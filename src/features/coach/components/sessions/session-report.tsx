import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, Info, Users } from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/shared/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AttendanceBars } from "@/features/coach/components/attendance-bars";
import { AttendanceRing } from "@/features/coach/components/attendance-ring";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { SessionTime } from "@/features/coach/components/session-time";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { ClassAttendanceEntry } from "@/features/coach/lib/attendance-api";
import { type AttendanceCounts, attendanceRate, attendanceTotal } from "@/features/coach/lib/attendance-summary";
import { weekDayLabels } from "@/features/coach/lib/coach-data";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { toPersianDigits } from "@/lib/digits";
import { toGregorianDate, toJalaliDate } from "@/lib/jalali";
import { SessionBand } from "./session-band";
import { SessionRoster } from "./session-roster";

export function SessionReport({
  session,
  date,
  entries,
  onDateChange,
}: {
  session: ClassSessionRecord;
  date: string;
  entries: ClassAttendanceEntry[];
  onDateChange: (date: string) => void;
}) {
  const counts: AttendanceCounts = { present: 0, late: 0, absent: 0, excused: 0, total: 0 };
  for (const entry of entries) {
    const status = entry.attendance?.status;
    if (!status) continue;

    counts.total = (counts.total ?? 0) + 1;
    if (status === "PRESENT") counts.present += 1;
    if (status === "LATE") counts.late += 1;
    if (status === "ABSENT") counts.absent += 1;
    if (status === "EXCUSED") counts.excused = (counts.excused ?? 0) + 1;
  }

  const marked = attendanceTotal(counts);
  const rate = attendanceRate(counts);
  const notes = entries.filter((entry) => entry.attendance?.note);
  const clubName = session.club?.name ?? "باشگاه حذف شده";
  const reportStudent = entries[0];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <SessionBand
        name={session.name}
        clubName={clubName}
        weekDays={session.weekDays}
        start={session.startTime}
        end={session.endTime}
        backHref={`/coach/sessions/${session.id}`}
        chip="گزارش جلسه"
        subtitle={`جلسه ${weekDayLabels(session.weekDays).join(" و ")}`}
        meta={
          <>
            <span className="meta-glass">
              <CalendarDays aria-hidden="true" />
              {toJalaliDate(date)}
            </span>
            <span className="meta-glass">
              <SessionTime start={session.startTime} end={session.endTime} />
            </span>
            <span className="meta-glass">
              <Users aria-hidden="true" />
              {toPersianDigits(String(entries.length))} هنرجو
            </span>
          </>
        }
      />

      <CoachSheet className="flex flex-col gap-4">
        <Card className="gap-0 p-4">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-ink-subtle">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            تاریخ جلسه
          </span>
          <DatePicker
            title="تاریخ جلسه"
            value={toJalaliDate(date)}
            onChange={(jalali) => {
              const iso = toGregorianDate(jalali);
              if (iso) onDateChange(iso);
            }}
          />

          <div className="mt-4 flex items-center gap-4 border-t border-[var(--line-2)] pt-4">
            <AttendanceRing percent={rate} />
            <div className="min-w-0 flex-1">
              <AttendanceBars counts={counts} />
            </div>
          </div>
          <p className="mt-3 border-t border-[var(--line-2)] pt-2.5 text-center text-[12px] font-semibold text-ink-subtle">
            {toPersianDigits(String(marked))} از {toPersianDigits(String(entries.length))} هنرجو برای این تاریخ ثبت شده
          </p>
        </Card>

        {marked === 0 ? (
          <Alert className="rounded-xl border-none bg-info-soft/60 p-3 text-start">
            <Info className="text-info" aria-hidden="true" />
            <AlertDescription className="text-[12px] leading-5 text-ink-muted">
              برای این تاریخ هنوز حضور و غیابی ثبت نشده است.
            </AlertDescription>
            <Button
              variant="brand"
              size="sm"
              className="mt-2 rounded-lg text-[12px] font-semibold"
              render={<Link href={`/coach/sessions/${session.id}/attendance?date=${date}`} />}
              nativeButton={false}
            >
              <ClipboardCheck data-icon="inline-start" aria-hidden="true" />
              ثبت حضور و غیاب
            </Button>
          </Alert>
        ) : null}

        {notes.length > 0 ? (
          <section>
            <SectionHeading title="توضیح های ثبت شده" action={<StatusBadge>{toPersianDigits(String(notes.length))} مورد</StatusBadge>} />
            <SessionRoster
              entries={notes.map((entry) => ({
                studentId: entry.studentId,
                name: entry.student.fullName,
                status: entry.attendance?.status,
                note: entry.attendance?.note ?? undefined,
              }))}
              showNotes
              linkStudents
            />
          </section>
        ) : null}

        <section>
          <SectionHeading
            title="وضعیت هنرجویان"
            action={
              <Link
                href={reportStudent ? `/coach/students/${reportStudent.studentId}/attendance` : "/coach/students"}
                className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-accent-ink"
              >
                گزارش تک هنرجو
                <ChevronLeft className="size-3" aria-hidden="true" />
              </Link>
            }
          />
          <SessionRoster
            entries={entries.map((entry) => ({
              studentId: entry.studentId,
              name: entry.student.fullName,
              status: entry.attendance?.status,
              note: entry.attendance?.note ?? undefined,
            }))}
          />
          <p className="mt-2 text-center text-[12px] font-bold text-ink-subtle">نمایش {toPersianDigits(String(entries.length))} هنرجو</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl text-[12px] font-semibold"
            render={<Link href={`/coach/sessions/${session.id}`} />}
            nativeButton={false}
          >
            <ChevronRight data-icon="inline-start" aria-hidden="true" />
            بازگشت به کلاس
          </Button>
          <Button
            variant="brand"
            className="h-12 rounded-xl text-[12px] font-semibold"
            render={<Link href={`/coach/sessions/${session.id}/attendance`} />}
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
