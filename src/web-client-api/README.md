# lebe-web-client-api

Separate, public, read-only API for the SEO-oriented public WebClient (`src/web-client`).
Reads public-safe data directly from the same Cosmos DB the Admin API (`src/api`) uses, but is
a distinct deployable with its own auth model (none — everything here is intentionally public)
and its own data-exposure rules (no Draft/Hidden content, no admin-only fields).

**Do not use this as a general-purpose API and do not add write endpoints here.** It exists
only to serve build-time data to the public WebClient's static export.

## Local development

```sh
cd src/web-client-api
npm install
cp .env.example .env   # fill in AZURE_COSMOS_CONNECTION_STRING (same value as src/api's)
npm run dev
```

Runs on `http://localhost:4100` by default (override with `PORT`). Then, in `src/web-client`,
set `WEB_CLIENT_API_BASE_URL=http://localhost:4100/api` before running `npm run dev` or
`npm run build` there.

## Endpoints

- `GET /api/products-page` — public-safe products + manufacturers for the `/produkte` page.
- `GET /health` — liveness check.

## How it's used in CI

The `web-client-deploy.yml` GitHub Actions workflow builds this service and runs it locally
(`node dist/server.js`, bound to `localhost`) for the duration of the `src/web-client` static
build, so `next build` can fetch real data from `${WEB_CLIENT_API_BASE_URL}/products-page` at
build time — no persistent Azure deployment of this service exists yet.
