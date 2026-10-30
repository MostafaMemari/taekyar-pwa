"use client";

import { ClipboardCheck, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useSessionStudentCounts, useSessions } from "@/features/coach/hooks/use-sessions";
import { sessionIsToday } from "@/features/coach/lib/coach-data";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  const { data, error, isLoading, mutate } = useSessions();
  const { data: clubData } = useClubs();
  const today = (data?.sessions ?? [])
    .filter((session) => sessionIsToday(session.weekDays))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const { data: counts } = useSessionStudentCounts(today.map((session) => session.id));
  const clubNames = new Map((clubData?.clubs ?? []).map((club) => [club.id, club.name]));

  return (
    <section>
      <SectionHeading
        title="کلاس های امروز"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-9 text-sm font-bold text-accent-ink"
            render={<Link href="/coach/sessions" />}
            nativeButton={false}
          >
            برنامه هفتگی
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-3">
            {[0, 1].map((row) => (
              <Skeleton key={row} className="h-14 w-full rounded-xl" />
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
          <p className="p-4 text-center text-[12px] font-semibold text-ink-subtle">امروز کلاسی ثبت نشده است.</p>
        ) : (
          today.map((session, index) => (
            <div
              key={session.id}
              className={cn("flex items-center gap-2 pe-2 ps-4 py-2.5", index > 0 && "border-t border-[var(--line-2)]")}
            >
              <Link href={`/coach/sessions/${session.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-1">
                <span className="w-12 shrink-0 text-center">
                  <b className="block text-[13px] leading-5 font-extrabold tabular-nums text-ink">{toPersianDigits(session.startTime)}</b>
                  <span className="block text-[11px] leading-4 tabular-nums text-ink-subtle">{toPersianDigits(session.endTime)}</span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-extrabold text-ink">
                    {session.name}
                    {session.isActive ? "" : " (غیرفعال)"}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-ink-subtle">
                    <span className="truncate">{clubNames.get(session.clubId) ?? "باشگاه حذف شده"}</span>
                    <span className="flex shrink-0 items-center gap-1 tabular-nums">
                      <Users className="size-3" aria-hidden="true" />
                      {counts?.[session.id] === undefined ? "—" : toPersianDigits(String(counts[session.id]))}
                    </span>
                  </span>
                </span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`ثبت حضور و غیاب ${session.name}`}
                className="size-11 shrink-0 rounded-xl text-accent-ink"
                render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
                nativeButton={false}
              >
                <ClipboardCheck aria-hidden="true" />
              </Button>
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
