import { CalendarDays, ChevronLeft, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SessionTime } from "@/features/coach/components/session-time";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function ClubClasses({
  clubId,
  sessions,
  memberCounts,
}: {
  clubId: string;
  sessions: ClassSessionRecord[];
  memberCounts?: Record<string, number>;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <section>
      <SectionHeading title="کلاس های باشگاه" action={<StatusBadge>{toPersianDigits(String(sessions.length))} کلاس</StatusBadge>} />

      {sessions.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {sessions.map((session) => (
            <Link key={session.id} href={`/coach/sessions/${session.id}`} className="block transition duration-150 active:scale-[0.995]">
              <Card className="flex-row items-center gap-3 px-3.5 py-3">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    session.isActive ? "bg-brand-50 text-accent-ink" : "bg-muted text-ink-subtle",
                  )}
                >
                  <CalendarDays className="size-5" aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <b className="truncate text-[13px] font-extrabold text-ink">{session.name}</b>
                    {session.isActive ? null : (
                      <StatusBadge className="shrink-0">
                        <Minus aria-hidden="true" />
                        غیرفعال
                      </StatusBadge>
                    )}
                    <span className="ms-auto flex shrink-0 items-center gap-1 text-[12px] font-extrabold tabular-nums text-accent-ink">
                      <Users className="size-3.5" aria-hidden="true" />
                      {memberCounts?.[session.id] === undefined ? (
                        <Skeleton className="h-3 w-7" />
                      ) : (
                        toPersianDigits(String(memberCounts[session.id]))
                      )}
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-x-2 text-[12px] font-semibold text-ink-muted">
                    <span className="truncate">{weekDayLabels(session.weekDays).join(" · ")}</span>
                    <span className="shrink-0 tabular-nums">
                      <SessionTime start={session.startTime} end={session.endTime} />
                    </span>
                  </span>
                </span>

                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Empty className="border-none bg-transparent p-4">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-11 rounded-2xl bg-brand-50 text-accent-ink">
              <CalendarDays aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-[13px] font-extrabold text-ink">هنوز کلاسی ثبت نشده</EmptyTitle>
            <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
              اولین کلاس این باشگاه را بسازید تا حضور و غیاب شروع شود
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" className="rounded-lg" type="button" onClick={() => setSheetOpen(true)}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              کلاس جدید
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <SessionSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} clubId={clubId} />
    </section>
  );
}
