import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

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
