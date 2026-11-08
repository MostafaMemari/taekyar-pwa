import { ATTENDANCE_META, type AttendanceStatus } from "@/features/coach/lib/coach-data";
import { cn } from "@/lib/utils";

export function AttendanceStatusText({ status, className }: { status: AttendanceStatus; className?: string }) {
  const meta = ATTENDANCE_META[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold",
        status === "PRESENT" && "text-success",
        status === "LATE" && "text-warning",
        status === "ABSENT" && "text-danger",
        status === "EXCUSED" && "text-info",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
