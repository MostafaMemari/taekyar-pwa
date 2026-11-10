import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { type FeePaymentRecord, fetchClubFee, fetchFeePayments } from "@/features/coach/lib/fee-api";
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
