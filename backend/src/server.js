import express from 'express';
import cors from 'cors';
import { seedIfEmpty } from './seed.js';
import { uploadsRoot } from './middleware/upload.js';
import { categoriesRouter } from './routes/categories.js';
import { manufacturersRouter } from './routes/manufacturers.js';
import { productsRouter } from './routes/products.js';
import { offersRouter } from './routes/offers.js';
import { offerComponentsRouter } from './routes/offerComponents.js';
import { uploadsRouter } from './routes/uploads.js';

seedIfEmpty();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadsRoot));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/categories', categoriesRouter);
app.use('/api/manufacturers', manufacturersRouter);
app.use('/api/products', productsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/offer-components', offerComponentsRouter);
app.use('/api/uploads', uploadsRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`LeBe admin API listening on http://localhost:${PORT}`));
