import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type RecordFeePaymentInput, recordFeePayment, removeFeePayment, saveClubFee } from "@/features/coach/lib/fee-api";

// Fee settings change the debtors math, so the whole fee branch is revalidated.
const revalidateFees = () => mutate((key) => Array.isArray(key) && key[0] === "fee");

export function useSaveClubFee(clubId: string) {
  return useSWRMutation(["fee", "save", clubId] as const, async (_key: unknown, { arg }: { arg: number }) => {
    await saveClubFee(clubId, arg);
    await revalidateFees();
  });
}

export function useRecordFeePayment(clubId: string) {
  return useSWRMutation(["fee", "record", clubId] as const, async (_key: unknown, { arg }: { arg: RecordFeePaymentInput }) => {
    await recordFeePayment(clubId, arg);
    await revalidateFees();
  });
}

export function useRemoveFeePayment(clubId: string) {
  return useSWRMutation(["fee", "remove"] as const, async (_key: unknown, { arg }: { arg: { paymentId: string } }) => {
    await removeFeePayment(clubId, arg.paymentId);
    await revalidateFees();
  });
}
