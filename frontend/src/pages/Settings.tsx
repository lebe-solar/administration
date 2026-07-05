import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { useLayout } from '../lib/layoutContext';

export default function Settings() {
  const { mobile, onMenu } = useLayout();
  return (
    <div>
      <Topbar title="Settings" subtitle="Konto- und Systemeinstellungen." mobile={mobile} onMenu={onMenu} />
      <Card style={{ textAlign: 'center', padding: '56px 24px' }}>
        <span style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--cream)', color: 'var(--sage)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="settings" size={28} /></span>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--charcoal)' }}>Noch keine Einstellungen verfügbar</h2>
        <p style={{ margin: '0 auto', fontSize: 14, color: 'var(--gray-mid)', maxWidth: 380, lineHeight: 1.5 }}>Diese Ansicht ist als Platzhalter vorgesehen. Kontoverwaltung, Benachrichtigungen und Systemoptionen folgen hier.</p>
      </Card>
    </div>
  );
}
