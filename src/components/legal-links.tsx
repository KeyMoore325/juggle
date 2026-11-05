import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/lib/cookie-consent";

export function LegalLinks() {
  return (
    <nav aria-label="Legal policies" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-2 font-semibold text-foreground">
        <Link to="/privacy" activeProps={{ "aria-current": "page" }}>Privacy Policy</Link>
      </Button>
      <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-2 font-semibold text-foreground">
        <Link to="/terms" activeProps={{ "aria-current": "page" }}>Terms of Service</Link>
      </Button>
      <Button asChild variant="link" className="h-auto whitespace-normal px-0 py-2 font-semibold text-foreground">
        <Link to="/cookies" activeProps={{ "aria-current": "page" }}>Cookie Policy</Link>
      </Button>
      <Button type="button" variant="link" onClick={openCookieSettings} className="h-auto whitespace-normal px-0 py-2 font-semibold text-foreground">Cookie settings</Button>
    </nav>
  );
}