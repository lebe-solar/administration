import express from "express";
import multer from "multer";
import { AppConfig } from "../config/appConfig";
import { uploadBlob, uploadKindContentTypes, UploadKind } from "../services/blobStorage";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

export default function createUploadsRouter(config: AppConfig) {
    const router = express.Router();

    function handler(kind: UploadKind) {
        return [
            upload.single("file"),
            async (req: express.Request, res: express.Response) => {
                if (!req.file) {
                    return res.status(400).json({ error: "Keine Datei empfangen." });
                }
                if (!uploadKindContentTypes[kind].test(req.file.mimetype)) {
                    return res.status(400).json({ error: kind === "pdfs" ? "Nur PDF-Dateien sind erlaubt." : "Ungültiges Bildformat. Erlaubt: PNG, JPG, WEBP, SVG." });
                }

                const result = await uploadBlob(config.storage, kind, req.file.originalname, req.file.mimetype, req.file.buffer);
                res.json(result);
            },
        ];
    }

    router.post("/pdf", ...handler("pdfs"));
    router.post("/image", ...handler("images"));
    router.post("/logo", ...handler("logos"));

    return router;
}
