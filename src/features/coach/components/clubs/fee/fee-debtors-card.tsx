"use client";

import { Banknote, ListFilter, Search } from "lucide-react";
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
import { useClub } from "@/features/coach/hooks/use-clubs";
import { useClubFee, useFeeDebtors } from "@/features/coach/hooks/use-fee";
import {
  currentFeeMonth,
  type FeeDebtorFilters,
  type FeeDebtorStatusFilter,
  type FeeDebtors,
  type FeeMonth,
  feeMonthLabel,
} from "@/features/coach/lib/fee-api";
import { apiErrorMessage } from "@/lib/api/client";
import { formatMoney, toPersianDigits } from "@/lib/digits";
import { FeeDebtorsFiltersSheet } from "./fee-debtors-filters-sheet";
import { FeePaymentSheet } from "./fee-payment-sheet";

const SEARCH_DEBOUNCE_MS = 500;

type DebtorRow = FeeDebtors["debtors"][number];

// The debtor's first owed month presets the payment sheet; the backend formats it as "1405/08".
function owedMonthOf(debtor: DebtorRow): FeeMonth {
  const [year, month] = debtor.firstUnpaidMonth.split("/");
  return { year: Number(year), month: Number(month) };
}

function DebtorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2">
      <span className="block text-[11px] font-semibold text-ink-subtle">{label}</span>
      <b className="mt-0.5 block text-[12px] font-extrabold tabular-nums text-ink-body">{value}</b>
    </div>
  );
}

export function FeeDebtorsCard({ clubId, month }: { clubId: string; month: FeeMonth }) {
  const { data: fee, error: feeError, isLoading: feeLoading, mutate: mutateFee } = useClubFee(clubId);
  const { data: club } = useClub(clubId);

  const [status, setStatus] = useState("ALL");
  const [membership, setMembership] = useState("ALL");
  const [minMonths, setMinMonths] = useState("1");
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<DebtorRow | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  // The URL keeps every keystroke; the request waits for a pause so the list does not refetch per character.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: FeeDebtorFilters = {
    year: month.year,
    month: month.month,
    ...(status !== "ALL" && { status: status as FeeDebtorStatusFilter }),
    ...(minMonths !== "1" && { minMonthsOwed: Number(minMonths) }),
    ...(searchTerm && { search: searchTerm }),
    ...(membership !== "ALL" && { membershipStatus: membership as FeeDebtorFilters["membershipStatus"] }),
  };

  // The backend refuses debtors while no fee is set, so the request waits for the fee to exist.
  const { summary, debtors, hasMore, error, isLoading, isValidating, mutate, setSize } = useFeeDebtors(fee ? clubId : null, filters);

  const filterCount = (status !== "ALL" ? 1 : 0) + (membership !== "ALL" ? 1 : 0) + (minMonths !== "1" ? 1 : 0);
  const hasFilters = filterCount > 0 || searchTerm !== "";

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
            <div className="grid grid-cols-3 gap-2">
              <DebtorStat label="شهریه ماهانه" value={`${formatMoney(summary.monthlyAmount)} تومان`} />
              <DebtorStat label="بدهکار" value={`${toPersianDigits(String(summary.debtorCount))} نفر`} />
              <DebtorStat label="بدهی کل" value={`${formatMoney(summary.totalDebt)} تومان`} />
            </div>

            <div className="border-t border-[var(--line-2)] pt-3">
              <div className="flex items-center gap-2">
                <InputGroup className="h-11 min-w-0 flex-1 rounded-xl">
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
                <Button
                  type="button"
                  variant="field"
                  size="icon"
                  aria-label="فیلترها"
                  aria-haspopup="dialog"
                  className="relative size-11 shrink-0 rounded-xl"
                  onClick={() => setFiltersOpen(true)}
                >
                  <ListFilter aria-hidden="true" />
                  {filterCount > 0 ? (
                    <span className="absolute -top-1 -end-1 grid min-w-[16px] place-items-center rounded-full bg-brand-500 px-1 text-[12px] font-semibold leading-4 text-white tabular-nums">
                      {toPersianDigits(String(filterCount))}
                    </span>
                  ) : null}
                </Button>
              </div>
            </div>

            {debtors.length > 0 ? (
              <div className="border-t border-[var(--line-2)] pt-1">
                {debtors.map((debtor, index) => (
                  <Fragment key={debtor.studentId}>
                    {index > 0 ? <Separator /> : null}
                    <div className="py-2.5">
                      <div className="flex items-center gap-2">
                        <b className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-body">{debtor.fullName}</b>
                        {debtor.membershipActive ? <StatusBadge tone="success">فعال</StatusBadge> : <StatusBadge>غیرفعال</StatusBadge>}
                        <b className="shrink-0 text-[12px] font-extrabold tabular-nums text-ink-body">{formatMoney(debtor.totalDebt)}</b>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium tabular-nums text-ink-subtle">
                          اولین ماه بدهی {toPersianDigits(debtor.firstUnpaidMonth)} · {toPersianDigits(String(debtor.monthsOwed))} ماه
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 shrink-0 gap-1 rounded-lg px-2.5 text-[11px] font-bold"
                          onClick={() => {
                            setPayTarget(debtor);
                            setPayOpen(true);
                          }}
                        >
                          <Banknote data-icon="inline-start" aria-hidden="true" />
                          ثبت پرداخت
                        </Button>
                      </div>
                    </div>
                  </Fragment>
                ))}

                {isValidating && hasMore ? <Skeleton className="h-14 w-full rounded-xl" /> : null}
                <LoadMoreSentinel
                  disabled={!hasMore || isValidating || Boolean(error)}
                  onLoadMore={() => void setSize((current) => current + 1)}
                />
              </div>
            ) : (
              <p className="rounded-xl bg-muted/60 p-3 text-center text-[12px] font-semibold leading-5 text-ink-subtle">
                {hasFilters ? "با این فیلترها هنرجویی پیدا نشد" : "بدهی معوقه ای برای این ماه وجود ندارد"}
              </p>
            )}
          </>
        ) : null}
      </Card>

      <FeeDebtorsFiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        status={status}
        membership={membership}
        minMonths={minMonths}
        onStatusChange={setStatus}
        onMembershipChange={setMembership}
        onMinMonthsChange={setMinMonths}
        onClear={() => {
          setStatus("ALL");
          setMembership("ALL");
          setMinMonths("1");
        }}
      />

      {/* Stays mounted so Base UI runs the slide animations; the last target is kept through the close
          animation so the content does not swap while the sheet slides out. */}
      <FeePaymentSheet
        open={payOpen}
        onOpenChange={(open) => {
          if (!open) setPayOpen(false);
        }}
        clubId={clubId}
        clubs={club ? [club] : undefined}
        month={payTarget ? owedMonthOf(payTarget) : currentFeeMonth()}
        initialStudentId={payTarget?.studentId}
        subtitle={payTarget ? `${payTarget.fullName} · ${feeMonthLabel(owedMonthOf(payTarget))}` : undefined}
      />
    </section>
  );
}
