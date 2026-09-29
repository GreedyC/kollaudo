import { Healthz } from "@kollaudo/schema";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";

describe("GET /healthz", () => {
  it("answers ok", async () => {
    const res = await createApp().request("/healthz");

    expect(res.status).toBe(200);
    expect(Healthz.parse(await res.json()).status).toBe("ok");
  });
});
