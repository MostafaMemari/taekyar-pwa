"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { currentFeeMonth } from "@/features/coach/lib/fee-api";
import { FeePaymentSheet } from "./fee-payment-sheet";

// Payment happens right after a class, so the report page gets a direct entry to the shared sheet.
export function FeePaymentButton({ clubId }: { clubId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" className="h-12 w-full rounded-xl text-[12px] font-semibold" onClick={() => setOpen(true)}>
        <Wallet data-icon="inline-start" aria-hidden="true" />
        ثبت پرداخت شهریه
      </Button>
      <FeePaymentSheet open={open} onOpenChange={setOpen} clubId={clubId} month={currentFeeMonth()} />
    </>
  );
}
