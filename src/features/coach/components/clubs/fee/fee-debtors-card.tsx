"use client";

import { Search } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { LoadMoreSentinel } from "@/features/coach/components/load-more-sentinel";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useClubFee, useFeeDebtors } from "@/features/coach/hooks/use-fee";
import type { FeeDebtorFilters, FeeDebtorStatusFilter, FeeMonth } from "@/features/coach/lib/fee-api";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { FeeMonthSelect } from "./fee-month-select";

const SEARCH_DEBOUNCE_MS = 500;

const STATUS_CHIPS: { label: string; value: FeeDebtorStatusFilter | "" }[] = [
  { label: "همه", value: "" },
  { label: "پرداخت نشده", value: "UNPAID" },
  { label: "ناقص", value: "PARTIAL" },
];

const MEMBERSHIP_CHIPS: { label: string; value: "" | "active" | "inactive" }[] = [
  { label: "همه", value: "" },
  { label: "فعال", value: "active" },
  { label: "غیرفعال", value: "inactive" },
];

const MIN_MONTHS_OPTIONS = [1, 2, 3, 6];

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="field"
      aria-pressed={active}
      onClick={onClick}
      className={cn("h-8 shrink-0 rounded-xl px-2.5 text-[12px] font-bold", active && "border-primary/35 bg-brand-50 text-accent-ink")}
    >
      {label}
    </Button>
  );
}

export function FeeDebtorsCard({
  clubId,
  month,
  onMonthChange,
}: {
  clubId: string;
  month: FeeMonth;
  onMonthChange: (month: FeeMonth) => void;
}) {
  const { data: fee, error: feeError, isLoading: feeLoading, mutate: mutateFee } = useClubFee(clubId);

  const [status, setStatus] = useState<FeeDebtorStatusFilter | "">("");
  const [membership, setMembership] = useState<"" | "active" | "inactive">("");
  const [minMonths, setMinMonths] = useState(1);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // The URL keeps every keystroke; the request waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: FeeDebtorFilters = {
    year: month.year,
    month: month.month,
    ...(status && { status }),
    ...(minMonths > 1 && { minMonthsOwed: minMonths }),
    ...(searchTerm && { search: searchTerm }),
    ...(membership && { membershipStatus: membership }),
  };

  // The backend refuses debtors while no fee is set, so the request waits for the fee to exist.
  const { summary, debtors, hasMore, error, isLoading, isValidating, mutate, setSize } = useFeeDebtors(fee ? clubId : null, filters);

  const hasFilters = Boolean(status || membership || minMonths > 1 || searchTerm);

  return (
    <section>
      <SectionHeading title="گزارش بدهکاران" />
      <Card className="flex flex-col gap-3 p-4">
        {(feeLoading || isLoading) && !summary ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-6 w-full rounded-lg" />
            ))}
          </div>
        ) : feeError ? (
          <ErrorState
            title="خواندن شهریه انجام نشد"
            message={apiErrorMessage(feeError)}
            onRetry={() => {
              void mutateFee();
              void mutate();
            }}
          />
        ) : !fee ? (
          <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
            برای محاسبه بدهکاران، ابتدا مبلغ شهریه را در بخش تنظیم شهریه ثبت کنید
          </p>
        ) : error ? (
          <ErrorState title="خواندن گزارش انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : summary ? (
          <>
            <div className="flex flex-col gap-0">
              {[
                { label: "مبلغ شهریه ماهانه", value: `${formatMoney(summary.monthlyAmount)} تومان` },
                { label: "تعداد بدهکار", value: `${toPersianDigits(String(summary.debtorCount))} نفر` },
                { label: "بدهی کل", value: `${formatMoney(summary.totalDebt)} تومان` },
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

            <div className="border-t border-[var(--line-2)] pt-3">
              <p className="mb-2 text-[12px] font-semibold text-ink-subtle">مشاهده ماه</p>
              <FeeMonthSelect value={month} onChange={onMonthChange} />
            </div>

            <div className="border-t border-[var(--line-2)] pt-3">
              <InputGroup className="h-11 rounded-xl">
                <InputGroupInput
                  type="search"
                  placeholder="جستجوی نام هنرجو..."
                  aria-label="جستجوی هنرجو در بدهکاران"
                  className="text-[13px]"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <Search className="size-4 text-ink-subtle" aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>

              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="shrink-0 text-[11px] font-bold text-ink-subtle">وضعیت</span>
                {STATUS_CHIPS.map((chip) => (
                  <FilterChip key={chip.label} label={chip.label} active={status === chip.value} onClick={() => setStatus(chip.value)} />
                ))}
                <Separator orientation="vertical" className="mx-0.5 h-5" />
                <span className="shrink-0 text-[11px] font-bold text-ink-subtle">عضویت</span>
                {MEMBERSHIP_CHIPS.map((chip) => (
                  <FilterChip
                    key={chip.label}
                    label={chip.label}
                    active={membership === chip.value}
                    onClick={() => setMembership(chip.value)}
                  />
                ))}
                <Separator orientation="vertical" className="mx-0.5 h-5" />
                <span className="shrink-0 text-[11px] font-bold text-ink-subtle">بدهی</span>
                {MIN_MONTHS_OPTIONS.map((months) => (
                  <FilterChip
                    key={months}
                    label={months === 1 ? "همه ماه ها" : `${toPersianDigits(String(months))}+ ماه`}
                    active={minMonths === months}
                    onClick={() => setMinMonths(months)}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </Card>

      {summary && debtors.length > 0 ? (
        <Card className="mt-3 gap-0 px-4 py-1">
          {debtors.map((debtor, index) => (
            <Fragment key={debtor.studentId}>
              {index > 0 ? <Separator /> : null}
              <div className="py-2.5">
                <div className="flex items-center gap-2">
                  <b className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-body">{debtor.fullName}</b>
                  {debtor.membershipActive ? <StatusBadge tone="success">فعال</StatusBadge> : <StatusBadge>غیرفعال</StatusBadge>}
                  <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(debtor.totalDebt)}</b>
                </div>
                <span className="mt-0.5 block text-[12px] font-medium tabular-nums text-ink-subtle">
                  اولین ماه بدهی {toPersianDigits(debtor.firstUnpaidMonth)} · {toPersianDigits(String(debtor.monthsOwed))} ماه
                </span>
              </div>
            </Fragment>
          ))}

          {isValidating && hasMore ? <Skeleton className="h-14 w-full rounded-xl" /> : null}
          <LoadMoreSentinel
            disabled={!hasMore || isValidating || Boolean(error)}
            onLoadMore={() => void setSize((current) => current + 1)}
          />
        </Card>
      ) : summary ? (
        <p className="mt-3 rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
          {hasFilters ? "با این فیلترها هنرجویی پیدا نشد" : "بدهی معوقه ای برای این ماه وجود ندارد"}
        </p>
      ) : null}
    </section>
  );
}
