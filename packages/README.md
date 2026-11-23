# Shared packages

Workspace packages used by more than one Kiboar product. They live here, not
inside a product, so the dependency direction stays visible and no product
imports another product's source.

| Package | What it shares |
| --- | --- |
| [`@kiboar/design`](design/README.md) | Base CSS, colour tokens and focus styles |
| [`@kiboar/tsconfig`](tsconfig/README.md) | TypeScript compiler options for the React apps |

## Rules

- A package enters this directory only when a second product needs it. A helper
  with one consumer stays in that product.
- Shared packages are product-agnostic. They do not import `web`, `shop`,
  `docs`, `software` or the library.
- Dependency versions still come from the `catalog` block in
  `pnpm-workspace.yaml`; a shared package does not get its own version range for
  React or Tailwind.
- Product-specific screens stay in the product. Sharing the design base does not
  mean sharing the catalogue or the brand page.
