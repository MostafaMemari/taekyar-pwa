# TaekYar — Design Direction

The visual identity of TaekYar, written down so every screen stays on it. Derived from the built UI and the audit-002 direction (see `anti-slop/audit-002-2026-11-08.md`). Tokens live in `src/app/globals.css`.

## Product

A coach's companion for running a taekwondo club: students, belts, insurance, classes, attendance.

## Character

Disciplined, exact, quietly ceremonial.

## World

The dojang — the training hall: mats, the evening dark of practice hours, the rank ceremony. Surfaces stay neutral (grey ramps in `globals.css`); the world shows in the accent, the dark coach band and the belt motif, not in tinted backgrounds.

## Identity anchors

- **Accent.** One crimson (`--ak-*` ramp / `brand-*`). It marks the primary action, selection and the one number that matters. No second accent.
- **The dark coach band.** The evening-hall moment: a dark band with one corner accent wash (`coach-band` in `globals.css`). It is the single rich surface of the app; everything else stays quiet.
- **The belt motif.** `BeltStrip`, `BeltGlyph`, `BeltWatermark`, `BeltMotif` (in `src/components/shared/taekyar-mark.tsx`) appear only where rank is the subject — belt pickers, belt states, rank lines, the welcome watermark. Nowhere decorative.
- **Type.** Vazirmatn only (`public/fonts`), 400/500 with 700 for emphasis. Heavy weights (extrabold) belong to titles and tile labels; small running text stays 400/500. Persian digits via `toPersianDigits`, Latin digits in the model, `tabular-nums` on figures.
- **Radius.** Three-step preset (`کم/معمولی/گرد`) written to `--radius`; components use the shadcn semantic radii. Nested radius math: inner = outer − padding.
- **Depth.** Light theme: neutral, soft, small shadows. Dark theme: surface steps and hairlines, not shadows. Exactly one brand-colored glow is allowed per screen — today that is the `role-card-hero` welcome card.
- **Copy.** Persian-first, regular spaces (never ZWNJ), no em dashes — «،» «؛» «:» and parentheses instead. No exclamation marks, no hype, placeholders show «ثبت نشده», numbers always compared to a reference when they claim change.

## Dials

- ENERGY 2 — composed, with a confident accent; never loud.
- RHYTHM 1 — one 4px rhythm, equal things equal sizes.
- MOTION 1 — color/surface transitions and one guarded entrance per page; nothing loops except live states, always `motion-safe`.

## Do not

- Do not add gradients between hues, glows beyond the one-per-screen dose, glass-with-glow cards, emoji icons or tracked uppercase labels.
- Do not introduce a second font, a second accent or decorative radials outside the coach band.
- Do not use the belt motif as decoration on unrelated screens.
