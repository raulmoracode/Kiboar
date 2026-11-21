import type { ZodError } from "zod";

/**
 * Render a validation error as one line per issue, with the field path first.
 * This is the shape the UI and the CLI print, so a user can see which field
 * failed without reading a nested JSON object.
 */
export function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.map(String).join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}
