import { CalendarDays, ChevronRight, Landmark } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CoachBand } from "@/features/coach/components/coach-band";
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
  watermark = "کلاس",
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
  watermark?: string;
  chip?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <CoachBand watermark={watermark}>
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="بازگشت"
          className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          <ChevronRight aria-hidden="true" />
        </Button>

        {chip ? <span className="hero-chip border-white/20 bg-white/10 text-white backdrop-blur-sm">{chip}</span> : null}
        {action}
      </div>

      <div className="mt-3 flex items-center gap-3.5">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/15 ring-2 ring-white/25">
          <CalendarDays className="size-7" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[20px] font-extrabold leading-7">{name}</h1>
          <p className="mt-1 truncate text-[11px] font-semibold text-white/65">
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
