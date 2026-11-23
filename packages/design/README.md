# @kiboar/design

The base CSS every Kiboar web surface starts from: the dark colour scheme, the
page background and font, the focus ring and the shared colour tokens.

It is deliberately small. It carries the design tokens and the document
defaults, not components. A component moves into a shared package only when more
than one product uses it; until then it stays in the app that owns it.

## Usage

Add the package to the app and import it after Tailwind, so the tokens win over
the preflight:

```css
@import "tailwindcss";
@import "@kiboar/design/base.css";
```

Tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--kiboar-bg` | `#0a0b0d` | Page background |
| `--kiboar-surface` | `#0c0e11` | Raised surfaces such as the cart drawer |
| `--kiboar-accent` | `#bef264` | Focus ring and accent states |

Use `var(--kiboar-bg)` instead of repeating the hex value. The utilities in the
apps still use Tailwind classes; this package does not replace Tailwind.

## Boundaries

- CSS only. No React, no JavaScript and no build step.
- No product-specific layout. `web` is a brand page and the storefront is a
  catalogue; neither belongs here.
- No remote fonts. The font stack is the system UI stack.

Consumed by `web` and `shop/storefront`. `docs` keeps the Fumadocs theme and
does not use this package yet.
