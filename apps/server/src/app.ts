import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ApiError, Healthz, Project, TestRunCreated, TestRunInput } from "@kollaudo/schema";
import { eq } from "drizzle-orm";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { type AuthEnv, requireScope } from "./auth.ts";
import type { Db } from "./db/client.ts";
import { projects } from "./db/schema.ts";
import { errorResponse, HttpError, validationResponse } from "./errors.ts";
import { ingestTestRun } from "./ingest.ts";

export const VERSION = "0.0.0";

/** Largest accepted request body. Big e2e suites with long traces can reach tens of megabytes. */
const MAX_BODY_BYTES = 50 * 1024 * 1024;

const json = <T>(schema: T, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

const errors = {
  400: json(ApiError, "The request is not valid"),
  401: json(ApiError, "The API token is missing, unknown or revoked"),
  403: json(ApiError, "The API token doesn't have the needed scope"),
};

export interface AppOptions {
  db: Db;
}

/** Builds the HTTP application. Kept separate from `main.ts` so tests can call it without a network. */
export function createApp({ db }: AppOptions) {
  const app = new OpenAPIHono<AuthEnv>({
    defaultHook: (result, c) => {
      if (!result.success) return validationResponse(c, result.error);
    },
  });

  app.openAPIRegistry.registerComponent("securitySchemes", "token", {
    type: "http",
    scheme: "bearer",
    description: "A project API token: `ingest` to send data, `read` to read it.",
  });

  app.use(
    "/v1/*",
    bodyLimit({
      maxSize: MAX_BODY_BYTES,
      onError: (c) => errorResponse(c, 413, "payload_too_large", "The request body is too large."),
    }),
  );

  app.openapi(
    createRoute({
      method: "get",
      path: "/healthz",
      summary: "Liveness check",
      responses: { 200: json(Healthz, "The server is up") },
    }),
    (c) => c.json({ status: "ok" as const, version: VERSION }, 200),
  );

  app.openapi(
    createRoute({
      method: "get",
      path: "/v1/project",
      summary: "The project of the API token",
      security: [{ token: [] }],
      middleware: [requireScope(db, "read")] as const,
      responses: { 200: json(Project, "The project"), 401: errors[401], 403: errors[403] },
    }),
    async (c) => {
      const [project] = await db
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(eq(projects.id, c.var.projectId));
      if (!project) throw new HttpError(401, "unauthorized", "The project no longer exists.");
      return c.json(project, 200);
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/v1/test-runs",
      summary: "Send a CTRF test report",
      description:
        "Stores a test run for a version of a component, in an environment or at build level. " +
        "The component, environment and version are created if they don't exist yet.",
      security: [{ token: [] }],
      middleware: [requireScope(db, "ingest")] as const,
      request: { body: { ...json(TestRunInput, "The test run"), required: true } },
      responses: {
        201: json(TestRunCreated, "The test run was stored"),
        ...errors,
        409: json(ApiError, "The version already exists with different metadata"),
        413: json(ApiError, "The report is too large"),
      },
    }),
    async (c) => {
      const run = await ingestTestRun(db, c.var.projectId, c.req.valid("json"));
      return c.json(run, 201);
    },
  );

  app.doc31("/v1/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "Kollaudo API",
      version: VERSION,
      description: "Test results and health of every version, in every environment.",
      license: { name: "Apache-2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
    },
  });

  app.notFound((c) => errorResponse(c, 404, "not_found", "Not found."));

  app.onError((error, c) => {
    if (error instanceof HttpError)
      return errorResponse(c, error.status, error.code, error.message);
    if (error instanceof HTTPException) {
      return errorResponse(c, error.status as 400, "invalid_request", error.message);
    }
    console.error(error);
    return errorResponse(c, 500, "internal_error", "Something went wrong on the server.");
  });

  return app;
}
