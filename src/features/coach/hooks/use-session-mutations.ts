import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type CreateClassSessionInput, changeSessionStatus, createSession, updateSession } from "@/features/coach/lib/session-api";

// Any class write can change the list, a detail record and the member counts, so the whole session branch is revalidated.
const revalidateSessions = () => mutate((key) => Array.isArray(key) && key[0] === "session");

// clubId is create-only: the backend ignores it on PATCH, so it is dropped when editing.
export function useSaveSession(sessionId?: string) {
  return useSWRMutation(
    sessionId ? (["session", "update", sessionId] as const) : (["session", "create"] as const),
    async (_key: unknown, { arg }: { arg: CreateClassSessionInput }) => {
      const session = sessionId
        ? await updateSession(sessionId, { name: arg.name, weekDays: arg.weekDays, startTime: arg.startTime, endTime: arg.endTime })
        : await createSession(arg);

      await revalidateSessions();
      return session;
    },
  );
}

export function useChangeSessionStatus(sessionId: string) {
  return useSWRMutation(["session", "status", sessionId] as const, async (_key: unknown, { arg }: { arg: boolean }) => {
    const session = await changeSessionStatus(sessionId, arg);
    await revalidateSessions();
    return session;
  });
}
