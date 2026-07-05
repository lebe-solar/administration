import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from './msalInstance';
import { loginRequest } from './msalConfig';

// The API validates the ID token (audience = this app's client id) as its bearer credential
// — see the comment in msalConfig.ts for why (no "Expose an API" scope is configured).
export async function getIdToken(): Promise<string | null> {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return null;
  }

  try {
    const result = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return result.idToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      // Refresh failed silently (e.g. expired session) — send the user through an
      // interactive login again; the in-flight API call will simply fail this once.
      await msalInstance.acquireTokenRedirect({ ...loginRequest, account });
      return null;
    }
    throw err;
  }
}
