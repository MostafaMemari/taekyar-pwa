import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { PagerMeta } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS, todayJalali, toJalaliDate } from "@/lib/jalali";

// Money fields arrive as Prisma Decimal strings; display turns them into numbers.
export type ClubFeeRecord = {
  id: string;
  clubId: string;
  monthlyAmount: string;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
};

export type FeePaymentStatus = "CONFIRMED" | "CANCELLED" | "REFUNDED";

export type FeePeriodStatus = "UNPAID" | "PARTIAL" | "PAID" | "UNPRICED";

export type FeePaymentRecord = {
  id: string;
  studentId: string;
  amount: string;
  paidAt: string;
  note: string | null;
  status: FeePaymentStatus;
  cancelReason: string | null;
  refundNote: string | null;
  // The month's period status rides along: PAID means the month is fully settled, PARTIAL means installments continue.
  period: { periodStart: string; status: FeePeriodStatus };
  student: { id: string; fullName: string; nationalCode: string };
};

export type FeeDebtorStatusFilter = "UNPAID" | "PARTIAL";

export type FeeDebtorFilters = {
  year: number;
  month: number;
  status?: FeeDebtorStatusFilter;
  minMonthsOwed?: number;
  search?: string;
  membershipStatus?: "active" | "inactive";
  sessionId?: string;
  page?: number;
  take?: number;
};

export type FeeDebtors = {
  summary: { monthlyAmount: string; debtorCount: number; totalDebt: string };
  debtors: Array<{
    studentId: string;
    fullName: string;
    monthsOwed: number;
    firstUnpaidMonth: string;
    totalDebt: string;
    membershipActive: boolean;
    // At least one owed month carries a partial payment, so the row reads «پرداخت ناقص».
    hasPartial: boolean;
    sessionNames: string[];
  }>;
  pager: PagerMeta;
};

export type FeeMonth = { year: number; month: number };

export type RecordFeePaymentInput = {
  studentId: string;
  year: number;
  month: number;
  amount: number;
  note?: string;
};

export function currentFeeMonth(): FeeMonth {
  const [year, month] = toLatinDigits(todayJalali()).slice(0, 7).split("/");
  return { year: Number(year), month: Number(month) };
}

export function nextFeeMonth(month: FeeMonth): FeeMonth {
  return month.month === 12 ? { year: month.year + 1, month: 1 } : { year: month.year, month: month.month + 1 };
}

export function feeMonthLabel(month: FeeMonth): string {
  return `${JALALI_MONTHS[month.month - 1]} ${toPersianDigits(String(month.year))}`;
}

// "current" is editable in place, "scheduled" starts in a future month, "stale" moves a save to next month.
export type FeeRateState = "current" | "scheduled" | "stale";

function feeRateMonth(rate: { effectiveFrom: string }): { year: number; month: number } {
  const [year, month] = toLatinDigits(toJalaliDate(rate.effectiveFrom)).split("/").map(Number);
  return { year, month };
}

export function feeRateState(fee: ClubFeeRecord): FeeRateState {
  const rate = feeRateMonth(fee);
  const current = currentFeeMonth();
  if (rate.year > current.year || (rate.year === current.year && rate.month > current.month)) return "scheduled";
  if (rate.year === current.year && rate.month === current.month) return "current";
  return "stale";
}

export type ClubFeeRateRecord = {
  id: string;
  clubId: string;
  monthlyAmount: string;
  effectiveFrom: string;
};

// The amount the backend charges for this month: the latest rate effective no later than the month start.
export function rateAmountForMonth(rates: ClubFeeRateRecord[], month: FeeMonth): number | null {
  let amount: number | null = null;
  for (const rate of rates) {
    const { year, month: rateMonth } = feeRateMonth(rate);
    if (year < month.year || (year === month.year && rateMonth <= month.month)) amount = Number(rate.monthlyAmount);
    else break;
  }
  return amount;
}

export function fetchClubFee(clubId: string): Promise<ClubFeeRecord | null> {
  return authRequest<ClubFeeRecord | null>(`club/${clubId}/fee`);
}

export function fetchClubFeeRates(clubId: string): Promise<ClubFeeRateRecord[]> {
  return authRequest<ClubFeeRateRecord[]>(`club/${clubId}/fee/rates`);
}

export function saveClubFee(clubId: string, monthlyAmount: number): Promise<void> {
  return authRequest<unknown>(`club/${clubId}/fee`, { method: "put", json: { monthlyAmount } }).then(() => undefined);
}

export function fetchFeePayments(
  clubId: string,
  year: number,
  month: number,
  page: number,
): Promise<{ data: FeePaymentRecord[]; pager?: PagerMeta }> {
  return authRequestWithMeta<FeePaymentRecord[]>(`club/${clubId}/fee/payments?year=${year}&month=${month}&page=${page}&take=20`);
}

export function fetchFeeDebtors(clubId: string, filters: FeeDebtorFilters): Promise<FeeDebtors> {
  const params = new URLSearchParams({ year: String(filters.year), month: String(filters.month) });
  if (filters.status) params.set("status", filters.status);
  if (filters.minMonthsOwed !== undefined) params.set("minMonthsOwed", String(filters.minMonthsOwed));
  if (filters.search) params.set("search", filters.search);
  if (filters.membershipStatus) params.set("membershipStatus", filters.membershipStatus);
  if (filters.sessionId) params.set("sessionId", filters.sessionId);
  params.set("page", String(filters.page ?? 1));
  params.set("take", String(filters.take ?? 20));
  return authRequest<FeeDebtors>(`club/${clubId}/fee/debtors?${params.toString()}`);
}

// shortcut: assumes at most 100 payments in one club-month (the API take cap); a payment beyond page 1 would be missed.
export type FeeMonthStudentState = { settled: boolean; paidAmount: number };

// Per-student payment state of one club-month: settled comes from the period status, paidAmount sums confirmed installments.
export async function fetchFeeMonthStudentStates(clubId: string, year: number, month: number): Promise<Map<string, FeeMonthStudentState>> {
  const { data } = await authRequestWithMeta<FeePaymentRecord[]>(`club/${clubId}/fee/payments?year=${year}&month=${month}&page=1&take=100`);
  const states = new Map<string, FeeMonthStudentState>();
  for (const payment of data) {
    const state = states.get(payment.studentId) ?? { settled: false, paidAmount: 0 };
    if (payment.period.status === "PAID") state.settled = true;
    if (payment.status === "CONFIRMED") state.paidAmount += Number(payment.amount);
    states.set(payment.studentId, state);
  }
  return states;
}

export function recordFeePayment(clubId: string, input: RecordFeePaymentInput): Promise<void> {
  return authRequest<unknown>(`club/${clubId}/fee/payments`, { method: "post", json: input }).then(() => undefined);
}

export function cancelFeePayment(clubId: string, paymentId: string, reason?: string): Promise<void> {
  const search = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return authRequest<unknown>(`club/${clubId}/fee/payments/${paymentId}${search}`, { method: "delete" }).then(() => undefined);
}

export function refundFeePayment(clubId: string, paymentId: string, reason?: string): Promise<void> {
  return authRequest<unknown>(`club/${clubId}/fee/payments/${paymentId}/refund`, {
    method: "post",
    json: { ...(reason && { reason }) },
  }).then(() => undefined);
}
