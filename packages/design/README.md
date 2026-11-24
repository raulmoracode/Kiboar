# @kiboar/design

The base CSS every Kiboar web surface starts from: the dark colour scheme, the
page background and font, the focus ring, the shared colour tokens and the few
component classes the three apps repeat.

It is deliberately small. Tailwind utilities still describe each element at the
call site; this package owns only what would otherwise be copied between
products. A component moves into a shared package only when more than one
product uses it; until then it stays in the app that owns it.

## Usage

Import the app entry, which pulls Tailwind and the base in the right order:

```css
@import "@kiboar/design/app.css";
```

`app.css` is `@import "tailwindcss"`, `base.css` and the `@layer components`
classes. An app that does not use Tailwind can import
`@kiboar/design/base.css` directly.

Tokens:

| Token | Value | Use |
| --- | --- | --- |
| `--kiboar-bg` | `#0a0b0d` | Page background |
| `--kiboar-surface` | `#0c0e11` | Raised surfaces such as the cart drawer |
| `--kiboar-accent` | `#bef264` | Focus ring and accent states |

Use `var(--kiboar-bg)` instead of repeating the hex value. The utilities in the
apps still use Tailwind classes; this package does not replace Tailwind.

Component classes:

| Class | What it is |
| --- | --- |
| `kiboar-shell` | The page shell: full height, page background, body text colour |
| `kiboar-eyebrow` | The mono uppercase label above a section title |
| `kiboar-card` | The translucent bordered card |
| `kiboar-button-primary` | The light call to action |
| `kiboar-link` | The muted underlined text link; colour and size stay at the call site |

## Boundaries

- CSS only. No React and no build step. It owns the Tailwind entry and
therefore depends on `tailwindcss` from the catalog.
- Repeated patterns only. A string used once stays in its component, and a
  product-specific layout never moves here.
- No remote fonts. The font stack is the system UI stack.

Consumed by `web`, `shop/storefront` and `software/app` (Studio). `docs`
keeps the Fumadocs theme and does not use this package yet.
