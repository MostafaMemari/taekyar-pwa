import useSWRMutation from "swr/mutation";
import {
  cancelFeePayment,
  type RecordFeePaymentInput,
  recordFeePayment,
  refundFeePayment,
  saveClubFee,
} from "@/features/coach/lib/fee-api";
import { revalidateResource } from "@/lib/api/swr";

// Fee writes change the debtor math and each student's fee chip on the students list, so both branches revalidate.
const revalidateFees = () => revalidateResource("fee");
const revalidateStudents = () => revalidateResource("student");

export function useSaveClubFee() {
  return useSWRMutation(["fee", "save"] as const, async (_key: unknown, { arg }: { arg: { clubId: string; monthlyAmount: number } }) => {
    await saveClubFee(arg.clubId, arg.monthlyAmount);
    await revalidateFees();
    await revalidateStudents();
  });
}

export function useRecordFeePayment() {
  return useSWRMutation(["fee", "record"] as const, async (_key: unknown, { arg }: { arg: RecordFeePaymentInput & { clubId: string } }) => {
    await recordFeePayment(arg.clubId, arg);
    await revalidateFees();
    await revalidateStudents();
  });
}

export function useCancelFeePayment(clubId: string) {
  return useSWRMutation(["fee", "cancel"] as const, async (_key: unknown, { arg }: { arg: { paymentId: string; reason?: string } }) => {
    await cancelFeePayment(clubId, arg.paymentId, arg.reason);
    await revalidateFees();
    await revalidateStudents();
  });
}

export function useRefundFeePayment(clubId: string) {
  return useSWRMutation(["fee", "refund"] as const, async (_key: unknown, { arg }: { arg: { paymentId: string; reason?: string } }) => {
    await refundFeePayment(clubId, arg.paymentId, arg.reason);
    await revalidateFees();
    await revalidateStudents();
  });
}
