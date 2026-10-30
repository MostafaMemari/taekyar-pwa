"use client";

import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import {
  AGE_CATEGORY_LABELS,
  AGE_CATEGORY_NAMES,
  type AgeCategoryName,
  beltApiName,
  beltKeyOf,
  INSURANCE_META,
  INSURANCE_STATUSES,
  type StudentBeltApiName,
  type StudentInsuranceStatus,
} from "@/features/coach/lib/students-options";
import { toPersianDigits } from "@/lib/digits";
import { STUDENT_BELT_GROUPS, type StudentBeltKey } from "@/lib/student-belts";

function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink-muted">
      {icon}
      {children}
    </h3>
  );
}

function beltGroupOf(key?: StudentBeltKey) {
  if (key?.startsWith("poom-")) return "poom";
  if (key?.startsWith("dan-")) return "dan";
  return "color";
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
  const [group, setGroup] = useState(() => beltGroupOf(selectedBelts[0]));

  const activeGroup = STUDENT_BELT_GROUPS.find((item) => item.value === group) ?? STUDENT_BELT_GROUPS[0];
  const groupKeys = activeGroup.options.map((option) => option.value as StudentBeltKey);
  const groupSelection = selectedBelts.filter((key) => groupKeys.includes(key));

  const changeBelts = (next: string[]) => {
    const rest = belts.filter((name) => !groupKeys.includes(beltKeyOf(name)));
    onBeltsChange([...rest, ...next.map((value) => beltApiName(value as StudentBeltKey))]);
  };

  const activeCount = belts.length + ages.length + insurances.length;

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر هنرجویان"
      description="کمربند، رده سنی و وضعیت بیمه را برای محدود کردن فهرست انتخاب کنید."
    >
      <div className="mt-3 flex max-h-[60vh] flex-col gap-5 overflow-y-auto pb-1">
        <section className="flex flex-col gap-2">
          <SectionTitle icon={<span className="size-3 rounded-full bg-brand-500" aria-hidden="true" />}>کمربند</SectionTitle>

          <ToggleGroup
            multiple={false}
            value={[group]}
            onValueChange={(next) => setGroup(next[0] ?? "color")}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="w-full"
            aria-label="گروه کمربند"
          >
            {STUDENT_BELT_GROUPS.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} className="h-8 flex-1 rounded-lg text-[11px] font-bold">
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <ToggleGroup
            multiple
            value={groupSelection}
            onValueChange={changeBelts}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-3"
            aria-label="فیلتر کمربند"
          >
            {activeGroup.options.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className="h-auto flex-col gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
              >
                <BeltStrip
                  color={option.color}
                  bottomColor={option.bottomColor}
                  outline={option.outline}
                  stripes={option.stripes}
                  className="size-auto w-9"
                />
                <span>{option.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle icon={<span className="size-3 rounded-full bg-info" aria-hidden="true" />}>رده سنی</SectionTitle>

          <ToggleGroup
            multiple
            value={ages}
            onValueChange={(next) => onAgesChange(next as AgeCategoryName[])}
            variant="outline"
            size="sm"
            spacing={1.5}
            className="grid w-full grid-cols-2"
            aria-label="فیلتر رده سنی"
          >
            {AGE_CATEGORY_NAMES.map((name) => {
              const category = ageCategories?.find((item) => item.name === name);
              const range =
                category?.birthYearStart != null && category.birthYearEnd != null
                  ? `${toPersianDigits(String(category.birthYearStart))} تا ${toPersianDigits(String(category.birthYearEnd))}`
                  : null;

              return (
                <ToggleGroupItem
                  key={name}
                  value={name}
                  className="h-auto flex-col items-start gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  <span>{AGE_CATEGORY_LABELS[name]}</span>
                  {range ? <span className="text-[9px] font-medium text-ink-subtle">{range}</span> : null}
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
                  className="h-9 justify-start gap-1.5 rounded-xl px-2.5 text-[11px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {meta.label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </section>
      </div>

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
