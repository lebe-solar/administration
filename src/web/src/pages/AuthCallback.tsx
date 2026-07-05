import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

export default function AuthCallback() {
  const { inProgress } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      navigate('/', { replace: true });
    }
  }, [inProgress, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f1', fontFamily: 'var(--font-sans)', color: 'var(--gray-mid)', fontSize: 14 }}>
      Anmeldung wird verarbeitet…
    </div>
  );
}
