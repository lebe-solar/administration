import { Modal } from './Modal';
import { AdminButton } from './Button';
import { Icon } from './Icon';

export function ConfirmModal({ open, title, description, confirmLabel = 'Löschen', onCancel, onConfirm }: {
  open: boolean; title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(192,57,43,0.12)', color: '#c0392b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Icon name="trash" size={24} /></span>
        <h2 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 700 }}>{title}</h2>
        <p style={{ margin: '0 0 22px', fontSize: 14.5, color: 'var(--gray-mid)' }}>{description}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <AdminButton variant="outline" onClick={onCancel}>Abbrechen</AdminButton>
          <AdminButton variant="danger" icon="trash" onClick={onConfirm}>{confirmLabel}</AdminButton>
        </div>
      </div>
    </Modal>
  );
}
