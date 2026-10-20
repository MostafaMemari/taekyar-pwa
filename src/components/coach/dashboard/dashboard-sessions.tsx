import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SESSIONS } from "@/lib/coach/coach-data";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  return (
    <section>
      <SectionHeading
        title="کلاس ها"
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
        {SESSIONS.slice(0, 3).map((session, index) => (
          <Link
            key={session.id}
            href="/coach/sessions"
            className={cn(
              "flex items-center gap-3 p-4 transition-colors hover:bg-muted/40",
              index > 0 && "border-t border-[var(--line-2)]",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
              <session.icon className="size-[18px]" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <b className="truncate text-[13px] font-extrabold text-ink">{session.name}</b>
                <StatusBadge tone={session.active ? "success" : "neutral"} className="shrink-0">
                  {session.active ? "فعال" : "غیرفعال"}
                </StatusBadge>
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] font-medium text-ink-subtle">
                <span className="truncate">{session.club}</span>
                <span aria-hidden="true">•</span>
                <SessionTime start={session.start} end={session.end} />
              </span>
              <span className="mt-1.5 flex flex-wrap gap-1">
                {session.days.map((day) => (
                  <StatusBadge key={day} tone="brand" className="px-1.5 text-[8.5px]">
                    {day}
                  </StatusBadge>
                ))}
              </span>
            </span>
            <ChevronLeft className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          </Link>
        ))}
      </Card>
    </section>
  );
}
