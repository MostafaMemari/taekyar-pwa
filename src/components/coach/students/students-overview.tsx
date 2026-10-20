import { UserPlus, Users } from "lucide-react";
import { GymContext, StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import type { InsuranceStatus } from "@/lib/coach/coach-data";
import { INSURANCE_FILTERS, INSURANCE_ICONS, INSURANCE_TILE_TONES } from "@/lib/coach/students-options";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function StudentsOverview({
  count,
  insurance,
  onInsuranceChange,
  onAdd,
}: {
  count: number;
  insurance: InsuranceStatus | null;
  onInsuranceChange: (value: InsuranceStatus | null) => void;
  onAdd: () => void;
}) {
  return (
    <>
      <header className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold text-ink">هنرجویان</h1>
        <StatusBadge tone="neutral" className="mt-0.5">
          <Users aria-hidden="true" />
          <b className="tabular-nums">{toPersianDigits(String(count))}</b>
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        {INSURANCE_FILTERS.map((option) => {
          const Icon = INSURANCE_ICONS[option.value];
          const active = insurance === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="field"
              aria-pressed={active}
              onClick={() => onInsuranceChange(active ? null : option.value)}
              className={cn(
                "h-auto flex-col gap-1.5 rounded-2xl px-2 py-2.5 whitespace-normal",
                active && "border-primary/35 bg-brand-50/60 ring-2 ring-primary/15",
              )}
            >
              <span className={cn("grid size-8 place-items-center rounded-xl", INSURANCE_TILE_TONES[option.value])}>
                <Icon aria-hidden="true" />
              </span>
              <b className="text-[15px] leading-none font-extrabold tabular-nums text-ink">{toPersianDigits(String(option.count))}</b>
              <span className="text-[9px] leading-none font-bold text-ink-muted">{option.label}</span>
            </Button>
          );
        })}
      </div>

      <GymContext className="mt-3" subtitle="لیست هنرجویان این باشگاه" actionLabel="تغییر باشگاه" />
    </>
  );
}
