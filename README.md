# Stellar SCIO

Website and product demo for **Stellar SCIO**, the AI business operating system by Stellarmind.ai.
SCIO works on top of a company's ERP, POS, warehouse, HR and finance systems: people ask questions in
plain language, SCIO spots problems early, and a person approves every action.

Live site: https://www.stellarscio.app

## What's in this repo

| Path | What it is |
|---|---|
| `src/components/landing`, `src/components/site`, `src/app/site` | Public marketing site: `/`, `/platform`, `/platform/integrations`, `/use-cases`, `/why-scio`, `/erp-experts`, `/faq`, `/contact` |
| `src/demo` | The SCIO product app at `/app` (unlisted, not indexed) |
| `src/app/page.tsx`, `src/components/{energy,maritime,manufacturing,logistics}` | Industry dashboards opened with `/?launch=1` or `/?industry=…` |
| `src/server`, `api/index.js` | API used by the site assistant and the app, deployed as a Vercel function |
| `convex/` | Convex backend (read `convex/_generated/ai/guidelines.md` before changing it) |
| `scripts/prerender-seo.mjs` | Post-build SEO step (see below) |
| `public/` | Static files served as-is: images, logos, `robots.txt`, `sitemap.xml`, `404.html` |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # vite build + SEO prerender into dist/
npm run lint       # oxlint
```

## SEO: where things live

- **Titles and descriptions** for every public page live in `src/components/site/seoRoutes.json`.
  The live pages read them through `pageSeo()` in `src/components/site/seo.ts`, and the build's prerender step reads the same file. Titles must be at most 60 characters and descriptions at most 160, or the build fails.
- **Prerendered HTML.** The site is a single-page app, so `scripts/prerender-seo.mjs` writes `dist/<route>.html` for each public route after `vite build`. Each file carries that page's title, canonical URL, social tags, JSON-LD and a plain-text copy of its heading and key points, so crawlers that don't run JavaScript still see the content. It also writes `llms.txt` and `llms-full.txt`. When you change a page's hero copy, update its `h1` / `intro` / `points` there too.
- **Adding a public page:** add the route in `src/AppRouter.tsx`, an entry in `seoRoutes.json`, a route in `prerender-seo.mjs`, and a `<url>` in `public/sitemap.xml`.
- **Hosting rules** live in `vercel.json`:
  - redirects for retired URLs
  - the `/app` SPA rewrite
  - `X-Robots-Tag: noindex` on `/app`
  - security and cache headers

  Unknown URLs get `public/404.html` with a real 404 status.

The latest audit is in `docs/seo-audit/`.
