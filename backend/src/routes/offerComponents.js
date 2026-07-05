import { Router } from 'express';
import { db } from '../db.js';

export const offerComponentsRouter = Router();

function rowToComponent(row) {
  return { ...row, descriptionLines: JSON.parse(row.descriptionLines || '[]') };
}
function today() { return new Date().toISOString().slice(0, 10); }
function slugify(s) {
  return (s || '').toLowerCase()
    .replace(/[äöü ]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue', ' ': '-' }[m]))
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

offerComponentsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM offer_components ORDER BY updatedAt DESC').all();
  res.json(rows.map(rowToComponent));
});

offerComponentsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM offer_components WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Leistungsposition nicht gefunden.' });
  res.json(rowToComponent(row));
});

function validateComponent(body) {
  const errors = {};
  if (!(body.name || '').trim()) errors.name = 'Name erforderlich';
  if (!Array.isArray(body.descriptionLines) || !body.descriptionLines.some(l => (l || '').trim())) errors.descriptionLines = 'Mindestens eine Beschreibungszeile';
  return errors;
}

offerComponentsRouter.post('/', (req, res) => {
  const errors = validateComponent(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const b = req.body;
  let id = slugify(b.name) || `service-${Date.now()}`;
  if (db.prepare('SELECT id FROM offer_components WHERE id = ?').get(id)) id = `${id}-${Date.now().toString(36)}`;
  const rec = {
    id, name: b.name.trim(), quantity: Number(b.quantity) || 1, price: Number(b.price) || 0,
    descriptionLines: JSON.stringify(b.descriptionLines.filter(l => (l || '').trim())), updatedAt: today(),
  };
  db.prepare('INSERT INTO offer_components (id, name, quantity, price, descriptionLines, updatedAt) VALUES (@id, @name, @quantity, @price, @descriptionLines, @updatedAt)').run(rec);
  res.status(201).json(rowToComponent(db.prepare('SELECT * FROM offer_components WHERE id = ?').get(id)));
});

offerComponentsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM offer_components WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Leistungsposition nicht gefunden.' });
  const errors = validateComponent(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const b = req.body;
  db.prepare('UPDATE offer_components SET name=?, quantity=?, price=?, descriptionLines=?, updatedAt=? WHERE id=?')
    .run(b.name.trim(), Number(b.quantity) || 1, Number(b.price) || 0, JSON.stringify(b.descriptionLines.filter(l => (l || '').trim())), today(), existing.id);
  res.json(rowToComponent(db.prepare('SELECT * FROM offer_components WHERE id = ?').get(existing.id)));
});

offerComponentsRouter.post('/:id/duplicate', (req, res) => {
  const existing = db.prepare('SELECT * FROM offer_components WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Leistungsposition nicht gefunden.' });
  const id = `${existing.id}-copy-${Date.now().toString(36)}`;
  db.prepare('INSERT INTO offer_components (id, name, quantity, price, descriptionLines, updatedAt) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, `${existing.name} (Copy)`, existing.quantity, existing.price, existing.descriptionLines, today());
  res.status(201).json(rowToComponent(db.prepare('SELECT * FROM offer_components WHERE id = ?').get(id)));
});

offerComponentsRouter.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM offer_components WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Leistungsposition nicht gefunden.' });
  db.prepare('DELETE FROM offer_components WHERE id = ?').run(existing.id);
  res.status(204).end();
});
