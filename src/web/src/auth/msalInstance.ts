import { PublicClientApplication, EventType } from '@azure/msal-browser';
import type { AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from './msalConfig';

export const msalInstance = new PublicClientApplication(msalConfig);

// Must run to completion (including the redirect-promise handling, which processes the
// ?code=...&state=... Entra ID appends after login) before the app renders — otherwise
// components can mount believing the user is signed out mid-redirect.
export async function initializeMsal(): Promise<void> {
  await msalInstance.initialize();

  const response = await msalInstance.handleRedirectPromise();
  if (response?.account) {
    msalInstance.setActiveAccount(response.account);
  } else {
    const [firstAccount] = msalInstance.getAllAccounts();
    if (firstAccount) {
      msalInstance.setActiveAccount(firstAccount);
    }
  }

  msalInstance.addEventCallback(event => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const result = event.payload as AuthenticationResult;
      if (result.account) {
        msalInstance.setActiveAccount(result.account);
      }
    }
  });
}
