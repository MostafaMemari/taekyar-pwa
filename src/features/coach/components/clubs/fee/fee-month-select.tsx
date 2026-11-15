"use client";

import { CalendarDays, CalendarRange } from "lucide-react";
import { AuthSelect } from "@/components/shared/auth-select";
import { currentFeeMonth, type FeeMonth } from "@/features/coach/lib/fee-api";
import { toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS } from "@/lib/jalali";

// shortcut: the year window starts at 1400; widen it when an older ledger needs review.
const FIRST_YEAR = 1400;

export function FeeMonthSelect({
  value,
  onChange,
  fromMonth,
  disabledMonths,
}: {
  value: FeeMonth;
  onChange: (month: FeeMonth) => void;
  // Payment picker: restricts the months to fromMonth..12 of value.year and hides the year select.
  fromMonth?: number;
  // Months the student has fully settled; rendered as unselectable with a label.
  disabledMonths?: number[];
}) {
  const lastYear = currentFeeMonth().year + 1;
  const years = Array.from({ length: lastYear - FIRST_YEAR + 1 }, (_, index) => String(FIRST_YEAR + index));

  const months = JALALI_MONTHS.map((label, index) => {
    const month = index + 1;
    if (fromMonth !== undefined && month < fromMonth) return null;
    if (disabledMonths?.includes(month)) return { value: String(month), label: `${label} (تسویه شده)`, disabled: true };
    return { value: String(month), label, disabled: false };
  }).filter((option) => option !== null);

  return (
    <div className={fromMonth !== undefined ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2"}>
      <AuthSelect
        icon={CalendarDays}
        placeholder="ماه"
        value={String(value.month)}
        onValueChange={(month) => {
          if (month !== null) onChange({ ...value, month: Number(month) });
        }}
        options={months}
        placeholderAsOption={false}
      />
      {fromMonth !== undefined ? null : (
        <AuthSelect
          icon={CalendarRange}
          placeholder="سال"
          value={String(value.year)}
          onValueChange={(year) => {
            if (year !== null) onChange({ ...value, year: Number(year) });
          }}
          options={years.map((year) => ({ value: year, label: toPersianDigits(year) }))}
          placeholderAsOption={false}
        />
      )}
    </div>
  );
}
