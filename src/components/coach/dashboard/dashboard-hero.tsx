import { CalendarDays, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { CoachBand } from "@/components/coach/coach-band";
import { CoachBell } from "@/components/coach/coach-ui";
import { COACH, SESSIONS, sessionIsToday } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";

export function DashboardHero() {
  const todaySessions = SESSIONS.filter((session) => sessionIsToday(session.weekDays));
  const studentCount = new Set(todaySessions.flatMap((session) => session.studentIds)).size;
  const firstStart = todaySessions.reduce((earliest, session) => (session.start < earliest ? session.start : earliest), "23:59");

  return (
    <CoachBand>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[21px] font-extrabold leading-7">سلام، مربی {COACH.name}</h1>
          <p className="mt-1 text-[11px] font-semibold text-white/70">برنامه امروز باشگاه های شما</p>
        </div>
        <CoachBell />
      </div>

      <Link href="/coach/sessions" className="mt-4 block transition duration-150 active:scale-[0.99]">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur-[2px]">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/25">
            <CalendarDays className="size-6" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/75">
              <span className="size-1.5 rounded-full bg-white/80" aria-hidden="true" />
              کلاس های امروز
            </span>
            <b className="mt-1 block truncate text-[14px] font-extrabold leading-5">
              {todaySessions.length > 0 ? `${toPersianDigits(String(todaySessions.length))} کلاس امروز` : "کلاسی برای امروز ثبت نشده"}
            </b>
            <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-white/75">
              <Clock className="size-3" aria-hidden="true" />
              {todaySessions.length > 0
                ? `شروع از ${toPersianDigits(firstStart)} · ${toPersianDigits(String(studentCount))} هنرجو`
                : "برنامه هفتگی کلاس ها را بررسی کنید"}
            </span>
          </span>

          <ChevronLeft className="size-5 shrink-0 text-white/80" aria-hidden="true" />
        </div>
      </Link>
    </CoachBand>
  );
}
