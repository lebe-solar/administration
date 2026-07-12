import { RequestHandler } from "express";
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
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
            (err, decoded) => {
                if (err) {
                    res.status(401).json({ error: "Ungültiges oder abgelaufenes Token." });
                    return;
                }
                // Every route behind this middleware requires the same Entra ID sign-in — this
                // codebase has no separate admin/viewer role concept, so a validated token is
                // the only notion of "admin" that exists. Attach the decoded ID token claims so
                // route handlers can attribute actions (e.g. publication triggeredBy/changedBy).
                const payload = decoded as JwtPayload | undefined;
                req.user = {
                    oid: payload?.oid as string | undefined,
                    name: payload?.name as string | undefined,
                    email: (payload?.preferred_username || payload?.email) as string | undefined,
                };
                next();
            },
        );
    };
}
