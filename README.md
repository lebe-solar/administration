# LeBe Solarenergie — Product Administration

A Product Administration frontend for **LeBe Solarenergie**: manage the products, manufacturers, and sales offers (Angebotspakete) shown on the public website. Deployed to Azure with a Static Web App + Functions + Cosmos DB (MongoDB API) architecture, provisioned and deployed via the Azure Developer CLI (`azd`).

This project was bootstrapped from the [`Azure-Samples/todo-nodejs-mongo-swa-func`](https://github.com/Azure-Samples/todo-nodejs-mongo-swa-func) template — its infrastructure-as-code patterns and the Express-on-Functions custom-handler approach carried over; the sample's Todo application code did not.

### Prerequisites

This template will create infrastructure and deploy code to Azure. If you don't have an Azure subscription, you can sign up for a [free account here](https://azure.microsoft.com/free/). Make sure you have the Contributor role on the Azure subscription.

- [Azure Developer CLI](https://aka.ms/azd-install)
- [Azure Functions Core Tools (4+)](https://docs.microsoft.com/azure/azure-functions/functions-run-local)
- [Node.js with npm (20+)](https://nodejs.org/) — for the API backend and the web frontend

### Quickstart

```bash
# Log in to azd. Only required once per install.
azd auth login

# Provision infrastructure and deploy code to Azure
azd up
```

`azd up` will ask for an environment name, an Azure subscription, and a region, then provision every resource below and deploy both `src/web` and `src/api`.

### Application Architecture

- [**Azure Static Web Apps**](https://docs.microsoft.com/azure/static-web-apps/) hosts the Vite/React admin frontend (`src/web`).
- [**Azure Function Apps**](https://docs.microsoft.com/azure/azure-functions/) (Consumption plan, Node 20, Linux) hosts the Express API (`src/api`) via the [custom handler](https://learn.microsoft.com/azure/azure-functions/functions-custom-handlers) model — the whole Express app runs as a normal HTTP server, with a single catch-all Functions binding forwarding every request to it. This is why the API code looks like a plain Express app rather than a set of individual Function handlers.
- [**Azure Cosmos DB API for MongoDB**](https://docs.microsoft.com/azure/cosmos-db/mongodb/mongodb-introduction), **serverless** capacity (pay-per-request, no idle RU cost — a good fit for a low-traffic internal admin tool), stores four collections: `Products`, `Manufacturers`, `Offers`, `OfferComponents`.
- [**Azure Blob Storage**](https://learn.microsoft.com/azure/storage/blobs/) (the same storage account Functions provisions for its own runtime needs) holds admin-uploaded files in three containers: `pdfs` (product spec sheets), `logos` (manufacturer/product logos), `images` (offer preview images). The Function App's managed identity is granted **Storage Blob Data Contributor** on this account; your `az login` principal gets the same role for local testing (see `infra/app/storage-roles-avm.bicep`).

There is intentionally **no Key Vault or Application Insights/Log Analytics** in this deployment (trimmed from the upstream template to keep the footprint small for an internal tool) — the Cosmos connection string is resolved directly via `listConnectionStrings()` in Bicep and handed to the Function App as a plain app setting. Add them back if/when you need centralized secrets or telemetry.

### Authentication

Sign-in uses **Microsoft Entra ID** via [MSAL.js](https://learn.microsoft.com/entra/identity-platform/msal-overview), restricted to the `lebe-solar-admin` app registration's home tenant (anyone in the tenant can sign in — there is no per-user allow-list). The frontend (`src/web`) redirects unauthenticated users to a Microsoft sign-in page and attaches the resulting ID token as a `Bearer` header on every API call; the backend (`src/api/src/middleware/auth.ts`) validates that token's signature, issuer, and audience against the tenant's JWKS endpoint before allowing a request through. Because the app registration has no "Expose an API" scope, the frontend and API deliberately share one app registration and its ID token as the bearer credential.

Both sides need the tenant and client id of that app registration — `AZURE_AD_TENANT_ID`/`AZURE_AD_CLIENT_ID` for the API, `VITE_AZURE_AD_TENANT_ID`/`VITE_AZURE_AD_CLIENT_ID` for the web app. `infra/main.bicep` wires these through automatically on `azd up` (defaulting to the `lebe-solar-admin` registration's values); for local development without a `.env`/`.env.local` override, both sides fall back to those same defaults. The API only enforces auth once both of its values are non-empty, so local development against an unauthenticated API still works if you don't set them.

### Local development

**API** (`src/api`):

```bash
cd src/api
npm install
```

Create `src/api/.env` with:

```
AZURE_COSMOS_CONNECTION_STRING=<a MongoDB-compatible connection string — a local MongoDB, or the deployed Cosmos account's>
AZURE_COSMOS_DATABASE_NAME=LeBeAdmin
AZURE_STORAGE_ACCOUNT_NAME=<your storage account name, once deployed>
AZURE_STORAGE_CONNECTION_STRING=<a connection string, e.g. Azurite for local blob emulation, or the deployed account's>
```

Then `npm start` (builds + runs on port 3100), or `func start --typescript --port 3100` to run it under the actual Functions host. Either way, the database seeds itself with sample data (from the Memodo product export) on first run if the `Products` collection is empty.

**Web** (`src/web`):

```bash
cd src/web
npm install
VITE_API_BASE_URL=http://localhost:3100 npm run dev
```

Or use the VS Code task **"Start API and Web"**, which wires both up automatically (see `.vscode/tasks.json`).

### Cost of provisioning and deploying this template

This template provisions resources to an Azure subscription that you select on provisioning. Refer to the [Pricing calculator for Microsoft Azure](https://azure.microsoft.com/pricing/calculator/) to estimate cost, and adjust `infra/main.bicep` / `infra/app/*.bicep` to suit your needs. The Function App and App Service Plan use the Consumption (`Y1`) tier, and Cosmos DB is serverless — both scale to (near) zero cost at rest.

### Next steps

- [`azd pipeline config`](https://learn.microsoft.com/azure/developer/azure-developer-cli/configure-devops-pipeline?tabs=GitHub) — configure a CI/CD pipeline (GitHub Actions or Azure DevOps) that deploys on push to `main`.
- [Run and Debug Locally](https://learn.microsoft.com/azure/developer/azure-developer-cli/debug?pivots=ide-vs-code) — using VS Code and the Azure Developer CLI extension.
- [`azd down`](https://learn.microsoft.com/azure/developer/azure-developer-cli/reference#azd-down) — delete all Azure resources created by this template.
- `tests/` has Playwright smoke tests that hit a deployed environment — see `tests/README.md`.

## Security

### Roles

This template creates a [managed identity](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) for the Function App, granted **Storage Blob Data Contributor** on the storage account (see `infra/app/storage-roles-avm.bicep`). `principalId` (your `az login` user, wired automatically by `azd`) is granted the same role so uploads can be exercised locally against real Blob Storage.

### Uploads

PDF specs, logos, and images are validated by content type server-side (`src/api/src/services/blobStorage.ts`) before being written to their respective Blob container, which is configured for anonymous **blob-level** read (not container listing) so the admin UI and public site can link directly to a blob URL without SAS tokens.

## Reporting Issues and Feedback

For issues with the underlying `azd`/Bicep tooling itself, see [Azure Developer CLI issues](https://aka.ms/azure-dev/issues) and [discussions](https://aka.ms/azure-dev/discussions). For issues with this application, please contact the LeBe Solarenergie team.
