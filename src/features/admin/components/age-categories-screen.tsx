"use client";

import { CalendarRange, ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminBand } from "@/features/admin/components/admin-band";
import { AgeCategorySaveSheet } from "@/features/admin/components/age-category-save-sheet";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { useAgeCategories } from "@/features/coach/hooks/use-age-categories";
import type { AgeCategoryRecord } from "@/features/coach/lib/student-api";
import { AGE_CATEGORY_LABELS, type AgeCategoryName } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function AgeCategoriesScreen() {
  const { data: categories, error, isLoading, mutate } = useAgeCategories();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AgeCategoryRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (category: AgeCategoryRecord) => {
    setEditing(category);
    setSheetOpen(true);
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="رده های سنی"
          icon={CalendarRange}
          backHref="/admin"
          chip={
            categories ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(categories.length))} رده
              </span>
            ) : null
          }
        />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5 pb-44", PAGE_ENTER)}>
        {isLoading && !error ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-[62px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="خواندن رده های سنی انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : categories && categories.length === 0 ? (
          <Empty className="min-h-[45dvh] border-none bg-transparent p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="size-14 rounded-2xl bg-brand-50 text-accent-ink">
                <CalendarRange aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-[14px] font-extrabold text-ink">هنوز رده سنی ثبت نشده است</EmptyTitle>
              <EmptyDescription className="text-[12px] leading-5 text-ink-subtle">
                اولین رده سنی را با بازه تاریخ تولد ثبت کنید
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          categories?.map((category) => <AgeCategoryRow key={category.id} category={category} onSelect={openEdit} />)
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
          رده سنی جدید
        </Button>
      </div>

      <AgeCategorySaveSheet open={sheetOpen} onOpenChange={setSheetOpen} category={editing} />
    </main>
  );
}

function AgeCategoryRow({ category, onSelect }: { category: AgeCategoryRecord; onSelect: (category: AgeCategoryRecord) => void }) {
  const label = AGE_CATEGORY_LABELS[category.name as AgeCategoryName] ?? category.name;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="block w-full text-start transition duration-150 active:scale-[0.995]"
    >
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink" aria-hidden="true">
          <CalendarRange className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{label}</b>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-ink-subtle">
            <span>از {toPersianDigits(toJalaliDate(category.startDate))}</span>
            <span aria-hidden="true">·</span>
            <span>تا {toPersianDigits(toJalaliDate(category.endDate))}</span>
          </span>
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
