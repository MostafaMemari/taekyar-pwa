import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AttendanceStatusText } from "@/features/coach/components/attendance-status-text";
import type { AttendanceStatus } from "@/features/coach/lib/coach-data";

export function StudentAttendanceRecordCard({
  sessionName,
  clubName,
  date,
  status,
  note,
  showIcon = false,
}: {
  sessionName: string;
  clubName: string;
  date: string;
  status: AttendanceStatus;
  note?: string | null;
  showIcon?: boolean;
}) {
  return (
    <Card className="flex-row items-center gap-3 p-3">
      {showIcon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-ink-muted">
          <CalendarDays className="size-[18px]" aria-hidden="true" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{sessionName}</p>
        <p className="mt-0.5 truncate text-[12px] text-ink-subtle">
          {clubName} · {date}
        </p>
        {note ? (
          <p className="mt-1 truncate text-[12px] text-ink-subtle">
            <span className="font-bold">یادداشت:</span> {note}
          </p>
        ) : null}
      </div>

      <AttendanceStatusText status={status} />
    </Card>
  );
}
