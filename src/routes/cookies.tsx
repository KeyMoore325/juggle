import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { cookieSections } from "@/lib/legal-content";
import { pageHead } from "@/lib/og-pages";

export const Route = createFileRoute("/cookies")({
  head: () => pageHead("cookies"),
  component: CookiePage,
});

function CookiePage() {
  return <LegalPage title="Cookie Policy" intro="An explanation of the browser technologies Juggle uses, the categories they fall into, and your choices." sections={cookieSections} />;
}