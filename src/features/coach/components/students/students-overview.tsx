import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { StudentInsuranceSummary } from "@/features/coach/lib/student-api";
import { INSURANCE_META, INSURANCE_STATUSES, type StudentInsuranceStatus } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<StudentInsuranceStatus, string> = {
  valid: "text-success",
  expiring: "text-warning",
  expired: "text-danger",
  none: "text-ink-muted",
};

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
        <h1 className="page-title text-ink">هنرجویان</h1>
        <StatusBadge tone="neutral" className="mt-0.5">
          <Users aria-hidden="true" />
          {total === undefined ? <Skeleton className="h-3 w-5" /> : <b className="tabular-nums">{toPersianDigits(String(total))}</b>}
          <span>هنرجو</span>
        </StatusBadge>
        <Button
          type="button"
          variant="brand"
          size="sm"
          className="ms-auto h-8 gap-1.5 rounded-xl px-3.5 text-[12px] font-bold"
          onClick={onAdd}
        >
          <UserPlus data-icon="inline-start" aria-hidden="true" />
          افزودن
        </Button>
      </header>

      <div className="mt-4 flex flex-wrap gap-1.5">
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
                "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                isActive && "border-primary/35 bg-brand-50 text-accent-ink",
              )}
            >
              <Icon className={cn("size-3.5", TONE_TEXT[value])} aria-hidden="true" />
              <span>{meta.shortLabel}</span>
              {count === undefined ? (
                <Skeleton className="h-3 w-5" />
              ) : (
                <b className={cn("leading-none tabular-nums", TONE_TEXT[value])}>{toPersianDigits(String(count))}</b>
              )}
            </Button>
          );
        })}
      </div>
    </>
  );
}
