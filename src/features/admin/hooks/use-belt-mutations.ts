import useSWRMutation from "swr/mutation";
import { type BeltInput, deleteBelt, saveBelt } from "@/features/admin/lib/admin-api";
import { revalidateResource } from "@/lib/api/swr";

export function useSaveBelt(id: string | null) {
  return useSWRMutation(
    id ? (["belt", "update", id] as const) : (["belt", "create"] as const),
    async (_key: unknown, { arg }: { arg: BeltInput }) => {
      await saveBelt(id, arg);
      await revalidateResource("belt");
    },
  );
}

export function useDeleteBelt() {
  return useSWRMutation(["belt", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteBelt(arg);
    await revalidateResource("belt");
  });
}
