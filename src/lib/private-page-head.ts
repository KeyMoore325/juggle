import { pageHead } from "./og-pages";

// The managed client-only auth layout prevents the router from emitting its
// children's heads during SSR. Fill only their public metadata at the server
// response boundary; do not render private content or run account loaders.
export function privatePageHead(path: string) {
  if (path === "/dashboard") return pageHead("dashboard");
  if (path === "/profile") return pageHead("profile");
  if (/^\/schedules\/[^/]+$/.test(path)) return pageHead("schedule", path);
  return null;
}

function escapeAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function privateHeadMarkup(path: string) {
  const head = privatePageHead(path);
  if (!head) return "";
  return head.meta.map((tag) => {
    if ("title" in tag && tag.title) return `<title data-juggle-share-head>${escapeAttribute(tag.title)}</title>`;
    if ("property" in tag && tag.property) return `<meta data-juggle-share-head property="${escapeAttribute(tag.property)}" content="${escapeAttribute(tag.content)}">`;
    if ("name" in tag && tag.name) return `<meta data-juggle-share-head name="${escapeAttribute(tag.name)}" content="${escapeAttribute(tag.content)}">`;
    return "";
  }).join("") + head.links.map((link) => `<link data-juggle-share-head rel="canonical" href="${escapeAttribute(link.href)}">`).join("");
}