import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { type CoachProfileInput, updateCoachProfile, uploadCoachImage } from "@/features/coach/lib/coach-profile-api";

const revalidateCoach = () => mutate((key) => Array.isArray(key) && key[0] === "coach");

export function useUpdateCoachProfile(id: string) {
  return useSWRMutation(["coach", "update", id] as const, async (_key: unknown, { arg }: { arg: CoachProfileInput }) => {
    await updateCoachProfile(id, arg);
    await revalidateCoach();
  });
}

export function useUploadCoachImage(id: string) {
  return useSWRMutation(["coach", "image", id] as const, async (_key: unknown, { arg }: { arg: File }) => {
    await uploadCoachImage(id, arg);
    await revalidateCoach();
  });
}
