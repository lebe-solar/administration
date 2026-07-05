import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

function storageFor(subdir) {
  const dir = path.join(uploadsRoot, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  });
}

const MB = 1024 * 1024;

export const uploadPdf = multer({
  storage: storageFor('pdfs'),
  limits: { fileSize: 20 * MB },
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    cb(ok ? null : new Error('Nur PDF-Dateien sind erlaubt.'), ok);
  },
});

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
export const uploadImage = multer({
  storage: storageFor('images'),
  limits: { fileSize: 10 * MB },
  fileFilter: (req, file, cb) => {
    const ok = IMAGE_TYPES.has(file.mimetype);
    cb(ok ? null : new Error('Ungültiges Bildformat. Erlaubt: PNG, JPG, WEBP, SVG.'), ok);
  },
});

export const uploadLogo = multer({
  storage: storageFor('logos'),
  limits: { fileSize: 10 * MB },
  fileFilter: (req, file, cb) => {
    const ok = IMAGE_TYPES.has(file.mimetype);
    cb(ok ? null : new Error('Ungültiges Logo-Format. Erlaubt: PNG, JPG, SVG, WEBP.'), ok);
  },
});
