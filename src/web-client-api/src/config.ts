import dotenv from "dotenv";

export interface WebClientApiConfig {
    port: number
    database: {
        connectionString: string
        databaseName: string
    }
    allowOrigins: string[] | string
}

export function getConfig(): WebClientApiConfig {
    if (process.env.NODE_ENV !== "production") {
        dotenv.config();
    }

    const connectionString = process.env.AZURE_COSMOS_CONNECTION_STRING || "";
    const databaseName = process.env.AZURE_COSMOS_DATABASE_NAME || "LeBeAdmin";

    if (!connectionString) {
        // eslint-disable-next-line no-console
        console.warn("AZURE_COSMOS_CONNECTION_STRING is not set — this service cannot read product data without it.");
    }

    const allowOriginsEnv = process.env.WEB_CLIENT_API_ALLOW_ORIGINS;
    const allowOrigins = process.env.NODE_ENV === "development" || !allowOriginsEnv
        ? "*" // this API is entirely public/read-only, so an open CORS policy is intentional
        : allowOriginsEnv.split(",");

    return {
        port: Number(process.env.PORT) || 4100,
        database: { connectionString, databaseName },
        allowOrigins,
    };
}
