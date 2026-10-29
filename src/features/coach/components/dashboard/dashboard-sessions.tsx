"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SESSIONS, sessionIsToday } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardSessions() {
  const [today] = useState(() =>
    SESSIONS.filter((session) => sessionIsToday(session.weekDays)).sort((a, b) => a.start.localeCompare(b.start)),
  );

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
        {today.length > 0 ? (
          today.map((session, index) => (
            <div key={session.id} className={cn("flex items-center gap-3 px-4 py-3", index > 0 && "border-t border-[var(--line-2)]")}>
              <span className="w-14 shrink-0 text-center">
                <b className="block text-sm leading-5 font-extrabold tabular-nums text-ink">{toPersianDigits(session.start)}</b>
                <span className="block text-xs leading-4 tabular-nums text-ink-muted">{toPersianDigits(session.end)}</span>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  {session.name}
                  {session.isActive ? "" : " (غیرفعال)"}
                </span>
                <span className="mt-1 block truncate text-xs text-ink-muted">{session.club}</span>
              </span>

              <span className="flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums text-ink-muted">
                <Users className="size-3.5" aria-hidden="true" />
                {toPersianDigits(String(session.studentIds.length))} هنرجو
              </span>
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-sm font-semibold text-ink-muted">برای امروز کلاسی ثبت نشده است.</p>
        )}
      </Card>
    </section>
  );
}
