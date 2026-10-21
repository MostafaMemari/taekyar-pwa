import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Users } from "lucide-react";
import Link from "next/link";
import { AttendanceBars, AttendanceRing, attendanceRate, attendanceTotal } from "@/components/coach/attendance-summary";
import { CoachSheet } from "@/components/coach/coach-band";
import { GymContext, SectionHeading, SessionTime, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { weekDayLabels } from "@/lib/coach/coach-data";
import type { SessionDetail } from "@/lib/coach/session-data";
import { toPersianDigits } from "@/lib/digits";
import { SessionBand } from "./session-band";
import { SessionRoster } from "./session-roster";

export function SessionReport({ detail }: { detail: SessionDetail }) {
  const counts = detail.lastSession.counts;
  const rate = attendanceRate(counts);
  const total = attendanceTotal(counts);
  const notes = detail.roster.filter((entry) => entry.note);
  const reportStudent = detail.roster[0];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <SessionBand
        detail={detail}
        backHref={`/coach/sessions/${detail.id}`}
        watermark="گزارش"
        chip="گزارش جلسه"
        subtitle={`جلسه ${weekDayLabels(detail.weekDays).join(" و ")} — ثبت شده توسط ${detail.lastSession.recordedBy}`}
        meta={
          <>
            <span className="meta-glass">
              <CalendarDays aria-hidden="true" />
              {detail.lastSession.date}
            </span>
            <span className="meta-glass">
              <SessionTime start={detail.start} end={detail.end} />
            </span>
            <span className="meta-glass">
              <Users aria-hidden="true" />
              {toPersianDigits(String(detail.memberCount))} هنرجو
            </span>
          </>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <GymContext name={detail.club} subtitle="گزارش اختصاصی این باشگاه" actionLabel="تغییر باشگاه" />

        <Card className="gap-0 p-4">
          <div className="flex items-center gap-4">
            <AttendanceRing percent={rate} />
            <div className="min-w-0 flex-1">
              <AttendanceBars counts={counts} />
            </div>
          </div>
          <p className="mt-3 border-t border-[var(--line-1)] pt-2.5 text-center text-[10.5px] font-semibold text-ink-subtle">
            ثبت شده توسط {detail.lastSession.recordedBy} · مجموع {toPersianDigits(String(total))} هنرجو
          </p>
        </Card>

        {notes.length > 0 ? (
          <section>
            <SectionHeading title="توضیح های ثبت شده" action={<StatusBadge>{toPersianDigits(String(notes.length))} مورد</StatusBadge>} />
            <SessionRoster entries={notes} showNotes linkStudents />
          </section>
        ) : null}

        <section>
          <SectionHeading
            title="وضعیت هنرجویان"
            action={
              <Link
                href={reportStudent ? `/coach/students/${reportStudent.studentId}/attendance` : "/coach/students"}
                className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-accent-ink"
              >
                گزارش تک هنرجو
                <ChevronLeft className="size-3" aria-hidden="true" />
              </Link>
            }
          />
          <SessionRoster entries={detail.roster} />
          <p className="mt-2 text-center text-[10px] font-bold text-ink-faint">
            نمایش {toPersianDigits(String(detail.roster.length))} از {toPersianDigits(String(detail.memberCount))} هنرجو
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href={`/coach/sessions/${detail.id}`} />}
            nativeButton={false}
          >
            <ChevronRight data-icon="inline-start" aria-hidden="true" />
            بازگشت به کلاس
          </Button>
          <Button
            variant="brand"
            className="h-12 rounded-xl text-[12px] font-extrabold"
            render={<Link href={`/coach/sessions/${detail.id}/attendance`} />}
            nativeButton={false}
          >
            <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
            ثبت جلسه جدید
          </Button>
        </div>
      </CoachSheet>
    </main>
  );
}
