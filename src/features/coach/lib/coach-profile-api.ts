import { authRequest } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type CoachProfileRecord = {
  id: string;
  userId: string;
  fullName: string;
  nationalCode: string;
  gender: Gender;
  province: string;
  birthDate: string | null;
  imageKey: string | null;
  belt: string | null;
  mobile: string;
  createdAt: string;
  updatedAt: string;
};

export type CoachProfileInput = {
  fullName: string;
  nationalCode: string;
  province: string;
  birthDate?: string;
  belt: string | null;
};

export function fetchCoachProfile(): Promise<CoachProfileRecord> {
  return authRequest<CoachProfileRecord>("auth/profile");
}

export function updateCoachProfile(id: string, input: CoachProfileInput): Promise<void> {
  return authRequest<unknown>(`coach/${id}`, { method: "patch", json: input }).then(() => undefined);
}
