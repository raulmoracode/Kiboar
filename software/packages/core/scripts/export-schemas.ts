import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { boardJsonSchema, registryJsonSchema } from "../src/schema/json-schema";

const softwareRoot = fileURLToPath(new URL("../../../", import.meta.url));
const schemasDirectory = join(softwareRoot, "schemas");

const files: Array<[string, Record<string, unknown>]> = [
  ["board.schema.json", boardJsonSchema()],
  ["registry.schema.json", registryJsonSchema()],
];

mkdirSync(schemasDirectory, { recursive: true });
for (const [name, schema] of files) {
  const path = join(schemasDirectory, name);
  writeFileSync(path, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
  console.log(`wrote ${path}`);
}
