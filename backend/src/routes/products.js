import { Router } from 'express';
import { db } from '../db.js';
import { CATEGORIES } from './categories.js';

export const productsRouter = Router();

function rowToProduct(row) {
  return { ...row, hasSpec: !!row.hasSpec };
}

productsRouter.get('/', (req, res) => {
  const { category, manufacturer_id, status, q } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (manufacturer_id && manufacturer_id !== 'all') { sql += ' AND manufacturer_id = ?'; params.push(Number(manufacturer_id)); }
  if (status && status !== 'all') { sql += ' AND Status = ?'; params.push(status); }
  if (q) { sql += ' AND (Header LIKE ? OR id LIKE ? OR Hersteller LIKE ?)'; const like = `%${q}%`; params.push(like, like, like); }
  sql += ' ORDER BY updatedAt DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(rowToProduct));
});

productsRouter.get('/next-id', (req, res) => {
  const category = req.query.category;
  const cat = CATEGORIES.find(c => c.key === category);
  if (!cat) return res.status(400).json({ error: 'Unbekannte Kategorie.' });
  const rows = db.prepare('SELECT id FROM products WHERE id LIKE ?').all(`${cat.prefix}-%`);
  const nums = rows.map(r => parseInt(String(r.id).split('-')[1], 10) || 0);
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  res.json({ id: `${cat.prefix}-${String(n).padStart(3, '0')}` });
});

productsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Produkt nicht gefunden.' });
  res.json(rowToProduct(row));
});

function validateProduct(body, excludeId, asDraft) {
  const errors = {};
  const id = (body.id || '').trim();
  if (!id) errors.id = 'ID ist erforderlich';
  else {
    const dupe = db.prepare('SELECT id FROM products WHERE id = ? AND id != ?').get(id, excludeId ?? '');
    if (dupe) errors.id = 'Diese ID existiert bereits';
  }
  if (!CATEGORIES.some(c => c.key === body.category)) errors.category = 'Ungültige Kategorie';
  if (!(body.Header || '').trim()) errors.Header = 'Titel ist erforderlich';
  if (!body.manufacturer_id) errors.manufacturer_id = 'Hersteller wählen';
  else if (!db.prepare('SELECT id FROM manufacturers WHERE id = ?').get(Number(body.manufacturer_id))) errors.manufacturer_id = 'Hersteller existiert nicht';
  if (!asDraft) {
    if (!(body.Beschreibung || '').trim()) errors.Beschreibung = 'Beschreibung ist erforderlich';
    if (!body.Spezifikation) errors.Spezifikation = 'Spezifikations-PDF ist erforderlich';
  }
  if (body.Power !== '' && body.Power != null && isNaN(Number(body.Power))) errors.Power = 'Power muss eine Zahl sein';
  if (body.category === 'Solarmodule') {
    if (body.panelHeightMeters === '' || body.panelHeightMeters == null || isNaN(Number(body.panelHeightMeters))) errors.panelHeightMeters = 'Zahl erforderlich (nur Solarmodule)';
    if (body.panelWidthMeters === '' || body.panelWidthMeters == null || isNaN(Number(body.panelWidthMeters))) errors.panelWidthMeters = 'Zahl erforderlich (nur Solarmodule)';
  }
  return errors;
}

function today() { return new Date().toISOString().slice(0, 10); }

productsRouter.post('/', (req, res) => {
  const asDraft = req.body.Status === 'Draft';
  const errors = validateProduct(req.body, null, asDraft);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const b = req.body;
  const isSolar = b.category === 'Solarmodule';
  const man = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(Number(b.manufacturer_id));
  const rec = {
    id: b.id.trim(), category: b.category, Header: b.Header.trim(), Beschreibung: b.Beschreibung || '',
    Hersteller: man.name, manufacturer_id: man.id, Garantie: b.Garantie || '',
    Power: b.Power === '' || b.Power == null ? null : Number(b.Power), Unit: b.Unit || '',
    Spezifikation: b.Spezifikation || null, hasSpec: b.Spezifikation ? 1 : 0,
    Logo: b.Logo || man.logo, Status: b.Status || 'Draft',
    panelHeightMeters: isSolar ? Number(b.panelHeightMeters) : null,
    panelWidthMeters: isSolar ? Number(b.panelWidthMeters) : null,
    createdAt: today(), updatedAt: today(),
  };
  db.prepare(`
    INSERT INTO products (id, category, Header, Beschreibung, Hersteller, manufacturer_id, Garantie, Power, Unit, Spezifikation, hasSpec, Logo, Status, panelHeightMeters, panelWidthMeters, createdAt, updatedAt)
    VALUES (@id, @category, @Header, @Beschreibung, @Hersteller, @manufacturer_id, @Garantie, @Power, @Unit, @Spezifikation, @hasSpec, @Logo, @Status, @panelHeightMeters, @panelWidthMeters, @createdAt, @updatedAt)
  `).run(rec);
  res.status(201).json(rowToProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(rec.id)));
});

productsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produkt nicht gefunden.' });
  const asDraft = req.body.Status === 'Draft';
  const errors = validateProduct(req.body, existing.id, asDraft);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const b = req.body;
  const isSolar = b.category === 'Solarmodule';
  const man = db.prepare('SELECT * FROM manufacturers WHERE id = ?').get(Number(b.manufacturer_id));
  const newId = b.id.trim();
  const rec = {
    oldId: existing.id, id: newId, category: b.category, Header: b.Header.trim(), Beschreibung: b.Beschreibung || '',
    Hersteller: man.name, manufacturer_id: man.id, Garantie: b.Garantie || '',
    Power: b.Power === '' || b.Power == null ? null : Number(b.Power), Unit: b.Unit || '',
    Spezifikation: b.Spezifikation || null, hasSpec: b.Spezifikation ? 1 : 0,
    Logo: b.Logo || man.logo, Status: b.Status || 'Draft',
    panelHeightMeters: isSolar ? Number(b.panelHeightMeters) : null,
    panelWidthMeters: isSolar ? Number(b.panelWidthMeters) : null,
    updatedAt: today(),
  };
  db.prepare(`
    UPDATE products SET id=@id, category=@category, Header=@Header, Beschreibung=@Beschreibung, Hersteller=@Hersteller,
      manufacturer_id=@manufacturer_id, Garantie=@Garantie, Power=@Power, Unit=@Unit, Spezifikation=@Spezifikation,
      hasSpec=@hasSpec, Logo=@Logo, Status=@Status, panelHeightMeters=@panelHeightMeters, panelWidthMeters=@panelWidthMeters,
      updatedAt=@updatedAt
    WHERE id=@oldId
  `).run(rec);
  res.json(rowToProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(newId)));
});

productsRouter.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Produkt nicht gefunden.' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
