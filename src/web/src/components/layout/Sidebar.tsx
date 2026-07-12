import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Icon } from '../ui/Icon';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { key: 'products', label: 'Produkte', icon: 'box', path: '/products' },
  { key: 'product-form', label: 'Add Product', icon: 'plus', path: '/products/new' },
  { key: 'manufacturers', label: 'Hersteller', icon: 'factory', path: '/manufacturers' },
  { key: 'project-insights', label: 'Projekt-Einblicke', icon: 'image', path: '/project-insights' },
  { key: 'offers', label: 'Angebote', icon: 'tag', path: '/offers' },
  { key: 'offer-form', label: 'Angebot erstellen', icon: 'plus', path: '/offers/new' },
  { key: 'contact-requests', label: 'Kontaktanfragen', icon: 'mail', path: '/contact-requests' },
  { key: 'system-components', label: 'Systemkomponenten', icon: 'layers', path: '/system-components' },
  { key: 'services', label: 'Inklusivleistungen', icon: 'check', path: '/services' },
  { key: 'publication', label: 'Veröffentlichung', icon: 'globe', path: '/publication' },
  { key: 'settings', label: 'Einstellungen', icon: 'settings', path: '/settings' },
];

function isActive(path: string, pathname: string) {
  if (path === '/') return pathname === '/';
  if (path === '/products') return pathname === '/products';
  if (path === '/products/new') return pathname === '/products/new' || /^\/products\/.+\/edit$/.test(pathname);
  if (path === '/project-insights') return pathname === '/project-insights' || pathname.startsWith('/project-insights/');
  if (path === '/offers') return pathname === '/offers' || /^\/offers\/.+\/preview$/.test(pathname);
  if (path === '/offers/new') return pathname === '/offers/new' || /^\/offers\/.+\/edit$/.test(pathname);
  if (path === '/contact-requests') return pathname.startsWith('/contact-requests');
  return pathname === path;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ open, onClose, mobile }: { open: boolean; onClose: () => void; mobile: boolean }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const displayName = account?.name || account?.username || 'Angemeldet';
  const email = account?.username || '';

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: '/' });
  };

  const panel = (
    <aside style={{ width: 250, background: 'var(--charcoal)', color: '#e9e9e7', display: 'flex', flexDirection: 'column', height: '100vh', position: mobile ? 'fixed' : 'sticky', top: 0, left: 0, zIndex: 150, transform: mobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none', transition: 'transform .25s ease', flex: 'none' }}>
      <div style={{ padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <img src="/assets/logos/logo_simple.svg" alt="LeBe" style={{ height: 40, flex: 'none' }} />
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 16 }}>LeBe Solar</div>
          <div style={{ color: '#9a9a97', fontSize: 11, letterSpacing: '.04em' }}>ADMIN PANEL</div>
        </div>
      </div>
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(it => {
          const active = isActive(it.path, pathname);
          return (
            <button key={it.key} onClick={() => { navigate(it.path); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14.5, fontFamily: 'var(--font-sans)', fontWeight: active ? 700 : 500, color: active ? 'var(--charcoal)' : '#d7d7d4', background: active ? 'var(--yellow)' : 'transparent', transition: 'background .15s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <Icon name={it.icon} size={19} />{it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--sage)', color: 'var(--charcoal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flex: 'none' }}>{initialsOf(displayName)}</span>
        <div style={{ flex: 1, lineHeight: 1.2, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, color: '#e9e9e7', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
          <div style={{ fontSize: 11, color: '#9a9a97', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
        </div>
        <button onClick={handleLogout} title="Abmelden" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'inline-flex', flex: 'none' }}>
          <Icon name="logout" size={17} color="#9a9a97" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {mobile && open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 140 }} />}
      {panel}
    </>
  );
}
