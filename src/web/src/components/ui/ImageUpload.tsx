import { useRef, useState } from 'react';
import { Icon } from './Icon';
import { uploadFile } from '../../api/client';

function overlayBtn(color?: string) {
  return { background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 'var(--radius-pill)', padding: '6px 12px', fontSize: 12.5, fontWeight: 600, color: color || 'var(--charcoal)', cursor: 'pointer', fontFamily: 'var(--font-sans)' } as const;
}

export function ImageUpload({ value, onChange, label = 'Vorschaubild hochladen' }: { value?: string | null; onChange: (url: string) => void; label?: string }) {
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const ref = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) { setState('error'); return; }
    setState('uploading');
    try {
      const res = await uploadFile('image', file);
      setState('idle');
      onChange(res.url);
    } catch {
      setState('error');
    }
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{ display: 'none' }} onChange={e => handle(e.target.files)} />
      {!value && state !== 'uploading' && (
        <div onClick={() => ref.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handle(e.dataTransfer.files); }}
          style={{ border: `1.5px dashed ${state === 'error' ? '#c0392b' : 'var(--gray-500)'}`, borderRadius: 'var(--radius-md)', padding: '26px 18px', textAlign: 'center', cursor: 'pointer', background: 'var(--gray-300)' }}>
          <Icon name="image" size={24} color="var(--sage)" style={{ marginBottom: 6 }} />
          <p style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-mid)' }}>PNG, JPG, WEBP oder SVG</p>
          {state === 'error' && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#c0392b' }}>Ungültiges Bildformat.</p>}
        </div>
      )}
      {state === 'uploading' && (
        <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13 }}>Bild wird hochgeladen…</p>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-400)', overflow: 'hidden' }}><div style={{ height: '100%', width: '55%', background: 'var(--sage)', animation: 'admloader 1s ease-in-out infinite' }} /></div>
        </div>
      )}
      {value && state !== 'uploading' && (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-400)' }}>
          <img src={value} alt="Vorschau" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
            <button onClick={() => ref.current?.click()} style={overlayBtn()}>Ersetzen</button>
            <button onClick={() => { setState('idle'); onChange(''); }} style={overlayBtn('#c0392b')}>Entfernen</button>
          </div>
          <div style={{ position: 'absolute', bottom: 10, left: 10, fontSize: 11.5, color: '#1f8a5b', background: 'var(--white)', padding: '3px 8px', borderRadius: 'var(--radius-pill)', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="check" size={12} />Hochgeladen</div>
        </div>
      )}
    </div>
  );
}
