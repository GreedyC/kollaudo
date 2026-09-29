import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "./db/client.ts";
import { apiTokens, projects } from "./db/schema.ts";
import { createToken, type TokenScope } from "./tokens.ts";

/** An error caused by the user's input, reported without a stack trace. */
export class UserError extends Error {}

const PROJECT_NAME = /^[a-z0-9][a-z0-9._-]{0,63}$/;

/** Creates a project with one `ingest` and one `read` token (ADR 0007). */
export async function createProject(db: Db, name: string) {
  if (!PROJECT_NAME.test(name)) {
    throw new UserError(
      `Invalid project name "${name}": use up to 64 lowercase letters, digits, ".", "_" or "-", starting with a letter or digit.`,
    );
  }

  return db.transaction(async (tx) => {
    const [project] = await tx
      .insert(projects)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: projects.id, name: projects.name });
    if (!project) throw new UserError(`Project "${name}" already exists.`);

    const ingest = await createToken(tx, project.id, "ingest");
    const read = await createToken(tx, project.id, "read");
    return { project, tokens: [ingest, read] };
  });
}

async function getProject(db: Db, name: string) {
  const [project] = await db.select().from(projects).where(eq(projects.name, name));
  if (!project) throw new UserError(`Project "${name}" not found.`);
  return project;
}

export async function createProjectToken(db: Db, projectName: string, scope: TokenScope) {
  const project = await getProject(db, projectName);
  return createToken(db, project.id, scope);
}

export async function listProjectTokens(db: Db, projectName: string) {
  const project = await getProject(db, projectName);
  return db
    .select({
      id: apiTokens.id,
      scope: apiTokens.scope,
      hint: apiTokens.hint,
      createdAt: apiTokens.createdAt,
      lastUsedAt: apiTokens.lastUsedAt,
      revokedAt: apiTokens.revokedAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.projectId, project.id))
    .orderBy(asc(apiTokens.createdAt));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function revokeToken(db: Db, tokenId: string) {
  if (!UUID.test(tokenId)) throw new UserError(`Invalid token id "${tokenId}".`);
  const [row] = await db
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiTokens.id, tokenId), isNull(apiTokens.revokedAt)))
    .returning({ id: apiTokens.id });
  if (!row) throw new UserError(`No active token with id "${tokenId}".`);
}
