import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SESSIONS, sessionIsToday, weekDayLabels } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  const todaySessions = SESSIONS.filter((session) => sessionIsToday(session.weekDays)).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <section>
      <SectionHeading
        title="کلاس های امروز"
        action={
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink"
            render={<Link href="/coach/sessions" />}
            nativeButton={false}
          >
            مدیریت کلاس ها
          </Button>
        }
      />
      <Card className="gap-0 p-0">
        {todaySessions.length > 0 ? (
          todaySessions.map((session, index) => (
            <Link
              key={session.id}
              href={`/coach/sessions/${session.id}`}
              className={cn(
                "flex items-center gap-3 p-4 transition-colors hover:bg-muted/40",
                index > 0 && "border-t border-[var(--line-2)]",
              )}
            >
              <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-muted/60 py-2">
                <b className="text-[12px] font-extrabold leading-4 tabular-nums text-ink">{toPersianDigits(session.start)}</b>
                <span className="mt-0.5 text-[8.5px] font-medium leading-3 text-ink-muted">تا {toPersianDigits(session.end)}</span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <b className="truncate text-[13px] font-extrabold text-ink">{session.name}</b>
                  <StatusBadge tone={session.isActive ? "success" : "neutral"} className="shrink-0">
                    {session.isActive ? "فعال" : "غیرفعال"}
                  </StatusBadge>
                </span>
                <span className="mt-1 block truncate text-[10px] font-medium text-ink-subtle">
                  {session.club} · {weekDayLabels(session.weekDays).join("، ")}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[9.5px] font-bold text-ink-subtle">
                  <Users className="size-3" aria-hidden="true" />
                  {toPersianDigits(String(session.studentIds.length))} هنرجو
                </span>
              </span>

              <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          ))
        ) : (
          <p className="p-4 text-center text-[11px] font-semibold text-ink-subtle">برای امروز کلاسی ثبت نشده است.</p>
        )}
      </Card>
    </section>
  );
}
