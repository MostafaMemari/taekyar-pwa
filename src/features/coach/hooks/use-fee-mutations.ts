import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import {
  cancelFeePayment,
  type RecordFeePaymentInput,
  recordFeePayment,
  refundFeePayment,
  saveClubFee,
} from "@/features/coach/lib/fee-api";

// Fee settings change the debtors math, so the whole fee branch is revalidated.
const revalidateFees = () => mutate((key) => Array.isArray(key) && key[0] === "fee");

export function useSaveClubFee() {
  return useSWRMutation(["fee", "save"] as const, async (_key: unknown, { arg }: { arg: { clubId: string; monthlyAmount: number } }) => {
    await saveClubFee(arg.clubId, arg.monthlyAmount);
    await revalidateFees();
  });
}

export function useRecordFeePayment() {
  return useSWRMutation(["fee", "record"] as const, async (_key: unknown, { arg }: { arg: RecordFeePaymentInput & { clubId: string } }) => {
    await recordFeePayment(arg.clubId, arg);
    await revalidateFees();
  });
}

export function useCancelFeePayment(clubId: string) {
  return useSWRMutation(["fee", "cancel"] as const, async (_key: unknown, { arg }: { arg: { paymentId: string; reason?: string } }) => {
    await cancelFeePayment(clubId, arg.paymentId, arg.reason);
    await revalidateFees();
  });
}

export function useRefundFeePayment(clubId: string) {
  return useSWRMutation(["fee", "refund"] as const, async (_key: unknown, { arg }: { arg: { paymentId: string; reason?: string } }) => {
    await refundFeePayment(clubId, arg.paymentId, arg.reason);
    await revalidateFees();
  });
}
