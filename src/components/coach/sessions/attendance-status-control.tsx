"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ATTENDANCE_META, type AttendanceStatus } from "@/lib/coach/coach-data";
import { cn } from "@/lib/utils";

const STATUS_VALUES: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

const ACTIVE_CLASS: Record<AttendanceStatus, string> = {
  PRESENT: "aria-pressed:bg-success-soft aria-pressed:text-success aria-pressed:hover:bg-success-soft",
  LATE: "aria-pressed:bg-warning-soft aria-pressed:text-warning aria-pressed:hover:bg-warning-soft",
  ABSENT: "aria-pressed:bg-danger-soft aria-pressed:text-danger aria-pressed:hover:bg-danger-soft",
  EXCUSED: "aria-pressed:bg-info-soft aria-pressed:text-info aria-pressed:hover:bg-info-soft",
};

export function AttendanceStatusControl({
  name,
  value,
  onChange,
}: {
  name: string;
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}) {
  return (
    <ToggleGroup
      aria-label={`وضعیت ${name}`}
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0] as AttendanceStatus | undefined;
        if (selected) onChange(selected);
      }}
      spacing={1}
      className="mt-3 flex w-full rounded-xl bg-muted p-1"
    >
      {STATUS_VALUES.map((status) => (
        <ToggleGroupItem
          key={status}
          value={status}
          className={cn("h-9 min-w-0 flex-1 rounded-lg text-[11px] font-extrabold text-ink-muted transition", ACTIVE_CLASS[status])}
        >
          {ATTENDANCE_META[status].label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
