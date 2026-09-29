import { describe, expect, it } from "vitest";
import { HELP, run, VERSION } from "./run.ts";

function runCli(args: string[]) {
  let out = "";
  let err = "";
  const code = run(args, { out: (t) => (out += t), err: (t) => (err += t) });
  return { code, out, err };
}

describe("kollaudo", () => {
  it("prints help without arguments", () => {
    expect(runCli([])).toEqual({ code: 0, out: HELP, err: "" });
  });

  it("prints its version", () => {
    expect(runCli(["--version"])).toMatchObject({ code: 0, out: `${VERSION}\n` });
  });

  it("fails on an unknown command", () => {
    const { code, err } = runCli(["deploy"]);

    expect(code).toBe(1);
    expect(err).toContain("Unknown command: deploy");
  });

  it("fails on an unknown option", () => {
    expect(runCli(["--nope"]).code).toBe(1);
  });
});
