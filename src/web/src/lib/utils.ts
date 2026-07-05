import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function fmtDate(d?: string | null) {
  if (!d) return '—';
  const p = d.split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : d;
}

export const euro = (n?: number | null) => (n || 0).toLocaleString('de-DE') + ' €';

export function slugify(s?: string) {
  return (s || '').toLowerCase()
    .replace(/[äöü ]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue', ' ': '-' } as Record<string, string>)[m])
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function isExpired(validUntil?: string | null) {
  return !!validUntil && validUntil < today();
}
