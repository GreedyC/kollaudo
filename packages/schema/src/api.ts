import { z } from "zod";

export const Project = z
  .object({
    id: z.uuid(),
    name: z.string(),
  })
  .meta({ id: "Project" });
export type Project = z.infer<typeof Project>;

/** Body of every error response. */
export const ApiError = z
  .object({
    error: z.object({
      code: z.string().meta({ example: "invalid_request" }),
      message: z.string(),
      issues: z
        .array(z.object({ path: z.string(), message: z.string() }))
        .optional()
        .meta({ description: "Validation problems, one per invalid field." }),
    }),
  })
  .meta({ id: "Error" });
export type ApiError = z.infer<typeof ApiError>;
