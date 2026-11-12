import { Plus, ShieldCheck, ShieldOff, ShieldX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/coach/components/status-badge";
import type { StudentInsuranceSummary } from "@/features/coach/lib/student-api";
import { FEE_META, type StudentFeeStatus, type StudentInsuranceStatus } from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

// Filter chips group statuses: expiring and expired share one chip.
const INSURANCE_FILTER_GROUPS: { label: string; icon: typeof ShieldCheck; tone: string; values: StudentInsuranceStatus[] }[] = [
  { label: "معتبر", icon: ShieldCheck, tone: "text-success", values: ["valid"] },
  { label: "منقضی و نزدیک انقضا", icon: ShieldX, tone: "text-danger", values: ["expired", "expiring"] },
  { label: "بدون بیمه", icon: ShieldOff, tone: "text-ink-muted", values: ["none"] },
];

const FEE_TEXT: Record<StudentFeeStatus, string> = {
  PAID: "text-success",
  OWED: "text-danger",
};

export function StudentsOverview({
  total,
  stats,
  feeCounts,
  active,
  onToggleValues,
  fee,
  onFeeToggle,
  onAdd,
}: {
  total?: number;
  stats?: StudentInsuranceSummary;
  feeCounts?: { paid: number; owed: number };
  active: StudentInsuranceStatus[];
  onToggleValues: (values: StudentInsuranceStatus[]) => void;
  fee?: StudentFeeStatus | null;
  onFeeToggle: (value: StudentFeeStatus) => void;
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
          <Plus data-icon="inline-start" aria-hidden="true" />
          هنرجو جدید
        </Button>
      </header>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] font-bold text-ink-subtle">بیمه ورزشی</span>
          {INSURANCE_FILTER_GROUPS.map((group) => {
            const Icon = group.icon;
            const isActive = group.values.every((value) => active.includes(value));
            const count = group.values.reduce((sum, value) => sum + (stats?.[value] ?? 0), 0);

            return (
              <Button
                key={group.label}
                type="button"
                variant="field"
                aria-pressed={isActive}
                onClick={() => onToggleValues(group.values)}
                className={cn(
                  "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                  isActive && "border-primary/35 bg-brand-50 text-accent-ink",
                )}
              >
                <Icon className={cn("size-3.5", group.tone)} aria-hidden="true" />
                <span>{group.label}</span>
                {stats === undefined ? (
                  <Skeleton className="h-3 w-5" />
                ) : (
                  <b className={cn("leading-none tabular-nums", group.tone)}>{toPersianDigits(String(count))}</b>
                )}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="shrink-0 text-[11px] font-bold text-ink-subtle">شهریه</span>
          {(Object.keys(FEE_META) as StudentFeeStatus[]).map((value) => {
            const meta = FEE_META[value];
            const Icon = meta.icon;
            const isActive = fee === value;
            const count = feeCounts?.[value === "PAID" ? "paid" : "owed"];

            return (
              <Button
                key={value}
                type="button"
                variant="field"
                aria-pressed={isActive}
                onClick={() => onFeeToggle(value)}
                className={cn(
                  "h-9 gap-1.5 rounded-xl px-2.5 text-[12px] font-bold",
                  isActive && "border-primary/35 bg-brand-50 text-accent-ink",
                )}
              >
                <Icon className={cn("size-3.5", FEE_TEXT[value])} aria-hidden="true" />
                <span>{meta.shortLabel}</span>
                {count === undefined ? (
                  <Skeleton className="h-3 w-5" />
                ) : (
                  <b className={cn("leading-none tabular-nums", FEE_TEXT[value])}>{toPersianDigits(String(count))}</b>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
