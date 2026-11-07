import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACCEPT_ALL, CONSENT_KEY, OPEN_SETTINGS_EVENT, REJECT_ALL, canLoadAnalytics, makeConsent, parseConsent, type Consent } from "@/lib/cookie-consent";

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    const c = parseConsent(window.localStorage.getItem(CONSENT_KEY));
    setConsent(c);
    setReady(true);
    const onOpen = () => {
      const cur = parseConsent(window.localStorage.getItem(CONSENT_KEY));
      setAnalytics(cur?.analytics ?? false);
      setPreferences(cur?.preferences ?? false);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, onOpen);
  }, []);

  useEffect(() => {
    // Umami analytics loads only after explicit analytics consent.
    const id = "umami-script";
    const existing = document.getElementById(id);
    if (canLoadAnalytics(consent)) {
      document.documentElement.dataset["analyticsConsent"] = "granted";
      if (!existing) {
        const s = document.createElement("script");
        s.id = id;
        s.defer = true;
        s.src = "https://cloud.umami.is/script.js";
        s.dataset["websiteId"] = "f24adf11-d683-4dbc-b8b6-96e93666f059";
        document.head.appendChild(s);
      }
    } else {
      delete document.documentElement.dataset["analyticsConsent"];
      existing?.remove();
    }
  }, [consent]);

  const save = (choice: { analytics: boolean; preferences: boolean }) => {
    const c = makeConsent(choice);
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
    setConsent(c);
    setOpen(false);
  };

  const btn = "h-auto min-h-11 flex-1 whitespace-normal rounded-full border-2 border-primary bg-card font-extrabold text-foreground hover:bg-primary hover:text-primary-foreground";

  return (
    <>
      {ready && !consent && !open && (
        <section role="region" aria-label="Cookie consent"
          className="no-print fixed inset-x-3 bottom-3 z-50 rounded-3xl border-2 border-primary bg-card p-5 text-foreground shadow-lg md:inset-x-auto md:left-5 md:bottom-5 md:max-w-[480px]">
          <p className="font-semibold leading-relaxed">
            🍪 We use cookies to keep Juggle running and, with your OK, to understand how people use it.{" "}
            <Link to="/cookies" className="font-extrabold text-foreground underline underline-offset-4">Read our Cookie Policy</Link>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className={btn} onClick={() => save(ACCEPT_ALL)}>Accept all</Button>
            <Button variant="outline" className={btn} onClick={() => save(REJECT_ALL)}>Reject non-essential</Button>
            <Button variant="outline" className={btn} onClick={() => { setAnalytics(false); setPreferences(false); setOpen(true); }}>Customize</Button>
          </div>
        </section>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-2 border-primary bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Cookie settings</DialogTitle>
            <DialogDescription>Choose which cookies Juggle may use. You can change this anytime from the footer.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {[
              { id: "essential", label: "Essential", desc: "Keeps the site working and you signed in. Always on.", checked: true, disabled: true, set: () => {} },
              { id: "analytics", label: "Analytics", desc: "Helps us understand how people use Juggle.", checked: analytics, disabled: false, set: setAnalytics },
              { id: "preferences", label: "Preferences", desc: "Remembers choices like your favorite theme.", checked: preferences, disabled: false, set: setPreferences },
            ].map((o) => (
              <div key={o.id} className="flex items-start justify-between gap-4 rounded-2xl border border-foreground/15 p-4">
                <div>
                  <label htmlFor={`cookie-${o.id}`} className="font-extrabold">{o.label}</label>
                  <p id={`cookie-${o.id}-desc`} className="text-sm text-muted-foreground">{o.desc}</p>
                </div>
                <Switch id={`cookie-${o.id}`} checked={o.checked} disabled={o.disabled} onCheckedChange={o.set} aria-describedby={`cookie-${o.id}-desc`} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button className="min-h-11 rounded-full font-extrabold" onClick={() => save({ analytics, preferences })}>Save my choices</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
