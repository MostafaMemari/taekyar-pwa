"use client";

import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useFeeDebtors } from "@/features/coach/hooks/use-fee";
import type { FeeMonth } from "@/features/coach/lib/fee-api";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { FeeMonthSelect } from "./fee-month-select";

export function FeeDebtorsCard({
  clubId,
  month,
  onMonthChange,
}: {
  clubId: string;
  month: FeeMonth;
  onMonthChange: (month: FeeMonth) => void;
}) {
  const { data, error, isLoading, mutate } = useFeeDebtors(clubId, month.year, month.month);

  return (
    <section>
      <SectionHeading title="گزارش بدهکاران" />
      <Card className="flex flex-col gap-0 p-4">
        {isLoading && !data ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-6 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="خواندن گزارش انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : data ? (
          <>
            <div className="flex flex-col gap-0">
              {[
                { label: "مبلغ شهریه ماهانه", value: `${formatMoney(data.summary.monthlyAmount)} تومان` },
                { label: "تعداد بدهکار", value: `${toPersianDigits(String(data.summary.debtorCount))} نفر` },
                { label: "بدهی کل", value: `${formatMoney(data.summary.totalDebt)} تومان` },
              ].map((row, index) => (
                <Fragment key={row.label}>
                  {index > 0 ? <Separator className="my-2" /> : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-semibold text-ink-subtle">{row.label}</span>
                    <b className="text-[12px] font-extrabold tabular-nums text-ink-body">{row.value}</b>
                  </div>
                </Fragment>
              ))}
            </div>

            <div className="mt-3 border-t border-[var(--line-2)] pt-3">
              <p className="mb-2 text-[12px] font-semibold text-ink-subtle">مشاهده ماه</p>
              <FeeMonthSelect value={month} onChange={onMonthChange} />
            </div>
          </>
        ) : null}
      </Card>

      {data && data.debtors.length > 0 ? (
        <Card className="mt-3 gap-0 px-4 py-1">
          {data.debtors.map((debtor, index) => (
            <Fragment key={debtor.studentId}>
              {index > 0 ? <Separator /> : null}
              <div className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <b className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-body">{debtor.fullName}</b>
                  <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(debtor.totalDebt)}</b>
                </div>
                <span className="mt-0.5 block text-[12px] font-medium tabular-nums text-ink-subtle">
                  اولین ماه بدهی {toPersianDigits(debtor.firstUnpaidMonth)} · {toPersianDigits(String(debtor.monthsOwed))} ماه
                </span>
              </div>
            </Fragment>
          ))}
        </Card>
      ) : data ? (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          بدهی معوقه ای برای این ماه وجود ندارد
        </p>
      ) : null}
    </section>
  );
}
