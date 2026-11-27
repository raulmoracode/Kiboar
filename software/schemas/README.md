# Generated schemas

`board.schema.json` and `registry.schema.json` are generated from the Zod
definitions in `software/packages/core/src/schema/`. Do not edit them by hand.

```bash
pnpm schema:export
```

CI fails when a committed schema differs from the generated output.

## Scope of the JSON Schema

The JSON Schema covers the shape a non-TypeScript tool can check: types,
required fields, patterns, ranges, enums and unknown fields. It does not cover
the cross-field rules that JSON Schema cannot express, which the Zod schema in
`core` enforces:

- the number of row and column pins matches the matrix;
- a pin is used only once across the matrix, encoders and display;
- a key matrix position is inside the matrix and not repeated;
- the first layer is `base` and layer names are unique;
- encoder ids are unique.

A validator that only reads the JSON Schema is a first gate, not the whole
contract. The application validates with Zod before it writes anything.
