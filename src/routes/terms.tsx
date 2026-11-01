import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { termsSections } from "@/lib/legal-content";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Juggle" },
      { name: "description", content: "The rules for using Juggle, the playful custom schedule template builder." },
      { property: "og:title", content: "Terms of Service | Juggle" },
      { property: "og:description", content: "The rules for using Juggle, the playful custom schedule template builder." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://juggle-schedulebuilder.lovable.app/terms" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://juggle-schedulebuilder.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The rules for using Juggle, the playful custom schedule template builder."
      lastUpdated="October 26, 2026"
      tldr="Be kind, use Juggle for personal planning, and don’t misuse the site. Your schedules are yours. Juggle is provided as-is, so we can’t guarantee it’s perfect."
      sections={termsSections}
    />
  );
}
