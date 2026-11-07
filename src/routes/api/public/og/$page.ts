import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/og/$page")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // This public endpoint only renders allowlisted copy, never account data.
        const { createOgResponse } = await import("@/lib/og-image.server");
        return createOgResponse(request, params.page);
      },
    },
  },
});