import type { ReactNode } from "react";
import { AttendanceBars, type AttendanceCounts, AttendanceRing, attendanceRate } from "@/components/coach/attendance-summary";
import { Card } from "@/components/ui/card";

export function StudentAttendanceSummary({ counts, footer }: { counts: AttendanceCounts; footer: ReactNode }) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center gap-4">
        <AttendanceRing percent={attendanceRate(counts)} size={64} />
        <AttendanceBars counts={counts} className="min-w-0 flex-1" />
      </div>
      <p className="mt-3 border-t border-[var(--line-1)] pt-2.5 text-center text-[10.5px] font-semibold text-ink-subtle">{footer}</p>
    </Card>
  );
}
