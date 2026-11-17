import useSWRMutation from "swr/mutation";
import { type BeltExamInput, deleteBeltExam, saveBeltExam } from "@/features/admin/lib/admin-api";
import { revalidateResource } from "@/lib/api/swr";

export function useSaveBeltExam(id: string | null) {
  return useSWRMutation(
    id ? (["belt-exam", "update", id] as const) : (["belt-exam", "create"] as const),
    async (_key: unknown, { arg }: { arg: BeltExamInput }) => {
      await saveBeltExam(id, arg);
      await revalidateResource("belt-exam");
    },
  );
}

export function useDeleteBeltExam() {
  return useSWRMutation(["belt-exam", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteBeltExam(arg);
    await revalidateResource("belt-exam");
  });
}
