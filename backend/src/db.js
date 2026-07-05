import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    logo TEXT,
    link TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    Header TEXT NOT NULL,
    Beschreibung TEXT DEFAULT '',
    Hersteller TEXT,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    Garantie TEXT DEFAULT '',
    Power REAL,
    Unit TEXT,
    Spezifikation TEXT,
    hasSpec INTEGER DEFAULT 0,
    Logo TEXT,
    Status TEXT DEFAULT 'Draft',
    panelHeightMeters REAL,
    panelWidthMeters REAL,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS offer_components (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price REAL DEFAULT 0,
    descriptionLines TEXT DEFAULT '[]',
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    conditions TEXT DEFAULT '',
    validUntil TEXT,
    designedFor TEXT DEFAULT '',
    system TEXT DEFAULT '',
    price TEXT DEFAULT '',
    priceAmount REAL,
    priceCurrency TEXT DEFAULT 'EUR',
    priceLabel TEXT DEFAULT '',
    link TEXT DEFAULT '',
    slug TEXT UNIQUE,
    previewImage TEXT,
    products TEXT DEFAULT '{}',
    inclusive TEXT DEFAULT '[]',
    allowChanges INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Draft',
    createdAt TEXT,
    updatedAt TEXT
  );
`);
