import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { termsSections } from "@/lib/legal-content";
import { pageHead } from "@/lib/og-pages";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("terms"),
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
