import { RequestHandler } from "express";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { AuthConfig } from "../config/appConfig";

// The frontend has no "Expose an API" scope configured on its app registration (see
// src/web/src/auth/msalConfig.ts), so the SPA sends its own ID token as the bearer
// credential. We therefore validate it as an ID token: audience = the SPA's client id,
// issuer = this tenant's v2.0 endpoint.
export function createAuthMiddleware(authConfig: AuthConfig): RequestHandler {
    const issuer = `https://login.microsoftonline.com/${authConfig.tenantId}/v2.0`;
    const client = jwksClient({
        jwksUri: `https://login.microsoftonline.com/${authConfig.tenantId}/discovery/v2.0/keys`,
        cache: true,
        rateLimit: true,
    });

    const getSigningKey = (header: JwtHeader, callback: SigningKeyCallback) => {
        if (!header.kid) {
            callback(new Error("Token header is missing 'kid'."));
            return;
        }
        client.getSigningKey(header.kid, (err, key) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, key?.getPublicKey());
        });
    };

    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;

        if (!token) {
            res.status(401).json({ error: "Authentifizierung erforderlich." });
            return;
        }

        jwt.verify(
            token,
            getSigningKey,
            { algorithms: ["RS256"], audience: authConfig.clientId, issuer },
            (err) => {
                if (err) {
                    res.status(401).json({ error: "Ungültiges oder abgelaufenes Token." });
                    return;
                }
                next();
            },
        );
    };
}
