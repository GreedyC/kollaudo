// Common Test Report Format (https://ctrf.io), the native format for test results (ADR 0008).
// Validation is lenient: only the fields Kollaudo uses are checked, and unknown fields are kept,
// so reports from older reporters and future spec versions are accepted.

import { z } from "zod";

export const CtrfStatus = z.enum(["passed", "failed", "skipped", "pending", "other"]);
export type CtrfStatus = z.infer<typeof CtrfStatus>;

const Extra = z.record(z.string(), z.unknown());

export const CtrfTest = z.looseObject({
  name: z.string().min(1),
  status: CtrfStatus,
  duration: z.number().nonnegative(),
  start: z.number().optional(),
  stop: z.number().optional(),
  /** A list of suite names, or a single string with names separated by " > " (older reporters). */
  suite: z.union([z.string(), z.array(z.string())]).optional(),
  message: z.string().optional(),
  trace: z.string().optional(),
  filePath: z.string().optional(),
  retries: z.number().int().nonnegative().optional(),
  flaky: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  extra: Extra.optional(),
});
export type CtrfTest = z.infer<typeof CtrfTest>;

export const CtrfReport = z
  .looseObject({
    reportFormat: z.literal("CTRF").optional(),
    specVersion: z.string().optional(),
    results: z.looseObject({
      tool: z.looseObject({ name: z.string().min(1), version: z.string().optional() }),
      summary: z.looseObject({
        tests: z.number().int().nonnegative(),
        start: z.number().optional(),
        stop: z.number().optional(),
      }),
      tests: z.array(CtrfTest),
      environment: Extra.optional(),
      extra: Extra.optional(),
    }),
  })
  .meta({ description: "A CTRF test report, as produced by a CTRF reporter." });
export type CtrfReport = z.infer<typeof CtrfReport>;
