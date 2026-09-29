import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema.ts";

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export type Db = ReturnType<typeof createDb>["db"];
/** A database or a transaction: functions that accept it can run inside a transaction. */
export type Executor = Db | Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Connects to PostgreSQL. Call `close` when done, or the process won't exit. */
export function createDb(url: string) {
  const client = postgres(url, { onnotice: () => {} });
  const db = drizzle(client, { schema, casing: "snake_case" });
  return { db, close: () => client.end() };
}

/** Applies pending migrations. Safe to run on every start. */
export async function migrateDb(db: Db) {
  await migrate(db, { migrationsFolder });
}
