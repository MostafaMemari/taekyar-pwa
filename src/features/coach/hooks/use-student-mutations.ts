import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import {
  type AssignBeltInput,
  addStudentMetrics,
  assignStudentBelt,
  type CreateStudentInput,
  createStudent,
  deleteStudent,
  removeStudentInsurance,
  renewStudentInsurance,
  renewStudentMembershipYear,
  type UpdateStudentInput,
  updateStudent,
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

export function useRenewStudentMembershipYear() {
  return useSWRMutation(["student", "membership-year"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await renewStudentMembershipYear(arg);
    await revalidateStudents();
  });
}

export function useRenewStudentInsurance() {
  return useSWRMutation(
    ["student", "insurance-renew"] as const,
    async (_key: unknown, { arg }: { arg: { id: string; sportsInsuranceDate: string } }) => {
      await renewStudentInsurance(arg.id, arg.sportsInsuranceDate);
      await revalidateStudents();
    },
  );
}

export function useRemoveStudentInsurance() {
  return useSWRMutation(["student", "insurance-remove"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await removeStudentInsurance(arg);
    await revalidateStudents();
  });
}

export function useAddStudentMetrics() {
  return useSWRMutation(
    ["student", "metrics-add"] as const,
    async (_key: unknown, { arg }: { arg: { id: string; height: number; weight: number } }) => {
      await addStudentMetrics(arg.id, arg.height, arg.weight);
      await revalidateStudents();
    },
  );
}

export function useAssignStudentBelt() {
  return useSWRMutation(["student", "belt"] as const, async (_key: unknown, { arg }: { arg: { id: string } & AssignBeltInput }) => {
    await assignStudentBelt(arg.id, arg);
    await revalidateStudents();
  });
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
