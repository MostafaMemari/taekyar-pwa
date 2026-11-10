import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceBars } from "@/features/coach/components/attendance-bars";
import { AttendanceRing } from "@/features/coach/components/attendance-ring";
import { AttendanceStatusText } from "@/features/coach/components/attendance-status-text";
import type { StudentAttendance } from "@/features/coach/lib/attendance-api";
import { attendanceRate, attendanceTotal } from "@/features/coach/lib/attendance-summary";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDay } from "@/lib/jalali";

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
    <Card className="gap-0 p-4">
      <div className="flex items-center gap-4">
        <AttendanceRing percent={attendanceRate(counts)} size={64} />
        <AttendanceBars counts={counts} className="min-w-0 flex-1" />
      </div>

      <p className="mt-3 border-t border-[var(--line-2)] pt-2.5 text-center text-[12px] font-semibold text-ink-subtle">
        مجموع: {toPersianDigits(String(attendanceTotal(counts)))} جلسه، غیبت {toPersianDigits(String(counts.absent))} · غیبت موجه{" "}
        {toPersianDigits(String(counts.excused))}
      </p>

      {records.length > 0 ? (
        <div className="mt-3 border-t border-[var(--line-2)] pt-1">
          {records.slice(0, 4).map((record) => (
            <div key={record.id} className="flex items-center gap-3 border-b border-[var(--line-2)] py-2.5 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold text-ink">{record.classSession.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-subtle">
                  {record.classSession.club.name} · {toJalaliDay(record.sessionDate)}
                </p>
              </div>
              <AttendanceStatusText status={record.status} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          هنوز جلسه ای برای این هنرجو ثبت نشده است
        </p>
      )}

      <Button
        variant="outline"
        className="mt-3 h-11 w-full rounded-xl text-[12px] font-bold"
        render={<Link href={`/coach/students/${studentId}/attendance`} />}
        nativeButton={false}
      >
        گزارش کامل حضور و غیاب
      </Button>
    </Card>
  );
}
