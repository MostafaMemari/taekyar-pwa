"use client";

import { useState } from "react";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { currentFeeMonth, type FeeMonth } from "@/features/coach/lib/fee-api";
import { FeeDebtorsCard } from "./fee-debtors-card";
import { FeePaymentsCard } from "./fee-payments-card";
import { FeeSettingsCard } from "./fee-settings-card";

export function ClubFeePanel({ clubId }: { clubId: string }) {
  const [month, setMonth] = useState<FeeMonth>(currentFeeMonth);

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="شهریه باشگاه" backHref={`/coach/clubs/${clubId}`} />
      <CoachSheet className="mt-3 flex flex-col gap-4">
        <FeeSettingsCard clubId={clubId} />
        <FeeDebtorsCard clubId={clubId} month={month} onMonthChange={setMonth} />
        <FeePaymentsCard clubId={clubId} month={month} />
      </CoachSheet>
    </main>
  );
}
