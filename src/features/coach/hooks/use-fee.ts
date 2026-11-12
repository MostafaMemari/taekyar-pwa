import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  type FeeDebtorFilters,
  type FeeDebtors,
  type FeePaymentRecord,
  fetchClubFee,
  fetchFeeDebtors,
  fetchFeePayments,
} from "@/features/coach/lib/fee-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useClubFee(clubId: string) {
  return useSWR(["fee", "club", clubId] as const, ([, , id]) => fetchClubFee(id), swrReadOptions);
}

type FeePaymentsPage = { data: FeePaymentRecord[]; pager?: { page: number; totalPages: number } };

// Endless feed of one month's payments; a month change restarts at page 1.
export function useFeePayments(clubId: string, year: number, month: number) {
  const feed = useSWRInfinite(
    (index, previous: FeePaymentsPage | undefined) => {
      if (previous && (previous.data.length === 0 || (previous.pager && previous.pager.page >= previous.pager.totalPages))) return null;
      return ["fee", "payments", clubId, year, month, index + 1] as const;
    },
    ([, , id, y, m, page]) => fetchFeePayments(id, y, m, page),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const lastPage = pages[pages.length - 1];
  const hasMore = Boolean(lastPage?.data.length && (!lastPage.pager || lastPage.pager.page < lastPage.pager.totalPages));

  const payments = [...new Map(pages.flatMap((page) => page.data).map((payment) => [payment.id, payment])).values()];

  return {
    ...feed,
    payments,
    total: pages[0]?.pager?.total,
    hasMore,
  };
}

type FeeDebtorsPage = FeeDebtors;

// Endless feed of the debtor report; filters are in the key, so a change restarts at page 1.
export function useFeeDebtors(clubId: string | null, filters: FeeDebtorFilters) {
  const feed = useSWRInfinite(
    (index, previous: FeeDebtorsPage | undefined) => {
      if (!clubId) return null;
      if (previous && (previous.debtors.length === 0 || previous.pager.page >= previous.pager.totalPages)) return null;
      return [
        "fee",
        "debtors",
        clubId,
        filters.year,
        filters.month,
        filters.status ?? "",
        filters.minMonthsOwed ?? 0,
        filters.search ?? "",
        filters.membershipStatus ?? "",
        index + 1,
      ] as const;
    },
    ([, , id, year, month, status, minMonthsOwed, search, membershipStatus, page]) =>
      fetchFeeDebtors(id, {
        year,
        month,
        ...(status && { status: status as FeeDebtorFilters["status"] }),
        ...(minMonthsOwed > 0 && { minMonthsOwed }),
        ...(search && { search }),
        ...(membershipStatus && { membershipStatus: membershipStatus as FeeDebtorFilters["membershipStatus"] }),
        page,
      }),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const lastPage = pages[pages.length - 1];
  const hasMore = Boolean(lastPage && lastPage.debtors.length > 0 && lastPage.pager.page < lastPage.pager.totalPages);

  const debtors = pages.flatMap((page) => page.debtors);

  return {
    ...feed,
    summary: pages[0]?.summary,
    debtors,
    total: pages[0]?.pager?.total,
    hasMore,
  };
}
