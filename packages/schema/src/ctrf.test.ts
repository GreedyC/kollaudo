import { describe, expect, it } from "vitest";
import { CtrfReport } from "./ctrf.ts";

const report = (tests: unknown[]) => ({
  results: {
    tool: { name: "playwright" },
    summary: { tests: tests.length, passed: 0, failed: 0, start: 0, stop: 0 },
    tests,
  },
});

describe("CtrfReport", () => {
  it("accepts a minimal report without reportFormat, as older reporters produce", () => {
    const parsed = CtrfReport.parse(
      report([{ name: "logs in", status: "passed", duration: 12, suite: "auth > login" }]),
    );
    expect(parsed.results.tests[0]?.suite).toBe("auth > login");
  });

  it("keeps fields it doesn't model", () => {
    const parsed = CtrfReport.parse(
      report([{ name: "t", status: "failed", duration: 1, attachments: [{ name: "shot" }] }]),
    );
    expect(parsed.results.tests[0]).toHaveProperty("attachments");
  });

  it("rejects an unknown status with the path of the test", () => {
    const result = CtrfReport.safeParse(report([{ name: "t", status: "broken", duration: 1 }]));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["results", "tests", 0, "status"]);
  });

  it("rejects something that isn't a CTRF report", () => {
    expect(CtrfReport.safeParse({ testsuites: [] }).success).toBe(false);
  });
});
