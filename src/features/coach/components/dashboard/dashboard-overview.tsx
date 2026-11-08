"use client";

import { CalendarPlus, ClipboardCheck, Send, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvitations } from "@/features/coach/hooks/use-invitations";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { sessionIsToday } from "@/features/coach/lib/coach-data";
import { pickNextSession } from "@/features/coach/lib/next-session";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const [now] = useState(() => new Date());
  const { data: sessions } = useSessions();
  const { data: studentStats } = useStudentStats();
  const { data: invitations } = useInvitations();

  const next = pickNextSession(sessions?.sessions ?? [], now);
  const attendanceHref = next ? `/coach/sessions/${next.session.id}/attendance` : "/coach/sessions";
  const todayCount = (sessions?.sessions ?? []).filter((session) => sessionIsToday(session.weekDays)).length;
  const pendingInvitations = invitations
    ? invitations.invitations.filter((invitation) => invitation.status === "PENDING").length
    : undefined;

  const actions = [
    { href: attendanceHref, label: "حضور", icon: ClipboardCheck, primary: true },
    { href: "/coach/students/new", label: "هنرجو", icon: UserPlus, primary: false },
    { href: "/coach/students/invite", label: "دعوت", icon: Send, primary: false },
    { href: "/coach/sessions/new", label: "کلاس", icon: CalendarPlus, primary: false },
  ];

  const stats = [
    { href: "/coach/students", label: "هنرجو", value: studentStats?.total, loading: !studentStats },
    { href: "/coach/sessions", label: "کلاس امروز", value: sessions ? todayCount : undefined, loading: !sessions },
    { href: "/coach/invitations", label: "دعوت", value: pendingInvitations, loading: !invitations },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-4 gap-1">
        {actions.map((action) => (
          <li key={action.label}>
            <Link href={action.href} className="flex flex-col items-center gap-1.5 rounded-2xl py-1.5 transition-colors active:bg-muted/60">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full",
                  action.primary ? "bg-primary text-primary-foreground" : "bg-muted text-ink-body",
                )}
              >
                <action.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className={cn("text-[12px] font-medium", action.primary ? "text-ink" : "text-ink-muted")}>{action.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <Card className="gap-0 p-0">
        <div className="grid grid-cols-3">
          {stats.map((stat) => (
            <Link
              key={stat.href}
              href={stat.href}
              className="flex flex-col items-center gap-0.5 border-s border-[var(--line-2)] py-3 first:border-s-0 active:bg-muted/40"
            >
              <b className="text-[20px] leading-7 font-extrabold tabular-nums text-ink">
                {stat.loading ? (
                  <Skeleton className="h-5 w-10" />
                ) : stat.value === undefined ? (
                  "ثبت نشده"
                ) : (
                  toPersianDigits(String(stat.value))
                )}
              </b>
              <span className="text-[12px] font-medium text-ink-muted">{stat.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
