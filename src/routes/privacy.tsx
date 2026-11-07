import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { privacySections } from "@/lib/legal-content";
import { pageHead } from "@/lib/og-pages";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("privacy"),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro="How Juggle handles planning information, the privacy choices you have, and how to reach us." sections={privacySections} />;
}