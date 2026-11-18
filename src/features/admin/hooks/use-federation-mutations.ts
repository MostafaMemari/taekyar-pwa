import useSWRMutation from "swr/mutation";
import { type FederationImportInput, importCoachStudents, syncCoachStudents } from "@/features/admin/lib/admin-api";
import { revalidateResource } from "@/lib/api/swr";

export function useImportCoachStudents() {
  return useSWRMutation(["federation", "import"] as const, async (_key: unknown, { arg }: { arg: FederationImportInput }) => {
    const result = await importCoachStudents(arg);
    await revalidateResource("student");
    return result;
  });
}

export function useSyncCoachStudents() {
  return useSWRMutation(["federation", "sync"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    const result = await syncCoachStudents(arg);
    await revalidateResource("student");
    return result;
  });
}
