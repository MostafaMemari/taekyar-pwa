<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# taekyar-pwa

Next.js 16.4.2 App Router app (React 19.3, Tailwind v4, shadcn/ui on Base UI, SWR, Biome). Two roles: coach (`مربی`) and student (`هنرجو`). Despite the name, there is **no PWA scaffolding yet** — no web manifest, no service worker, no offline support.

The project is currently a **design-to-code conversion**: the finished HTML screens in `design/reference/shared/` are being rebuilt as React pages with shadcn/ui. That scope is the single most important constraint below.

Everything below the managed block is project-specific; `next dev` preserves it.

## Scope

- Auth is wired to the real backend: login, signup, OTP verification and complete-profile use the `ky` client in `src/lib/api/`, React Hook Form + Zod validation, and a stored session. Do not stub or bypass these flows.
- Route access is client-side: `RequireSession` in `src/features/auth/components/require-session.tsx` and `GuestOnly` in `src/features/auth/components/guest-only.tsx` wrap the auth, signup and role routes, and `HOME_BY_ROLE` in `session.ts` is the role → home map. Tokens live in `localStorage`, so `proxy.ts` cannot gate them; the `401 → refresh → retry` path in `src/features/auth/api.ts` is the real enforcement. Sign out uses `logoutSession()`, which revokes the refresh token on the backend and drops the local session even when that request fails.
- Coach clubs are wired to the real backend through `src/features/coach/lib/club-api.ts` (`GET /club`, `GET /club/:id`, `GET /club/:id/students?take=1` for the member total, `POST /club`, `PATCH /club/:id`, `PATCH /club/:id/status`) using `authRequest`, so the access token and the `401 → refresh → retry` path are reused. Reads go through the SWR hooks in `src/features/coach/hooks/use-clubs.ts` (`useClubs`, `useClub`, `useClubStudentCount`, `useClubStudentCounts`) and writes through `use-club-mutations.ts` (`useSaveClub`, `useChangeClubStatus`), which revalidate every `["club", ...]` key; the screens hold no copy of the server data in `useState`. `clearDataCache()` in `src/lib/api/cache.ts` drops the cached private data on sign out and after a verified OTP. The create and edit forms use React Hook Form + Zod (`clubFormSchema` mirrors the DTO bounds). There is no `DELETE /club/:id`, so «حذف» is the reversible `isActive` toggle; `gender` is assigned by the server from the coach profile, and `GET /club` returns no class or member counts, so member totals cost one request per club.
- Coach class sessions are wired to the real backend through `src/features/coach/lib/session-api.ts` (`GET /class-session?page=1&take=100`, `GET /class-session/:id`, `GET /class-session/:id/students?take=1` for the member total, `POST /class-session`, `PATCH /class-session/:id`, `PATCH /class-session/:id/status`) using `authRequest`. Reads go through `src/features/coach/hooks/use-sessions.ts` (`useSessions`, `useSession`, `useSessionStudentCount`, `useSessionStudentCounts`) and writes through `use-session-mutations.ts` (`useSaveSession`, `useChangeSessionStatus`), which revalidate every `["session", ...]` key. The create/edit form (`sessions/session-form.tsx`) uses React Hook Form + Zod (`sessionFormSchema` mirrors the DTO bounds, plus a client-side `endTime > startTime` refinement). `clubId` is create-only — a select fed by `useClubs()` on new and rendered disabled on edit, since the backend ignores it on `PATCH`. `GET /class-session` returns no club and no member count, so the list takes club names from the `useClubs()` cache and sends one `?take=1` request per class; the detail roster comes from `students[].student.fullName` inside the `GET /class-session/:id` response. The shared read policy (`revalidateOnFocus: false`, retry only network/429/5xx) is `swrReadOptions` in `src/lib/api/swr.ts`, and the retry-with-error screen is `features/coach/components/error-state.tsx`.
- The rest of the app (student and coach dashboards, students, invitations, attendance marking and session reports) is still a **design-to-code conversion**: screens stay visual unless an endpoint is explicitly wired. Do not invent API calls, payloads, or role rules for them.
- Coach settings, notifications and account sessions are wired to the real backend. `src/features/coach/lib/account-session-api.ts` covers `GET /sessions`, `DELETE /sessions/:id` and `DELETE /sessions`; `notification-api.ts` covers `GET /notifications`, `PATCH /notifications/read-all` and `GET /notifications/unread-count`. Reads and writes use the SWR hooks `use-account-sessions.ts`, `use-account-session-mutations.ts`, `use-notifications.ts`, `use-notification-mutations.ts` and `use-unread-notifications.ts`, which revalidate `["account-session", ...]` and `["notification", ...]`. The current session comes from `getSessionId()` (the `sessionId` claim in the access token); «لغو همه نشست ها» revokes the current one too, so the screen clears the local session and returns to `/login`. `GET /sessions` needs `isActive` sent explicitly — a missing value is transformed to `false`, so the API layer fetches both halves and merges them; notification `isRead`/`type` filters are client-side for the same DTO gap. Screens live in `features/coach/components/settings/` behind `/coach/settings` (`/appearance`, `/security`) and `/coach/notifications`; appearance reads and writes theme mode/accent through `useThemeStore`.
- Forms outside auth, clubs and classes are visual only: local `useState`, `noValidate`, and a submit handler that navigates with `router.push(...)`. Prototype footnotes such as «نمونه رابط کاربری — بدون اعتبارسنجی» are intentional.
- Implement only the small UI behaviors the designs imply (step switching, OTP countdown, theme toggle, Persian digit formatting) without adding unrelated state.
- Reuse shared UI and layout components across roles, but keep role-specific screens separate. Don't duplicate shared UI, and don't merge unrelated role flows into one component to avoid a second file.

## Feature-based architecture

- `src/features/` is the default home for product code. Each feature owns its own logic, forms, hooks, schemas and API calls; feature-specific code must not sit in the shared folders without a concrete reason.
- Create a feature folder only when a real capability and its code exist. Never scaffold empty or speculative features (`students`, `classes`, `tournaments`, …) ahead of the code.
- Split a feature internally (`forms/`, `hooks/`, `api/`, `schemas/`, `components/`, `lib/`) only when there is enough code to justify the split. Never create a folder for one file.
- `src/app/` is routing only: `page.tsx`, `layout.tsx`, route groups, and the wiring that imports the matching feature. Do not define a feature's forms or main logic inside `page.tsx`.
- Keep Next.js-required files (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`) where the framework expects them and follow its contract.
- Auth forms live in `src/features/auth/forms/`; auth hooks in `src/features/auth/hooks/`; auth-only components in `src/features/auth/components/`; API, schemas, session and pending-signup helpers in the feature root. Never merge login with signup, or student signup with coach signup.
- Coach, student, clubs, classes and tournaments code belongs to `src/features/<domain>/`. Clubs currently lives inside `src/features/coach/components/clubs/` because it is a coach-only sub-domain; don't create a cross-feature dependency just to give it a top-level folder.
- `src/components/ui/` holds base UI primitives (`Button`, `Input`, `Dialog`, …) only. `src/components/shared/` holds only components genuinely shared by independent areas; a component used by a single feature stays in that feature.
- `src/lib/` holds domain-agnostic infrastructure and utilities (API client, digit helpers, Jalali dates, theme, …). Feature-specific code never goes there.
- Client data fetching is SWR, and it belongs to the feature that owns the data: reads in `src/features/<feature>/hooks/use-*.ts`, writes with `useSWRMutation` in the same folder, requests still in the feature API file. Components take `data`, `error`, `isLoading` and `mutate` from the hook and never mirror that server state with their own `useState`. Cache keys are arrays that start with the resource name and then carry its parameters (`["club", id]`, `["club", "list", take]`), and `clearDataCache()` in `src/lib/api/cache.ts` is the logout / new-identity seam.
- Zustand is only for global client state that unrelated components read and write and that no server response owns. Today that is just the theme: `src/lib/theme-store.ts` holds `mode`/`accent`/`radius`, applies them through `applyTheme`/`applyAccent`/`applyRadius`, and `ThemeProvider` syncs it after mount from the class/attribute/`--radius` that `THEME_INIT_SOURCE` already set. `radius` is a three-step preset (کم/معمولی/گرد) written to `--radius`, so shadcn `rounded-*` utilities follow it; CSS with hard-coded radii does not. Server data stays in SWR, per-screen UI state stays `useState`, and filter/URL state stays `nuqs` — don't move those into a store.

## Design source of truth

- References: `design/reference/shared/SHR-001-welcome.html` … `SHR-006-complete-student-profile.html` plus `SHR-023-student-profile.html` and `SHR-024-coach-profile.html`. Read the matching file before changing a screen; do not invent layout or copy.
- Screen mapping: `/` SHR-001, `/login` SHR-002, `/verify` SHR-003, `/signup/student` SHR-004 with SHR-023 as its third step, `/signup/coach` SHR-005 with SHR-024 as its optional second step, `/complete-profile` SHR-006, and `/signup/mobile` reusing SHR-002's mobile-entry pattern after signup. `/verify` is shared by login and signup. `/student`, `/coach`, and `/login/clubs` are placeholder destinations with no reference file.
- Keep the design's hierarchy, Persian copy, and CTA order, but implement every control with shadcn. The raw `<input>`, `<select>`, `.btn`, and `.seg` markup in the HTML is reference only — never copy it.
- **The signup step screens (SHR-004/005) and the shared OTP screen have no top brand/back header.** They start with the stepper or title, and the back action is a bottom CTA. Render signup steps, `/login`, `/verify`, and `/signup/mobile` with `<AuthScreen showHeader={false}>`. Only `/login/clubs` keeps the top header.
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
- **One exported component per file**, named after the file (`status-badge.tsx` exports `StatusBadge`). No bucket files: `coach-ui.tsx`, `auth-field.tsx`, `auth-brand-header.tsx`, `*-form-fields.tsx`, `students-sheets.tsx` and `session-guard.tsx` were each split into one file per component. A second component may share a file only when it is private (not exported) and only meaningful inside that screen — a skeleton row or a stat inside its own parent. `taekyar-mark.tsx` is the one deliberate exception: the brand SVG family lives together. Feature code lives under `src/features/<feature>/`; `src/app` only wires routes. Introduce `src/components/shared` or `src/lib` only when code is genuinely shared.
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
- Shared wrappers live in `src/components/shared/`, one component per file: `auth-screen` (shell/header), `auth-brand-header`, `auth-page-title`, `auth-page-lead`, `auth-field`, `auth-input`, `auth-select`, `auth-form-error`, `segmented`, `otp-input`, `stepper`, `step-one-fields`, `belt-picker`, `photo-picker`, `wheel-column`, `date-picker`, `time-picker`. Extend these instead of duplicating markup.
- `AuthInput` centers its value and placeholder. Keep that alignment when adding fields; `AuthSelect` stays start-aligned because its icon and chevron consume the edges.
- shadcn has no stepper primitive; keep the shared semantic `<ol>` implementation in `stepper.tsx` rather than rebuilding step headers per screen.
- Use built-in variants before custom classes — `brand`, `outline`, `cta`, `segmented` already encode the design's CTAs and segmented controls. `className` is for layout; don't restyle component colors or typography through it.
- Two-button bottom CTA rows use `cta-dock cta-row` together. `cta-row` is a grid with `minmax(0, 3fr)` / `minmax(0, 9fr)` columns, so the back/primary split is always 3:9 regardless of label length. Back buttons read «بازگشت»; don't add `flex-1`/`flex-[3]` or extra display classes to these rows.
- Coach form routes are immersive: `CoachTabBar` hides there and `ActionDock` takes its place at the bottom. The route list lives in `src/features/coach/lib/coach-form-routes.ts`; register any new page that uses `FormDock`/`ActionDock`.
- Optional steps use the `optional` prop on `AuthField`, `BeltPicker`, and `PhotoPicker` (renders `(اختیاری)` with no asterisk). The student documents step and coach professional step are fully optional; their CTAs submit without requiring input.
- `PhotoPicker` is always the stacked card layout (camera button above the label); student and coach screens share it. `BeltPicker` strips are inset with `px-3` and use `stretch` so the SVG fills the reduced width.
- Date fields use the shared `DatePicker`: a bottom `Sheet` with three `WheelColumn`s for year, month (Persian names), and day. It clamps the day to the selected month (Esfand 30 in leap years), applies on «تایید», clears on «پاک کردن», and renders the stored `YYYY/MM/DD` in Persian digits. Pass `fromYear`/`toYear`; don't replace it with a typed date input.
- Time fields use the shared `TimePicker`: a bottom `Sheet` with two `WheelColumn`s for hour (۰…۲۳) and minute (۰۰…۵۹), shown 24-hour with Persian digits and stored as Latin `HH:mm`. Never use `<input type="time">`; it renders locale AM/PM in the browser.
- Student belts use one grouped picker (`BeltPicker` `groups`): «رنگی» (سفید…قرمز), «پوم» ۱…۴ and «دان» ۱…۱۰, matching the backend `BeltName` enum. The category switcher keeps only the active group's tiles visible so the signup step never shows all 19 at once. «پوم N» is the two-tone belt — black top, red bottom, N stripes (`BeltStrip` `bottomColor`); «دان N» is solid black with N stripes. Persist ranks on the student model as `poom`/`dan`, render strips/dots through `BeltStrip` and `studentBeltDotStyle`, and keep the shared options in `src/lib/student-belts.ts` (`poom-1`…`poom-4`, `dan-1`…`dan-10`). Coach belts run from «دان ۳» to «دان ۱۰» in a three-column grid, matching the backend `IsCoachBelt` validator. The assignment screen (`/coach/students/[id]/belt`) shows only the next belt from `nextStudentBelt`, not a picker: colors step up, «قرمز» goes to «پوم ۱» at 15 or under and «دان ۱» above, poom and dan ranks step up by one, and «پوم ۴» converts to «دان ۴».
- Gender starts as `MALE` in signup and complete-profile state, matching the design's preselected «مرد».
- Inline field icons track the field's focus state with the ring token (`group-focus-within` on `InputGroup`, `group-focus-visible` on `SelectTrigger`), so the icon and border highlight together.
- Prefer semantic tokens (`bg-primary`, `text-muted-foreground`, `text-ink-body`) over raw palette classes.
- Loading UI is the shadcn `Skeleton` inside the component that reads (see `features/coach/components/clubs/`), never a spinner paragraph. Render it only on the true initial load (`isLoading` from the SWR hook): cached data stays on screen while SWR revalidates, and error and empty stay separate states with a retry action. There are no `loading.tsx` files on purpose: every screen reads data in the browser (tokens live in `localStorage`), so no route suspends and a route-level fallback would never render. Add one when a Server Component actually awaits data.
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

- `src/app/` — App Router. `layout.tsx` (fa/rtl shell, Vazirmatn, metadata), `globals.css` (theme tokens), `page.tsx` (welcome), plus routes `login/` (with `login/clubs/`), `verify/`, `signup/student/`, `signup/coach/`, `signup/mobile/`, `complete-profile/`, `student/`, and `coach/` (including `coach/settings/` and `coach/notifications/`).
- `src/components/ui/` — shadcn components only, generated by the CLI. Put generic composed/wrapper UI in `src/components/shared/`. These folders hold `.tsx` components only.
- `src/features/` — feature code; `src/app` pages only wire routes to it. `features/auth/` holds auth forms (`forms/`), hooks (`hooks/`), components (`components/`), plus `api.ts`, `schemas.ts`, `session.ts`, `pending-signup.ts`. `features/coach/{components,hooks,lib}/` holds coach screens, their SWR hooks and their prototype data/models.
- `src/lib/` — general infrastructure: `api/` (ky client, `cache.ts` for clearing the SWR cache), `utils.ts` (`cn` re-export), `digits.ts` (Persian/Latin digit display helpers), `jalali.ts`, `provinces.ts`, `student-belts.ts`, `theme.ts`. No role-specific or auth-specific code.
- `design/reference/` — the HTML designs being converted; source material, not shipping code.
- `docs/coach-api.md` — the coach backend contract (endpoints, required/optional fields, envelope, enums, gaps). Keep it in sync when a coach screen or backend contract changes; it describes the API phase, not current runtime behavior.
- `public/` — `fonts/` (Vazirmatn) and `images/` (welcome hero).
- `@/*` resolves to `src/*` (see `tsconfig.json` `paths`).
- `README.md` is untouched create-next-app boilerplate and is **wrong** about paths (it says `app/page.tsx`; the real file is `src/app/page.tsx`). Don't treat it as a spec.
