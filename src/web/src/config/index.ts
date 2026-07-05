/// <reference types="vite/client" />

export interface ApiConfig {
    baseUrl: string
}

export interface AppConfig {
    api: ApiConfig
}

const config: AppConfig = {
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3100",
    },
};

export default config;
