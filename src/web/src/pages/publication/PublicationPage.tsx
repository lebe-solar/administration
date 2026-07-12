import { useCallback, useEffect, useRef, useState } from 'react';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../lib/ToastContext';
import { useLayout } from '../../lib/layoutContext';
import { publicationApi } from '../../api/publication';
import { ApiError } from '../../api/client';
import type {
  DeploymentStatus, PublicationOverview, PublicChangeStatus, PublicContentChange,
  PublicEntityType, PublicWebClientDeployment,
} from '../../types';

const ENTITY_TYPE_LABELS: Record<PublicEntityType, string> = {
  product: 'Produkt',
  manufacturer: 'Hersteller',
  offer: 'Angebot',
  projectInsight: 'Projekt-Einblick',
  knowledge: 'Wissen',
  landingPage: 'Landing Page',
  settings: 'Einstellungen',
  manual: 'Manuell',
};

const REASON_LABELS: Record<string, string> = {
  'product-published': 'Produkt veröffentlicht',
  'product-updated': 'Öffentliche Produktdaten geändert',
  'product-hidden': 'Produkt versteckt',
  'product-deleted': 'Produkt gelöscht',
  'manufacturer-updated': 'Herstellerdaten geändert',
  'offer-published': 'Angebot veröffentlicht',
  'offer-updated': 'Angebotsdaten geändert',
  'offer-hidden': 'Angebot versteckt',
  'offer-deleted': 'Angebot gelöscht',
  'projectInsight-published': 'Projekt veröffentlicht',
  'projectInsight-updated': 'Projektdaten geändert',
  'projectInsight-hidden': 'Projekt versteckt',
  'projectInsight-archived': 'Projekt archiviert',
  'projectInsight-deleted': 'Projekt gelöscht',
  'manual-publish': 'Manuelle Veröffentlichung',
};

function reasonLabel(reason: string): string {
  return REASON_LABELS[reason] || reason;
}

function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString('de-DE')} · ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
}

function fmtDuration(ms?: number | null): string {
  if (ms == null) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds} Sek.` : `${minutes} Min. ${seconds} Sek.`;
}

const DEPLOYMENT_STATUS_STYLE: Record<DeploymentStatus, { bg: string; fg: string; label: string }> = {
  queued: { bg: 'rgba(181,137,0,0.16)', fg: '#9a7400', label: 'Wartet' },
  running: { bg: 'rgba(159,178,161,0.28)', fg: 'var(--charcoal)', label: 'Läuft' },
  success: { bg: 'rgba(31,138,91,0.14)', fg: '#1f8a5b', label: 'Erfolgreich' },
  failed: { bg: 'rgba(192,86,74,0.14)', fg: '#c0564a', label: 'Fehlgeschlagen' },
};

function DeploymentStatusBadge({ status }: { status: DeploymentStatus }) {
  const s = DEPLOYMENT_STATUS_STYLE[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: s.bg, color: s.fg, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg }} />{s.label}
    </span>
  );
}

const CHANGE_STATUS_STYLE: Record<PublicChangeStatus, { bg: string; fg: string; label: string }> = {
  pending: { bg: 'rgba(181,137,0,0.16)', fg: '#9a7400', label: 'Offen' },
  publishing: { bg: 'rgba(159,178,161,0.28)', fg: 'var(--charcoal)', label: 'Wird veröffentlicht' },
  published: { bg: 'rgba(31,138,91,0.14)', fg: '#1f8a5b', label: 'Veröffentlicht' },
  ignored: { bg: 'rgba(135,135,135,0.16)', fg: '#6b6b6b', label: 'Ignoriert' },
};

function ChangeStatusBadge({ status }: { status: PublicChangeStatus }) {
  const s = CHANGE_STATUS_STYLE[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 'var(--radius-pill)', background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function isRunning(deployment: PublicWebClientDeployment | null): boolean {
  return !!deployment && (deployment.status === 'queued' || deployment.status === 'running');
}

export default function PublicationPage() {
  const { mobile, onMenu } = useLayout();
  const { pushToast } = useToast();

  const [overview, setOverview] = useState<PublicationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return publicationApi.overview().then(setOverview).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Poll the latest deployment's status while a publish is in flight, so "Veröffentlichung
  // läuft" resolves to success/failed on its own without a manual page reload.
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    const latest = overview?.latestDeployment || null;
    if (!isRunning(latest) || !latest) return;

    pollRef.current = setInterval(async () => {
      try {
        await publicationApi.refreshStatus(latest.id);
      } catch {
        // transient — the next overview reload will retry
      }
      load();
    }, 6000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [overview?.latestDeployment, load]);

  async function handlePublish() {
    setPublishing(true);
    try {
      await publicationApi.publish({ reason: 'manual-publish', includePendingChanges: true });
      pushToast('success', 'Veröffentlichung wurde gestartet.');
    } catch (e) {
      pushToast('error', e instanceof ApiError ? e.message : 'Veröffentlichung konnte nicht gestartet werden.');
    } finally {
      setPublishing(false);
      load();
    }
  }

  if (loading && !overview) {
    return (
      <div>
        <Topbar title="Öffentliche Website veröffentlichen" subtitle="Veröffentlichen Sie Änderungen aus dem Admin auf der öffentlichen LeBe Website." mobile={mobile} onMenu={onMenu} />
        <Card pad={16}><div style={{ height: 14, width: '40%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></Card>
      </div>
    );
  }

  if (!overview) return null;

  const { status, pendingChanges, latestDeployment, history } = overview;
  const running = isRunning(latestDeployment);
  const failed = status === 'failed';

  const statusCopy: Record<typeof status, { label: string; text: string; icon: string }> = {
    upToDate: { label: 'Öffentliche Website ist aktuell', text: 'Es liegen keine unveröffentlichten Änderungen vor.', icon: 'check' },
    pending: { label: 'Unveröffentlichte Änderungen vorhanden', text: 'Änderungen im Admin betreffen die öffentliche Website und müssen veröffentlicht werden.', icon: 'alert' },
    publishing: { label: 'Veröffentlichung läuft', text: 'Die öffentliche Website wird neu gebaut und veröffentlicht.', icon: 'send' },
    failed: { label: 'Letzte Veröffentlichung fehlgeschlagen', text: 'Bitte prüfen Sie den Fehler und starten Sie die Veröffentlichung erneut.', icon: 'alert' },
  };
  const copy = statusCopy[status];

  const publishLabel = running
    ? 'Veröffentlichung läuft bereits'
    : failed
      ? 'Erneut veröffentlichen'
      : pendingChanges.length > 0
        ? 'Öffentliche Website veröffentlichen'
        : 'Manuell neu veröffentlichen';

  const groupedChanges = pendingChanges.reduce<Record<string, PublicContentChange[]>>((acc, c) => {
    (acc[c.entityType] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div>
      <Topbar title="Öffentliche Website veröffentlichen" subtitle="Veröffentlichen Sie Änderungen aus dem Admin auf der öffentlichen LeBe Website." mobile={mobile} onMenu={onMenu} />

      {/* 1+3+4 · Status, publish action, current rebuild status */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{
              width: 44, height: 44, borderRadius: '50%', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: failed ? 'rgba(192,86,74,0.14)' : running ? 'rgba(159,178,161,0.28)' : status === 'pending' ? 'rgba(181,137,0,0.16)' : 'rgba(31,138,91,0.14)',
              color: failed ? '#c0564a' : running ? 'var(--charcoal)' : status === 'pending' ? '#9a7400' : '#1f8a5b',
            }}>
              <Icon name={copy.icon} size={22} />
            </span>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--charcoal)' }}>{copy.label}</div>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--gray-mid)', maxWidth: 480 }}>{copy.text}</p>
            </div>
          </div>
          <AdminButton icon="send" onClick={handlePublish} disabled={running || publishing}>{publishLabel}</AdminButton>
        </div>

        {latestDeployment && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--gray-300)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>Status</div>
              <DeploymentStatusBadge status={latestDeployment.status} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>Gestartet von</div>
              <div style={{ fontSize: 13.5, color: 'var(--charcoal)', fontWeight: 600 }}>{latestDeployment.triggeredBy || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>Gestartet am</div>
              <div style={{ fontSize: 13.5, color: 'var(--charcoal)' }}>{fmtDateTime(latestDeployment.startedAt || latestDeployment.triggeredAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>Abgeschlossen am</div>
              <div style={{ fontSize: 13.5, color: 'var(--charcoal)' }}>{fmtDateTime(latestDeployment.completedAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>Dauer</div>
              <div style={{ fontSize: 13.5, color: 'var(--charcoal)' }}>{fmtDuration(latestDeployment.durationMs)}</div>
            </div>
            {latestDeployment.githubRunUrl && (
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-mid)', marginBottom: 4 }}>GitHub Workflow</div>
                <a href={latestDeployment.githubRunUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: 'var(--sage)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Workflow öffnen <Icon name="external" size={13} />
                </a>
              </div>
            )}
          </div>
        )}

        {latestDeployment?.status === 'failed' && latestDeployment.errorMessage && (
          <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(192,86,74,0.08)', border: '1px solid rgba(192,86,74,0.3)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#c0564a', marginBottom: 2 }}>Fehler</div>
            <div style={{ fontSize: 13, color: 'var(--charcoal)' }}>{latestDeployment.errorMessage}</div>
          </div>
        )}
      </Card>

      {/* 2 · Pending changes */}
      <Card pad={0} style={{ marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px 4px', fontSize: 15, fontWeight: 700, color: 'var(--charcoal)' }}>Offene Änderungen</div>
        {pendingChanges.length === 0 ? (
          <EmptyState icon="check" title="Keine offenen Änderungen." text="Alle Änderungen aus dem Admin wurden bereits veröffentlicht." />
        ) : (
          <div>
            {Object.entries(groupedChanges).map(([entityType, changes]) => (
              <div key={entityType}>
                <div style={{ padding: '14px 22px 6px', fontSize: 11.5, fontWeight: 700, color: 'var(--gray-mid)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  {ENTITY_TYPE_LABELS[entityType as PublicEntityType] || entityType}
                </div>
                {changes.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 22px', borderBottom: i < changes.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.entityTitle || c.entityId}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--gray-mid)' }}>{reasonLabel(c.reason)}</div>
                    </div>
                    <div style={{ flex: '1 1 200px', fontSize: 12.5, color: 'var(--gray-mid)' }}>{c.changedBy || '—'} · {fmtDateTime(c.changedAt)}</div>
                    <ChangeStatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5 · History */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px 4px', fontSize: 15, fontWeight: 700, color: 'var(--charcoal)' }}>Letzte Veröffentlichungen</div>
        {history.length === 0 ? (
          <EmptyState icon="send" title="Noch keine Veröffentlichungen" text="Sobald Sie zum ersten Mal veröffentlichen, erscheint der Verlauf hier." />
        ) : (
          <div>
            {history.map((d, i) => (
              <div key={d.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 22px', borderBottom: i < history.length - 1 ? '1px solid var(--gray-300)' : 'none', flexWrap: 'wrap' }}>
                <DeploymentStatusBadge status={d.status} />
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--charcoal)' }}>{reasonLabel(d.reason)}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-mid)' }}>{d.triggeredBy || '—'} · {fmtDateTime(d.triggeredAt)}</div>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', flex: '0 0 auto' }}>Dauer: {fmtDuration(d.durationMs)}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray-mid)', flex: '0 0 auto' }}>{d.affectedChanges.length} {d.affectedChanges.length === 1 ? 'Änderung' : 'Änderungen'}</div>
                {d.githubRunUrl && (
                  <a href={d.githubRunUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: 'var(--sage)', fontWeight: 600, flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Workflow öffnen <Icon name="external" size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
