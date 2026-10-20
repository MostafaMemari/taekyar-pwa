import {
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  type LucideIcon,
  MessageSquareText,
  Send,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CoachBand, CoachSheet } from "@/components/coach/coach-band";
import { BELT_EXAMS, COACH, INVITATIONS, SESSIONS, STUDENTS, WEEKLY_ATTENDANCE, WEEKLY_TOTAL } from "@/components/coach/coach-data";
import { CoachBell, GymContext, PersonAvatar, SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export const metadata = { title: "داشبورد مربی" };

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

export default function CoachDashboardPage() {
  const todaySessions = SESSIONS.filter((session) => session.when.includes("today")).length;

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachBand>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[21px] font-extrabold leading-7">سلام، مربی {COACH.name}</h1>
            <p className="mt-1 text-[11px] font-semibold text-white/55">شنبه ۲۴ آبان ۱۴۰۴</p>
          </div>
          <CoachBell />
        </div>

        <Link href="/coach/sessions" className="mt-3.5 block transition duration-150 active:scale-[0.99]">
          <Card className="flex-row items-center gap-3 rounded-2xl bg-card px-3.5 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-xl">
              <ClipboardCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[14px] font-extrabold text-ink">ثبت حضور و غیاب</b>
              <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">لیست امروز را علامت بزنید</span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-accent-ink" aria-hidden="true" />
          </Card>
        </Link>
      </CoachBand>

      <CoachSheet className="flex flex-col gap-6">
        <GymContext className="mt-1" />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="cta"
            className="h-auto rounded-2xl py-3 text-[11.5px] font-extrabold"
            render={<Link href="/coach/students" />}
            nativeButton={false}
          >
            <UserPlus data-icon="inline-start" aria-hidden="true" />
            <span>ثبت هنرجوی جدید</span>
          </Button>
          <Button
            variant="field"
            size="cta"
            className="h-auto rounded-2xl py-3 text-[11.5px] font-extrabold"
            render={<Link href="/coach/students" />}
            nativeButton={false}
          >
            <Send data-icon="inline-start" aria-hidden="true" />
            <span>دعوت هنرجو</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} value={toPersianDigits(String(STUDENTS.length))} label="هنرجویان" href="/coach/students" />
          <StatCard icon={CalendarDays} value={toPersianDigits(String(todaySessions))} label="کلاس های امروز" href="/coach/sessions" />
          <StatCard icon={Clock} value={toPersianDigits(String(INVITATIONS.length))} label="دعوت نامه های در انتظار" accent />
          <StatCard icon={TrendingUp} value={`${toPersianDigits("87")}٪`} label="میانگین حضور هفته" />
        </div>

        <section>
          <SectionHeading title="حضور این هفته" action={<StatusBadge tone="neutral">میانگین ۸۷٪</StatusBadge>} className="mb-2" />
          <Card className="gap-0 p-4">
            <div role="img" aria-label="نمودار حضور هنرجویان از شنبه تا جمعه، میانگین ۸۷ درصد" className="relative h-[122px]">
              <div className="pointer-events-none absolute inset-x-1 top-0 h-[96px]">
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
                <div className="absolute inset-x-0 bottom-0 border-t border-border" />
              </div>

              <div className="absolute inset-x-1 top-0 flex h-[96px] items-end gap-2">
                {WEEKLY_ATTENDANCE.map((item, index) => (
                  <div key={item.day} className="relative flex h-full flex-1 items-end justify-center">
                    <div
                      className={cn(
                        "w-[22px] rounded-lg",
                        index === 0 ? "bg-gradient-to-t from-brand-600 to-brand-500" : "bg-brand-600/20",
                      )}
                      style={{ height: `${item.value}%` }}
                      title={`${item.day}: ${toPersianDigits(String(item.value))} درصد`}
                    />
                    {index === 0 || index === 5 ? (
                      <span
                        className={cn("absolute text-[9px] font-extrabold", index === 0 ? "text-accent-ink" : "text-ink-subtle")}
                        style={{ bottom: `calc(${item.value}% + 4px)` }}
                      >
                        {toPersianDigits(String(item.value))}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-1 bottom-0 flex gap-2">
                {WEEKLY_ATTENDANCE.map((item) => (
                  <span key={item.day} className="flex-1 text-center text-[9.5px] font-bold text-ink-subtle">
                    {item.day}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-[var(--line-2)] pt-2.5">
              <span className="text-[10px] font-bold text-ink-subtle">
                {toPersianDigits(`${WEEKLY_TOTAL.present} حضور ثبت شده از ${WEEKLY_TOTAL.total} رکورد`)}
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-extrabold text-accent-ink">
                گزارش کامل
              </Button>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading title="ابزارهای مربی" />
          <div className="grid grid-cols-2 gap-3">
            <Card className="items-start gap-2.5 rounded-2xl p-3.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-accent-ink">
                <MessageSquareText className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <b className="block text-[12.5px] font-extrabold text-ink">گفتگو با هنرجویان</b>
                <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">۳ پیام خوانده نشده</span>
              </span>
            </Card>
            <Card className="items-start gap-2.5 rounded-2xl p-3.5">
              <span className="grid size-9 place-items-center rounded-xl bg-muted text-ink-subtle">
                <TrendingUp className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <b className="block text-[12.5px] font-extrabold text-ink">تحلیل کلاس ها</b>
                <span className="mt-0.5 block text-[10.5px] font-semibold text-ink-subtle">به زودی</span>
              </span>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading
            title="دعوت نامه های در انتظار"
            action={
              <Button variant="link" size="sm" className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink">
                مشاهده همه
              </Button>
            }
          />
          <Card className="gap-0 p-0">
            {INVITATIONS.map((invitation, index) => (
              <div key={invitation.id} className={cn("flex items-center gap-3 p-4", index > 0 && "border-t border-[var(--line-2)]")}>
                <PersonAvatar name={invitation.name} className="size-9" fallbackClassName="text-[12px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-extrabold text-ink">{invitation.name}</p>
                  <p className="mt-1 text-[10.5px] font-medium text-ink-subtle">ارسال: {toPersianDigits(invitation.sentAt)}</p>
                </div>
                <StatusBadge tone="warning" className="shrink-0">
                  در انتظار پاسخ
                </StatusBadge>
              </div>
            ))}
          </Card>
        </section>

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

        <section>
          <SectionHeading
            title="آزمون های پیش رو"
            action={
              <Button variant="link" size="sm" className="h-auto p-0 text-[10.5px] font-extrabold text-accent-ink">
                همه
              </Button>
            }
          />
          <div className="grid gap-3">
            {BELT_EXAMS.map((exam) => (
              <Card key={exam.id} className="flex-row items-center gap-3 rounded-2xl p-3.5">
                <span className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-brand-50 py-2 text-accent-ink">
                  <b className="text-[18px] font-extrabold leading-none tabular-nums">{toPersianDigits(exam.day)}</b>
                  <span className="mt-1 text-[9.5px] font-bold">{exam.month}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge tone="brand">{exam.course}</StatusBadge>
                    <StatusBadge tone={exam.status === "open" ? "success" : "neutral"}>
                      {exam.status === "open" ? "در حال ثبت نام" : "به زودی"}
                    </StatusBadge>
                  </span>
                  <b className="mt-1.5 block truncate text-[12.5px] font-extrabold text-ink">{exam.title}</b>
                  <span className="mt-1 block text-[10px] font-medium text-ink-subtle">{toPersianDigits(exam.deadline)}</span>
                </span>
              </Card>
            ))}
          </div>
        </section>
      </CoachSheet>
    </main>
  );
}
