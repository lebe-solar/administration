import { AppConfig, AuthConfig, DatabaseConfig, GitHubConfig, StorageConfig } from "./appConfig";
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
    const authConfig = config.get<AuthConfig>("auth");
    const githubConfig = config.get<GitHubConfig>("github");

    if (!databaseConfig.connectionString) {
        logger.warn("database.connectionString is required but has not been set. Ensure environment variable 'AZURE_COSMOS_CONNECTION_STRING' has been set");
    }

    if (!storageConfig.accountName) {
        logger.warn("storage.accountName is not set. Ensure environment variable 'AZURE_STORAGE_ACCOUNT_NAME' has been set for uploads to work against Azure Blob Storage.");
    }

    if (!authConfig.tenantId || !authConfig.clientId) {
        logger.warn("auth.tenantId/auth.clientId are not set. Ensure environment variables 'AZURE_AD_TENANT_ID' and 'AZURE_AD_CLIENT_ID' have been set so bearer tokens can be validated.");
    }

    // Never log the token value itself — only whether it's present.
    if (!githubConfig.token) {
        logger.warn("github.token is not set. Ensure environment variable 'GITHUB_TOKEN_FOR_WEBCLIENT_REBUILD' has been set so the public WebClient publish/rebuild workflow can be triggered.");
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
        auth: {
            tenantId: authConfig.tenantId,
            clientId: authConfig.clientId,
        },
        github: {
            owner: githubConfig.owner,
            repo: githubConfig.repo,
            workflowId: githubConfig.workflowId,
            ref: githubConfig.ref,
            token: githubConfig.token,
        },
    };
};
