import "express-async-errors";
import express, { Express } from "express";
import swaggerUI from "swagger-ui-express";
import cors from "cors";
import yaml from "yamljs";
import mongoose from "mongoose";
import { getConfig } from "./config";
import categories from "./routes/categories";
import manufacturers from "./routes/manufacturers";
import products from "./routes/products";
import offers from "./routes/offers";
import offerComponents from "./routes/offerComponents";
import createUploadsRouter from "./routes/uploads";
import { configureMongoose } from "./models/mongoose";
import { seedIfEmpty } from "./seed";
import { logger } from "./config/observability";
import { createAuthMiddleware } from "./middleware/auth";

// Use API_ALLOW_ORIGINS env var with comma separated urls like
// `http://localhost:300, http://otherurl:100`
// Requests coming to the api server from other urls will be rejected as per
// CORS.
const allowOrigins = process.env.API_ALLOW_ORIGINS;

// Use NODE_ENV to change webConfiguration based on this value.
// For example, setting NODE_ENV=development disables CORS checking,
// allowing all origins.
const environment = process.env.NODE_ENV;

const originList = (): string[] | string => {

    if (environment && environment === "development") {
        console.log(`Allowing requests from any origins. NODE_ENV=${environment}`);
        return "*";
    }

    const origins: string[] = [];

    if (allowOrigins && allowOrigins !== "") {
        allowOrigins.split(",").forEach(origin => {
            origins.push(origin);
        });
    }

    return origins;
};

export const createApp = async (): Promise<Express> => {
    const config = await getConfig();
    const app = express();

    // Configuration
    await configureMongoose(config.database);
    await seedIfEmpty();

    // Middleware
    app.use(express.json());

    app.use(cors({
        origin: originList()
    }));

    // Bearer-token auth (Entra ID). Only enforced once tenant/client id are configured, so
    // local dev without an app registration on hand keeps working unauthenticated.
    const authMiddlewares = config.auth.tenantId && config.auth.clientId
        ? [createAuthMiddleware(config.auth)]
        : [];

    // API Routes
    app.use("/categories", ...authMiddlewares, categories);
    app.use("/manufacturers", ...authMiddlewares, manufacturers);
    app.use("/products", ...authMiddlewares, products);
    app.use("/offers", ...authMiddlewares, offers);
    app.use("/offer-components", ...authMiddlewares, offerComponents);
    app.use("/uploads", ...authMiddlewares, createUploadsRouter(config));

    // Swagger UI (left unauthenticated: it only serves the API's static documentation)
    const swaggerDocument = yaml.load("./openapi.yaml");
    app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

    // Centralized error handling: translate common Mongoose errors into sensible HTTP
    // statuses instead of a bare 500, then log anything unexpected.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err instanceof mongoose.Error.CastError) {
            return res.status(404).json({ error: "Ressource nicht gefunden." });
        }
        if (err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ error: err.message, errors: err.errors });
        }

        logger.error(`Unhandled error: ${err?.stack || err}`);
        res.status(500).json({ error: "Ein interner Fehler ist aufgetreten." });
    });

    return app;
};
