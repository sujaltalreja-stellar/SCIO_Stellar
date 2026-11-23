import { useEffect } from "react";

export const SITE_URL = "https://www.stellarscio.app";
const DEFAULT_IMAGE = `${SITE_URL}/thumbnail.png?v=3`;

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Per-page title, description, canonical URL and social tags for the public site. */
export function useSeo({ title, description, path, image }: { title: string; description: string; path: string; image?: string }) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    const img = image ? `${SITE_URL}${image}` : DEFAULT_IMAGE;
    document.title = title;
    setMeta("name", "description", description);
    setCanonical(url);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", img);
  }, [title, description, path, image]);
}
