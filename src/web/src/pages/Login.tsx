import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msalConfig';

function MicrosoftLogo() {
  return (
    <span style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, width: 18, height: 18, flex: 'none' }}>
      <span style={{ background: '#f25022' }} />
      <span style={{ background: '#7fba00' }} />
      <span style={{ background: '#00a4ef' }} />
      <span style={{ background: '#ffb900' }} />
    </span>
  );
}

export default function Login() {
  const { instance } = useMsal();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f1', fontFamily: 'var(--font-sans)', padding: 20 }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '48px 40px', maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <img src="/assets/logos/logo_simple.svg" alt="LeBe Solarenergie" style={{ height: 56, marginBottom: 24 }} />
        <h1 style={{ fontSize: 21, fontWeight: 700, color: 'var(--charcoal)', margin: '0 0 8px' }}>Product Administration</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-mid)', lineHeight: 1.5, margin: '0 0 28px' }}>
          Bitte melden Sie sich mit Ihrem LeBe Solarenergie Microsoft-Konto an.
        </p>
        <button
          onClick={() => instance.loginRedirect(loginRequest)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
            padding: '12px 20px', fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-sans)',
            color: 'var(--charcoal)', background: 'var(--white)', border: '1px solid var(--gray-500)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          }}
        >
          <MicrosoftLogo />
          Mit Microsoft anmelden
        </button>
      </div>
    </div>
  );
}
