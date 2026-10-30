import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { addStudentToClub } from "@/features/coach/lib/club-api";
import {
  addStudentsToSession,
  type CreateClassSessionInput,
  changeSessionStatus,
  createSession,
  updateSession,
} from "@/features/coach/lib/session-api";
import { ApiError } from "@/lib/api/client";

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

export function useAddStudentsToSession(sessionId: string) {
  return useSWRMutation(
    ["session", "students", "add", sessionId] as const,
    async (_key: unknown, { arg }: { arg: { clubId: string; studentIds: string[] } }) => {
      for (const studentId of arg.studentIds) {
        try {
          await addStudentToClub(arg.clubId, studentId);
        } catch (error) {
          // A class member must also be an active club member; 409 means that membership already exists.
          if (!(error instanceof ApiError && error.status === 409)) throw error;
        }
      }

      await addStudentsToSession(sessionId, arg.studentIds);
      await revalidateSessions();
      await mutate((key) => Array.isArray(key) && key[0] === "attendance");
      await mutate((key) => Array.isArray(key) && key[0] === "club");
    },
  );
}
