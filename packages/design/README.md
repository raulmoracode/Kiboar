# @kiboar/design

The shared design tokens every Kiboar product starts from: the dark colour
scheme, the page background and font, the focus ring, the palette and the few
component classes the web apps repeat. The palette is available as CSS custom
properties for the web and as a plain JavaScript module for React Native.

It is deliberately small. Tailwind utilities still describe each element at the
call site; this package owns only what would otherwise be copied between
products. A component moves into a shared package only when more than one
product uses it; until then it stays in the app that owns it.

## Usage

Web: import the app entry, which pulls Tailwind and the base in the right order.

```css
@import "@kiboar/design/app.css";
```

React Native: import the palette from the token module.

```ts
import { kiboarColors } from "@kiboar/design/tokens";
```

`app.css` is `@import "tailwindcss"`, `base.css` and the `@layer components`
classes. An app that does not use Tailwind can import
`@kiboar/design/base.css` directly.

Tokens (the complete list is in `tokens.css` and `tokens.js`):

| Token | Value | Use |
| --- | --- | --- |
| `--kiboar-bg` | `#0a0b0d` | Page background |
| `--kiboar-surface` | `#0c0e11` | Raised surfaces such as the cart drawer |
| `--kiboar-accent` | `#bef264` | Focus ring and accent states |
| `--kiboar-text` | `#e4e4e7` | Body text |
| `--kiboar-muted` | `#a1a1aa` | Secondary text |
| `--kiboar-faint` | `#71717a` | Micro-labels and borders |
| `--kiboar-danger` | `#f87171` | Errors and destructive actions |

Use `var(--kiboar-bg)` on the web or `kiboarColors.background` in React Native
instead of repeating the value. The utilities in the apps still use Tailwind
classes; this package does not replace Tailwind.

Component classes:

| Class | What it is |
| --- | --- |
| `kiboar-shell` | The page shell: full height, page background, body text colour |
| `kiboar-eyebrow` | The mono uppercase label above a section title |
| `kiboar-card` | The translucent bordered card |
| `kiboar-button-primary` | The light call to action |
| `kiboar-link` | The muted underlined text link; colour and size stay at the call site |

## Boundaries

- **CSS plus a token module.** No React and no build step. `tokens.js` is plain
  ESM so Metro can consume it without transpiling, and `tokens.d.ts` gives it
  types. `tokens.css` mirrors the same values for the web apps.
- Repeated patterns only. A string used once stays in its component, and a
  product-specific layout never moves here.
- No remote fonts. The font stack is the system UI stack.

Consumed by `web`, `shop/storefront`, `shop/pos` and `software/app` (Studio).
The POS reads `tokens.js`; the web apps import `app.css` or `tokens.css`.
`docs` imports `tokens.css` and maps the Fumadocs `--color-fd-*` tokens to the
Kiboar palette; it keeps its own structure and does not import the document
defaults or the component classes.
