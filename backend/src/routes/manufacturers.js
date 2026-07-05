import { Router } from 'express';
import { db } from '../db.js';

export const manufacturersRouter = Router();

function withLinkedCount(m) {
  const n = db.prepare('SELECT COUNT(*) AS n FROM products WHERE manufacturer_id = ?').get(m.id).n;
  return { ...m, linkedProducts: n };
}

manufacturersRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM manufacturers ORDER BY name').all();
  res.json(rows.map(withLinkedCount));
});

manufacturersRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Hersteller nicht gefunden.' });
  res.json(withLinkedCount(row));
});

function validateManufacturer(body, excludeId) {
  const errors = {};
  const name = (body.name || '').trim();
  if (!name) errors.name = 'Name ist erforderlich';
  else {
    const dupe = db.prepare('SELECT id FROM manufacturers WHERE lower(name) = lower(?) AND id != ?').get(name, excludeId ?? -1);
    if (dupe) errors.name = 'Dieser Herstellername existiert bereits';
  }
  return errors;
}

manufacturersRouter.post('/', (req, res) => {
  const errors = validateManufacturer(req.body, null);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const info = db.prepare('INSERT INTO manufacturers (name, description, logo, link) VALUES (?, ?, ?, ?)')
    .run(req.body.name.trim(), req.body.description || '', req.body.logo || null, req.body.link || '');
  const row = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(withLinkedCount(row));
});

manufacturersRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Hersteller nicht gefunden.' });
  const errors = validateManufacturer(req.body, id);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  db.prepare('UPDATE manufacturers SET name = ?, description = ?, logo = ?, link = ? WHERE id = ?')
    .run(req.body.name.trim(), req.body.description || '', req.body.logo ?? existing.logo, req.body.link || '', id);
  const row = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(id);
  res.json(withLinkedCount(row));
});

manufacturersRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Hersteller nicht gefunden.' });
  const linked = db.prepare('SELECT COUNT(*) AS n FROM products WHERE manufacturer_id = ?').get(id).n;
  if (linked > 0) return res.status(409).json({ error: `„${existing.name}" hat ${linked} verknüpfte Produkte und kann nicht gelöscht werden.` });
  db.prepare('DELETE FROM manufacturers WHERE id = ?').run(id);
  res.status(204).end();
});
