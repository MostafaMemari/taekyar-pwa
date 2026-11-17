"use client";

import { Award, ChevronLeft, Plus } from "lucide-react";
import { useState } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminBand } from "@/features/admin/components/admin-band";
import { BeltSaveSheet } from "@/features/admin/components/belt-save-sheet";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { useBelts } from "@/features/coach/hooks/use-belts";
import type { BeltRecord } from "@/features/coach/lib/student-api";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { getStudentBeltMeta } from "@/lib/student-belts";
import { cn } from "@/lib/utils";

export function BeltsScreen() {
  const { data: belts, error, isLoading, mutate } = useBelts();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<BeltRecord | null>(null);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (belt: BeltRecord) => {
    setEditing(belt);
    setSheetOpen(true);
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="کمربندها"
          subtitle="رتبه ها، سطح و بازه اعطای هر کمربند"
          icon={Award}
          backHref="/admin"
          chip={
            belts ? (
              <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white tabular-nums">
                {toPersianDigits(String(belts.length))} کمربند
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
          <ErrorState title="خواندن کمربندها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : belts && belts.length === 0 ? (
          <p className="py-10 text-center text-[12px] font-medium text-ink-subtle">هنوز کمربندی ثبت نشده است</p>
        ) : (
          belts?.map((belt) => <BeltRow key={belt.id} belt={belt} onSelect={openEdit} />)
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
          کمربند جدید
        </Button>
      </div>

      <BeltSaveSheet open={sheetOpen} onOpenChange={setSheetOpen} belt={editing} />
    </main>
  );
}

function BeltRow({ belt, onSelect }: { belt: BeltRecord; onSelect: (belt: BeltRecord) => void }) {
  const meta = getStudentBeltMeta(beltKeyOf(belt.name));

  return (
    <button type="button" onClick={() => onSelect(belt)} className="block w-full text-start transition duration-150 active:scale-[0.995]">
      <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
        <span className="w-12 shrink-0">
          <BeltStrip color={meta.color} bottomColor={meta.bottomColor} outline={meta.outline} stripes={meta.stripeCount} />
        </span>

        <span className="min-w-0 flex-1">
          <b className="block truncate text-[13px] font-extrabold text-ink">{meta.label}</b>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold text-ink-subtle">
            <span>سطح {toPersianDigits(String(belt.level))}</span>
            <span aria-hidden="true">·</span>
            <span>{belt.durationMonth ? `${toPersianDigits(String(belt.durationMonth))} ماه` : "بدون بازه"}</span>
          </span>
        </span>

        <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
      </Card>
    </button>
  );
}
