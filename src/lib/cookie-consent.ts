export const CONSENT_KEY = "juggle-cookie-consent";
export const OPEN_SETTINGS_EVENT = "juggle:open-cookie-settings";

export interface Consent { essential: true; analytics: boolean; preferences: boolean; savedAt: string }

export const ACCEPT_ALL = { analytics: true, preferences: true };
export const REJECT_ALL = { analytics: false, preferences: false };

export function makeConsent(choice: { analytics: boolean; preferences: boolean }): Consent {
  return { essential: true, analytics: choice.analytics, preferences: choice.preferences, savedAt: new Date().toISOString() };
}

export function parseConsent(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (v && typeof v.analytics === "boolean" && typeof v.preferences === "boolean") return { ...v, essential: true };
  } catch { /* ignore */ }
  return null;
}

/** Analytics may only load after explicit analytics consent. */
export const canLoadAnalytics = (c: Consent | null) => c?.analytics === true;

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
