import { toPersianDigits } from "@/lib/digits";

export function SessionTime({ start, end, className }: { start: string; end: string; className?: string }) {
  return (
    <span className={className}>
      <span dir="ltr">{toPersianDigits(start)}</span> تا <span dir="ltr">{toPersianDigits(end)}</span>
    </span>
  );
}
