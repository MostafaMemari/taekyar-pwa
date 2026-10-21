import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeading, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SESSIONS } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  const todaySessions = SESSIONS.filter((session) => session.when.includes("today")).sort((a, b) => a.start.localeCompare(b.start));

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
        {todaySessions.map((session, index) => {
          const attendance = session.attendance;
          const percent = attendance ? Math.round((attendance.present / attendance.total) * 100) : 0;

          return (
            <Link
              key={session.id}
              href="/coach/sessions"
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
                  <StatusBadge tone={session.active ? "success" : "neutral"} className="shrink-0">
                    {session.active ? "فعال" : "غیرفعال"}
                  </StatusBadge>
                </span>
                <span className="mt-1 block truncate text-[10px] font-medium text-ink-subtle">
                  {session.club} · {session.days.join("، ")}
                </span>
                {attendance ? (
                  <span className="mt-2 flex items-center gap-2">
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          percent >= 85 ? "bg-success" : percent >= 70 ? "bg-brand-500" : "bg-warning",
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-[9px] font-bold tabular-nums text-ink-subtle">
                      {toPersianDigits(String(attendance.present))} از {toPersianDigits(String(attendance.total))}
                    </span>
                  </span>
                ) : null}
              </span>

              <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
            </Link>
          );
        })}
      </Card>
    </section>
  );
}
