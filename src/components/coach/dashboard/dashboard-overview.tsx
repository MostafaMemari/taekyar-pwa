import { CalendarDays, Clock, type LucideIcon, Send, TrendingUp, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { INVITATIONS, SESSIONS, STUDENTS } from "@/components/coach/coach-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  value,
  label,
  href,
  accent = false,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  href?: string;
  accent?: boolean;
}) {
  const card = (
    <Card className={cn("flex-row items-center gap-3 rounded-2xl px-3.5 py-3", accent && "bg-accent ring-brand-100")}>
      <span
        className={cn("grid size-9 shrink-0 place-items-center rounded-xl", accent ? "bg-card text-accent-ink" : "bg-muted text-ink-muted")}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <b className="block text-[18px] font-extrabold leading-none tabular-nums text-ink">{value}</b>
        <span className="mt-1.5 block text-[10px] font-bold leading-4 text-ink-subtle">{label}</span>
      </span>
    </Card>
  );

  if (!href) return card;

  return (
    <Link href={href} className="block transition duration-150 active:scale-[0.98]">
      {card}
    </Link>
  );
}

export function DashboardOverview() {
  const todaySessions = SESSIONS.filter((session) => session.when.includes("today")).length;
  const pendingInvitations = INVITATIONS.filter((invitation) => invitation.status === "pending").length;

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

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} value={toPersianDigits(String(STUDENTS.length))} label="هنرجویان" href="/coach/students" />
        <StatCard icon={CalendarDays} value={toPersianDigits(String(todaySessions))} label="کلاس های امروز" href="/coach/sessions" />
        <StatCard
          icon={Clock}
          value={toPersianDigits(String(pendingInvitations))}
          label="دعوت نامه های در انتظار"
          href="/coach/invitations"
          accent
        />
        <StatCard icon={TrendingUp} value={`${toPersianDigits("87")}٪`} label="میانگین حضور هفته" />
      </div>
    </>
  );
}
