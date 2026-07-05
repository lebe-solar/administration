export interface DatabaseConfig {
    connectionString: string
    databaseName: string
}

export interface StorageConfig {
    accountName: string
    blobEndpoint: string
    connectionString?: string
}

export interface AppConfig {
    database: DatabaseConfig
    storage: StorageConfig
}
