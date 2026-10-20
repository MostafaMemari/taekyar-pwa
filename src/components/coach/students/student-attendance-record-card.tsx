import { CalendarDays } from "lucide-react";
import { AttendanceStatusText } from "@/components/coach/coach-ui";
import { Card } from "@/components/ui/card";
import type { StudentAttendanceRecord } from "@/lib/coach/student-profile-data";

export function StudentAttendanceRecordCard({ record, showIcon = false }: { record: StudentAttendanceRecord; showIcon?: boolean }) {
  return (
    <Card className="flex-row items-center gap-3 p-3">
      {showIcon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-ink-muted">
          <CalendarDays className="size-[18px]" aria-hidden="true" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{record.className}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink-subtle">
          {record.club} · {record.date}
        </p>
        {record.note ? (
          <p className="mt-1 truncate text-[11px] text-ink-subtle">
            <span className="font-bold">یادداشت:</span> {record.note}
          </p>
        ) : null}
      </div>

      <AttendanceStatusText status={record.status} />
    </Card>
  );
}
