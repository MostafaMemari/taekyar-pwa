import { CalendarDays, ChevronLeft, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { type ClassSession, weekDayLabels } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function ClubClasses({ sessions }: { sessions: ClassSession[] }) {
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
                  <session.icon className="size-5" aria-hidden="true" />
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
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {weekDayLabels(session.weekDays).map((day) => (
                      <StatusBadge key={day}>{day}</StatusBadge>
                    ))}
                    <StatusBadge>
                      <SessionTime start={session.start} end={session.end} />
                    </StatusBadge>
                    <StatusBadge tone="brand">
                      <Users aria-hidden="true" />
                      {toPersianDigits(String(session.studentIds.length))} هنرجو
                    </StatusBadge>
                  </span>
                </span>

                <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
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
            <EmptyDescription className="text-[11.5px] leading-5 text-ink-subtle">
              اولین کلاس این باشگاه را بسازید تا حضور و غیاب شروع شود.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" className="rounded-lg" render={<Link href="/coach/sessions/new" />} nativeButton={false}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              کلاس جدید
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </section>
  );
}
