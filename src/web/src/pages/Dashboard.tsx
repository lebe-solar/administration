import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/layout/Topbar';
import { Card } from '../components/ui/Card';
import { AdminButton } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { LogoThumb } from '../components/ui/LogoThumb';
import { CategoryTag, StatusBadge } from '../components/ui/Badges';
import { useLayout } from '../lib/layoutContext';
import { useWindowWidth, isExpired } from '../lib/utils';
import { productsApi } from '../api/products';
import { offersApi } from '../api/offers';
import { projectInsightsApi } from '../api/projectInsights';
import { contactRequestsApi } from '../api/contactRequests';
import type { Product, Offer, ProjectInsight, ContactRequest } from '../types';

export default function Dashboard() {
  const { mobile, onMenu } = useLayout();
  const navigate = useNavigate();
  const w = useWindowWidth();
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [projects, setProjects] = useState<ProjectInsight[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsApi.list(), offersApi.list(), projectInsightsApi.list(), contactRequestsApi.list()])
      .then(([p, o, pr, r]) => { setProducts(p); setOffers(o); setProjects(pr); setRequests(r); })
      .finally(() => setLoading(false));
  }, []);

  const count = (cat: string) => products.filter(p => p.category === cat).length;
  const stats = [
    { label: 'Total Products', value: products.length, icon: 'box', tone: 'var(--sage)' },
    { label: 'Solarmodule', value: count('Solarmodule'), icon: 'panel', tone: '#6b8e6f' },
    { label: 'Wechselrichter', value: count('Wechselrichter'), icon: 'inverter', tone: '#7a94a8' },
    { label: 'Heimspeicher', value: count('Heimspeicher'), icon: 'battery', tone: '#b58b4c' },
    { label: 'Ladestationen', value: count('Ladestationen'), icon: 'plug', tone: '#8a7bb0' },
    { label: 'Heizsysteme', value: count('Heizsysteme'), icon: 'heat', tone: '#c0574a' },
    { label: 'Active', value: products.filter(p => p.Status === 'Active').length, icon: 'check', tone: '#1f8a5b' },
    { label: 'Drafts', value: products.filter(p => p.Status === 'Draft').length, icon: 'edit', tone: '#c79400' },
  ];
  const cols = w < 640 ? 2 : w < 1100 ? 3 : 4;
  const recent = [...products].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5);
  const offerStats = [
    { label: 'Total Offers', value: offers.length, icon: 'tag', tone: 'var(--sage)' },
    { label: 'Active', value: offers.filter(o => o.status === 'Active').length, icon: 'check', tone: '#1f8a5b' },
    { label: 'Drafts', value: offers.filter(o => o.status === 'Draft').length, icon: 'edit', tone: '#c79400' },
    { label: 'Hidden', value: offers.filter(o => o.status === 'Hidden').length, icon: 'eyeoff', tone: '#6b6b6b' },
    { label: 'Expired', value: offers.filter(o => isExpired(o.validUntil)).length, icon: 'clock', tone: '#c0574a' },
    { label: 'With Storage', value: offers.filter(o => o.mainProducts?.storage).length, icon: 'battery', tone: '#b58b4c' },
    { label: 'With Wallbox', value: offers.filter(o => o.mainProducts?.wallbox).length, icon: 'plug', tone: '#8a7bb0' },
    { label: 'With Heating', value: offers.filter(o => o.mainProducts?.heatingSystem).length, icon: 'heat', tone: '#c0574a' },
  ];
  const projectStats = [
    { label: 'Projekte gesamt', value: projects.length, icon: 'image', tone: 'var(--sage)' },
    { label: 'Veröffentlicht', value: projects.filter(p => p.status === 'Veröffentlicht').length, icon: 'check', tone: '#1f8a5b' },
    { label: 'Entwurf', value: projects.filter(p => p.status === 'Entwurf').length, icon: 'edit', tone: '#c79400' },
    { label: 'Hervorgehoben', value: projects.filter(p => p.featured).length, icon: 'tag', tone: '#8a7bb0' },
  ];
  const requestStats = [
    { label: 'Anfragen gesamt', value: requests.length, icon: 'mail', tone: 'var(--sage)' },
    { label: 'Neu', value: requests.filter(r => r.status === 'Neu').length, icon: 'check', tone: '#1f8a5b' },
    { label: 'To-do', value: requests.filter(r => r.status === 'To-do').length, icon: 'alert', tone: '#c0574a' },
    { label: 'In Bearbeitung', value: requests.filter(r => r.status === 'In Bearbeitung').length, icon: 'clock', tone: '#c79400' },
  ];

  if (loading) {
    return (
      <div>
        <Topbar title="Dashboard" subtitle="Überblick über alle Produkte auf der LeBe-Solarenergie Website." mobile={mobile} onMenu={onMenu} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <Card key={i} pad={18} style={{ height: 78, background: 'var(--gray-300)', animation: 'admpulse 1.2s infinite' }} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Überblick über alle Produkte auf der LeBe-Solarenergie Website." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => navigate('/products/new')}>Add New Product</AdminButton>} />

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <Card key={s.label} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: s.tone, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={22} /></span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 3 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--gray-400)' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>Recently updated</h2>
          <AdminButton size="sm" variant="outline" onClick={() => navigate('/products')}>View all</AdminButton>
        </div>
        <div>
          {recent.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 22px', borderBottom: i < recent.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
              <LogoThumb src={p.Logo} name={p.Hersteller} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.Header}</div>
                <div style={{ fontSize: 12.5, color: 'var(--gray-mid)' }}>{p.id} · {p.Hersteller}</div>
              </div>
              {w > 720 && <CategoryTag category={p.category} />}
              <StatusBadge status={p.Status} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 2px 14px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>Angebote / Offers</h2>
        <AdminButton size="sm" variant="outline" onClick={() => navigate('/offers')}>Alle Angebote</AdminButton>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {offerStats.map(s => (
          <Card key={s.label} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: s.tone, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={22} /></span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 3 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 2px 14px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>Projekt-Einblicke</h2>
        <AdminButton size="sm" variant="outline" onClick={() => navigate('/project-insights')}>Alle Projekte</AdminButton>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {projectStats.map(s => (
          <Card key={s.label} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: s.tone, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={22} /></span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 3 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '28px 2px 14px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--charcoal)' }}>Kontaktanfragen</h2>
        <AdminButton size="sm" variant="outline" onClick={() => navigate('/contact-requests')}>Alle Anfragen</AdminButton>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {requestStats.map(s => (
          <Card key={s.label} pad={18} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 12, background: s.tone, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={s.icon} size={22} /></span>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--charcoal)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-mid)', marginTop: 3 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
