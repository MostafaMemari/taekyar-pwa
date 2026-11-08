"use client";

import { ClipboardCheck, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import { sessionIsToday } from "@/features/coach/lib/coach-data";
import { minutesOfDay } from "@/features/coach/lib/next-session";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  const [now] = useState(() => new Date());
  const { data, error, isLoading, mutate } = useSessions();
  const { data: clubData } = useClubs();
  const today = (data?.sessions ?? [])
    .filter((session) => sessionIsToday(session.weekDays))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const { data: counts } = useSessionStudentCounts(today.map((session) => session.id));
  const clubNames = new Map((clubData?.clubs ?? []).map((club) => [club.id, club.name]));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <section>
      <SectionHeading
        title="کلاس های امروز"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-9 text-[12px] font-semibold text-accent-ink"
            render={<Link href="/coach/sessions" />}
            nativeButton={false}
          >
            برنامه هفتگی
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[0, 1].map((row) => (
              <Skeleton key={row} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            className="p-3"
            title="خواندن کلاس های امروز انجام نشد"
            message={apiErrorMessage(error)}
            onRetry={() => void mutate()}
          />
        ) : today.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] font-medium text-ink-subtle">امروز کلاسی ثبت نشده است.</p>
        ) : (
          <ul>
            {today.map((session, index) => {
              const live = minutesOfDay(session.startTime) <= nowMinutes && nowMinutes < minutesOfDay(session.endTime);
              const count = counts?.[session.id];

              return (
                <li
                  key={session.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    index > 0 && "border-t border-[var(--line-2)]",
                    live && "bg-success-soft/40",
                  )}
                >
                  <span className="flex w-11 shrink-0 flex-col">
                    <b className="text-[13px] leading-5 font-semibold tabular-nums text-ink">{toPersianDigits(session.startTime)}</b>
                    <span className="text-[12px] leading-5 tabular-nums text-ink-subtle">{toPersianDigits(session.endTime)}</span>
                  </span>

                  <Link href={`/coach/sessions/${session.id}`} className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <b className="truncate text-[13px] font-semibold text-ink">{session.name}</b>
                      {live ? (
                        <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-success">
                          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                          در حال برگزاری
                        </span>
                      ) : session.isActive ? null : (
                        <span className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-ink-subtle">
                          <span className="size-1.5 rounded-full bg-ink-faint" aria-hidden="true" />
                          غیرفعال
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 flex items-center gap-3 text-[12px] font-medium text-ink-subtle">
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{clubNames.get(session.clubId) ?? "باشگاه حذف شده"}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 tabular-nums">
                        <Users className="size-3.5 shrink-0" aria-hidden="true" />
                        {count === undefined ? <Skeleton className="h-3 w-4" /> : toPersianDigits(String(count))} هنرجو
                      </span>
                    </span>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`ثبت حضور و غیاب ${session.name}`}
                    className="size-11 shrink-0 rounded-full text-ink-subtle hover:text-accent-ink"
                    render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
                    nativeButton={false}
                  >
                    <ClipboardCheck className="size-[18px]" aria-hidden="true" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
