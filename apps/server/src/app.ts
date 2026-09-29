import type { Healthz } from "@kollaudo/schema";
import { Hono } from "hono";

export const VERSION = "0.0.0";

/** Builds the HTTP application. Kept separate from `main.ts` so tests can call it without a network. */
export function createApp() {
  const app = new Hono();

  app.get("/healthz", (c) => c.json({ status: "ok", version: VERSION } satisfies Healthz));

  return app;
}
