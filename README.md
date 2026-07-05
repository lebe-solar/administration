# LeBe Solarenergie — Product Administration

Production implementation of the `ui_kits/admin` design (`project/ui_kits/admin/index.html` and its imports): a React + Vite admin frontend backed by a real Express + SQLite API, covering Products, Manufacturers, and Offers/Angebotspakete.

## Structure

- `backend/` — Express API (`better-sqlite3` storage, `multer` file uploads for PDFs/logos/images). Seeds itself from the design system's mock data on first run.
- `frontend/` — React + TypeScript + Vite SPA. Dev server proxies `/api` and `/uploads` to the backend.

## Running locally

```bash
# Terminal 1 — API on :4000
cd backend
npm install
npm run dev

# Terminal 2 — frontend on :5173
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The SQLite database (`backend/data/app.db`) and uploaded files (`backend/uploads/`) are created automatically; delete `backend/data/app.db*` to reset to the seed data.

## Notes

- Design tokens (colors, type, spacing, fonts) and brand/product imagery were ported from `project/tokens/`, `project/fonts/`, and `project/assets/` into `frontend/src/styles/` and `frontend/public/assets/`.
- Söhne is a licensed commercial typeface (Klim Type Foundry) — confirm licensing before shipping the bundled `.woff2` files externally, per the design system's own caveat.
