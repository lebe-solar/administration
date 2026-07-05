import type { Configuration } from '@azure/msal-browser';

// Public values (not secrets) for the "lebe-solar-admin" Entra ID app registration.
// Overridable via VITE_AZURE_AD_* env vars (wired from Bicep outputs in azure.yaml) so the
// same build works across environments without hardcoding a specific tenant/app.
const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID || '0b0e365f-09be-4291-8f1f-082f5929872d';
const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID || '720a1304-b7eb-4161-9025-e5689331de4a';

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: '/auth',
    postLogoutRedirectUri: '/',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

// No "Expose an API" scope is configured on this app registration, so the frontend and API
// share the same app registration and the ID token (audience = clientId) is used as the
// bearer credential — see src/api/src/middleware/auth.ts for the corresponding validation.
export const loginRequest = {
  scopes: ['openid', 'profile'],
};
