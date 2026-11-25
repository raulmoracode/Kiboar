# @kiboar/design

The base CSS every Kiboar web surface starts from: the dark colour scheme, the
page background and font, the focus ring and the shared colour tokens.

It is deliberately small. It carries the design tokens and the document
defaults, not components. A component moves into a shared package only when more
than one product uses it; until then it stays in the app that owns it.

## Usage

Import the app entry, which pulls Tailwind and the base in the right order:

```css
@import "@kiboar/design/app.css";
```

`app.css` is `@import "tailwindcss"` followed by `base.css`. An app that does not
use Tailwind can import `@kiboar/design/base.css` directly.

Tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--kiboar-bg` | `#0a0b0d` | Page background |
| `--kiboar-surface` | `#0c0e11` | Raised surfaces such as the cart drawer |
| `--kiboar-accent` | `#bef264` | Focus ring and accent states |

Use `var(--kiboar-bg)` instead of repeating the hex value. The utilities in the
apps still use Tailwind classes; this package does not replace Tailwind.

## Boundaries

- CSS only. No React and no build step. It owns the Tailwind entry and
therefore depends on `tailwindcss` from the catalog.
- No product-specific layout. `web` is a brand page and the storefront is a
  catalogue; neither belongs here.
- No remote fonts. The font stack is the system UI stack.

Consumed by `web`, `shop/storefront` and `software/app` (Studio) through
`app.css`. `docs` imports `tokens.css` and maps the Fumadocs `--color-fd-*`
tokens to the Kiboar palette; it keeps its own structure and does not import
the document defaults or the component classes.
