import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Board, boardSchema, formatIssues } from "../src";

export const SOFTWARE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export function readJson(relativePath: string): unknown {
  return JSON.parse(readFileSync(join(SOFTWARE_ROOT, relativePath), "utf8")) as unknown;
}

export function parseBoard(relativePath: string): Board {
  const result = boardSchema.safeParse(readJson(relativePath));
  if (!result.success) {
    throw new Error(`${relativePath}\n${formatIssues(result.error)}`);
  }
  return result.data;
}
