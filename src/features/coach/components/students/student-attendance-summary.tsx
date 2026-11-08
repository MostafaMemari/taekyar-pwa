import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { AttendanceBars } from "@/features/coach/components/attendance-bars";
import { AttendanceRing } from "@/features/coach/components/attendance-ring";
import type { AttendanceCounts } from "@/features/coach/lib/attendance-summary";
import { attendanceRate } from "@/features/coach/lib/attendance-summary";

export function StudentAttendanceSummary({ counts, footer }: { counts: AttendanceCounts; footer: ReactNode }) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center gap-4">
        <AttendanceRing percent={attendanceRate(counts)} size={64} />
        <AttendanceBars counts={counts} className="min-w-0 flex-1" />
      </div>
      <p className="mt-3 border-t border-[var(--line-2)] pt-2.5 text-center text-[12px] font-semibold text-ink-subtle">{footer}</p>
    </Card>
  );
}
