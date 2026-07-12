export interface DatabaseConfig {
    connectionString: string
    databaseName: string
}

export interface StorageConfig {
    accountName: string
    blobEndpoint: string
    connectionString?: string
}

export interface AuthConfig {
    tenantId: string
    clientId: string
}

export interface GitHubConfig {
    owner: string
    repo: string
    workflowId: string
    ref: string
    token: string
}

export interface AppConfig {
    database: DatabaseConfig
    storage: StorageConfig
    auth: AuthConfig
    github: GitHubConfig
}
