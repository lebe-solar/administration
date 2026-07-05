import { AppConfig, DatabaseConfig, StorageConfig } from "./appConfig";
import dotenv from "dotenv";
import { logger } from "../config/observability";
import { IConfig } from "config";

export const getConfig: () => Promise<AppConfig> = async () => {
    // Load any ENV vars from local .env file
    if (process.env.NODE_ENV !== "production") {
        dotenv.config();
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config: IConfig = require("config") as IConfig;
    const databaseConfig = config.get<DatabaseConfig>("database");
    const storageConfig = config.get<StorageConfig>("storage");

    if (!databaseConfig.connectionString) {
        logger.warn("database.connectionString is required but has not been set. Ensure environment variable 'AZURE_COSMOS_CONNECTION_STRING' has been set");
    }

    if (!storageConfig.accountName) {
        logger.warn("storage.accountName is not set. Ensure environment variable 'AZURE_STORAGE_ACCOUNT_NAME' has been set for uploads to work against Azure Blob Storage.");
    }

    return {
        database: {
            connectionString: databaseConfig.connectionString,
            databaseName: databaseConfig.databaseName,
        },
        storage: {
            accountName: storageConfig.accountName,
            blobEndpoint: storageConfig.blobEndpoint,
            connectionString: storageConfig.connectionString,
        },
    };
};
