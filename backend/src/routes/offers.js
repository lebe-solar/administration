import { Router } from 'express';
import { db } from '../db.js';

export const offersRouter = Router();

const SLOTS = ['solarModule', 'inverter', 'storage', 'wallbox', 'heatingSystem'];

function rowToOffer(row) {
  return { ...row, allowChanges: !!row.allowChanges, products: JSON.parse(row.products || '{}'), inclusive: JSON.parse(row.inclusive || '[]') };
}
function today() { return new Date().toISOString().slice(0, 10); }
function slugify(s) {
  return (s || '').toLowerCase()
    .replace(/[äöü ]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue', ' ': '-' }[m]))
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
function isExpired(o) { return o.validUntil && o.validUntil < today(); }
function linkedProductCount(products) { return SLOTS.reduce((n, s) => n + (products && products[s + 'Id'] ? 1 : 0), 0); }

offersRouter.get('/', (req, res) => {
  const { status, q } = req.query;
  let rows = db.prepare('SELECT * FROM offers ORDER BY updatedAt DESC').all().map(rowToOffer);
  if (status && status !== 'all') rows = rows.filter(o => o.status === status);
  if (q) rows = rows.filter(o => (o.title + ' ' + o.id + ' ' + o.subtitle).toLowerCase().includes(String(q).toLowerCase()));
  if (req.query.price && req.query.price !== 'all') {
    const p = req.query.price;
    rows = rows.filter(o => {
      const amt = o.priceAmount || 0;
      if (p === 'lt15') return amt < 15000;
      if (p === '15to30') return amt >= 15000 && amt <= 30000;
      return amt > 30000;
    });
  }
  if (req.query.valid && req.query.valid !== 'all') {
    rows = rows.filter(o => (req.query.valid === 'active' ? !isExpired(o) : isExpired(o)));
  }
  res.json(rows);
});

offersRouter.get('/next-id', (req, res) => {
  const rows = db.prepare('SELECT id FROM offers').all();
  const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ''), 10) || 0);
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  res.json({ id: `OFF-${String(n).padStart(3, '0')}` });
});

offersRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Angebot nicht gefunden.' });
  res.json(rowToOffer(row));
});

function validateOffer(body, excludeId, asDraft) {
  const errors = {};
  const id = (body.id || '').trim();
  if (!id) errors.id = 'ID erforderlich';
  else if (db.prepare('SELECT id FROM offers WHERE id = ? AND id != ?').get(id, excludeId ?? '')) errors.id = 'Diese ID existiert bereits';
  if (!(body.title || '').trim()) errors.title = 'Titel erforderlich';
  const slug = body.slug || slugify(body.title);
  if (slug && db.prepare('SELECT id FROM offers WHERE slug = ? AND id != ?').get(slug, excludeId ?? '')) errors.slug = 'Slug bereits vergeben';
  if (body.priceAmount !== '' && body.priceAmount != null && isNaN(Number(body.priceAmount))) errors.priceAmount = 'Muss eine Zahl sein';

  const products = body.products || {};
  for (const s of SLOTS) {
    const pid = products[s + 'Id'];
    if (pid && !db.prepare('SELECT id FROM products WHERE id = ?').get(pid)) errors.products = `Produkt ${pid} existiert nicht im Katalog`;
  }

  if (!asDraft) {
    if (!(body.subtitle || '').trim()) errors.subtitle = 'Untertitel erforderlich';
    if (!(body.description || '').trim()) errors.description = 'Beschreibung erforderlich';
    if (!(body.priceLabel || '').trim() && (body.priceAmount === '' || body.priceAmount == null)) errors.priceLabel = 'Preis-Label oder Betrag erforderlich';
    if (!body.previewImage) errors.previewImage = 'Vorschaubild erforderlich';
    if (!body.validUntil || isNaN(Date.parse(body.validUntil))) errors.validUntil = 'Gültiges Datum erforderlich';
    if (linkedProductCount(products) === 0) errors.products = 'Mindestens ein Produkt verknüpfen';
    (body.inclusive || []).forEach((s, i) => {
      if (!(s.name || '').trim() || (Number(s.quantity) || 0) <= 0 || !(s.descriptionLines || []).some(l => (l || '').trim())) errors[`svc${i}`] = 'Ungültige Leistungsposition';
    });
  }
  return errors;
}

offersRouter.post('/', (req, res) => {
  const b = req.body;
  const asDraft = b.status === 'Draft';
  const errors = validateOffer(b, null, asDraft);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const rec = {
    id: b.id.trim(), title: b.title.trim(), subtitle: b.subtitle || '', description: b.description || '',
    conditions: b.conditions || '', validUntil: b.validUntil || null, designedFor: b.designedFor || '',
    system: b.system || '', priceAmount: b.priceAmount === '' || b.priceAmount == null ? null : Number(b.priceAmount),
    priceCurrency: b.priceCurrency || 'EUR', priceLabel: b.priceLabel || '',
    price: b.priceLabel || b.price || (b.priceAmount ? `${Number(b.priceAmount).toLocaleString('de-DE')} €` : ''),
    link: b.link || '', slug: b.slug || slugify(b.title), previewImage: b.previewImage || null,
    products: JSON.stringify(b.products || {}), inclusive: JSON.stringify(b.inclusive || []),
    allowChanges: b.allowChanges ? 1 : 0, status: b.status || 'Draft', createdAt: today(), updatedAt: today(),
  };
  db.prepare(`
    INSERT INTO offers (id, title, subtitle, description, conditions, validUntil, designedFor, system, price, priceAmount, priceCurrency, priceLabel, link, slug, previewImage, products, inclusive, allowChanges, status, createdAt, updatedAt)
    VALUES (@id, @title, @subtitle, @description, @conditions, @validUntil, @designedFor, @system, @price, @priceAmount, @priceCurrency, @priceLabel, @link, @slug, @previewImage, @products, @inclusive, @allowChanges, @status, @createdAt, @updatedAt)
  `).run(rec);
  res.status(201).json(rowToOffer(db.prepare('SELECT * FROM offers WHERE id = ?').get(rec.id)));
});

offersRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Angebot nicht gefunden.' });
  const b = req.body;
  const asDraft = b.status === 'Draft';
  const errors = validateOffer(b, existing.id, asDraft);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const newId = b.id.trim();
  const rec = {
    oldId: existing.id, id: newId, title: b.title.trim(), subtitle: b.subtitle || '', description: b.description || '',
    conditions: b.conditions || '', validUntil: b.validUntil || null, designedFor: b.designedFor || '',
    system: b.system || '', priceAmount: b.priceAmount === '' || b.priceAmount == null ? null : Number(b.priceAmount),
    priceCurrency: b.priceCurrency || 'EUR', priceLabel: b.priceLabel || '',
    price: b.priceLabel || b.price || (b.priceAmount ? `${Number(b.priceAmount).toLocaleString('de-DE')} €` : ''),
    link: b.link || '', slug: b.slug || slugify(b.title), previewImage: b.previewImage || null,
    products: JSON.stringify(b.products || {}), inclusive: JSON.stringify(b.inclusive || []),
    allowChanges: b.allowChanges ? 1 : 0, status: b.status || 'Draft', updatedAt: today(),
  };
  db.prepare(`
    UPDATE offers SET id=@id, title=@title, subtitle=@subtitle, description=@description, conditions=@conditions,
      validUntil=@validUntil, designedFor=@designedFor, system=@system, price=@price, priceAmount=@priceAmount,
      priceCurrency=@priceCurrency, priceLabel=@priceLabel, link=@link, slug=@slug, previewImage=@previewImage,
      products=@products, inclusive=@inclusive, allowChanges=@allowChanges, status=@status, updatedAt=@updatedAt
    WHERE id=@oldId
  `).run(rec);
  res.json(rowToOffer(db.prepare('SELECT * FROM offers WHERE id = ?').get(newId)));
});

offersRouter.post('/:id/duplicate', (req, res) => {
  const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Angebot nicht gefunden.' });
  const rows = db.prepare('SELECT id FROM offers').all();
  const nums = rows.map(r => parseInt(String(r.id).replace(/\D/g, ''), 10) || 0);
  const newId = `OFF-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
  const title = `${existing.title} (Copy)`;
  let slug = slugify(title);
  if (db.prepare('SELECT id FROM offers WHERE slug = ?').get(slug)) slug = `${slug}-${Date.now().toString(36)}`;
  const rec = { ...existing, id: newId, title, slug, status: 'Draft', createdAt: today(), updatedAt: today() };
  db.prepare(`
    INSERT INTO offers (id, title, subtitle, description, conditions, validUntil, designedFor, system, price, priceAmount, priceCurrency, priceLabel, link, slug, previewImage, products, inclusive, allowChanges, status, createdAt, updatedAt)
    VALUES (@id, @title, @subtitle, @description, @conditions, @validUntil, @designedFor, @system, @price, @priceAmount, @priceCurrency, @priceLabel, @link, @slug, @previewImage, @products, @inclusive, @allowChanges, @status, @createdAt, @updatedAt)
  `).run(rec);
  res.status(201).json(rowToOffer(db.prepare('SELECT * FROM offers WHERE id = ?').get(newId)));
});

offersRouter.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Angebot nicht gefunden.' });
  db.prepare('DELETE FROM offers WHERE id = ?').run(existing.id);
  res.status(204).end();
});
