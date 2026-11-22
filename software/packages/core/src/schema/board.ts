import { z } from "zod";

export const BOARD_SCHEMA_VERSION = "kiboar.board/1" as const;

export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9-]{1,31}$/,
    "expected 2-32 characters: lowercase letters, digits and hyphens, starting with a letter or digit",
  );

const pinSchema = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9_.]{0,15}$/, "expected a pin name such as GP0 or P0.0");

const keycodeSchema = z
  .string()
  .regex(/^[A-Za-z0-9_()+,.:-]{1,32}$/, "expected a QMK-style keycode such as KC_ESC or MO(1)");

const positionSchema = z.number().finite().min(0).max(1000);
const sizeSchema = z.number().finite().positive().max(8);
const rotationSchema = z.number().finite().min(-180).max(180);

export const keySchema = z.strictObject({
  matrix: z.tuple([z.number().int().min(0).max(31), z.number().int().min(0).max(31)]),
  x: positionSchema,
  y: positionSchema,
  w: sizeSchema.default(1),
  h: sizeSchema.default(1),
  r: rotationSchema.default(0),
  keycode: keycodeSchema,
  label: z.string().min(1).max(16).optional(),
});

export const encoderSchema = z.strictObject({
  id: slugSchema,
  x: positionSchema,
  y: positionSchema,
  r: rotationSchema.default(0),
  pins: z.strictObject({
    a: pinSchema,
    b: pinSchema,
  }),
});

export const displaySchema = z.strictObject({
  type: z.enum(["oled128x32", "oled128x64"]),
  i2c: z.strictObject({
    sda: pinSchema,
    scl: pinSchema,
  }),
});

export const matrixSchema = z.strictObject({
  rows: z.number().int().min(1).max(32),
  cols: z.number().int().min(1).max(32),
  diode: z.enum(["COL2ROW", "ROW2COL"]),
});

export const pinsSchema = z.strictObject({
  rows: z.array(pinSchema).min(1).max(32),
  cols: z.array(pinSchema).min(1).max(32),
});

export const layerSchema = z.strictObject({
  name: z.string().min(1).max(32),
});

type BoardPath = (string | number)[];

function issue(ctx: z.RefinementCtx, path: BoardPath, message: string): void {
  ctx.addIssue({ code: "custom", path, message });
}

function checkPinUsage(
  ctx: z.RefinementCtx,
  entries: ReadonlyArray<{ pin: string; path: BoardPath; owner: string }>,
): void {
  const firstUse = new Map<string, string>();
  for (const entry of entries) {
    const previous = firstUse.get(entry.pin);
    if (previous !== undefined) {
      issue(ctx, entry.path, `pin ${entry.pin} is already used by ${previous}`);
      continue;
    }
    firstUse.set(entry.pin, entry.owner);
  }
}

export const boardSchema = z
  .strictObject({
    schema: z.literal(BOARD_SCHEMA_VERSION),
    board_id: slugSchema,
    name: z.string().min(1).max(64),
    hw_rev: z.number().int().min(1).max(99),
    mcu: slugSchema,
    matrix: matrixSchema,
    pins: pinsSchema,
    keys: z.array(keySchema).min(1).max(256),
    layers: z.array(layerSchema).min(1).max(16),
    encoders: z.array(encoderSchema).max(8).default([]),
    display: displaySchema.nullable().default(null),
    split: z.boolean().default(false),
  })
  .superRefine((board, ctx) => {
    const { rows, cols } = board.matrix;

    if (board.pins.rows.length !== rows) {
      issue(
        ctx,
        ["pins", "rows"],
        `expected ${rows} row pins to match matrix.rows, received ${board.pins.rows.length}`,
      );
    }
    if (board.pins.cols.length !== cols) {
      issue(
        ctx,
        ["pins", "cols"],
        `expected ${cols} column pins to match matrix.cols, received ${board.pins.cols.length}`,
      );
    }

    const pinEntries: Array<{ pin: string; path: BoardPath; owner: string }> = [
      ...board.pins.rows.map((pin, index) => ({
        pin,
        path: ["pins", "rows", index] as BoardPath,
        owner: `row ${index + 1}`,
      })),
      ...board.pins.cols.map((pin, index) => ({
        pin,
        path: ["pins", "cols", index] as BoardPath,
        owner: `column ${index + 1}`,
      })),
      ...board.encoders.flatMap((encoder, index) => [
        {
          pin: encoder.pins.a,
          path: ["encoders", index, "pins", "a"] as BoardPath,
          owner: `encoder ${encoder.id}`,
        },
        {
          pin: encoder.pins.b,
          path: ["encoders", index, "pins", "b"] as BoardPath,
          owner: `encoder ${encoder.id}`,
        },
      ]),
      ...(board.display === null
        ? []
        : [
            {
              pin: board.display.i2c.sda,
              path: ["display", "i2c", "sda"] as BoardPath,
              owner: "display SDA",
            },
            {
              pin: board.display.i2c.scl,
              path: ["display", "i2c", "scl"] as BoardPath,
              owner: "display SCL",
            },
          ]),
    ];
    checkPinUsage(ctx, pinEntries);

    const seenKeys = new Map<string, number>();
    board.keys.forEach((key, index) => {
      const [row, col] = key.matrix;
      if (row >= rows || col >= cols) {
        issue(
          ctx,
          ["keys", index, "matrix"],
          `matrix position ${row},${col} is outside the ${rows}x${cols} matrix`,
        );
      }
      const position = `${row},${col}`;
      const previous = seenKeys.get(position);
      if (previous !== undefined) {
        issue(
          ctx,
          ["keys", index, "matrix"],
          `matrix position ${position} is already used by key ${previous}`,
        );
      } else {
        seenKeys.set(position, index);
      }
    });

    if (board.layers[0]?.name !== "base") {
      issue(ctx, ["layers", 0, "name"], 'the first layer must be named "base"');
    }

    const layerNames = new Set<string>();
    board.layers.forEach((layer, index) => {
      if (layerNames.has(layer.name)) {
        issue(ctx, ["layers", index, "name"], `duplicate layer name "${layer.name}"`);
      }
      layerNames.add(layer.name);
    });

    const encoderIds = new Set<string>();
    board.encoders.forEach((encoder, index) => {
      if (encoderIds.has(encoder.id)) {
        issue(ctx, ["encoders", index, "id"], `duplicate encoder id "${encoder.id}"`);
      }
      encoderIds.add(encoder.id);
    });
  });

export type Board = z.infer<typeof boardSchema>;
export type BoardKey = z.infer<typeof keySchema>;
export type BoardEncoder = z.infer<typeof encoderSchema>;
