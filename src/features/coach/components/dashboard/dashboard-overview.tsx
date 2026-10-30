"use client";

import { CalendarDays, Clock, Send, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { INVITATIONS } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const { data: sessions } = useSessions();
  const { data: studentStats } = useStudentStats();
  const pendingInvitations = INVITATIONS.filter((invitation) => invitation.status === "PENDING").length;

  const stats = [
    { href: "/coach/students", label: "هنرجویان", value: studentStats?.total, icon: Users },
    { href: "/coach/sessions", label: "کلاس های ثبت شده", value: sessions?.total, icon: CalendarDays },
    { href: "/coach/invitations", label: "دعوت در انتظار", value: pendingInvitations, icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button variant="brand" size="cta" render={<Link href="/coach/students/new" />} nativeButton={false}>
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          <span>ثبت هنرجوی جدید</span>
        </Button>
        <Button variant="outline" size="cta" render={<Link href="/coach/students/invite" />} nativeButton={false}>
          <Send data-icon="inline-start" aria-hidden="true" />
          <span>دعوت هنرجو</span>
        </Button>
      </div>

      <Card className="grid grid-cols-3 gap-0 p-0">
        {stats.map((stat, index) => (
          <Link
            key={stat.href}
            href={stat.href}
            className={cn(
              "flex flex-col items-center gap-1 px-1 py-3.5 text-center transition-colors hover:bg-muted/40",
              index > 0 && "border-s border-[var(--line-2)]",
            )}
          >
            <span className="flex items-center gap-1 text-xs font-medium text-ink-muted">
              <stat.icon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{stat.label}</span>
            </span>
            <b className="text-xl leading-6 font-extrabold tabular-nums text-ink">
              {stat.value === undefined ? "—" : toPersianDigits(String(stat.value))}
            </b>
          </Link>
        ))}
      </Card>
    </div>
  );
}
