import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { cookieSections } from "@/lib/legal-content";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Juggle" },
      { name: "description", content: "Juggle’s Cookie Policy explains browser technologies, cookie categories, and your choices." },
      { property: "og:title", content: "Cookie Policy — Juggle" },
      { property: "og:description", content: "Read Juggle’s cookie policy, browser choices, and contact details." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://juggle-schedulebuilder.lovable.app/cookies" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://juggle-schedulebuilder.lovable.app/cookies" }],
  }),
  component: CookiePage,
});

function CookiePage() {
  return <LegalPage title="Cookie Policy" intro="An explanation of the browser technologies Juggle uses, the categories they fall into, and your choices." sections={cookieSections} />;
}