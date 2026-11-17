import useSWRMutation from "swr/mutation";
import { type AgeCategoryInput, deleteAgeCategory, saveAgeCategory } from "@/features/admin/lib/admin-api";
import { revalidateResource } from "@/lib/api/swr";

export function useSaveAgeCategory(id: string | null) {
  return useSWRMutation(
    id ? (["age-category", "update", id] as const) : (["age-category", "create"] as const),
    async (_key: unknown, { arg }: { arg: AgeCategoryInput }) => {
      await saveAgeCategory(id, arg);
      await revalidateResource("age-category");
    },
  );
}

export function useDeleteAgeCategory() {
  return useSWRMutation(["age-category", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteAgeCategory(arg);
    await revalidateResource("age-category");
  });
}
