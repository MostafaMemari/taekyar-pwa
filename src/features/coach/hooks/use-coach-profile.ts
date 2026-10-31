import useSWR from "swr";
import { fetchCoachProfile } from "@/features/coach/lib/coach-profile-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useCoachProfile() {
  return useSWR(["coach", "profile"] as const, fetchCoachProfile, swrReadOptions);
}
