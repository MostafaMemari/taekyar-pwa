"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { currentFeeMonth, type FeeMonth } from "@/features/coach/lib/fee-api";
import { FeeDebtorsCard } from "./fee-debtors-card";
import { FeeMonthSelect } from "./fee-month-select";
import { FeePaymentsCard } from "./fee-payments-card";
import { FeeSettingsCard } from "./fee-settings-card";

export function ClubFeePanel({ clubId }: { clubId: string }) {
  const [month, setMonth] = useState<FeeMonth>(currentFeeMonth);

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="شهریه باشگاه" backHref={`/coach/clubs/${clubId}`} />
      <CoachSheet className="mt-3 flex flex-col gap-4">
        <FeeSettingsCard clubId={clubId} />
        {/* One slim month picker drives the payments list and the debtor report below it. */}
        <Card className="flex items-center gap-3 p-3">
          <span className="shrink-0 text-[12px] font-semibold text-ink-subtle">مشاهده ماه</span>
          <div className="min-w-0 flex-1">
            <FeeMonthSelect value={month} onChange={setMonth} />
          </div>
        </Card>
        <FeeDebtorsCard clubId={clubId} month={month} />
        <FeePaymentsCard clubId={clubId} month={month} />
      </CoachSheet>
    </main>
  );
}
