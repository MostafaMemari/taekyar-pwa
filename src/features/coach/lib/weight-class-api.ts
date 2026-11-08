import { authRequest } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";

export type WeightClassSuggestion = {
  weightClass: { id: string; label: string; minWeightKg: string; maxWeightKg: string | null };
  effectiveMaxWeightKg: number | null;
  allowanceKg: number;
};

// Open to every signed-in user, so the coach panel can suggest a weight class from the student's own data.
export function calculateWeightClass(input: { ageCategoryId: string; gender: Gender; weightKg: number }): Promise<WeightClassSuggestion> {
  return authRequest<WeightClassSuggestion>("weight-class/calculate", { method: "post", json: input });
}
