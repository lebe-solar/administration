import { useRef, useState } from 'react';
import { LogoThumb } from './LogoThumb';
import { AdminButton } from './Button';
import { uploadFile, ApiError } from '../../api/client';

export function LogoUpload({ value, name, onChange, accept = 'image/png,image/jpeg,image/svg+xml,image/webp' }: {
  value?: string | null; name?: string; onChange: (url: string) => void; accept?: string;
}) {
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setState('uploading');
    try {
      const res = await uploadFile('logo', f);
      setState('idle');
      onChange(res.url);
    } catch (e) {
      setState('error'); setErrMsg(e instanceof ApiError ? e.message : 'Upload fehlgeschlagen.');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => handle(e.target.files)} />
      <LogoThumb src={value} name={name} size={64} />
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          <AdminButton size="sm" variant="outline" icon="upload" onClick={() => ref.current?.click()}>{value ? 'Ersetzen' : 'Hochladen'}</AdminButton>
          {value && <AdminButton size="sm" variant="ghost" icon="trash" onClick={() => { setState('idle'); onChange(''); }}>Entfernen</AdminButton>}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: state === 'uploading' ? 'var(--sage)' : state === 'error' ? '#c0392b' : 'var(--gray-mid)' }}>
          {state === 'uploading' ? 'Wird hochgeladen…' : state === 'error' ? errMsg : 'PNG, JPG, SVG oder WEBP'}
        </p>
      </div>
    </div>
  );
}
