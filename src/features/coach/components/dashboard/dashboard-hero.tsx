"use client";

import { CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBell } from "@/features/coach/components/coach-bell";
import { useCoachProfile } from "@/features/coach/hooks/use-coach-profile";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { sessionIsToday, todayWeekDay, WEEK_DAY_META } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";

function minutesOfDay(time: string) {
  const [hours, minutes] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function untilLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${toPersianDigits(String(rest))} دقیقه دیگر`;
  if (rest === 0) return `${toPersianDigits(String(hours))} ساعت دیگر`;
  return `${toPersianDigits(String(hours))} ساعت و ${toPersianDigits(String(rest))} دقیقه دیگر`;
}

export function DashboardHero() {
  const [now] = useState(() => new Date());
  const { data: profile } = useCoachProfile();
  const { data } = useSessions();
  const today = (data?.sessions ?? [])
    .filter((session) => sessionIsToday(session.weekDays))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = today.find((session) => minutesOfDay(session.endTime) > nowMinutes);
  const isUpcoming = next !== undefined && minutesOfDay(next.startTime) > nowMinutes;

  return (
    <CoachBand>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold leading-7">سلام{profile ? `، مربی ${profile.fullName}` : ""}</h1>
          <p className="mt-1 text-xs font-semibold text-white">
            {WEEK_DAY_META[todayWeekDay()].label} {toPersianDigits(toJalaliDate(now.toISOString()))}
          </p>
        </div>
        <CoachBell />
      </div>

      <Link
        href={next ? `/coach/sessions/${next.id}` : "/coach/sessions"}
        className="mt-4 flex items-center gap-3 border-t border-white/20 pt-3.5"
      >
        {next ? (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-white">
                {isUpcoming ? `کلاس بعدی · ${untilLabel(minutesOfDay(next.startTime) - nowMinutes)}` : "کلاس در جریان"}
              </span>
              <span className="mt-1 block truncate text-sm font-extrabold">{next.name}</span>
            </span>
            <span className="shrink-0 text-end">
              <b className="block text-xl leading-6 font-extrabold tabular-nums">{toPersianDigits(next.startTime)}</b>
              <span className="block text-xs tabular-nums text-white">تا {toPersianDigits(next.endTime)}</span>
            </span>
          </>
        ) : (
          <>
            <CalendarDays className="size-5 shrink-0 text-white" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-sm font-bold">
              {today.length > 0 ? "کلاس های امروز پایان یافت" : "برنامه هفتگی کلاس ها"}
            </span>
            <ChevronLeft className="size-4 shrink-0 text-white" aria-hidden="true" />
          </>
        )}
      </Link>
    </CoachBand>
  );
}
