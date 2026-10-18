<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# taekyar-pwa

Single-route Next.js 16.4.2 App Router app (React 19.3, Tailwind v4, Biome). Despite the name, there is **no PWA scaffolding yet** — no web manifest, no service worker, no offline support. Adding PWA capability is net-new work, not a fix to existing code.

Everything below the managed block is project-specific; `next dev` preserves it.

## Commands

```bash
npm run dev        # http://localhost:3000, Turbopack (default, no flag needed)
npm run build      # production build; also runs the TypeScript check
npm start          # serve the production build
npm run lint       # biome check — reports only, applies NO fixes
npm run format     # biome format --write — formatting only, no lint/import fixes
npx biome check --write   # apply formatting + lint fixes + import organization
npx tsc --noEmit          # standalone typecheck (see gotcha below)
```

- **No test runner is installed.** Do not invent or invoke a test command; adding tests means first choosing and installing a framework.
- No CI, no pre-commit hooks, no git remote. Nothing enforces the checks — run them yourself. `npm run build` is the real gate.

## Gotchas that will bite you

**Typecheck needs generated route types.** Route props use Next-generated globals (`LayoutProps<"/">`, `PageProps<"/path">`) that live in `.next/types/routes.d.ts` and are only referenced by `tsconfig.json`, never imported. On a clean clone `npx tsc --noEmit` fails with `Cannot find name 'LayoutProps'` until types are generated. Run `npx next typegen` (or any build/dev) first. Don't "fix" this by inlining `{ children: React.ReactNode }` — typed routes are on by default in Next 16.

**`npm run lint` fails on a clean checkout.** Four scaffold files (`package.json`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`) carry formatting-only diffs against the 140-char `lineWidth`. Confirm whether a failure is pre-existing before debugging your own change.

**Tailwind is NOT wired through PostCSS here.** It runs as a Turbopack loader rule in `next.config.ts` (`@tailwindcss/turbopack`). There is no `postcss.config.*`, and this is intentional — the Next docs at `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` tell you to add `@tailwindcss/postcss` plus a PostCSS config. Don't follow that section; it would duplicate/conflict with the working pipeline.

**No `tailwind.config.js`.** Design tokens are declared in the `@theme inline` block in `src/app/globals.css` (mapped from `--background` / `--foreground` / font vars). Add colors, fonts, and spacing there, not in a JS config file.

## Next.js 16 changes worth knowing

- `middleware.ts` is now **`proxy.ts`** (default export named `proxy`). Docs: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`.
- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are **async** — await them.
- Turbopack is the default bundler for both `dev` and `build`.
- `next lint` no longer exists; Biome replaces it here.
- When unsure about an API, read `node_modules/next/dist/docs/` — it is version-matched to 16.4.2. Prefer it over web search and over recall.

## Layout

- `src/app/` — App Router. `layout.tsx` (fonts, metadata, `<html>` shell), `page.tsx` (the only route), `globals.css`.
- `@/*` resolves to `src/*` (see `tsconfig.json` `paths`).
- `public/` holds create-next-app placeholder SVGs; replace rather than add alongside.
- `README.md` is untouched create-next-app boilerplate and is **wrong** about paths (it says `app/page.tsx`; the real file is `src/app/page.tsx`). Don't treat it as a spec.

## Style

Biome enforces it: 2-space indent, double quotes, line width 140, automatic import organization, `next` + `react` lint domains at `recommended`. Prefer editing to match rather than hand-formatting against it.
