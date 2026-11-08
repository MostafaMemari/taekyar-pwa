"use client";

import { Check, Info, Moon, Sun } from "lucide-react";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { DashboardHero } from "@/features/coach/components/dashboard/dashboard-hero";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { ACCENT_SWATCH, ACCENTS, RADII, type ThemeMode } from "@/lib/theme";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "روشن", icon: Sun },
  { value: "dark", label: "تاریک", icon: Moon },
];

export function AppearanceScreen() {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);
  const radius = useThemeStore((state) => state.radius);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccent = useThemeStore((state) => state.setAccent);
  const setRadius = useThemeStore((state) => state.setRadius);

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="نمایش و رنگ" backHref="/coach/settings" />

      <section className="mt-5">
        <SectionHeading title="پیش نمایش زنده" />
        <div className="pointer-events-none overflow-hidden rounded-2xl border border-[var(--card-line)]" inert aria-hidden="true">
          <DashboardHero />
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading title="حالت نمایش" />
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((option) => {
            const Icon = option.icon;
            const active = mode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(option.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-[12px] font-semibold transition-colors",
                  active ? "border-brand-600 bg-brand-50 text-accent-ink" : "border-[var(--line-2)] bg-card text-ink-muted hover:text-ink",
                )}
              >
                <span className={cn("grid size-9 place-items-center rounded-xl", active ? "bg-brand-100" : "bg-muted")}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex items-center gap-1">
                  {active ? <Check className="size-3.5" aria-hidden="true" /> : null}
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading title="رنگ اصلی" action={<span className="text-[12px] font-bold text-ink-subtle">۵ رنگ</span>} />
        <div className="grid grid-cols-3 gap-3">
          {ACCENTS.map((option) => {
            const active = accent === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setAccent(option.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-[12px] font-semibold transition-colors",
                  active ? "border-brand-600 bg-brand-50 text-accent-ink" : "border-[var(--line-2)] bg-card text-ink-muted hover:text-ink",
                )}
              >
                {active ? (
                  <span className="absolute end-2 top-2 grid size-4 place-items-center rounded-full bg-brand-600 text-white">
                    <Check className="size-2.5" aria-hidden="true" />
                  </span>
                ) : null}
                <span
                  className="size-7 rounded-full ring-2 ring-white/70 ring-offset-1 ring-offset-transparent"
                  style={{ background: ACCENT_SWATCH[option.id] }}
                  aria-hidden="true"
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <SectionHeading title="گردی گوشه ها" action={<span className="text-[12px] font-bold text-ink-subtle">۳ سطح</span>} />
        <div className="grid grid-cols-3 gap-3">
          {RADII.map((option) => {
            const active = radius === option.id;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setRadius(option.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-[12px] font-semibold transition-colors",
                  active ? "border-brand-600 bg-brand-50 text-accent-ink" : "border-[var(--line-2)] bg-card text-ink-muted hover:text-ink",
                )}
              >
                <span
                  className={cn("h-7 w-12 border-2", active ? "border-brand-600 bg-brand-100" : "border-[var(--line-2)] bg-muted")}
                  style={{ borderRadius: `calc(${option.value} * 1.4)` }}
                  aria-hidden="true"
                />
                <span className="flex items-center gap-1">
                  {active ? <Check className="size-3.5" aria-hidden="true" /> : null}
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-7 flex items-start gap-3 rounded-2xl bg-brand-50 p-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-accent-ink">
          <Info className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block text-[13px] font-extrabold text-accent-ink">ذخیره سازی محلی</b>
          <p className="mt-1 text-[12px] leading-5 text-ink-body">
            انتخاب شما روی همین دستگاه نگه داشته می شود و در همه صفحه ها اعمال می شود.
          </p>
        </div>
      </div>
    </main>
  );
}
