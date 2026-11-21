import { z } from "zod";
import { slugSchema } from "./board";

export const REGISTRY_SCHEMA_VERSION = "kiboar.registry/1" as const;

const sha256Schema = z
  .string()
  .regex(/^[0-9a-f]{64}$/, "expected 64 lowercase hexadecimal characters");

const relativePathSchema = z
  .string()
  .min(1)
  .max(256)
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.includes("\\") &&
      !value.split("/").includes(".."),
    "expected a relative POSIX path without '..'",
  );

const versionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "expected a semantic version such as 1.2.0");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected an ISO date such as 2026-11-21");

const hexIdSchema = z
  .string()
  .regex(/^[0-9a-f]{4}$/, "expected four lowercase hexadecimal characters");

export const mcuSchema = z.strictObject({
  id: slugSchema,
  family: z.enum(["rp2040"]),
  bootloader: z.strictObject({
    vid: hexIdSchema,
    pid: hexIdSchema,
  }),
  flash_kb: z.number().int().positive().max(65_536),
});

export const boardEntrySchema = z.strictObject({
  board_id: slugSchema,
  hw_rev: z.number().int().min(1).max(99),
  definition: relativePathSchema.refine(
    (value) => value.endsWith(".json"),
    "expected a .json board definition",
  ),
});

export const firmwareEntrySchema = z.strictObject({
  board_id: slugSchema,
  hw_rev: z.number().int().min(1).max(99),
  version: versionSchema,
  path: relativePathSchema.refine(
    (value) => /\.(uf2|hex|bin)$/.test(value),
    "expected a .uf2, .hex or .bin firmware artefact",
  ),
  sha256: sha256Schema,
  signature: z.string().min(16).max(4096),
});

type RegistryPath = (string | number)[];

function issue(ctx: z.RefinementCtx, path: RegistryPath, message: string): void {
  ctx.addIssue({ code: "custom", path, message });
}

function pairKey(boardId: string, hwRev: number): string {
  return `${boardId}@${hwRev}`;
}

export const registrySchema = z
  .strictObject({
    schema: z.literal(REGISTRY_SCHEMA_VERSION),
    generated: dateSchema,
    mcus: z.array(mcuSchema).min(1).max(16),
    boards: z.array(boardEntrySchema).min(1).max(1024),
    firmware: z.array(firmwareEntrySchema).max(4096),
  })
  .superRefine((registry, ctx) => {
    const mcuIds = new Set<string>();
    registry.mcus.forEach((mcu, index) => {
      if (mcuIds.has(mcu.id)) {
        issue(ctx, ["mcus", index, "id"], `duplicate MCU id "${mcu.id}"`);
      }
      mcuIds.add(mcu.id);
    });

    const boardKeys = new Set<string>();
    registry.boards.forEach((board, index) => {
      const key = pairKey(board.board_id, board.hw_rev);
      if (boardKeys.has(key)) {
        issue(
          ctx,
          ["boards", index, "hw_rev"],
          `duplicate board ${board.board_id} revision ${board.hw_rev}`,
        );
      }
      boardKeys.add(key);
    });

    const firmwareKeys = new Set<string>();
    registry.firmware.forEach((entry, index) => {
      const target = pairKey(entry.board_id, entry.hw_rev);
      if (!boardKeys.has(target)) {
        issue(
          ctx,
          ["firmware", index, "board_id"],
          `firmware targets ${target}, which is not declared in boards`,
        );
      }

      const key = `${target}@${entry.version}`;
      if (firmwareKeys.has(key)) {
        issue(
          ctx,
          ["firmware", index, "version"],
          `duplicate firmware ${entry.board_id} revision ${entry.hw_rev} version ${entry.version}`,
        );
      }
      firmwareKeys.add(key);
    });
  });

export type Registry = z.infer<typeof registrySchema>;
export type RegistryMcu = z.infer<typeof mcuSchema>;
export type RegistryBoard = z.infer<typeof boardEntrySchema>;
export type RegistryFirmware = z.infer<typeof firmwareEntrySchema>;
