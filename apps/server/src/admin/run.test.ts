import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "../testing.ts";
import { findToken } from "../tokens.ts";
import { runAdmin } from "./run.ts";

let testDb: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => {
  testDb = await createTestDb();
});
afterAll(() => testDb.drop());

async function admin(...args: string[]) {
  let out = "";
  let err = "";
  const code = await runAdmin(args, testDb.db, { out: (t) => (out += t), err: (t) => (err += t) });
  return { code, out, err };
}

const tokenIn = (text: string, scope: string) =>
  new RegExp(`^${scope}\\s+(kol_\\S+)$`, "m").exec(text)?.[1] ?? "";

describe("kollaudo-server", () => {
  it("creates a project with an ingest and a read token", async () => {
    const { code, out } = await admin("project", "create", "demo");

    expect(code).toBe(0);
    expect((await findToken(testDb.db, tokenIn(out, "ingest")))?.scope).toBe("ingest");
    expect((await findToken(testDb.db, tokenIn(out, "read")))?.scope).toBe("read");
  });

  it("refuses a duplicate project", async () => {
    await admin("project", "create", "twice");
    const { code, err } = await admin("project", "create", "twice");

    expect(code).toBe(1);
    expect(err).toContain('Project "twice" already exists.');
  });

  it("refuses an invalid project name", async () => {
    const { code, err } = await admin("project", "create", "My Project");

    expect(code).toBe(1);
    expect(err).toContain("Invalid project name");
  });

  it("creates, lists and revokes tokens", async () => {
    await admin("project", "create", "tokens");
    const created = await admin("token", "create", "tokens", "--scope", "read");
    const token = tokenIn(created.out, "read");
    const id = (await findToken(testDb.db, token))?.id ?? "";

    const listed = await admin("token", "list", "tokens");
    expect(listed.out.split("\n").filter((l) => l.includes("active"))).toHaveLength(3);
    expect(listed.out).not.toContain(token);

    expect((await admin("token", "revoke", id)).code).toBe(0);
    expect(await findToken(testDb.db, token)).toBeUndefined();
    expect((await admin("token", "list", "tokens")).out).toContain("revoked");
  });

  it("requires a valid scope", async () => {
    await admin("project", "create", "scopes");
    const { code, err } = await admin("token", "create", "scopes", "--scope", "admin");

    expect(code).toBe(1);
    expect(err).toContain("--scope must be ingest or read.");
  });

  it("reports unknown projects, tokens and commands", async () => {
    expect((await admin("token", "list", "nope")).err).toContain('Project "nope" not found.');
    expect((await admin("token", "revoke", "abc")).err).toContain('Invalid token id "abc".');
    expect((await admin("deploy", "all")).err).toContain("Unknown command: deploy all");
  });
});
