import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../../components/layout/Topbar';
import { Card } from '../../components/ui/Card';
import { AdminButton, IconAction } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { LogoThumb } from '../../components/ui/LogoThumb';
import { CategoryTag, StatusBadge } from '../../components/ui/Badges';
import { TextInput, SelectInput } from '../../components/ui/Fields';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ViewProductModal } from './ViewProductModal';
import { useLayout } from '../../lib/layoutContext';
import { useWindowWidth, fmtDateShort } from '../../lib/utils';
import { useToast } from '../../lib/ToastContext';
import { productsApi, categoriesApi } from '../../api/products';
import { manufacturersApi } from '../../api/manufacturers';
import type { Product, Manufacturer, Category } from '../../types';

// Reserved pixel width of the pinned actions column (3 icon buttons + gaps + padding), used to
// offset the "Updated" column right beside it — both stay pinned together so neither is hidden
// underneath the other when the table is wider than the viewport.
const ACTIONS_COL_WIDTH = 122;

export default function ProductsPage() {
  const { mobile, onMenu } = useLayout();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const w = useWindowWidth();

  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [man, setMan] = useState('all');
  const [st, setSt] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  function load() {
    setLoading(true);
    Promise.all([productsApi.list(), manufacturersApi.list(), categoriesApi.list()])
      .then(([p, m, c]) => { setProducts(p); setManufacturers(m); setCategories(c); })
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = products.filter(p =>
    (cat === 'all' || p.category === cat) &&
    (man === 'all' || String(p.manufacturer_id) === man) &&
    (st === 'all' || p.Status === st) &&
    (q === '' || (p.Header + ' ' + p.id + ' ' + p.Hersteller).toLowerCase().includes(q.toLowerCase()))
  );
  const compact = w < 1024;

  async function confirmDelete() {
    if (!deleteTarget) return;
    await productsApi.remove(deleteTarget.id);
    setProducts(list => list.filter(p => p.id !== deleteTarget.id));
    pushToast('success', 'Produkt gelöscht');
    setDeleteTarget(null);
  }

  return (
    <div>
      <Topbar title="Product Administration" subtitle="Manage all products listed on the LeBe-Solarenergie website." mobile={mobile} onMenu={onMenu}
        action={<AdminButton icon="plus" onClick={() => navigate('/products/new')}>Add New Product</AdminButton>} />

      <Card pad={16} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-mid)' }}><Icon name="search" size={17} /></span>
            <TextInput placeholder="Suche nach Name, ID oder Hersteller…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ minWidth: 150, flex: '0 1 180px' }}>
            <SelectInput value={cat} onChange={e => setCat(e.target.value)}>
              <option value="all">Alle Kategorien</option>
              {categories.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
            </SelectInput>
          </div>
          <div style={{ minWidth: 150, flex: '0 1 180px' }}>
            <SelectInput value={man} onChange={e => setMan(e.target.value)}>
              <option value="all">Alle Hersteller</option>
              {manufacturers.map(m => <option key={m.id} value={String(m.id)}>{m.name}</option>)}
            </SelectInput>
          </div>
          <div style={{ minWidth: 130, flex: '0 1 150px' }}>
            <SelectInput value={st} onChange={e => setSt(e.target.value)}>
              <option value="all">Alle Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Hidden">Hidden</option>
            </SelectInput>
          </div>
        </div>
      </Card>

      <Card pad={0} style={{ overflow: 'hidden' }}>
        {loading ? (
          <div>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid var(--gray-300)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--gray-400)', animation: 'admpulse 1.2s infinite' }} />
                <div style={{ flex: 1 }}><div style={{ height: 12, width: '40%', background: 'var(--gray-400)', borderRadius: 6, animation: 'admpulse 1.2s infinite' }} /></div>
                <div style={{ width: 70, height: 20, background: 'var(--gray-400)', borderRadius: 10, animation: 'admpulse 1.2s infinite' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={products.length === 0 ? 'box' : 'search'}
            title={products.length === 0 ? 'Noch keine Produkte' : 'Keine Treffer'}
            text={products.length === 0 ? 'Legen Sie Ihr erstes Produkt an, um es auf der Website anzuzeigen.' : 'Keine Produkte entsprechen Ihren Filtern. Passen Sie Suche oder Filter an.'}
            action={products.length === 0
              ? <AdminButton icon="plus" onClick={() => navigate('/products/new')}>Add New Product</AdminButton>
              : <AdminButton variant="outline" onClick={() => { setQ(''); setCat('all'); setMan('all'); setSt('all'); }}>Filter zurücksetzen</AdminButton>} />
        ) : compact ? (
          <div>
            {filtered.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-300)' : 'none' }}>
                <LogoThumb src={p.image} name={p.Header} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.Header}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-mid)', marginTop: 2 }}>{p.id} · {p.Hersteller} · {p.Power}{p.Unit ? ' ' + p.Unit : ''}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}><StatusBadge status={p.Status} /></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <IconAction icon="edit" label="Bearbeiten" onClick={() => navigate(`/products/${p.id}/edit`)} />
                  <IconAction icon="trash" label="Löschen" tone="danger" onClick={() => setDeleteTarget(p)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', textAlign: 'left', color: 'var(--gray-mid)' }}>
                  {['ID', 'Product Picture', 'Product Name', 'Category', 'Manufacturer', 'Power', 'Spec', 'Status'].map((h, i) => (
                    <th key={i} style={{ padding: '12px 10px', fontWeight: 600, fontSize: 12, letterSpacing: '.02em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                  <th style={{ padding: '12px 10px', fontWeight: 600, fontSize: 12, letterSpacing: '.02em', whiteSpace: 'nowrap', position: 'sticky', right: ACTIONS_COL_WIDTH, background: 'var(--cream)' }}>Updated</th>
                  <th style={{ padding: '12px 10px', fontWeight: 600, fontSize: 12, letterSpacing: '.02em', whiteSpace: 'nowrap', position: 'sticky', right: 0, width: ACTIONS_COL_WIDTH, background: 'var(--cream)' }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <Fragment key={p.id}>
                    <tr style={{ borderBottom: '1px solid var(--gray-300)', background: expanded === p.id ? 'var(--gray-300)' : 'transparent' }}
                      onMouseEnter={e => { if (expanded !== p.id) e.currentTarget.style.background = 'var(--gray-100)'; }}
                      onMouseLeave={e => { if (expanded !== p.id) e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '11px 10px', fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--sage)', whiteSpace: 'nowrap' }}>{p.id}</td>
                      <td style={{ padding: '11px 10px' }}><LogoThumb src={p.image} name={p.Header} size={34} /></td>
                      <td style={{ padding: '11px 10px', maxWidth: 260 }}>
                        <div style={{ fontWeight: 600, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.Header}</div>
                        {p.category === 'Solarmodule' && (p.panelHeightMeters || p.panelWidthMeters) && (
                          <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ marginTop: 3, background: 'none', border: 'none', padding: 0, color: 'var(--gray-mid)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                            {expanded === p.id ? 'Maße ausblenden' : 'Maße anzeigen'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '11px 10px' }}><CategoryTag category={p.category} /></td>
                      <td style={{ padding: '11px 10px', whiteSpace: 'nowrap', color: 'var(--charcoal)' }}>{p.Hersteller}</td>
                      <td style={{ padding: '11px 10px', whiteSpace: 'nowrap', color: 'var(--charcoal)' }}>{p.Power}{p.Unit ? <span style={{ color: 'var(--gray-mid)' }}> {p.Unit}</span> : ''}</td>
                      <td style={{ padding: '11px 10px' }}>
                        {p.hasSpec
                          ? <span title={p.Spezifikation ?? undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1f8a5b', fontSize: 12.5, fontWeight: 600 }}><Icon name="file" size={14} />PDF</span>
                          : <span style={{ color: 'var(--gray-mid)', fontSize: 12.5 }}>—</span>}
                      </td>
                      <td style={{ padding: '11px 10px' }}><StatusBadge status={p.Status} /></td>
                      <td style={{ padding: '11px 10px', whiteSpace: 'nowrap', color: 'var(--gray-mid)', fontSize: 12.5, position: 'sticky', right: ACTIONS_COL_WIDTH, background: expanded === p.id ? 'var(--gray-300)' : 'var(--white)' }}>{fmtDateShort(p.updatedAt)}</td>
                      <td style={{ padding: '11px 8px', whiteSpace: 'nowrap', position: 'sticky', right: 0, width: ACTIONS_COL_WIDTH, background: expanded === p.id ? 'var(--gray-300)' : 'var(--white)', boxShadow: '-6px 0 6px -6px rgba(0,0,0,0.12)' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <IconAction icon="eye" label="Ansehen" onClick={() => setViewing(p)} />
                          <IconAction icon="edit" label="Bearbeiten" onClick={() => navigate(`/products/${p.id}/edit`)} />
                          <IconAction icon="trash" label="Löschen" tone="danger" onClick={() => setDeleteTarget(p)} />
                        </div>
                      </td>
                    </tr>
                    {expanded === p.id && (
                      <tr style={{ background: 'var(--gray-300)' }}>
                        <td colSpan={10} style={{ padding: '10px 22px 14px' }}>
                          <div style={{ display: 'flex', gap: 32, fontSize: 13 }}>
                            <span><strong style={{ color: 'var(--charcoal)' }}>Panel height:</strong> <span style={{ color: 'var(--gray-mid)' }}>{p.panelHeightMeters ?? '—'} m</span></span>
                            <span><strong style={{ color: 'var(--charcoal)' }}>Panel width:</strong> <span style={{ color: 'var(--gray-mid)' }}>{p.panelWidthMeters ?? '—'} m</span></span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {!loading && filtered.length > 0 && (
        <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--gray-mid)' }}>{filtered.length} von {products.length} Produkten</p>
      )}

      <ViewProductModal product={viewing} onClose={() => setViewing(null)} onEdit={p => { setViewing(null); navigate(`/products/${p.id}/edit`); }} />

      <ConfirmModal open={!!deleteTarget}
        title="Produkt löschen?"
        description={deleteTarget ? `„${deleteTarget.Header}" (${deleteTarget.id}) wird dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden.` : ''}
        onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}
