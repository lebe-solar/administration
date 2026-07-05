import { Router } from 'express';
import { uploadPdf, uploadImage, uploadLogo } from '../middleware/upload.js';

export const uploadsRouter = Router();

function handleUpload(field, dir) {
  return (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Keine Datei empfangen.' });
    res.json({ url: `/uploads/${dir}/${req.file.filename}`, filename: req.file.originalname });
  };
}

uploadsRouter.post('/pdf', (req, res, next) => {
  uploadPdf.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    handleUpload('file', 'pdfs')(req, res);
  });
});

uploadsRouter.post('/image', (req, res, next) => {
  uploadImage.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    handleUpload('file', 'images')(req, res);
  });
});

uploadsRouter.post('/logo', (req, res, next) => {
  uploadLogo.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    handleUpload('file', 'logos')(req, res);
  });
});
