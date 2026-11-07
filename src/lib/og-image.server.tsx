import { ImageResponse, cache } from "@cf-wasm/og";
import Color from "colorjs.io";
import brandCss from "@/styles.css?raw";
import { OG_PAGES, OG_VERSION, resolveOgPage, type OgPage } from "./og-pages";

// No external assets or execution-context-dependent cache writes are needed.
cache.disable();

function brandToken(name: string) {
  const value = new RegExp(`--${name}:\\s*([^;]+);`).exec(brandCss)?.[1]?.trim();
  if (!value) throw new Error(`Missing share-image color token: ${name}`);
  // The image renderer predates OKLCH, so convert CSS tokens rather than duplicating colors.
  return new Color(value).to("srgb").toString({ format: "hex" });
}

const colors = {
  background: brandToken("background"), foreground: brandToken("foreground"),
  primary: brandToken("primary"), sky: brandToken("sky"), sun: brandToken("sun"), card: brandToken("card"),
};

function ShareCard({ page }: { page: OgPage }) {
  const data = OG_PAGES[page];
  const accent = colors[data.accent];
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: colors.background, color: colors.foreground, padding: "48px 64px", fontFamily: "Noto Sans", letterSpacing: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 70, fontWeight: 700 }}>juggle<span style={{ color: colors.primary }}>.</span></div>
        <div style={{ display: "flex", gap: 12 }}>
          {[colors.primary, colors.sky, colors.sun].map((color, i) => <div key={color} style={{ display: "flex", width: 34, height: 34, borderRadius: i === 1 ? 8 : 34, background: color, border: `2px solid ${colors.foreground}`, transform: i === 1 ? "rotate(12deg)" : "rotate(0deg)" }} />)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, width: "100%", paddingTop: 14, paddingBottom: 14 }}>
        <div style={{ display: "flex", alignSelf: "flex-start", background: accent, border: `2px solid ${colors.foreground}`, borderRadius: 8, padding: "8px 16px", fontSize: 19, fontWeight: 700 }}>{data.eyebrow}</div>
        <div style={{ display: "flex", fontSize: data.imageTitle.length > 38 ? 66 : 76, fontWeight: 700, lineHeight: 1.12, marginTop: 20, maxWidth: 1030 }}>{data.imageTitle}</div>
        <div style={{ display: "flex", fontSize: 25, lineHeight: 1.45, marginTop: 20, maxWidth: 1000 }}>{data.ogDescription}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `2px solid ${colors.foreground}`, paddingTop: 18, fontSize: 21 }}>
        <span>Juggle: plan less, live more.</span><span>juggle-schedulebuilder.lovable.app</span>
      </div>
    </div>
  );
}

export async function createOgResponse(request: Request, value: string): Promise<Response> {
  const page = resolveOgPage(value);
  if (!page) return new Response("Share image not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  const headers = {
    "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    "Content-Type": "image/png",
    "X-Content-Type-Options": "nosniff",
    ETag: `"juggle-og-${OG_VERSION}-${page}"`,
  };
  if (request.headers.get("If-None-Match") === headers.ETag) return new Response(null, { status: 304, headers });
  // Render before sending headers so rendering failures never look like successful PNGs.
  return ImageResponse.async(<ShareCard page={page} />, { width: 1200, height: 630, headers });
}