import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useWindowWidth } from '../../lib/utils';

export function AppLayout() {
  const w = useWindowWidth();
  const mobile = w < 900;
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f1', fontFamily: 'var(--font-sans)', color: 'var(--charcoal)' }}>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} mobile={mobile} />
      <main style={{ flex: 1, minWidth: 0, padding: mobile ? '20px 16px 48px' : '30px 34px 60px' }}>
        <Outlet context={{ mobile, onMenu: () => setNavOpen(true) }} />
      </main>
    </div>
  );
}
