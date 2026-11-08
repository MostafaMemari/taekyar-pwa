"use client";

import { CalendarDays, ChevronLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBandBar } from "@/features/coach/components/coach-band-bar";
import { useCoachProfile } from "@/features/coach/hooks/use-coach-profile";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { todayWeekDay, WEEK_DAY_META } from "@/features/coach/lib/coach-data";
import { minutesOfDay, pickNextSession } from "@/features/coach/lib/next-session";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { getStudentBeltMeta } from "@/lib/student-belts";

function untilLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${toPersianDigits(String(rest))} دقیقه`;
  if (rest === 0) return `${toPersianDigits(String(hours))} ساعت`;
  return `${toPersianDigits(String(hours))} ساعت و ${toPersianDigits(String(rest))} دقیقه`;
}

export function DashboardHero() {
  const [now] = useState(() => new Date());
  const { data: profile } = useCoachProfile();
  const { data } = useSessions();

  const next = pickNextSession(data?.sessions ?? [], now);
  const belt = profile?.belt ? getStudentBeltMeta(beltKeyOf(profile.belt)) : null;
  const until = next?.isUpcoming ? minutesOfDay(next.session.startTime) - (now.getHours() * 60 + now.getMinutes()) : null;

  return (
    <CoachBand>
      <CoachBandBar />

      <div className="mt-4 min-w-0">
        <h1 className="page-title truncate">سلام{profile ? `، مربی ${profile.fullName}` : ""}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-white/55">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          {WEEK_DAY_META[todayWeekDay()].label} {toPersianDigits(toJalaliDate(now.toISOString()))}
        </p>
        {belt ? (
          <p className="mt-2.5 flex items-center gap-2 text-[12px] font-medium text-white/55">
            <BeltStrip
              color={belt.color}
              bottomColor={belt.bottomColor}
              outline="rgba(255,255,255,0.32)"
              stripes={belt.stripeCount}
              className="w-14 shrink-0"
            />
            کمربند <b className="font-bold text-white/85">{belt.label}</b>
          </p>
        ) : null}
      </div>

      <Link
        href={next ? `/coach/sessions/${next.session.id}` : "/coach/sessions"}
        className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3.5"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white/10">
          {next ? <Clock className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-bold text-white">{next ? next.session.name : "برنامه هفتگی کلاس ها"}</b>
          <span className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium tabular-nums text-white/55">
            {next ? (
              <>
                <span>{next.isUpcoming ? "کلاس بعدی" : "در حال برگزاری"}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {toPersianDigits(next.session.startTime)} تا {toPersianDigits(next.session.endTime)}
                </span>
              </>
            ) : (
              <span>کلاس بعدی خود را ببینید</span>
            )}
          </span>
        </span>

        {until !== null ? (
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-white/80">
            {untilLabel(until)}
          </span>
        ) : null}
        <ChevronLeft className="size-4 shrink-0 text-white/40" aria-hidden="true" />
      </Link>
    </CoachBand>
  );
}
