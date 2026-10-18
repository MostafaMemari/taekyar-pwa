<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# taekyar-pwa

Single-route Next.js 16.4.2 App Router app (React 19.3, Tailwind v4, shadcn/ui on Base UI, Biome). Despite the name, there is **no PWA scaffolding yet** — no web manifest, no service worker, no offline support. Adding PWA capability is net-new work, not a fix to existing code.

Everything below the managed block is project-specific; `next dev` preserves it.

## Product structure & roles

- TaekYar has two roles: coach (`مربی`) and student (`هنرجو`). Their authentication flows, permissions, and role-specific features may differ — never assume one flow serves both. Inspect the existing backend contract before implementing either.
- No auth, session, or role-gating code exists in this repo yet; treat all of it as new work, not an established convention.
- Reuse shared UI components, form controls, validation patterns, and utilities where they fit. Keep role-specific behavior and authentication logic separate: don't duplicate shared UI, and don't push unrelated role logic into one component to avoid a second file.

## Commands & validation

```bash
npm run dev                      # http://localhost:3000, Turbopack (default, no flag needed)
npm run build                    # production build; also runs the TypeScript check
npm start                        # serve the production build
npm run lint                     # biome check — reports only, applies NO fixes
npm run format                   # biome format --write — formatting only, no lint/import fixes
npx biome check --write <paths>  # format + lint fixes + import order, for touched files
npx tsc --noEmit                 # standalone typecheck (needs generated route types)
npx next typegen                 # generate route types without a full build
```

- **No test runner is installed.** Do not invent or invoke a test command; adding tests means first choosing and installing a framework.
- No CI, no pre-commit hooks, no git remote. Nothing enforces the checks — run them yourself. `npm run build` is the real gate.
- Validate what you touched, not the whole repo: `npx biome check --write` on your files, then `npm run build` (or `npx next typegen && npx tsc --noEmit` when only types matter).

## Working agreement

- Read the relevant code before editing, then make the smallest change that satisfies the request.
- Do not touch dependencies, lockfiles, configuration, public APIs, or unrelated files as a side effect.
- Ask before architectural changes, breaking API/backend contract changes, or adding a dependency. Routine implementation details are yours to decide.
- Review `git diff` before reporting. Say what changed, what you actually ran, and what is still unresolved — never claim a check passed unless you ran it.

## Code quality

- Prefer the plain, readable version. No abstraction until a second caller exists; no memoization, lazy loading, or micro-optimization without a measured reason.
- Deduplicate real duplication; a little repetition beats a forced shared helper.
- One primary responsibility per file. Colocate route-specific code under `src/app/<route>/`; introduce `src/components` or `src/lib` only when shared code first needs a home. Avoid both oversized files and one-export-per-file sprawl.
- No comments by default. Add one only for a non-obvious constraint or decision the code cannot express — never to restate what the code already says.

## React & Next.js

- Server Components by default. Add `"use client"` only on the smallest leaf that needs state, effects, event handlers, or browser APIs — not on a layout or page that can stay server-side.
- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are async — await them. Middleware lives in `proxy.ts`, not `middleware.ts`.
- When an API is unfamiliar, read `node_modules/next/dist/docs/` — it matches the installed 16.4.2. Prefer it over recall or web search.

## Persian & RTL

- The UI is Persian-first and RTL. Preserve directionality in layout, forms, navigation, alignment, and directional icons (chevrons, arrows, back/next).
- Prefer logical utilities — `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end` — over physical `left`/`right` equivalents, and logical CSS (`margin-inline`, `padding-inline`) in hand-written CSS.
- Use the existing typography and font stack; don't introduce a second one.
- `src/app/layout.tsx` is still the create-next-app scaffold (`lang="en"`, Geist/Latin, placeholder metadata), so RTL wiring there is pending, not established.

## UI

- shadcn/ui is initialized with the **Base UI** library and the **Nova** preset (`components.json`: `"style": "base-nova"`). Add components with the CLI instead of hand-writing primitives; don't reinitialize, change `style`/`base`, or replace the component library without approval.
- Composition uses Base UI's `render` prop, not Radix's `asChild`.
- Prefer existing variants and semantic tokens (`bg-primary`, `text-muted-foreground`) over custom styles; `cn` is re-exported from `src/lib/utils.ts`.
- VibeFarsi is optional for genuine Persian/RTL needs — not installed, so don't assume it or add it casually.

## Biome

- `biome.json` is the contract: 2-space indent, double quotes, width 140, auto-organized imports, `next` + `react` domains at `recommended`.
- Never weaken a rule, add an ignore, or edit the config to make a check pass. Fix the code instead.
- Format only the files you touched. A repo-wide `--write` rewrites scaffold files and adds diff noise unrelated to the task.

## Skills

Installed under `.agents/skills/`, which is **gitignored** — they may be missing in a fresh clone or another environment. Don't depend on them being present or cite their internals in code. Read the skill that covers the task at hand; don't apply one to unrelated work.

- `shadcn` — shadcn/ui and component work.
- `vercel-react-best-practices` — React/Next.js implementation and review; apply the rules that fit, not all of them.
- `web-design-guidelines` — UI/accessibility reviews when asked; not a mandatory check on every change.
- `migrate-radix-to-base` — only if a Radix migration arises. The project already uses Base UI, so it does not apply today.

## Gotchas

**Typecheck needs generated route types.** `LayoutProps<"/">` / `PageProps<"/path">` come from `.next/types/routes.d.ts` (referenced by `tsconfig.json`, never imported). On a clean clone `npx tsc --noEmit` fails with `Cannot find name 'LayoutProps'` until `npx next typegen` runs. Don't inline `{ children: React.ReactNode }` to work around it — typed routes are on by default in Next 16.

**`npm run lint` already fails on a clean checkout.** Five files carry formatting-only diffs at width 140: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/utils.ts`, `tsconfig.json`. Confirm a failure is pre-existing before debugging your change.

**Tailwind is NOT wired through PostCSS.** It runs as a Turbopack loader rule in `next.config.ts` (`@tailwindcss/turbopack`); there is no `postcss.config.*` and none should be added. The bundled docs (`01-app/01-getting-started/11-css.md`) recommend `@tailwindcss/postcss` — ignore that section here; it would conflict with the working pipeline.

**No `tailwind.config.js`.** Theme tokens are shadcn's semantic set in `src/app/globals.css` (`@theme inline` plus `:root` / `.dark`), with `@import "shadcn/tailwind.css"` and `tw-animate-css`. Add or override tokens there.

## Layout

- `src/app/` — App Router. `layout.tsx` (fonts, metadata, `<html>` shell), `page.tsx` (the only route), `globals.css`.
- `src/components/ui/` — shadcn components (`button.tsx` so far). `src/lib/utils.ts` — `cn` re-export.
- `@/*` resolves to `src/*` (see `tsconfig.json` `paths`).
- `README.md` is untouched create-next-app boilerplate and is **wrong** about paths (it says `app/page.tsx`; the real file is `src/app/page.tsx`). Don't treat it as a spec.
