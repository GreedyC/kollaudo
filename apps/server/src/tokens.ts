import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { Db, Executor } from "./db/client.ts";
import { apiTokens } from "./db/schema.ts";

export type TokenScope = (typeof apiTokens.$inferSelect)["scope"];

const PREFIX = "kol_";

/** A new random token, `kol_` followed by 256 random bits (ADR 0007). */
export function generateToken(): string {
  return PREFIX + randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Creates a token and returns it. The token itself is never stored, so it can't be shown again. */
export async function createToken(db: Executor, projectId: string, scope: TokenScope) {
  const token = generateToken();
  const [row] = await db
    .insert(apiTokens)
    .values({ projectId, scope, hash: hashToken(token), hint: token.slice(0, PREFIX.length + 4) })
    .returning({ id: apiTokens.id });
  if (!row) throw new Error("Token was not created");
  return { id: row.id, scope, token };
}

/** How often `lastUsedAt` is refreshed, to avoid a database write on every request. */
const LAST_USED_PRECISION_MS = 60_000;

/** Finds a valid, non-revoked token and records its use. Returns `undefined` if it doesn't exist. */
export async function findToken(db: Db, token: string) {
  if (!token.startsWith(PREFIX)) return undefined;
  const [row] = await db
    .select({
      id: apiTokens.id,
      projectId: apiTokens.projectId,
      scope: apiTokens.scope,
      lastUsedAt: apiTokens.lastUsedAt,
    })
    .from(apiTokens)
    .where(and(eq(apiTokens.hash, hashToken(token)), isNull(apiTokens.revokedAt)));
  if (!row) return undefined;

  const { lastUsedAt, ...found } = row;
  if (!lastUsedAt || Date.now() - lastUsedAt.getTime() > LAST_USED_PRECISION_MS) {
    await db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, row.id));
  }
  return found;
}
