import useSWRMutation from "swr/mutation";
import { deleteWeightClass, saveWeightClass, type WeightClassInput } from "@/features/admin/lib/admin-api";
import { revalidateResource } from "@/lib/api/swr";

export function useSaveWeightClass(id: string | null) {
  return useSWRMutation(
    id ? (["weight-class", "update", id] as const) : (["weight-class", "create"] as const),
    async (_key: unknown, { arg }: { arg: WeightClassInput }) => {
      await saveWeightClass(id, arg);
      await revalidateResource("weight-class");
    },
  );
}

export function useDeleteWeightClass() {
  return useSWRMutation(["weight-class", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteWeightClass(arg);
    await revalidateResource("weight-class");
  });
}
