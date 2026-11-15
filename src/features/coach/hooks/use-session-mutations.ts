import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { addStudentToClub } from "@/features/coach/lib/club-api";
import {
  addStudentsToSession,
  type ClassSessionRecord,
  type CreateClassSessionInput,
  changeSessionStatus,
  createSession,
  deleteSession,
  removeStudentFromSession,
  updateSession,
} from "@/features/coach/lib/session-api";
import { ApiError } from "@/lib/api/client";
import { revalidateResource } from "@/lib/api/swr";

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

export function useAddStudentsToSession() {
  return useSWRMutation(
    ["session", "students", "add"] as const,
    async (_key: unknown, { arg }: { arg: { sessionId: string; clubId: string; studentIds: string[] } }) => {
      for (const studentId of arg.studentIds) {
        try {
          await addStudentToClub(arg.clubId, studentId);
        } catch (error) {
          // A class member must also be an active club member; 409 means that membership already exists.
          if (!(error instanceof ApiError && error.status === 409)) throw error;
        }
      }

      await addStudentsToSession(arg.sessionId, arg.studentIds);
      await revalidateResource("session");
      await mutate((key) => Array.isArray(key) && key[0] === "attendance");
      await mutate((key) => Array.isArray(key) && key[0] === "club");
    },
  );
}

export function useRemoveSessionStudent(sessionId: string) {
  return useSWRMutation(["session", "students", "remove", sessionId] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await removeStudentFromSession(sessionId, arg);
    await revalidateResource("session");
  });
}

export function useDeleteSession() {
  return useSWRMutation(["session", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteSession(arg);

    // A plain filter-mutate keeps the deleted session inside the cached list, and the next screen's
    // per-id count fetches would 404 and flash the error screen. Drop its own caches and cut it from
    // the cached list before the refetch lands.
    await mutate((key) => Array.isArray(key) && (key[0] === "session" || key[0] === "attendance") && key.includes(arg), undefined, {
      revalidate: false,
    });
    await mutate(
      (key) => Array.isArray(key) && key[0] === "session" && key[1] === "list",
      (current: { sessions: ClassSessionRecord[] } | undefined) =>
        current ? { ...current, sessions: current.sessions.filter((session) => session.id !== arg) } : current,
      { revalidate: true },
    );
  });
}
