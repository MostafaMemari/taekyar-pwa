"use client";

import { CalendarPlus, ClipboardCheck, type LucideIcon, UserPlus, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeePaymentSheet } from "@/features/coach/components/clubs/fee/fee-payment-sheet";
import { SessionSaveSheet } from "@/features/coach/components/sessions/session-save-sheet";
import { useClubs } from "@/features/coach/hooks/use-clubs";
import { useInvitations } from "@/features/coach/hooks/use-invitations";
import { useSessions } from "@/features/coach/hooks/use-sessions";
import { useStudentStats } from "@/features/coach/hooks/use-student-stats";
import { activeClubIds, sessionIsToday } from "@/features/coach/lib/coach-data";
import { currentFeeMonth } from "@/features/coach/lib/fee-api";
import { pickNextSession } from "@/features/coach/lib/next-session";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const [now] = useState(() => new Date());
  const [payOpen, setPayOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const { data: sessions } = useSessions();
  const { data: studentStats } = useStudentStats();
  const { data: invitations } = useInvitations();
  const { data: clubs } = useClubs();

  const activeIds = activeClubIds(clubs?.clubs);
  const todaySessions = (sessions?.sessions ?? []).filter(
    (session) => session.isActive && (clubs === undefined || activeIds.has(session.clubId)),
  );
  const next = pickNextSession(todaySessions, now);
  const attendanceHref = next ? `/coach/sessions/${next.session.id}/attendance` : "/coach/sessions";
  const todayCount = todaySessions.filter((session) => sessionIsToday(session.weekDays)).length;
  const pendingInvitations = invitations
    ? invitations.invitations.filter((invitation) => invitation.status === "PENDING").length
    : undefined;

  const actions: Array<{ label: string; icon: LucideIcon; primary?: boolean; href?: string; payment?: true; session?: true }> = [
    { href: attendanceHref, label: "حضور", icon: ClipboardCheck, primary: true },
    { href: "/coach/students/new", label: "هنرجو", icon: UserPlus, primary: false },
    { label: "شهریه", icon: Wallet, payment: true },
    { label: "کلاس", icon: CalendarPlus, primary: false, session: true },
  ];

  const stats = [
    { href: "/coach/students", label: "هنرجو", value: studentStats?.total, loading: !studentStats },
    { href: "/coach/sessions", label: "کلاس امروز", value: sessions ? todayCount : undefined, loading: !sessions },
    { href: "/coach/invitations", label: "دعوت", value: pendingInvitations, loading: !invitations },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-4">
        {actions.map((action) => {
          const tile = (
            <>
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-full",
                  action.primary ? "bg-primary text-primary-foreground" : "bg-muted text-ink-body",
                )}
              >
                <action.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className={cn("text-[12px] font-medium", action.primary ? "text-ink" : "text-ink-muted")}>{action.label}</span>
            </>
          );
          const className = "flex w-full flex-col items-center gap-1.5 rounded-2xl py-2 transition-colors active:bg-muted/60";

          return (
            <li key={action.label}>
              {action.href !== undefined ? (
                <Link href={action.href} className={className}>
                  {tile}
                </Link>
              ) : action.session ? (
                <button type="button" className={cn(className, "cursor-pointer")} onClick={() => setSessionOpen(true)}>
                  {tile}
                </button>
              ) : (
                <button type="button" className={cn(className, "cursor-pointer")} onClick={() => setPayOpen(true)}>
                  {tile}
                </button>
              )}
            </li>
          );
        })}
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
                {stat.loading ? <Skeleton className="h-5 w-10" /> : stat.value === undefined ? "—" : toPersianDigits(String(stat.value))}
              </b>
              <span className="text-[12px] font-medium text-ink-muted">{stat.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      <FeePaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        clubId={clubs?.clubs[0]?.id ?? ""}
        clubs={clubs?.clubs}
        month={currentFeeMonth()}
      />

      <SessionSaveSheet open={sessionOpen} onOpenChange={setSessionOpen} />
    </div>
  );
}
