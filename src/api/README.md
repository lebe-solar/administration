# LeBe Solarenergie Administration API

Express REST API for products, manufacturers, and offers, hosted on Azure Functions via the custom-handler model. See the root `README.md` for the full architecture.

## Setup

### Prerequisites

- Node 20+
- npm

### Local Environment

Create a `.env` with the following configuration:

- `AZURE_COSMOS_CONNECTION_STRING` — a MongoDB-compatible connection string (a local MongoDB works fine for development; Cosmos DB's Mongo API is wire-compatible)
- `AZURE_COSMOS_DATABASE_NAME` — database name (default: `LeBeAdmin`); created automatically if it doesn't exist
- `AZURE_STORAGE_ACCOUNT_NAME` / `AZURE_STORAGE_BLOB_ENDPOINT` — used when authenticating to Blob Storage via managed identity (Azure)
- `AZURE_STORAGE_CONNECTION_STRING` — used instead of the above for local development (e.g. against [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite))

### Install Dependencies

Run `npm ci` to install local dependencies.

### Build & Compile

Run `npm run build` to build & compile the TypeScript code into the `./dist` folder.

### Run application

Run `npm start` to start the local development server.

Launch browser @ `http://localhost:3100`. The default page hosts the OpenAPI UI where you can try out the API. On first run, if the `Products` collection is empty, it seeds itself with sample data derived from the Memodo product export.
