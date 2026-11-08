import { type AttendanceCounts, attendanceTotal } from "@/features/coach/lib/attendance-summary";
import { ATTENDANCE_META } from "@/features/coach/lib/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function AttendanceBars({ counts, className }: { counts: AttendanceCounts; className?: string }) {
  const total = attendanceTotal(counts);
  const items = [
    { label: "حاضر", value: counts.present, color: ATTENDANCE_META.PRESENT.color },
    { label: "تأخیر", value: counts.late, color: ATTENDANCE_META.LATE.color },
    { label: "غیبت", value: counts.absent, color: ATTENDANCE_META.ABSENT.color },
    ...(counts.excused !== undefined ? [{ label: "غیبت موجه", value: counts.excused, color: ATTENDANCE_META.EXCUSED.color }] : []),
  ];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => {
        const width = total > 0 ? Math.max((item.value / total) * 100, item.value > 0 ? 4 : 0) : 0;

        return (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className="w-14 shrink-0 text-[12px] font-bold text-ink-muted">{item.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <span className="block h-full rounded-full" style={{ width: `${width}%`, background: item.color }} />
            </span>
            <b className="w-7 shrink-0 text-end text-[12px] font-semibold tabular-nums text-ink-body">
              {toPersianDigits(String(item.value))}
            </b>
          </div>
        );
      })}
    </div>
  );
}
