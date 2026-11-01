import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { privacySections } from "@/lib/legal-content";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Juggle" },
      { name: "description", content: "Juggle’s privacy notice covering planning information, privacy choices, and contact details." },
      { property: "og:title", content: "Privacy Policy — Juggle" },
      { property: "og:description", content: "Read Juggle’s privacy notice and contact us with privacy questions." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://juggle-schedulebuilder.lovable.app/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://juggle-schedulebuilder.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro="How Juggle handles planning information, the privacy choices you have, and how to reach us." sections={privacySections} />;
}