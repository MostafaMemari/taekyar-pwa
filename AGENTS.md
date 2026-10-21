<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# taekyar-pwa

Next.js 16.4.2 App Router app (React 19.3, Tailwind v4, shadcn/ui on Base UI, Biome). Two roles: coach (`مربی`) and student (`هنرجو`). Despite the name, there is **no PWA scaffolding yet** — no web manifest, no service worker, no offline support.

The project is currently a **design-to-code conversion**: the finished HTML screens in `design/reference/shared/` are being rebuilt as React pages with shadcn/ui. That scope is the single most important constraint below.

Everything below the managed block is project-specific; `next dev` preserves it.

## Scope: UI conversion only

- **No API, no validation, no auth/session, no persistence.** Do not add fetch/axios calls, server actions, route handlers, cookies, localStorage sessions, auth guards, validation schemas, or error/loading states that a design does not show.
- Forms are visual only: local `useState`, `noValidate`, and a submit handler that navigates with `router.push(...)`. Prototype footnotes such as «نمونه رابط کاربری — بدون اعتبارسنجی» are intentional.
- `src/lib/api/`, `src/lib/auth/`, and the auth hooks were deleted on purpose. Do not recreate equivalents unless the user asks.
- Implement only the small UI behaviors the designs imply (step switching, OTP countdown, theme toggle, Persian digit formatting) without connecting them to a backend.
- The backend contract is unknown; never assume endpoint shapes, payloads, or role rules.
- Reuse shared UI and layout components across roles, but keep role-specific screens separate. Don't duplicate shared UI, and don't merge unrelated role flows into one component to avoid a second file.

## Design source of truth

- References: `design/reference/shared/SHR-001-welcome.html` … `SHR-006-complete-student-profile.html` plus `SHR-023-student-profile.html` and `SHR-024-coach-profile.html`. Read the matching file before changing a screen; do not invent layout or copy.
- Screen mapping: `/` SHR-001, `/login` SHR-002, `/verify` SHR-003, `/signup/student` SHR-004 with SHR-023 as its third step, `/signup/coach` SHR-005 with SHR-024 as its optional second step, `/complete-profile` SHR-006, and `/signup/mobile` reusing SHR-002's mobile-entry pattern after signup. `/verify` is shared by login and signup. `/student`, `/coach`, and `/login/clubs` are placeholder destinations with no reference file.
- Keep the design's hierarchy, Persian copy, and CTA order, but implement every control with shadcn. The raw `<input>`, `<select>`, `.btn`, and `.seg` markup in the HTML is reference only — never copy it.
- **The signup step screens (SHR-004/005) and the shared OTP screen have no top brand/back header.** They start with the stepper or title, and the back action is a bottom CTA. Render signup steps and `/verify` with `<AuthScreen showHeader={false}>`; `/signup/mobile` does the same. Only `/login`, `/login/clubs`, and other non-signup auth screens keep the top header.
- **No inline `<svg>` in pages or feature components.** Use a lucide icon first. Custom brand artwork belongs only in `src/components/shared/taekyar-mark.tsx` (`TaekyarMark`, `LogoMark`, `BeltMotif`, `BeltGlyph`, `BeltStrip`, `BeltWatermark`, `TaekyarWordmark`); add a new custom SVG there only when lucide cannot represent it.
- Icons are `lucide-react`. Inside buttons pass `data-icon="inline-start"` or `data-icon="inline-end"` and let the component size the icon; don't add manual size classes.

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

- The UI is Persian-first and RTL. `src/app/layout.tsx` already sets `lang="fa" dir="rtl"` and Vazirmatn; keep it that way.
- Preserve directionality in layout, forms, navigation, alignment, and directional icons (chevrons, arrows, back/next).
- Prefer logical utilities — `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end` — over physical `left`/`right` equivalents, and logical CSS (`margin-inline`, `padding-inline`) in hand-written CSS.
- Use the existing typography and font stack; don't introduce a second one.
- Copy uses regular spaces, never ZWNJ (U+200C): write «سانتی متر», «ثبت نام», «می شود». The user reads ZWNJ-laden copy as machine-written, so don't reintroduce it in UI strings.
- Numeric values follow one pattern everywhere: the model stores Latin digits, the UI displays Persian digits.
  - Sanitize with `digitsOnly(value, maxLength)` from `src/lib/digits.ts` — it converts Persian `۰-۹` and Arabic `٠-٩` to Latin before stripping non-digits. Use `decimalOnly(value, maxWhole, maxFraction)` for typed values with a decimal point.
  - Display with `toPersianDigits(...)`. Dates are chosen with the shared `DatePicker`; state keeps Latin `YYYY/MM/DD` while the trigger renders Persian digits.
  - Typed numeric fields use `inputMode="numeric"` (or `"tel"`), `dir="ltr"`, and a `maxLength`. Height and weight are typed directly (max 3 digits, `digitsOnly` + `toPersianDigits`); dates use `DatePicker` instead of typing.
  - Never use `event.target.value.replace(/\D/g, "")` alone: it silently deletes Persian digits mid-typing.

## UI

- shadcn/ui is initialized with the **Base UI** library and the **Nova** preset (`components.json`: `"style": "base-nova"`). Add components with the CLI instead of hand-writing primitives; don't reinitialize, change `style`/`base`, or replace the component library without approval.
- **shadcn-first, no raw controls.** Never hand-write `<input>`, `<select>`, `<textarea>`, `<button>`, `<label>`, cards, or form layout when shadcn provides the piece. Use `Field`/`FieldGroup`/`FieldLabel`/`FieldDescription`, `Input`/`InputGroup`, `Select`, `ToggleGroup`, `InputOTP`, `Button`, `Card`, `Separator`, `Skeleton`, `Badge`, and `Alert`.
- Shared wrappers live in `src/components/shared/`: `auth-screen` (shell/header), `auth-brand-header` (brand + titles), `auth-field` (`AuthField`, `AuthInput`, `AuthSelect`), `segmented`, `otp-input`, `stepper`, `step-one-fields`, `belt-picker`, `photo-picker`, `wheel-column`, `date-picker`. Extend these instead of duplicating markup.
- `AuthInput` centers its value and placeholder. Keep that alignment when adding fields; `AuthSelect` stays start-aligned because its icon and chevron consume the edges.
- shadcn has no stepper primitive; keep the shared semantic `<ol>` implementation in `stepper.tsx` rather than rebuilding step headers per screen.
- Use built-in variants before custom classes — `brand`, `outline`, `cta`, `segmented` already encode the design's CTAs and segmented controls. `className` is for layout; don't restyle component colors or typography through it.
- Two-button bottom CTA rows use `cta-dock cta-row` together. `cta-row` is a grid with `minmax(0, 3fr)` / `minmax(0, 9fr)` columns, so the back/primary split is always 3:9 regardless of label length. Back buttons read «بازگشت»; don't add `flex-1`/`flex-[3]` or extra display classes to these rows.
- Optional steps use the `optional` prop on `AuthField`, `BeltPicker`, and `PhotoPicker` (renders `(اختیاری)` with no asterisk). The student documents step and coach professional step are fully optional; their CTAs submit without requiring input.
- `PhotoPicker` is always the stacked card layout (camera button above the label); student and coach screens share it. `BeltPicker` strips are inset with `px-3` and use `stretch` so the SVG fills the reduced width.
- Date fields use the shared `DatePicker`: a bottom `Sheet` with three `WheelColumn`s for year, month (Persian names), and day. It clamps the day to the selected month (Esfand 30 in leap years), applies on «تایید», clears on «پاک کردن», and renders the stored `YYYY/MM/DD` in Persian digits. Pass `fromYear`/`toYear`; don't replace it with a typed date input.
- Student belts use one grouped picker (`BeltPicker` `groups`): «رنگی» (سفید…قرمز), «پوم» ۱…۴ and «دان» ۱…۶. The category switcher keeps only the active group's tiles visible so the signup step never shows all 15 at once. «پوم N» is the two-tone belt — black top, red bottom, N stripes (`BeltStrip` `bottomColor`); «دان N» is solid black with N stripes. Persist ranks on the student model as `poom`/`dan`, render strips/dots through `BeltStrip` and `studentBeltDotStyle`, and keep the shared options in `src/lib/student-belts.ts` (`poom-1`…`poom-4`, `dan-1`…`dan-6`). Coach belts run from «دان ۴» to «دان ۹» in a three-column grid.
- Gender starts as `MALE` in signup and complete-profile state, matching the design's preselected «مرد».
- Inline field icons track the field's focus state with the ring token (`group-focus-within` on `InputGroup`, `group-focus-visible` on `SelectTrigger`), so the icon and border highlight together.
- Prefer semantic tokens (`bg-primary`, `text-muted-foreground`, `text-ink-body`) over raw palette classes.
- Composition uses Base UI's `render` prop, not Radix's `asChild`. When a `Button` renders a link, pass `render={<Link href="..." />}` plus `nativeButton={false}`.
- `cn` comes from the `cn` package; `src/lib/utils.ts` re-exports it. shadcn files import `"cn"` directly, app code imports `@/lib/utils` — both are the same function.
- VibeFarsi is optional for genuine Persian/RTL needs — not installed, so don't assume it or add it casually.

## Biome

- `biome.json` is the contract: 2-space indent, double quotes, width 140, auto-organized imports, `next` + `react` domains at `recommended`.
- Never weaken a rule or suppress diagnostics in app code to make a check pass. Fix the code instead. Scoping the scanner away from non-source material (`design/`) is not a suppression — see Gotchas.
- Format only the files you touched. A repo-wide `--write` rewrites scaffold files and adds diff noise unrelated to the task.

## Skills

Installed under `.agents/skills/`, which is **gitignored** — they may be missing in a fresh clone or another environment. Don't depend on them being present or cite their internals in code. Read the skill that covers the task at hand; don't apply one to unrelated work.

- `shadcn` — shadcn/ui and component work.
- `vercel-react-best-practices` — React/Next.js implementation and review; apply the rules that fit, not all of them.
- `web-design-guidelines` — UI/accessibility reviews when asked; not a mandatory check on every change.
- `migrate-radix-to-base` — only if a Radix migration arises. The project already uses Base UI, so it does not apply today.

## Gotchas

**Typecheck needs generated route types.** `LayoutProps<"/">` / `PageProps<"/path">` come from `.next/types/routes.d.ts` (referenced by `tsconfig.json`, never imported). On a clean clone `npx tsc --noEmit` fails with `Cannot find name 'LayoutProps'` until `npx next typegen` runs. Don't inline `{ children: React.ReactNode }` to work around it — typed routes are on by default in Next 16.

**`design/` is excluded from Biome** (`biome.json` → `files.includes`). Those HTML files are read-only references with inline bootstrap scripts; never lint, format, or “fix” them. `npm run lint` should pass on the app code — if it fails, the failure is yours to fix, not to suppress.

**Tailwind is NOT wired through PostCSS.** It runs as a Turbopack loader rule in `next.config.ts` (`@tailwindcss/turbopack`); there is no `postcss.config.*` and none should be added. The bundled docs (`01-app/01-getting-started/11-css.md`) recommend `@tailwindcss/postcss` — ignore that section here; it would conflict with the working pipeline.

**No `tailwind.config.js`.** Theme tokens are shadcn's semantic set in `src/app/globals.css` (`@theme inline` plus `:root` / `.dark`), with `@import "shadcn/tailwind.css"` and `tw-animate-css`. Add or override tokens there.

## Layout

- `src/app/` — App Router. `layout.tsx` (fa/rtl shell, Vazirmatn, metadata), `globals.css` (theme tokens), `page.tsx` (welcome), plus routes `login/` (with `login/clubs/`), `verify/`, `signup/student/`, `signup/coach/`, `signup/mobile/`, `complete-profile/`, `student/`, and `coach/`.
- `src/components/ui/` — shadcn components only, generated by the CLI. Put composed/wrapper UI in `src/components/shared/`, and role screens in `src/components/student/` or `src/components/coach/`. These folders hold `.tsx` components only.
- `src/lib/` — `utils.ts` (`cn` re-export), `digits.ts` (Persian/Latin digit display helpers), `provinces.ts` (province options), `theme.ts` (theme bootstrap), and `coach/` (coach prototype data, options, and form models — plain `.ts`, no JSX).
- `design/reference/` — the HTML designs being converted; source material, not shipping code.
- `public/` — `fonts/` (Vazirmatn) and `images/` (welcome hero).
- `@/*` resolves to `src/*` (see `tsconfig.json` `paths`).
- `README.md` is untouched create-next-app boilerplate and is **wrong** about paths (it says `app/page.tsx`; the real file is `src/app/page.tsx`). Don't treat it as a spec.
