import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type CreateStudentInput, createStudent, deleteStudent } from "@/features/coach/lib/student-api";

// A new student changes the list, the stats and every picker fed by them, so the whole student branch is revalidated.
const revalidateStudents = () => mutate((key) => Array.isArray(key) && key[0] === "student");

export function useCreateStudent() {
  return useSWRMutation(["student", "create"] as const, async (_key: unknown, { arg }: { arg: CreateStudentInput }) => {
    await createStudent(arg);
    await revalidateStudents();
  });
}

export function useDeleteStudent() {
  return useSWRMutation(["student", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteStudent(arg);
    await revalidateStudents();
  });
}
