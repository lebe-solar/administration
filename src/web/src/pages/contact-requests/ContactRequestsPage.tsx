import { useEffect, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { TextInput, SelectInput } from '../../components/ui/Fields';
import { EmptyState } from '../../components/ui/EmptyState';
import { ContactRequestDetail } from './ContactRequestDetail';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, fmtDate } from '../../lib/utils';
import { contactRequestsApi } from '../../api/contactRequests';
import { employeesApi } from '../../api/employees';
import type { ContactRequest, Employee, RequestStatus } from '../../types';

const STATUS_OPTIONS: (RequestStatus | 'all')[] = ['all', 'Neu', 'Gelesen', 'In Bearbeitung', 'To-do', 'Beantwortet', 'Erledigt', 'Archiviert', 'Papierkorb'];
const MODE_LABELS: Record<string, string> = {
  generalContact: 'Allgemeine Anfrage', freeConsultation: 'Kostenlose Beratung', simulationIndividual: 'Simulation prüfen', simulationPackage: 'Simulation prüfen',
  contactPackage: 'Paketprüfung', offerPackage: 'Paketprüfung', productQuestion: 'Produktberatung', knowledgeQuestion: 'Allgemeine Anfrage',
};
const STATUS_COLOR: Record<RequestStatus, string> = {
  'Neu': '#1f8a5b', 'Gelesen': '#6b6b6b', 'In Bearbeitung': '#c79400', 'To-do': '#c0574a', 'Beantwortet': '#7a94a8', 'Erledigt': '#1f8a5b', 'Archiviert': '#9a9a9a', 'Papierkorb': '#c0392b',
};

export default function ContactRequestsPage() {
  const { mobile, onMenu } = useLayout();
  const w = useWindowWidth();

  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [mode, setMode] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [todoOnly, setTodoOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    contactRequestsApi.list({ status, requestMode: mode, q, unreadOnly, todoOnly }).then(rows => {
      setRequests(rows);
      if (!selectedId && rows.length > 0) setSelectedId(rows[0].id);
    }).finally(() => setLoading(false));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [status, mode, unreadOnly, todoOnly]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => { employeesApi.list().then(setEmployees); }, []);

  const selected = requests.find(r => r.id === selectedId) || null;
  const twoCol = w > 900;

  function handleChanged(updated: ContactRequest) {
    setRequests(rows => rows.map(r => r.id === updated.id ? updated : r));
  }

  return (
    <div>
      <Topbar title="Kontaktanfragen" subtitle="Verwalten Sie eingegangene Anfragen von Website, Angeboten, PV-Simulator und Kontaktformular." mobile={mobile} onMenu={onMenu} />

      <Card pad={16} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-mid)' }}><Icon name="search" size={17} /></span>
            <TextInput placeholder="Anfrage suchen…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ minWidth: 140, flex: '0 1 170px' }}>
            <SelectInput value={status} onChange={e => setStatus(e.target.value as RequestStatus | 'all')}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'Alle Status' : s}</option>)}
            </SelectInput>
          </div>
          <div style={{ minWidth: 150, flex: '0 1 190px' }}>
            <SelectInput value={mode} onChange={e => setMode(e.target.value)}>
              <option value="all">Alle Anfragearten</option>
              {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </SelectInput>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--charcoal)', cursor: 'pointer' }}>
            <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} style={{ accentColor: 'var(--sage)' }} />Nur ungelesene
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--charcoal)', cursor: 'pointer' }}>
            <input type="checkbox" checked={todoOnly} onChange={e => setTodoOnly(e.target.checked)} style={{ accentColor: 'var(--sage)' }} />Nur To-dos
          </label>
        </div>
      </Card>

      {loading ? (
        <Card style={{ height: 300, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />
      ) : requests.length === 0 ? (
        <Card pad={0}>
          <EmptyState icon="mail" title="Noch keine Kontaktanfragen" text="Sobald Besucher über Kontakt, Angebote oder den PV-Simulator eine Anfrage senden, erscheinen sie hier." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: twoCol ? '360px 1fr' : '1fr', gap: 18, alignItems: 'start' }}>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: 720, overflowY: 'auto' }}>
              {requests.map((r, i) => (
                <button key={r.id} onClick={() => setSelectedId(r.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', borderBottom: i < requests.length - 1 ? '1px solid var(--gray-300)' : 'none', background: selectedId === r.id ? 'var(--cream)' : 'var(--white)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {r.status === 'Neu' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1f8a5b', flex: 'none' }} />}
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.kunde.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-mid)', flex: 'none' }}>{fmtDate(r.metainformationen?.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--charcoal)', marginBottom: 4 }}>{r.inquiryType}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{r.message || '—'}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: STATUS_COLOR[r.status], border: `1px solid ${STATUS_COLOR[r.status]}`, borderRadius: 'var(--radius-pill)', padding: '1px 7px' }}>{r.status}</span>
                    {r.admin.assignedTo && <span style={{ fontSize: 10.5, color: 'var(--gray-mid)' }}>· {r.admin.assignedTo.name}</span>}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selected ? (
            <Card pad={20}>
              <ContactRequestDetail request={selected} employees={employees} onChanged={handleChanged} />
            </Card>
          ) : (
            <Card><EmptyState icon="mail" title="Keine Anfrage ausgewählt" text="Wählen Sie eine Anfrage aus der Liste, um Details zu sehen." /></Card>
          )}
        </div>
      )}
    </div>
  );
}
