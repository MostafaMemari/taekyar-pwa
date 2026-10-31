import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { revokeAccountSession, revokeAllAccountSessions } from "@/features/coach/lib/account-session-api";

const revalidateSessions = () => mutate((key) => Array.isArray(key) && key[0] === "account-session");

export function useRevokeAccountSession() {
  return useSWRMutation(["account-session", "revoke"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await revokeAccountSession(arg);
    await revalidateSessions();
  });
}

export function useRevokeAllAccountSessions() {
  return useSWRMutation(["account-session", "revoke-all"] as const, async () => {
    await revokeAllAccountSessions();
    await revalidateSessions();
  });
}
