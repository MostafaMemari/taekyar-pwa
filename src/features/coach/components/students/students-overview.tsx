import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { StudentInsuranceSummary } from "@/features/coach/lib/student-api";
import { INSURANCE_META, INSURANCE_STATUSES, type StudentInsuranceStatus } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function StudentsOverview({
  total,
  stats,
  active,
  onToggle,
  onAdd,
}: {
  total?: number;
  stats?: StudentInsuranceSummary;
  active: StudentInsuranceStatus[];
  onToggle: (value: StudentInsuranceStatus) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <header className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold text-ink">هنرجویان</h1>
        <StatusBadge tone="neutral" className="mt-0.5">
          <Users aria-hidden="true" />
          {total === undefined ? <Skeleton className="h-3 w-5" /> : <b className="tabular-nums">{toPersianDigits(String(total))}</b>}
          <span>هنرجو</span>
        </StatusBadge>
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="ms-auto h-8 gap-1.5 rounded-xl px-3.5 text-[11px] font-bold has-data-[icon=inline-start]:pl-3.5"
          onClick={onAdd}
        >
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          افزودن
        </Button>
      </header>

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {INSURANCE_STATUSES.map((value) => {
          const meta = INSURANCE_META[value];
          const Icon = meta.icon;
          const isActive = active.includes(value);
          const count = stats?.[value];

          return (
            <Button
              key={value}
              type="button"
              variant="field"
              aria-pressed={isActive}
              onClick={() => onToggle(value)}
              className={cn(
                "h-auto flex-col gap-1 rounded-2xl px-1 py-2 whitespace-nowrap",
                isActive && "border-primary/35 bg-brand-50/60 ring-2 ring-primary/15",
              )}
            >
              <span className={cn("grid size-7 place-items-center rounded-lg", meta.tile)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {count === undefined ? (
                <Skeleton className="h-3.5 w-6" />
              ) : (
                <b className="text-[14px] leading-none font-extrabold tabular-nums text-ink">{toPersianDigits(String(count))}</b>
              )}
              <span className="text-[8.5px] font-bold leading-[11px] text-ink-muted">{meta.shortLabel}</span>
            </Button>
          );
        })}
      </div>
    </>
  );
}
