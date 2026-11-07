export const SITE_URL = "https://juggle-schedulebuilder.lovable.app";
export const OG_VERSION = "1";

// Only public page copy belongs here. Never use names, quiz answers or saved plans.
export const OG_PAGES = {
  home: { path: "/", title: "Juggle — Life's a lot. Let's juggle it together.", description: "Answer 7 fun questions and get a custom schedule template you can print or download. Free, takes about 60 seconds, no sign-up needed.", ogTitle: "Juggle — Life's a lot. Let's juggle it together.", ogDescription: "A 7-question quiz that builds a custom schedule template for your life. Print or download it free.", imageTitle: "Life's a lot. Let's juggle it together.", eyebrow: "PLAN LESS, LIVE MORE", accent: "primary" },
  quiz: { path: "/quiz", title: "Schedule Quiz — Juggle", description: "Answer 7 quick questions to generate your custom printable schedule template.", ogTitle: "Take the Juggle Schedule Quiz", ogDescription: "Seven playful questions to a schedule that fits your life.", imageTitle: "Your life. Your rhythm. Your schedule.", eyebrow: "7 QUESTIONS · 1 MINUTE", accent: "sky" },
  privacy: { path: "/privacy", title: "Privacy Policy — Juggle", description: "Juggle’s privacy notice covering planning information, privacy choices, and contact details.", ogTitle: "Privacy Policy — Juggle", ogDescription: "Read Juggle’s privacy notice and contact us with privacy questions.", imageTitle: "Privacy Policy", eyebrow: "YOUR INFORMATION & YOUR CHOICES", accent: "sky" },
  terms: { path: "/terms", title: "Terms of Service | Juggle", description: "The rules for using Juggle, the playful custom schedule template builder.", ogTitle: "Terms of Service | Juggle", ogDescription: "The rules for using Juggle, the playful custom schedule template builder.", imageTitle: "Terms of Service", eyebrow: "A LITTLE CLARITY FOR EVERYONE", accent: "primary" },
  cookies: { path: "/cookies", title: "Cookie Policy — Juggle", description: "Juggle’s Cookie Policy explains browser technologies, cookie categories, and your choices.", ogTitle: "Cookie Policy — Juggle", ogDescription: "Read Juggle’s cookie policy, browser choices, and contact details.", imageTitle: "Cookie Policy", eyebrow: "SMALL COOKIES. CLEAR CHOICES.", accent: "sun" },
  auth: { path: "/auth", title: "Your Juggle Account — Sign In or Join", description: "Create a free Juggle account to fully customize and save your schedules.", ogTitle: "Your Juggle Account", ogDescription: "Sign in to your saved schedules and personal planning preferences.", imageTitle: "Your little corner of Juggle.", eyebrow: "SIGN IN OR JOIN", accent: "primary" },
  "reset-password": { path: "/reset-password", title: "Reset Your Password — Juggle", description: "Securely choose a new password for your Juggle account.", ogTitle: "Reset Your Juggle Password", ogDescription: "Choose a new password and return to your schedules.", imageTitle: "A fresh password. A fresh start.", eyebrow: "BACK TO YOUR PLANS", accent: "sky" },
  dashboard: { path: "/dashboard", title: "My Saved Schedules — Juggle", description: "Your personal Juggle schedules, ready to reopen, customize or print.", ogTitle: "My Juggle Schedules", ogDescription: "Keep your favorite plans together in your Juggle account.", imageTitle: "A home for your favorite plans.", eyebrow: "MY SAVED SCHEDULES", accent: "sun" },
  profile: { path: "/profile", title: "Profile & Preferences — Juggle", description: "Manage your Juggle display name, profile photo and favorite schedule colors and themes.", ogTitle: "Your Juggle Profile", ogDescription: "Personalize your profile and schedule preferences.", imageTitle: "Make Juggle feel like you.", eyebrow: "PROFILE & PREFERENCES", accent: "primary" },
  schedule: { path: "/schedules", title: "Edit Your Saved Schedule — Juggle", description: "Customize your saved Juggle schedule with individual activities, times, themes and weekday plans.", ogTitle: "Your Saved Juggle Schedule", ogDescription: "Make time for what matters with your personal schedule.", imageTitle: "Make time for what matters.", eyebrow: "YOUR SAVED SCHEDULE", accent: "sky" },
} as const;

export type OgPage = keyof typeof OG_PAGES;

export function resolveOgPage(value: string): OgPage | null {
  const key = value.endsWith(".png") ? value.slice(0, -4) : value;
  return Object.hasOwn(OG_PAGES, key) ? key as OgPage : null;
}

export function ogImageUrl(page: OgPage) {
  return `${SITE_URL}/api/public/og/${page}.png?v=${OG_VERSION}`;
}

export function pageHead(page: OgPage, path: string = OG_PAGES[page].path) {
  const data = OG_PAGES[page];
  const image = ogImageUrl(page);
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title: data.title },
      { name: "description", content: data.description },
      { property: "og:title", content: data.ogTitle },
      { property: "og:description", content: data.ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: `Juggle — ${data.imageTitle}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: data.ogTitle },
      { name: "twitter:description", content: data.ogDescription },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: `Juggle — ${data.imageTitle}` },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}