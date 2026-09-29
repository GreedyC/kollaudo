import { describe, expect, it } from "vitest";
import { Healthz } from "./healthz.ts";

describe("Healthz", () => {
  it("accepts a valid response", () => {
    expect(Healthz.parse({ status: "ok", version: "0.0.0" })).toEqual({
      status: "ok",
      version: "0.0.0",
    });
  });

  it("rejects an unknown status", () => {
    expect(Healthz.safeParse({ status: "down", version: "0.0.0" }).success).toBe(false);
  });
});
