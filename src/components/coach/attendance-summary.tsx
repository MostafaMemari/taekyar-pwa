import { ATTENDANCE_META } from "@/lib/coach/coach-data";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export type AttendanceCounts = {
  present: number;
  late: number;
  absent: number;
  excused?: number;
  total?: number;
};

export function attendanceTotal(counts: AttendanceCounts) {
  return counts.total ?? counts.present + counts.late + counts.absent + (counts.excused ?? 0);
}

export function attendanceRate(counts: AttendanceCounts) {
  const total = attendanceTotal(counts);
  return total > 0 ? Math.round((counts.present / total) * 100) : 0;
}

export function AttendanceRing({
  percent,
  label = "حضور",
  size = 86,
  className,
}: {
  percent: number;
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("relative grid shrink-0 place-items-center rounded-full", className)}
      style={{ width: size, height: size, background: `conic-gradient(var(--primary) ${percent}%, var(--surface-3) 0)` }}
      role="img"
      aria-label={`${label} ${toPersianDigits(String(percent))} درصد`}
    >
      <span className="absolute inset-[7px] rounded-full bg-card" aria-hidden="true" />
      <span className="relative flex flex-col items-center leading-none">
        <b className={cn("font-extrabold tabular-nums text-ink", size >= 80 ? "text-[17px]" : "text-[15px]")}>
          {toPersianDigits(String(percent))}٪
        </b>
        <span className="mt-1 text-[8.5px] font-bold text-ink-subtle">{label}</span>
      </span>
    </div>
  );
}

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
            <span className="w-14 shrink-0 text-[10px] font-bold text-ink-muted">{item.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <span className="block h-full rounded-full" style={{ width: `${width}%`, background: item.color }} />
            </span>
            <b className="w-7 shrink-0 text-end text-[10.5px] font-extrabold tabular-nums text-ink-body">
              {toPersianDigits(String(item.value))}
            </b>
          </div>
        );
      })}
    </div>
  );
}
