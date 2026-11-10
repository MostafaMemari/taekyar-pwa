"use client";

import { CalendarDays, CalendarRange } from "lucide-react";
import { AuthSelect } from "@/components/shared/auth-select";
import { currentFeeMonth, type FeeMonth } from "@/features/coach/lib/fee-api";
import { toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS } from "@/lib/jalali";

// shortcut: the year window starts at 1400; widen it when an older ledger needs review.
const FIRST_YEAR = 1400;

export function FeeMonthSelect({ value, onChange }: { value: FeeMonth; onChange: (month: FeeMonth) => void }) {
  const lastYear = currentFeeMonth().year + 1;
  const years = Array.from({ length: lastYear - FIRST_YEAR + 1 }, (_, index) => String(FIRST_YEAR + index));

  return (
    <div className="grid grid-cols-2 gap-2">
      <AuthSelect
        icon={CalendarDays}
        placeholder="ماه"
        value={String(value.month)}
        onValueChange={(month) => onChange({ ...value, month: Number(month) })}
        options={JALALI_MONTHS.map((label, index) => ({ value: String(index + 1), label }))}
      />
      <AuthSelect
        icon={CalendarRange}
        placeholder="سال"
        value={String(value.year)}
        onValueChange={(year) => onChange({ ...value, year: Number(year) })}
        options={years.map((year) => ({ value: year, label: toPersianDigits(year) }))}
      />
    </div>
  );
}
