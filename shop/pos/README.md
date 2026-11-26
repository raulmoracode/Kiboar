# Kiboar POS

Mobile till for the Kiboar shop. Expo/React Native app that talks to the Medusa
**Admin API** as a staff member, builds a cart and will take payment with a QR
that opens a Stripe Checkout Session on the customer's phone.

**Status: scaffold.** The screens, theme, cart state and the typed Admin API
contract exist. The QR is a placeholder until the backend endpoint and the
Stripe webhook land. Authentication is not wired yet.

## Stack

- Expo SDK 58, React Native 0.88, React 19 (workspace catalog) and Expo Router.
- TypeScript strict, Biome for formatting/lint, Jest + React Native Testing
  Library for unit tests.
- It is a third application of the shop product, next to the Medusa service and
  `shop/storefront`; it uses the Admin API, not the Store API.

## Commands

```bash
pnpm --filter @kiboar/pos start       # Expo dev server (device or simulator)
pnpm --filter @kiboar/pos android     # dev server, open Android
pnpm --filter @kiboar/pos ios         # dev server, open iOS (macOS)
pnpm --filter @kiboar/pos web         # browser preview at localhost:8081
pnpm --filter @kiboar/pos typecheck
pnpm --filter @kiboar/pos test
pnpm --filter @kiboar/pos export      # Android JS bundle
```

The Medusa service must be running for real data (`pnpm --filter @kiboar/shop
dev`, with PostgreSQL). The scaffold catalogue is demo data.

## Configuration

Only non-secret values belong in the app:

```bash
EXPO_PUBLIC_MEDUSA_URL=http://localhost:9000
EXPO_PUBLIC_POS_SALES_CHANNEL_ID=sc_...
EXPO_PUBLIC_POS_LOCATION_ID=sloc_...
```

The Admin API credentials are entered by staff and will be stored with
`expo-secure-store`; never put a secret key in an `EXPO_PUBLIC_` variable.

## Web preview

The web target is enabled because Expo Router supports it and it is the fastest
way to check the layout in a browser:

```bash
pnpm --filter @kiboar/pos web   # http://localhost:8081
```

It is a preview, not the shipping target: the product is a mobile app. It needs
`react-dom` and `react-native-web`, both in `package.json`.

## Version notes

Expo's `expo install --check` expects React 19.3.0 and TypeScript 6. The
workspace catalog pins React 19.3.1 and TypeScript 7; typecheck, tests and the
Android bundle pass with those. Do not add a second React or TypeScript copy to
satisfy the checker. `react-native-svg` stays at the Expo-compatible 15.16.0.

## Monorepo notes

- `shop/pos` is in the root pnpm workspace. `metro.config.js` watches the
  workspace root and resolves both `node_modules` roots; keep it in sync with
  the pnpm layout.
- The app uses the workspace React version (catalog). Expo SDK 58 accepts React
  19.3; do not add a second React copy.
- It is not part of `medusa build` and has its own `shop-pos` CI workflow.

## Backend contract (next change)

```
POST /admin/pos/checkout
  { items: [{ variantId, quantity }], customerId?, salesChannelId?, locationId? }
  → { url, draftOrderId, expiresAt, status: "pending" }

GET /admin/pos/checkout/:draftOrderId
  → { url, draftOrderId, expiresAt, status: "pending" | "paid" | "expired" | "cancelled" }
```

The endpoint creates a Medusa draft order and a Stripe Checkout Session with
`metadata.draft_order_id`. Stripe calls a webhook when the session completes;
the backend verifies the signature over the raw body, checks amount/currency
and marks the draft order paid. The app polls the status and only then completes
the sale. The QR encodes `url`; it is never treated as proof of payment.

## Distribution

- Android: EAS Build or a local Gradle build, then sideload the APK for internal
  use. No store is required.
- iOS: code signing and an Apple Developer account are required even outside the
  App Store (Ad Hoc, TestFlight or MDM). "No notarization" is a macOS concept;
  it does not remove mobile signing.

## Not in this scaffold

Payments, authentication wiring, real catalogue, cash, receipts, offline,
hardware (printer, drawer, scanner), RBAC and order history.
