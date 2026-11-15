"use client";

import { Award, CalendarRange, Landmark, Loader2, Medal, ShieldCheck, Trophy, Wallet } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AuthSelect } from "@/components/shared/auth-select";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import {
  AGE_CATEGORY_LABELS,
  type AgeCategoryName,
  beltApiName,
  beltKeyOf,
  examBeltRangeOf,
  FEE_META,
  INSURANCE_META,
  INSURANCE_STATUSES,
  STUDENT_FEE_STATUSES,
  type StudentBeltApiName,
  type StudentFeeStatus,
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

type FilterTab = "belt" | "age" | "cover" | "club";

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
  fee,
  exam,
  clubs,
  selectedClubs,
  ageCategories,
  resultCount,
  onBeltsChange,
  onAgesChange,
  onInsurancesChange,
  onFeeChange,
  onExamChange,
  onClubsChange,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  belts: StudentBeltApiName[];
  ages: AgeCategoryName[];
  insurances: StudentInsuranceStatus[];
  fee: StudentFeeStatus | null;
  exam: string;
  clubs: ClubRecord[];
  selectedClubs: string[];
  ageCategories?: AgeCategoryRecord[];
  resultCount?: number;
  onBeltsChange: (value: StudentBeltApiName[]) => void;
  onAgesChange: (value: AgeCategoryName[]) => void;
  onInsurancesChange: (value: StudentInsuranceStatus[]) => void;
  onFeeChange: (value: "" | StudentFeeStatus) => void;
  onExamChange: (value: string) => void;
  onClubsChange: (value: string[]) => void;
  onClear: () => void;
}) {
  const [tab, setTab] = useState<FilterTab>("belt");
  const selectedBelts = belts.map(beltKeyOf);
  const exams = [...(useBeltExams().data ?? [])].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const selectedExam = exam ? exams.find((item) => item.id === exam) : null;
  const examOptions = exams.map((item) => ({
    value: item.id,
    label: [`آزمون دوره ${toPersianDigits(String(item.examNumber))}`, examBeltRangeOf(item.belts)].filter(Boolean).join(" · "),
    description: [`برگزاری ${toJalaliDate(item.eventDate)}`, item.eventPlaces.join("، ")].filter(Boolean).join(" · "),
  }));

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "belt", label: "کمربند", count: belts.length + (exam ? 1 : 0) },
    { id: "age", label: "رده سنی", count: ages.length },
    { id: "cover", label: "بیمه/شهریه", count: insurances.length + (fee ? 1 : 0) },
    { id: "club", label: "باشگاه", count: selectedClubs.length },
  ];

  const activeCount = belts.length + ages.length + insurances.length + selectedClubs.length + (fee ? 1 : 0) + (exam ? 1 : 0);

  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title="فیلتر هنرجویان"
      description="باشگاه، کمربند، رده سنی، بیمه و شهریه را برای محدود کردن فهرست انتخاب کنید"
    >
      <div className="mt-3 flex flex-col gap-4">
        <ToggleGroup
          value={[tab]}
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) setTab(selected as FilterTab);
          }}
          variant="segmented"
          spacing={1}
          className="w-full rounded-full bg-muted p-1"
          aria-label="دسته بندی فیلتر"
        >
          {tabs.map((item) => (
            <ToggleGroupItem
              key={item.id}
              value={item.id}
              className="group h-9 flex-1 gap-1 rounded-full px-1.5 text-[11px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
            >
              {item.label}
              {item.count > 0 ? (
                <span className="rounded-full bg-brand-50 px-1 text-[9px] font-bold text-accent-ink group-aria-pressed:bg-white/90 tabular-nums">
                  {toPersianDigits(String(item.count))}
                </span>
              ) : null}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {tab === "belt" ? (
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-3">
              <SectionTitle icon={<Award className="size-3.5" aria-hidden="true" />}>کمربند</SectionTitle>

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
              <SectionTitle icon={<Trophy className="size-3.5" aria-hidden="true" />}>آزمون کمربند</SectionTitle>

              <AuthSelect
                id="examFilter"
                value={exam || null}
                onValueChange={(value) => onExamChange(value ?? "")}
                placeholder="همه آزمون ها"
                options={examOptions}
                icon={Medal}
                itemGap
              />
              <p className="text-[12px] font-medium leading-5 text-ink-subtle">
                {selectedExam
                  ? [examBeltRangeOf(selectedExam.belts), `برگزاری ${toJalaliDate(selectedExam.eventDate)}`].filter(Boolean).join(" · ")
                  : "با انتخاب آزمون، فقط هنرجوهای واجد شرایط همان دوره نشان داده می شود"}
              </p>
            </section>
          </div>
        ) : tab === "age" ? (
          <section className="flex flex-col gap-2">
            <SectionTitle icon={<CalendarRange className="size-3.5" aria-hidden="true" />}>
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
        ) : tab === "cover" ? (
          <div className="flex flex-col gap-5">
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

            <section className="flex flex-col gap-2">
              <SectionTitle icon={<Wallet className="size-3.5" aria-hidden="true" />}>وضعیت شهریه</SectionTitle>

              <ToggleGroup
                value={[fee ?? ""]}
                onValueChange={(next) => {
                  const selected = next[0] as "" | StudentFeeStatus | undefined;
                  if (selected !== undefined) onFeeChange(selected);
                }}
                variant="outline"
                size="sm"
                spacing={1.5}
                className="grid w-full grid-cols-3"
                aria-label="فیلتر وضعیت شهریه"
              >
                {[{ value: "", label: "همه" }, ...STUDENT_FEE_STATUSES.map((value) => ({ value, label: FEE_META[value].shortLabel }))].map(
                  (option) => (
                    <ToggleGroupItem
                      key={option.value || "all"}
                      value={option.value}
                      className="h-9 rounded-xl text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                    >
                      {option.label}
                    </ToggleGroupItem>
                  ),
                )}
              </ToggleGroup>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <SectionTitle icon={<Landmark className="size-3.5" aria-hidden="true" />}>
              باشگاه
              <span className="text-[11px] font-medium text-ink-subtle">
                {selectedClubs.length > 0
                  ? `· ${toPersianDigits(String(selectedClubs.length))} انتخاب شده`
                  : "· بدون انتخاب یعنی همه باشگاه ها"}
              </span>
            </SectionTitle>

            <ToggleGroup
              multiple
              value={selectedClubs}
              onValueChange={onClubsChange}
              variant="outline"
              size="sm"
              spacing={1.5}
              className="grid w-full grid-cols-2"
              aria-label="فیلتر باشگاه"
            >
              {clubs.map((item) => (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className="h-10 justify-start gap-1.5 rounded-xl px-2.5 text-[12px] font-bold aria-pressed:border-primary/35 aria-pressed:bg-brand-50 aria-pressed:text-accent-ink"
                >
                  <Landmark className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.name}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {clubs.length === 0 ? (
              <p className="text-[12px] font-medium text-ink-subtle">هنوز باشگاهی ثبت نشده است</p>
            ) : (
              <p className="text-[12px] font-medium text-ink-subtle">فقط هنرجوهای عضو فعال این باشگاه ها</p>
            )}
          </div>
        )}
      </div>

      <SheetActions
        className="mt-4"
        secondaryLabel="پاک کردن"
        secondaryDisabled={activeCount === 0}
        onSecondary={() => {
          onClear();
          onOpenChange(false);
        }}
      >
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          onClick={() => onOpenChange(false)}
        >
          {resultCount === undefined ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              نمایش نتایج
            </>
          ) : (
            `نمایش ${toPersianDigits(String(resultCount))} هنرجو`
          )}
        </Button>
      </SheetActions>
    </SheetFrame>
  );
}
