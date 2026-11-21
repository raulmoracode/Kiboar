import { z } from "zod";
import { boardSchema } from "./board";
import { registrySchema } from "./registry";

type JsonSchema = Record<string, unknown>;

const DRAFT = "https://json-schema.org/draft/2020-12/schema";

function withMetadata(
  generated: JsonSchema,
  id: string,
  title: string,
  description: string,
): JsonSchema {
  const { $schema: _ignored, ...rest } = generated;
  return {
    $schema: DRAFT,
    $id: id,
    title,
    description,
    ...rest,
  };
}

export function boardJsonSchema(): JsonSchema {
  return withMetadata(
    z.toJSONSchema(boardSchema, { target: "draft-2020-12", io: "input" }),
    "urn:kiboar:board:1",
    "Kiboar board definition",
    "A Kiboar keyboard model: MCU, matrix, pins, keys, layers and optional peripherals.",
  );
}

export function registryJsonSchema(): JsonSchema {
  return withMetadata(
    z.toJSONSchema(registrySchema, { target: "draft-2020-12", io: "input" }),
    "urn:kiboar:registry:1",
    "Kiboar board registry",
    "The boards, MCUs and signed firmware artefacts the application can offer.",
  );
}
