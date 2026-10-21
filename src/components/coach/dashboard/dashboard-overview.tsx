import { CalendarDays, Clock, Send, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { INVITATIONS, SESSIONS, STUDENTS } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const todaySessions = SESSIONS.filter((session) => session.when.includes("today")).length;
  const pendingInvitations = INVITATIONS.filter((invitation) => invitation.status === "pending").length;

  const stats = [
    { href: "/coach/students", label: "هنرجو", value: STUDENTS.length, icon: Users },
    { href: "/coach/sessions", label: "کلاس امروز", value: todaySessions, icon: CalendarDays },
    { href: "/coach/invitations", label: "دعوت در انتظار", value: pendingInvitations, icon: Clock },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="cta"
          className="h-auto rounded-2xl py-3 text-[11.5px] font-extrabold"
          render={<Link href="/coach/students/new" />}
          nativeButton={false}
        >
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          <span>ثبت هنرجوی جدید</span>
        </Button>
        <Button
          variant="field"
          size="cta"
          className="h-auto rounded-2xl py-3 text-[11.5px] font-extrabold"
          render={<Link href="/coach/students/invite" />}
          nativeButton={false}
        >
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
              "flex flex-col items-center gap-1 px-2 py-3.5 transition-colors hover:bg-muted/40",
              index > 0 && "border-s border-[var(--line-2)]",
            )}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-ink-subtle">
              <stat.icon className="size-3.5" aria-hidden="true" />
              {stat.label}
            </span>
            <b className="text-[20px] font-extrabold leading-6 tabular-nums text-ink">{toPersianDigits(String(stat.value))}</b>
          </Link>
        ))}
      </Card>
    </>
  );
}
