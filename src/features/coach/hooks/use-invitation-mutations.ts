import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { sendInvitation } from "@/features/coach/lib/invitation-api";

const revalidateInvitations = () => mutate((key) => Array.isArray(key) && key[0] === "invitation");

export function useSendInvitation() {
  return useSWRMutation(["invitation", "send"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await sendInvitation(arg);
    await revalidateInvitations();
  });
}
