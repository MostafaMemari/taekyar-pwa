import { ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { CoachBand } from "@/components/coach/coach-band";
import { CoachBell } from "@/components/coach/coach-ui";
import { COACH, SESSIONS } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function DashboardHero() {
  const todaySessions = SESSIONS.filter((session) => session.when.includes("today"));
  const present = todaySessions.reduce((sum, session) => sum + (session.attendance?.present ?? 0), 0);
  const total = todaySessions.reduce((sum, session) => sum + (session.attendance?.total ?? 0), 0);
  const percent = total > 0 ? Math.round((present / total) * 100) : 0;
  const firstStart = todaySessions.reduce((earliest, session) => (session.start < earliest ? session.start : earliest), "23:59");

  return (
    <CoachBand>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-extrabold leading-7">سلام، مربی {COACH.name}</h1>
          <p className="mt-1 text-[11px] font-semibold text-white/70">شنبه ۲۴ آبان ۱۴۰۴</p>
        </div>
        <CoachBell />
      </div>

      <Link href="/coach/sessions" className="mt-4 block transition duration-150 active:scale-[0.99]">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-[2px]">
          <span
            role="img"
            aria-label={`${toPersianDigits(String(percent))} درصد حضور امروز`}
            className="grid size-14 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(#ffffff ${percent}%, rgba(255, 255, 255, 0.22) 0)` }}
          >
            <span className="grid size-11 content-center justify-items-center rounded-full bg-brand-700 text-white">
              <b className="text-[13px] font-extrabold leading-none tabular-nums">{toPersianDigits(String(percent))}٪</b>
              <span className="mt-1 text-[8px] font-bold leading-none text-white/70">حضور</span>
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/75">
              <span className="size-1.5 rounded-full bg-white/80" aria-hidden="true" />
              حضور امروز
            </span>
            <b className="mt-1 block text-[14px] font-extrabold leading-5">
              {toPersianDigits(String(present))} از {toPersianDigits(String(total))} هنرجو حاضر
            </b>
            <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/75">
              <Clock className="size-3" aria-hidden="true" />
              {toPersianDigits(String(todaySessions.length))} کلاس امروز · از {toPersianDigits(firstStart)}
            </span>
          </span>

          <ChevronLeft className="size-5 shrink-0 text-white/80" aria-hidden="true" />
        </div>
      </Link>
    </CoachBand>
  );
}
