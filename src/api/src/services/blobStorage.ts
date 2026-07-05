import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import crypto from "crypto";
import path from "path";
import { StorageConfig } from "../config/appConfig";

let cachedClient: BlobServiceClient | null = null;

function getBlobServiceClient(config: StorageConfig): BlobServiceClient {
    if (cachedClient) {
        return cachedClient;
    }

    if (config.connectionString) {
        // Local dev (Azurite) or any explicit connection string.
        cachedClient = BlobServiceClient.fromConnectionString(config.connectionString);
    } else {
        // In Azure: the Function App's managed identity, granted "Storage Blob Data
        // Contributor" on the storage account by the infra (see infra/app/storage-roles-avm.bicep).
        const url = config.blobEndpoint || `https://${config.accountName}.blob.core.windows.net`;
        cachedClient = new BlobServiceClient(url, new DefaultAzureCredential());
    }

    return cachedClient;
}

export type UploadKind = "pdfs" | "logos" | "images";

export const uploadKindContentTypes: Record<UploadKind, RegExp> = {
    pdfs: /^application\/pdf$/,
    logos: /^image\/(png|jpeg|svg\+xml|webp)$/,
    images: /^image\/(png|jpeg|svg\+xml|webp)$/,
};

export async function uploadBlob(config: StorageConfig, kind: UploadKind, originalFilename: string, contentType: string, buffer: Buffer): Promise<{ url: string, filename: string }> {
    const client = getBlobServiceClient(config);
    const containerClient = client.getContainerClient(kind);
    await containerClient.createIfNotExists({ access: "blob" });

    const ext = path.extname(originalFilename).toLowerCase();
    const blobName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
    });

    return { url: blockBlobClient.url, filename: originalFilename };
}
