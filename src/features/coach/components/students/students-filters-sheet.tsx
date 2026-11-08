"use client";

import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import {
  AGE_CATEGORY_LABELS,
  type AgeCategoryName,
  beltApiName,
  beltKeyOf,
  INSURANCE_META,
  INSURANCE_STATUSES,
  type StudentBeltApiName,
  type StudentInsuranceStatus,
} from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { beltDotStyle, STUDENT_BELT_GROUPS, type StudentBeltKey } from "@/lib/student-belts";

const BELT_GROUP_HINTS: Record<string, string> = {
  color: "از سفید تا قرمز",
  poom: "مشکی و قرمز، مخصوص زیر ۱۵ سال",
  dan: "کمربند مشکی",
};

// The product's six-division ladder: شکوفه→BLOSSOM, خردسالان→YOUTH, … پیشکسوت (ULTRA) stays out of the filter.
const FILTER_AGE_NAMES: AgeCategoryName[] = ["BLOSSOM", "YOUTH", "CADET", "JUNIOR", "YOUNG", "SENIOR"];

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted">
      {icon}
      {children}
    </h3>
  );
}

export function StudentsFiltersSheet({
  open,
  onOpenChange,
  belts,
  ages,
  insurances,
  ageCategories,
  resultCount,
  onBeltsChange,
  onAgesChange,
  onInsurancesChange,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  belts: StudentBeltApiName[];
  ages: AgeCategoryName[];
  insurances: StudentInsuranceStatus[];
  ageCategories?: AgeCategoryRecord[];
  resultCount?: number;
  onBeltsChange: (value: StudentBeltApiName[]) => void;
  onAgesChange: (value: AgeCategoryName[]) => void;
  onInsurancesChange: (value: StudentInsuranceStatus[]) => void;
  onClear: () => void;
}) {
  const selectedBelts = belts.map(beltKeyOf);

  const activeCount = belts.length + ages.length + insurances.length;

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر هنرجویان"
      description="کمربند، رده سنی و وضعیت بیمه را برای محدود کردن فهرست انتخاب کنید."
    >
      <ScrollArea className="mt-3 max-h-[60vh] [&_[data-slot=scroll-area-scrollbar]]:end-auto! [&_[data-slot=scroll-area-scrollbar]]:start-0! [&_[data-slot=scroll-area-viewport]]:max-h-[60vh]">
        <div className="flex flex-col gap-5 pb-1 pe-2 ps-3">
          <section className="flex flex-col gap-3">
            <SectionTitle icon={<span className="size-3 rounded-full bg-brand-500" aria-hidden="true" />}>کمربند</SectionTitle>

            {STUDENT_BELT_GROUPS.map((beltGroup) => {
              const groupKeys = beltGroup.options.map((option) => option.value);
              const groupSelection = selectedBelts.filter((key) => groupKeys.includes(key));

              return (
                <div key={beltGroup.value} className="flex flex-col gap-1.5">
                  <p className="flex items-baseline gap-1.5 text-[12px] font-bold text-ink">
                    {beltGroup.label}
                    <span className="text-[11px] font-medium text-ink-subtle">· {BELT_GROUP_HINTS[beltGroup.value]}</span>
                  </p>

                  <ToggleGroup
                    multiple
                    value={groupSelection}
                    onValueChange={(next) => {
                      const rest = selectedBelts.filter((key) => !groupKeys.includes(key));
                      onBeltsChange([...rest, ...next].map((value) => beltApiName(value as StudentBeltKey)));
                    }}
                    variant="outline"
                    size="sm"
                    spacing={1.5}
                    className="grid w-full grid-cols-5"
                    aria-label={`فیلتر کمربند ${beltGroup.label}`}
                  >
                    {beltGroup.options.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="h-9 gap-1 rounded-xl px-1 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full ring-1 ring-black/10"
                          style={beltDotStyle(option.value as StudentBeltKey)}
                          aria-hidden="true"
                        />
                        {option.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              );
            })}
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle icon={<span className="size-3 rounded-full bg-info" aria-hidden="true" />}>
              رده سنی
              <span className="text-[11px] font-medium text-ink-subtle">· سال تولد</span>
            </SectionTitle>

            <ToggleGroup
              multiple
              value={ages}
              onValueChange={(next) => onAgesChange(next as AgeCategoryName[])}
              variant="outline"
              size="sm"
              spacing={1.5}
              className="grid w-full grid-cols-3"
              aria-label="فیلتر رده سنی"
            >
              {FILTER_AGE_NAMES.map((name) => {
                const category = ageCategories?.find((category) => category.name === name);
                const range = category
                  ? `${toJalaliDate(category.startDate).split("/")[0].slice(2)} تا ${toJalaliDate(category.endDate).split("/")[0].slice(2)}`
                  : null;

                return (
                  <ToggleGroupItem
                    key={name}
                    value={name}
                    className="h-11 flex-col justify-center gap-0.5 rounded-xl px-1 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                  >
                    <span>{AGE_CATEGORY_LABELS[name]}</span>
                    {range ? <span className="text-[10px] font-medium text-ink-subtle tabular-nums">{range}</span> : null}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle icon={<ShieldCheck className="size-3.5" aria-hidden="true" />}>وضعیت بیمه</SectionTitle>

            <ToggleGroup
              multiple
              value={insurances}
              onValueChange={(next) => onInsurancesChange(next as StudentInsuranceStatus[])}
              variant="outline"
              size="sm"
              spacing={1.5}
              className="grid w-full grid-cols-2"
              aria-label="فیلتر وضعیت بیمه"
            >
              {INSURANCE_STATUSES.map((value) => {
                const meta = INSURANCE_META[value];
                const Icon = meta.icon;

                return (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    className="h-9 justify-start gap-1.5 rounded-xl px-2.5 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {meta.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </section>
        </div>
      </ScrollArea>

      <div className="mt-4 flex items-center gap-2 border-t border-[var(--line-2)] pt-3">
        <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={activeCount === 0} onClick={onClear}>
          پاک کردن
        </Button>
        <Button type="button" variant="brand" className="h-11 flex-1 rounded-xl" onClick={() => onOpenChange(false)}>
          نمایش {toPersianDigits(String(resultCount ?? 0))} هنرجو
        </Button>
      </div>
    </SheetFrame>
  );
}
