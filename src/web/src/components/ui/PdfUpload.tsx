import { useRef, useState } from 'react';
import { Icon } from './Icon';
import { IconAction } from './Button';
import { uploadFile, ApiError } from '../../api/client';

export function PdfUpload({ value, filename, onChange }: { value?: string | null; filename?: string | null; onChange: (url: string, filename: string) => void }) {
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setState('error'); setErrMsg('Nur PDF-Dateien sind erlaubt.'); return;
    }
    setState('uploading');
    try {
      const res = await uploadFile('pdf', file);
      setState('idle');
      onChange(res.url, res.filename);
    } catch (e) {
      setState('error'); setErrMsg(e instanceof ApiError ? e.message : 'Upload fehlgeschlagen.');
    }
  }

  const has = !!value;
  return (
    <div>
      <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
      {!has && state !== 'uploading' && (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          style={{ border: `1.5px dashed ${state === 'error' ? '#c0392b' : 'var(--gray-500)'}`, borderRadius: 'var(--radius-md)', padding: '22px 18px', textAlign: 'center', cursor: 'pointer', background: 'var(--gray-300)' }}>
          <Icon name="upload" size={22} color="var(--sage)" style={{ marginBottom: 6 }} />
          <p style={{ margin: '4px 0 2px', fontSize: 14, fontWeight: 600, color: 'var(--charcoal)' }}>PDF hochladen</p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-mid)' }}>Klicken oder Datei hierher ziehen · nur PDF</p>
          {state === 'error' && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#c0392b' }}>{errMsg}</p>}
        </div>
      )}
      {state === 'uploading' && (
        <div style={{ border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--white)' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--charcoal)' }}>Wird hochgeladen…</p>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--gray-400)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--sage)', borderRadius: 3, animation: 'admloader 1s ease-in-out infinite' }} />
          </div>
        </div>
      )}
      {has && state !== 'uploading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--gray-400)', borderRadius: 'var(--radius-md)', padding: '12px 14px', background: 'var(--white)' }}>
          <span style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(192,57,43,0.10)', color: '#c0392b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="file" size={18} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename || value}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#1f8a5b', display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="check" size={12} /> Hochgeladen</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconAction icon="eye" label="PDF ansehen" onClick={() => value && window.open(value, '_blank')} />
            <IconAction icon="upload" label="Ersetzen" onClick={() => fileRef.current?.click()} />
            <IconAction icon="trash" label="Entfernen" tone="danger" onClick={() => { setState('idle'); onChange('', ''); }} />
          </div>
        </div>
      )}
    </div>
  );
}
