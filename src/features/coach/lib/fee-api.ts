import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { PagerMeta } from "@/lib/api/client";
import { toLatinDigits, toPersianDigits } from "@/lib/digits";
import { JALALI_MONTHS, todayJalali } from "@/lib/jalali";

// Money fields arrive as Prisma Decimal strings; display turns them into numbers.
export type ClubFeeRecord = {
  id: string;
  clubId: string;
  monthlyAmount: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FeePaymentRecord = {
  id: string;
  studentId: string;
  amount: string;
  periodStart: string;
  paidAt: string;
  note: string | null;
  student: { id: string; fullName: string; nationalCode: string };
};

export type FeeDebtors = {
  summary: { monthlyAmount: string; debtorCount: number; totalDebt: string };
  debtors: Array<{ studentId: string; fullName: string; monthsOwed: number; firstUnpaidMonth: string; totalDebt: string }>;
};

export type FeeMonth = { year: number; month: number };

export type RecordFeePaymentInput = {
  studentId: string;
  year: number;
  month: number;
  amount?: number;
  note?: string;
};

export function currentFeeMonth(): FeeMonth {
  const [year, month] = toLatinDigits(todayJalali()).slice(0, 7).split("/");
  return { year: Number(year), month: Number(month) };
}

export function feeMonthLabel(month: FeeMonth): string {
  return `${JALALI_MONTHS[month.month - 1]} ${toPersianDigits(String(month.year))}`;
}

export function fetchClubFee(clubId: string): Promise<ClubFeeRecord | null> {
  return authRequest<ClubFeeRecord | null>(`club/${clubId}/fee`);
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

export function fetchFeeDebtors(clubId: string, year: number, month: number): Promise<FeeDebtors> {
  return authRequest<FeeDebtors>(`club/${clubId}/fee/debtors?year=${year}&month=${month}`);
}

export function recordFeePayment(clubId: string, input: RecordFeePaymentInput): Promise<void> {
  return authRequest<unknown>(`club/${clubId}/fee/payments`, { method: "post", json: input }).then(() => undefined);
}

export function removeFeePayment(clubId: string, paymentId: string): Promise<void> {
  return authRequest<unknown>(`club/${clubId}/fee/payments/${paymentId}`, { method: "delete" }).then(() => undefined);
}
