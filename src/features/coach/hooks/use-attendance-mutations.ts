import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type SaveAttendanceInput, saveClassAttendance } from "@/features/coach/lib/attendance-api";

// A save changes the roster of one date, so the whole attendance branch is revalidated.
const revalidateAttendance = () => mutate((key) => Array.isArray(key) && key[0] === "attendance");

export function useSaveAttendance(classSessionId: string) {
  return useSWRMutation(["attendance", "save", classSessionId] as const, async (_key: unknown, { arg }: { arg: SaveAttendanceInput }) => {
    const result = await saveClassAttendance(classSessionId, arg);
    await revalidateAttendance();
    return result;
  });
}
