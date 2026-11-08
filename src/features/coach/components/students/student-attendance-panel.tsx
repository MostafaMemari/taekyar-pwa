import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import { attendanceTotal } from "@/features/coach/lib/attendance-summary";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDay } from "@/lib/jalali";
import { StudentAttendanceRecordCard } from "./student-attendance-record-card";
import { StudentAttendanceSummary } from "./student-attendance-summary";

export function StudentAttendancePanel({ studentId, attendance }: { studentId: string; attendance?: StudentAttendance }) {
  if (!attendance) {
    return (
      <output className="flex flex-col gap-3" aria-busy="true" aria-label="در حال بارگذاری حضور و غیاب">
        <Skeleton className="h-28 w-full rounded-2xl" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-16 w-full rounded-xl" />
        ))}
      </output>
    );
  }

  const { counts, records } = attendance;

  return (
    <div className="flex flex-col gap-3">
      <StudentAttendanceSummary
        counts={counts}
        footer={
          <>
            مجموع: {toPersianDigits(String(attendanceTotal(counts)))} جلسه، غیبت {toPersianDigits(String(counts.absent))} · غیبت موجه{" "}
            {toPersianDigits(String(counts.excused))}
          </>
        }
      />

      {records.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {records.slice(0, 4).map((record) => (
            <StudentAttendanceRecordCard
              key={record.id}
              sessionName={record.classSession.name}
              clubName={record.classSession.club.name}
              date={toJalaliDay(record.sessionDate)}
              status={record.status}
              note={record.note}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          هنوز جلسه ای برای این هنرجو ثبت نشده است.
        </p>
      )}

      <Button
        variant="outline"
        className="h-11 w-full rounded-xl text-[12px] font-semibold"
        render={<Link href={`/coach/students/${studentId}/attendance`} />}
        nativeButton={false}
      >
        گزارش کامل حضور و غیاب
      </Button>
    </div>
  );
}
