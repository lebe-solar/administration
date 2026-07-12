// Augments Express's Request with the identity claims decoded from the bearer token by
// createAuthMiddleware (src/middleware/auth.ts). Populated only when auth is enforced
// (AZURE_AD_TENANT_ID/AZURE_AD_CLIENT_ID are set) — undefined in local unauthenticated dev.
declare namespace Express {
    export interface Request {
        user?: {
            oid?: string
            name?: string
            email?: string
        }
    }
}
