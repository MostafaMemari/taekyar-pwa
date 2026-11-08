import { CalendarDays, Landmark } from "lucide-react";
import type { ReactNode } from "react";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { SessionTime } from "@/features/coach/components/session-time";
import type { WeekDay } from "@/features/coach/lib/coach-data";
import { weekDayLabels } from "@/features/coach/lib/coach-data";

export function SessionBand({
  name,
  clubName,
  weekDays,
  start,
  end,
  backHref,
  chip,
  subtitle,
  meta,
  action,
}: {
  name: string;
  clubName: string;
  weekDays: WeekDay[];
  start: string;
  end: string;
  backHref: string;
  chip?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <CoachBand>
      <CoachBandBar
        backHref={backHref}
        chip={chip ? <span className="hero-chip border-white/20 bg-white/10 text-white">{chip}</span> : null}
        action={action}
      />

      <div className="mt-4 flex items-center gap-3.5">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 ring-1 ring-white/20">
          <CalendarDays className="size-7" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="page-title truncate">{name}</h1>
          <p className="mt-1 truncate text-[12px] font-semibold text-white/65">
            {subtitle ?? `${clubName} · ${weekDayLabels(weekDays).join(" و ")}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta ?? (
              <>
                <span className="meta-glass">
                  <Landmark aria-hidden="true" />
                  {clubName}
                </span>
                <span className="meta-glass">{weekDayLabels(weekDays).join(" و ")}</span>
                <span className="meta-glass">
                  <SessionTime start={start} end={end} />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </CoachBand>
  );
}
