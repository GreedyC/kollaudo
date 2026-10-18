import { describe, expect, it } from "vitest";
import { run } from "./run.ts";
import { runWith, webPage } from "./testing.ts";
import { VERDICT_LIST_HELP } from "./verdict-list.ts";

const env = { KOLLAUDO_URL: "https://kollaudo.example.com", KOLLAUDO_TOKEN: "kol_read" };
const given = {
  id: "0c0c0c0c-8a1b-4c3d-9e0f-123456789abc",
  component: "api",
  environment: "staging",
  version: "1.1.0",
  outcome: "fail",
  evidenceOutcome: "fail",
  message: "e2e failed.",
  policyRevision: 3,
  require: ["e2e"],
  overrideId: null,
  askedBy: "kargo",
  createdAt: "2026-10-02T09:10:00.000Z",
  asked: 1,
  lastAskedAt: "2026-10-02T09:10:00.000Z",
};

function server(status: number, body: unknown) {
  const requests: string[] = [];
  const fetch = async (url: string | URL | Request) => {
    requests.push(String(url));
    return new Response(JSON.stringify(body), { status });
  };
  return { requests, fetch: fetch as typeof globalThis.fetch };
}

describe("kollaudo verdict list", () => {
  it("lists the verdicts given, with who asked, the policy and overrides", async () => {
    const overridden = {
      ...given,
      outcome: "pass",
      message: "Overridden by on-call until 2026-10-02T12:00:00.000Z: Hotfix",
      policyRevision: null,
      overrideId: "0b0b0b0b-8a1b-4c3d-9e0f-123456789abc",
      askedBy: null,
    };
    const { requests, fetch } = server(200, { items: [overridden, given], next: null });
    const result = await runWith(
      run,
      ["verdict", "list", "--component", "api", "--env", "staging", "--outcome", "fail"],
      { env, fetch },
    );

    expect(result).toEqual({
      code: 0,
      out:
        "2026-10-02T09:10:00.000Z  PASS (override)  api 1.1.0 in staging, asked by a deleted " +
        "token: Overridden by on-call until 2026-10-02T12:00:00.000Z: Hotfix\n" +
        "2026-10-02T09:10:00.000Z  FAIL  api 1.1.0 in staging, asked by kargo, policy revision 3: " +
        "e2e failed.\n",
      err: "",
    });
    expect(requests).toEqual([
      "https://kollaudo.example.com/v1/verdicts?component=api&environment=staging&outcome=fail",
    ]);
  });

  it("says how many times a waiting gate got the same answer", async () => {
    const waited = {
      ...given,
      outcome: "unknown",
      message: "Evidence is missing for e2e.",
      asked: 37,
      lastAskedAt: "2026-10-02T09:46:00.000Z",
    };
    const { fetch } = server(200, { items: [waited], next: null });
    const { out } = await runWith(run, ["verdict", "list"], { env, fetch });
    expect(out).toBe(
      "2026-10-02T09:10:00.000Z  UNKNOWN  api 1.1.0 in staging, asked by kargo 37 times until " +
        "2026-10-02T09:46:00.000Z, policy revision 3: Evidence is missing for e2e.\n",
    );
  });

  it("says when there are none", async () => {
    const { fetch } = server(200, { items: [], next: null });
    expect(await runWith(run, ["verdict", "list"], { env, fetch })).toEqual({
      code: 0,
      out: "No verdicts.\n",
      err: "",
    });
  });

  it("prints the API's answer as JSON when asked", async () => {
    const body = { items: [given], next: "0d0d0d0d-8a1b-4c3d-9e0f-123456789abc" };
    const { requests, fetch } = server(200, body);
    const result = await runWith(run, ["verdict", "list", "--component", "api", "--json"], {
      env,
      fetch,
    });
    expect(result).toEqual({ code: 0, out: `${JSON.stringify(body)}\n`, err: "" });
    expect(requests).toEqual(["https://kollaudo.example.com/v1/verdicts?component=api"]);
  });

  it("prints an empty answer as JSON too, not as prose", async () => {
    const body = { items: [], next: null };
    const { fetch } = server(200, body);
    expect(await runWith(run, ["verdict", "list", "--json"], { env, fetch })).toEqual({
      code: 0,
      out: `${JSON.stringify(body)}\n`,
      err: "",
    });
  });

  it("uses next to request a second page, keeping the filters and limit", async () => {
    const cursor = given.id;
    const older = { ...given, id: "0d0d0d0d-8a1b-4c3d-9e0f-123456789abc", version: "1.0.0" };
    const requests: string[] = [];
    const fetch = async (url: string | URL | Request) => {
      requests.push(String(url));
      const page =
        requests.length === 1 ? { items: [given], next: cursor } : { items: [older], next: null };
      return new Response(JSON.stringify(page), { status: 200 });
    };
    const args = ["verdict", "list", "--component", "api", "--limit", "1", "--json"];
    const first = await runWith(run, args, { env, fetch: fetch as typeof globalThis.fetch });
    expect(first.code).toBe(0);
    const next = JSON.parse(first.out).next;
    const second = await runWith(run, [...args, "--before", next], {
      env,
      fetch: fetch as typeof globalThis.fetch,
    });
    expect(second).toEqual({
      code: 0,
      out: `${JSON.stringify({ items: [older], next: null })}\n`,
      err: "",
    });
    expect(requests).toEqual([
      "https://kollaudo.example.com/v1/verdicts?component=api&limit=1",
      `https://kollaudo.example.com/v1/verdicts?component=api&limit=1&before=${cursor}`,
    ]);
  });

  it("preserves the server's invalid-cursor message and exits with 1", async () => {
    const { requests, fetch } = server(400, {
      error: { code: "invalid_request", message: "before must be a valid UUID." },
    });
    const result = await runWith(run, ["verdict", "list", "--before", "invalid", "--json"], {
      env,
      fetch,
    });
    expect(result.code).toBe(1);
    expect(result.out).toBe("");
    expect(result.err).toContain("before must be a valid UUID.");
    expect(requests).toEqual(["https://kollaudo.example.com/v1/verdicts?before=invalid"]);
  });

  it("keeps the exit code when --json can't have the list", async () => {
    const { fetch } = server(403, {
      error: { code: "forbidden", message: "This endpoint needs a token with the read scope." },
    });
    const result = await runWith(run, ["verdict", "list", "--json"], { env, fetch });
    expect(result.code).toBe(1);
    expect(result.err).toContain("read scope");
  });

  it("exits with 1 when the list can't be had", async () => {
    const { fetch } = server(403, {
      error: { code: "forbidden", message: "This endpoint needs a token with the read scope." },
    });
    const result = await runWith(run, ["verdict", "list"], { env, fetch });
    expect(result.code).toBe(1);
    expect(result.err).toContain("read scope");
  });

  it("explains a page where the list should be", async () => {
    expect(await runWith(run, ["verdict", "list"], { env, fetch: webPage })).toEqual({
      code: 1,
      out: "",
      err: "Error: Kollaudo at https://kollaudo.example.com answered with a page, not with JSON. Is KOLLAUDO_URL the address of the Kollaudo server?\n",
    });
  });

  it("shows its help", async () => {
    const result = await runWith(run, ["verdict", "list", "--help"], { env });
    expect(result).toEqual({ code: 0, out: VERDICT_LIST_HELP, err: "" });
  });
});
