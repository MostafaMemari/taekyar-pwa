"use client";

import { ChevronLeft, Plus, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminBand } from "@/features/admin/components/admin-band";
import { BeltExamSaveSheet } from "@/features/admin/components/belt-exam-save-sheet";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { useBeltExams } from "@/features/coach/hooks/use-belt-exams";
import type { BeltExamRecord } from "@/features/coach/lib/exam-api";
import { examBeltRangeOf } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

export function BeltExamsScreen() {
  const { data: exams, error, isLoading, mutate } = useBeltExams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BeltExamRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (exam: BeltExamRecord) => {
    setEditing(exam);
    setSheetOpen(true);
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="آزمون های کمربند"
          subtitle="دوره ها، جنسیت و بازه کمربند هر آزمون"
          icon={Trophy}
          backHref="/admin"
          chip={
            exams ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(exams.length))} آزمون
              </span>
            ) : null
          }
        />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5 pb-44", PAGE_ENTER)}>
        {isLoading && !error ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-[68px] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="خواندن آزمون ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : exams && exams.length === 0 ? (
          <p className="py-10 text-center text-[12px] font-medium text-ink-subtle">هنوز آزمونی ثبت نشده است</p>
        ) : (
          exams?.map((exam) => <BeltExamRow key={exam.id} exam={exam} onSelect={openEdit} />)
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
          آزمون جدید
        </Button>
      </div>

      <BeltExamSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} exam={editing} />
    </main>
  );
}

function BeltExamRow({ exam, onSelect }: { exam: BeltExamRecord; onSelect: (exam: BeltExamRecord) => void }) {
  const beltRange = examBeltRangeOf(exam.belts);

  return (
    <button type="button" onClick={() => onSelect(exam)} className="block w-full text-start transition duration-150 active:scale-[0.995]">
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning" aria-hidden="true">
          <Trophy className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{exam.name}</b>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-ink-subtle">
            <span>دوره {toPersianDigits(String(exam.examNumber))}</span>
            <span aria-hidden="true">·</span>
            <span>{toPersianDigits(toJalaliDate(exam.eventDate))}</span>
            {beltRange ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{beltRange}</span>
              </>
            ) : null}
          </span>
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
