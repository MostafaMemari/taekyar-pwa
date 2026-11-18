"use client";

import { CalendarRange, ChevronDown, ChevronLeft, Plus, Scale } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminBand } from "@/features/admin/components/admin-band";
import { WeightClassSaveSheet } from "@/features/admin/components/weight-class-save-sheet";
import { useWeightClasses } from "@/features/admin/hooks/use-weight-classes";
import type { WeightClassRecord } from "@/features/admin/lib/admin-api";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import type { Gender } from "@/features/coach/lib/coach-data";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import { AGE_CATEGORY_LABELS, AGE_CATEGORY_NAMES, type AgeCategoryName } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

const GENDER_LABELS: Record<Gender, string> = { MALE: "آقایان", FEMALE: "بانوان" };

// Groups follow the canonical youngest-first age-category order (the API list is oldest-first),
// then men before women, then the stored order.
function sortWeightClasses(classes: WeightClassRecord[], categories: AgeCategoryRecord[]) {
  const categoryNameOf = new Map(categories.map((category) => [category.id, category.name as AgeCategoryName]));
  const rankOf = (id: string) => {
    const name = categoryNameOf.get(id);
    const index = name ? AGE_CATEGORY_NAMES.indexOf(name) : -1;
    return index === -1 ? 99 : index;
  };

  return [...classes].sort((a, b) => {
    const rankA = rankOf(a.ageCategoryId);
    const rankB = rankOf(b.ageCategoryId);
    if (rankA !== rankB) return rankA - rankB;
    if (a.gender !== b.gender) return a.gender === "MALE" ? -1 : 1;
    return a.order - b.order;
  });
}

function weightRangeOf(entry: WeightClassRecord) {
  const min = toPersianDigits(entry.minWeightKg);
  if (!entry.maxWeightKg) return `${min} کیلوگرم به بالا`;
  return `${min} تا ${toPersianDigits(entry.maxWeightKg)} کیلوگرم`;
}

type GenderFilter = "MALE" | "FEMALE";

const GENDER_FILTERS: { value: GenderFilter; label: string }[] = [
  { value: "MALE", label: "آقایان" },
  { value: "FEMALE", label: "بانوان" },
];

export function WeightClassesScreen() {
  const { data, error, isLoading, mutate } = useWeightClasses();
  const { data: categories } = useAgeCategories();
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("MALE");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<WeightClassRecord | null>(null);

  const weightClasses = sortWeightClasses(data?.weightClasses ?? [], categories ?? []).filter((entry) => entry.gender === genderFilter);
  const categoryNameOf = (id: string) => {
    const category = (categories ?? []).find((entry) => entry.id === id);
    return category ? (AGE_CATEGORY_LABELS[category.name as AgeCategoryName] ?? category.name) : "رده سنی";
  };

  // Adjacent rows share an age category, so the flat list collapses into labelled sections.
  const groups: { categoryId: string; label: string; entries: WeightClassRecord[] }[] = [];
  for (const entry of weightClasses) {
    const last = groups[groups.length - 1];
    if (last && last.categoryId === entry.ageCategoryId) last.entries.push(entry);
    else groups.push({ categoryId: entry.ageCategoryId, label: categoryNameOf(entry.ageCategoryId), entries: [entry] });
  }

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (entry: WeightClassRecord) => {
    setEditing(entry);
    setSheetOpen(true);
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="رده های وزنی"
          icon={Scale}
          backHref="/admin"
          chip={
            data ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(weightClasses.length))} رده
              </span>
            ) : null
          }
        />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5 pb-44", PAGE_ENTER)}>
        <ToggleGroup
          aria-label="فیلتر جنسیت"
          value={[genderFilter]}
          onValueChange={(next) => {
            const selected = next[0];
            if (selected) {
              setGenderFilter(selected as GenderFilter);
              setExpandedCategoryId(null);
            }
          }}
          variant="segmented"
          spacing={1}
          className="w-full rounded-full bg-muted p-1"
        >
          {GENDER_FILTERS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="h-9 flex-1 rounded-full text-[12px] font-bold aria-pressed:bg-brand-600 aria-pressed:text-white"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {isLoading && !error ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-[62px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="خواندن رده های وزنی انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : weightClasses.length === 0 ? (
          <p className="py-10 text-center text-[12px] font-medium text-ink-subtle">برای این جنسیت رده وزنی ثبت نشده است</p>
        ) : (
          groups.map((group) => {
            const expanded = expandedCategoryId === group.categoryId;

            return (
              <section key={group.categoryId} className="flex flex-col gap-2">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedCategoryId(expanded ? null : group.categoryId)}
                  className="block w-full text-start transition duration-150 active:scale-[0.995]"
                >
                  <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink" aria-hidden="true">
                      <CalendarRange className="size-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[13px] font-extrabold text-ink">{group.label}</b>
                      <span className="mt-0.5 block text-[12px] font-semibold text-ink-subtle">
                        {toPersianDigits(String(group.entries.length))} رده وزنی
                      </span>
                    </span>

                    {expanded ? (
                      <ChevronDown className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    ) : (
                      <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    )}
                  </Card>
                </button>

                {expanded ? (
                  <div className="flex flex-col gap-2">
                    {group.entries.map((entry) => (
                      <WeightClassRow key={entry.id} entry={entry} onSelect={openEdit} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <Button
          type="button"
          variant="brand"
          aria-haspopup="dialog"
          className="pointer-events-auto h-12 gap-2 rounded-full px-5 text-[13px] font-bold active:scale-95"
          onClick={openCreate}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          رده وزنی جدید
        </Button>
      </div>

      <WeightClassSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} weightClass={editing} />
    </main>
  );
}

function WeightClassRow({ entry, onSelect }: { entry: WeightClassRecord; onSelect: (entry: WeightClassRecord) => void }) {
  return (
    <button type="button" onClick={() => onSelect(entry)} className="block w-full text-start transition duration-150 active:scale-[0.995]">
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-info-soft text-info" aria-hidden="true">
          <Scale className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{toPersianDigits(entry.label)}</b>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-ink-subtle">
            <span>{GENDER_LABELS[entry.gender]}</span>
            <span aria-hidden="true">·</span>
            <span>{weightRangeOf(entry)}</span>
          </span>
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
