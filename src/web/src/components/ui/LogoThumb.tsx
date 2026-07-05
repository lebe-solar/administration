import { useState } from 'react';

export function LogoThumb({ src, name, size = 36 }: { src?: string | null; name?: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, background: 'var(--white)', border: '1px solid var(--gray-400)', padding: 3 }} />
    );
  }
  const initials = (name || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span style={{ width: size, height: size, borderRadius: 8, background: 'var(--sage)', color: 'var(--yellow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flex: 'none' }}>
      {initials}
    </span>
  );
}
