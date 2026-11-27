# Kiboar shop

The commercial surface of the brand: it sells assembled Kiboar keyboards. Buying
is a convenience, not a lock-in — the library and the board definitions are
published and the documentation lets anyone build the same board.

Three applications live here: the Medusa v2 service (Store API and admin
dashboard), the storefront in `shop/storefront`, a static Vite app that reads the
Store API over HTTP, and the POS in `shop/pos`, an Expo/React Native app for
staff that uses the Admin API.

**Status: catalogue and storefront.** The backend and the admin run; the
catalogue is seeded into PostgreSQL and both the storefront and the POS read
the published products and their photos from the Store API. The admin **Sales**
page and the POS sales screen read one register with the channel and the POS
payment method. The POS completes cash sales; the storefront keeps a demo bag in
the browser. There is no online Medusa cart, checkout, account or search yet.

## Requirements

- Node 22.23.4 or newer and pnpm 12, the same as the rest of the workspace.
- PostgreSQL for `dev`, `db:migrate` and `start`. The build does not need a
  database.

## Setup

```bash
cp shop/.env.template shop/.env
# edit shop/.env: DATABASE_URL, JWT_SECRET and COOKIE_SECRET
pnpm --filter @kiboar/shop db:migrate
pnpm --filter @kiboar/shop seed
pnpm --filter @kiboar/shop dev
```

`seed` is idempotent: it configures the `Kiboar` store, the Spain region and
its default 21% VAT rate, tax-inclusive EUR prices, the online and POS sales
channels, the stock location, the shipping options, one publishable key per
channel, the product types, collection, category tree and tags, and the six
Kiboar boards with the photos in `shop/static`. It also removes the unused
Medusa `Default Sales Channel` when no products, orders or carts reference it.
It prints the keys and writes them to `shop/seed-output.json`, which is ignored
by git and is the file the storefront and the POS read during local development.

### Local database

If PostgreSQL is not already running, the repository ships a compose file whose
defaults match `shop/.env.template`:

```bash
docker compose -f shop/docker-compose.yml up -d --wait
docker compose -f shop/docker-compose.yml down      # stop, keep the data
docker compose -f shop/docker-compose.yml down -v   # stop and delete the data
```

Use `docker-compose` instead of `docker compose` when your installation only
ships the standalone binary. Override `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB` or `POSTGRES_PORT` in the environment if you need different
credentials; the URL in `shop/.env` must match.

The same compose file starts pgAdmin at <http://localhost:5050>, already
connected to the `postgres` service. The default login is
`admin@kiboar.local` / `kiboar`; override `PGADMIN_DEFAULT_EMAIL`,
`PGADMIN_DEFAULT_PASSWORD` or `PGADMIN_PORT` if those ports or credentials are
taken. Both containers share the compose network, so pgAdmin reaches PostgreSQL
by the service name and not through the host port.

The API runs at <http://localhost:9000> and the admin dashboard at
<http://localhost:9000/app>. The first launch asks you to create an admin user.

## Commands

```bash
pnpm --filter @kiboar/shop dev          # needs PostgreSQL
pnpm --filter @kiboar/shop build        # compiles the server and the admin
pnpm --filter @kiboar/shop start        # needs PostgreSQL and a build
pnpm --filter @kiboar/shop db:migrate   # applies the migrations
pnpm --filter @kiboar/shop seed         # creates the region, channels and boards; idempotent
```

`build` writes to `.medusa/`, which is ignored by git.

## Storefront

`shop/storefront` is the customer-facing app, served under `/shop`. It is a
separate app from `web`: both use `@kiboar/design` for the base CSS and
tokens, `@kiboar/vite-config` for the Vite setup and `@kiboar/tsconfig` for the
compiler options, but neither imports the other's pages or components.

```bash
cp shop/storefront/.env.template shop/storefront/.env.local
# edit it: VITE_MEDUSA_URL and the online publishable key from shop/seed-output.json
pnpm --filter @kiboar/storefront dev        # http://localhost:3001
pnpm --filter @kiboar/storefront typecheck
pnpm --filter @kiboar/storefront build
```

The seed creates a **Kiboar Online** publishable key and writes it as
`onlineKey` in `shop/seed-output.json`. You can also create keys in the admin
under **Settings → Developer → Publishable API keys**. The key scopes the Store
API to its sales channel, so the storefront only sees the online catalogue and
the POS only sees the POS one. The Medusa `STORE_CORS` must include the
storefront origin; the template allows both `http://localhost:3000` and
`http://localhost:3001` in development, plus `http://localhost:8081` for the POS
web preview.

Each product page shows a **Keyboard files on GitHub** button when the product's
`metadata.keyboard_files_url` is set. Edit it from the **Keyboard files URL**
field in the product's **Edit Product** form; leave it empty to hide the button.

The same form has an **Official firmware** upload. The local file provider stores
the file in `shop/static` (ignored by git) and the relative `/static/<id>` path
is saved in `metadata.firmware_url`; the storefront shows **Download official
firmware** when it is set. Production needs an object-storage provider; the local
provider is for development.

Every storefront page shows a banner under the header that links to **Kiboar
Studio** at `/studio`, where the desktop app can be downloaded.

## POS

`shop/pos` is the mobile till. It reads the catalogue from the Store API with
the **Kiboar POS** publishable key, and signs staff in against the Admin API to
read the sales register and complete cash sales. It keeps the cart locally and
takes Stripe QR payments once the checkout endpoint lands. See
[`pos/README.md`](pos/README.md) for the stack, the backend contract and the
distribution notes.

```bash
cp shop/pos/.env.template shop/pos/.env.local
# edit it: EXPO_PUBLIC_POS_PUBLISHABLE_KEY from shop/seed-output.json
pnpm --filter @kiboar/shop exec medusa user -e staff@example.com -p 'a-strong-password'
pnpm --filter @kiboar/pos start
pnpm --filter @kiboar/pos typecheck
pnpm --filter @kiboar/pos test
```

The `medusa user` command creates the admin account the POS signs in with. The
token is kept in `expo-secure-store` on a device and in memory in the web
preview.

## pnpm notes

Medusa needs some packages hoisted to the top-level `node_modules`. That is why
the repository root has an `.npmrc` with the four `public-hoist-pattern`
entries from the Medusa pnpm guide. Do not remove them: without them the admin
fails with `can't resolve @medusajs/dashboard` or a missing `QueryClient`.

## Deployment

The storefront is static: build it with `VITE_BASE_PATH=/shop/` and serve it at
`/shop`. The Medusa service (Store API and admin) needs Node and PostgreSQL and
is proxied behind the same prefix; the admin and the API come from that process,
so the rewrite has to keep their paths consistent. Production CORS must include
the brand domain.

The routing and the production host are not configured in this repository.

## Sales register

`GET /admin/reports/sales` is the single read used by the admin **Sales** page
and the POS **Sales register** screen. It returns the orders with `channel`
(`online`, `pos` or `other`), `channel_name` and `payment_method`
(`stripe_link`, `cash` or `other`). The seed tags the two sales channels with
`metadata.kiboar_channel`; cash sales write `order.metadata.payment_method` as
`cash`, and the Stripe checkout must write `stripe_link`. When the metadata is
missing, the register falls back to the Stripe provider id and then to `other`.

## What is not here

- No online Medusa cart, checkout, customer accounts or search. The storefront
  bag is local to the browser and is lost on reload. The POS completes cash
  sales; the Stripe QR is still pending.
- No payment provider beyond the system provider the seed registers, and no
  shipping rates beyond the seeded free store pickup.
- No deployment configuration. The `/shop` route is a host concern; the
  applications themselves are ready to build.
