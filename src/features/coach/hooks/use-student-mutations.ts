import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import {
  assignStudentBelt,
  type CreateStudentInput,
  createStudent,
  deleteStudent,
  type UpdateStudentInput,
  updateStudent,
  updateStudentInsurance,
  uploadStudentImage,
} from "@/features/coach/lib/student-api";

// A new student changes the list, the stats and every picker fed by them, so the whole student branch is revalidated.
const revalidateStudents = () => mutate((key) => Array.isArray(key) && key[0] === "student");

export function useCreateStudent() {
  return useSWRMutation(["student", "create"] as const, async (_key: unknown, { arg }: { arg: CreateStudentInput }) => {
    await createStudent(arg);
    await revalidateStudents();
  });
}

export function useUpdateStudent() {
  return useSWRMutation(
    ["student", "update"] as const,
    async (_key: unknown, { arg }: { arg: { id: string; input: UpdateStudentInput } }) => {
      await updateStudent(arg.id, arg.input);
      await revalidateStudents();
    },
  );
}

export function useRegisterStudentInsurance() {
  return useSWRMutation(["student", "insurance"] as const, async (_key: unknown, { arg }: { arg: { id: string; isoDate: string } }) => {
    await updateStudentInsurance(arg.id, arg.isoDate);
    await revalidateStudents();
  });
}

export function useAssignStudentBelt() {
  return useSWRMutation(
    ["student", "belt"] as const,
    async (_key: unknown, { arg }: { arg: { id: string; beltId: string; beltDate: string } }) => {
      await assignStudentBelt(arg.id, arg.beltId, arg.beltDate);
      await revalidateStudents();
    },
  );
}

export function useDeleteStudent() {
  return useSWRMutation(["student", "delete"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await deleteStudent(arg);
    await revalidateStudents();
  });
}

export function useUploadStudentImage(id: string) {
  return useSWRMutation(["student", "image", id] as const, async (_key: unknown, { arg }: { arg: File }) => {
    await uploadStudentImage(id, arg);
    await revalidateStudents();
  });
}
