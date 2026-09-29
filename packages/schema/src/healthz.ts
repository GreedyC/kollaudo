import { z } from "zod";

/** Response of `GET /healthz`: the server is up and able to answer. */
export const Healthz = z.object({
  status: z.literal("ok"),
  version: z.string(),
});

export type Healthz = z.infer<typeof Healthz>;
