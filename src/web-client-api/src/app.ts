import "express-async-errors";
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { getConfig } from "./config";
import { configureMongoose } from "./mongoose";
import productsPage from "./routes/productsPage";

export const createApp = async (): Promise<Express> => {
    const config = getConfig();
    const app = express();

    await configureMongoose(config.database.connectionString, config.database.databaseName);

    app.use(express.json());
    app.use(cors({ origin: config.allowOrigins }));

    // Everything under /api is intentionally public and unauthenticated — this service exists
    // specifically to serve public-safe, build-time data to the WebClient's static export. Do
    // not add admin-only routes or admin-only fields here; that belongs in src/api.
    app.use("/api/products-page", productsPage);

    app.get("/health", (req, res) => res.json({ status: "ok" }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err instanceof mongoose.Error.CastError) {
            return res.status(404).json({ error: "Ressource nicht gefunden." });
        }
        // eslint-disable-next-line no-console
        console.error(`Unhandled error: ${err?.stack || err}`);
        res.status(500).json({ error: "Ein interner Fehler ist aufgetreten." });
    });

    return app;
};
