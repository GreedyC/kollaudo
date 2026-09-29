import { z } from "zod";
import { CtrfReport } from "./ctrf.ts";

/** Names of components and environments: they end up in URLs and CLI output. */
const Name = z
  .string()
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/,
    'Use up to 100 letters, digits, ".", "_", "/" or "-", starting with a letter or digit.',
  );

/** Versions are opaque identifiers chosen by the user (ADR 0004). */
const VersionName = z.string().min(1).max(255).regex(/^\S+$/, "Must not contain spaces.");

const Metadata = z.string().min(1).max(255);

export const TestRunInput = z
  .object({
    component: Name.meta({ example: "frontend" }),
    version: VersionName.meta({ example: "1.2.0" }),
    environment: Name.optional().meta({
      description: "Where the tests ran. Leave it out for build-level tests, such as unit tests.",
      example: "staging",
    }),
    kind: z
      .string()
      .regex(/^[a-z][a-z0-9-]{0,31}$/)
      .default("e2e")
      .meta({ description: "unit, e2e, smoke, uat, manual…", example: "e2e" }),
    commit: Metadata.optional(),
    branch: Metadata.optional(),
    tag: Metadata.optional(),
    pullRequest: Metadata.optional(),
    report: CtrfReport,
  })
  .meta({ id: "TestRunInput" });
export type TestRunInput = z.input<typeof TestRunInput>;

export const TestRunSummary = z
  .object({
    tests: z.number().int(),
    passed: z.number().int(),
    failed: z.number().int(),
    skipped: z.number().int(),
    pending: z.number().int(),
    other: z.number().int(),
    flaky: z.number().int(),
  })
  .meta({ id: "TestRunSummary" });
export type TestRunSummary = z.infer<typeof TestRunSummary>;

export const TestRunCreated = z
  .object({
    id: z.uuid(),
    component: z.string(),
    version: z.string(),
    environment: z.string().nullable(),
    kind: z.string(),
    summary: TestRunSummary,
  })
  .meta({ id: "TestRunCreated" });
export type TestRunCreated = z.infer<typeof TestRunCreated>;
