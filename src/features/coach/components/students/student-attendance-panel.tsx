import Link from "next/link";
import { Button } from "@/components/ui/button";
import { attendanceTotal } from "@/features/coach/lib/attendance-summary";
import type { StudentProfile } from "@/features/coach/lib/student-profile-data";
import { toPersianDigits } from "@/lib/digits";
import { StudentAttendanceRecordCard } from "./student-attendance-record-card";
import { StudentAttendanceSummary } from "./student-attendance-summary";

export function StudentAttendancePanel({ profile }: { profile: StudentProfile }) {
  const counts = profile.attendance.counts;

  return (
    <div className="flex flex-col gap-3">
      <StudentAttendanceSummary
        counts={counts}
        footer={
          <>
            مجموع: {toPersianDigits(String(attendanceTotal(counts)))} جلسه — غیبت {toPersianDigits(String(counts.absent))} · غیبت موجه{" "}
            {toPersianDigits(String(counts.excused ?? 0))}
          </>
        }
      />

      <div className="flex flex-col gap-2.5">
        {profile.attendance.records.slice(0, 4).map((record) => (
          <StudentAttendanceRecordCard key={record.id} record={record} />
        ))}
      </div>

      <Button
        variant="outline"
        className="h-11 w-full rounded-xl text-[12px] font-extrabold"
        render={<Link href={`/coach/students/${profile.id}/attendance`} />}
        nativeButton={false}
      >
        گزارش کامل حضور و غیاب
      </Button>
    </div>
  );
}
