import useSWR from "swr";
import type { Gender } from "@/features/coach/lib/coach-data";
import { calculateWeightClass } from "@/features/coach/lib/weight-class-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useWeightClassSuggestion(input: { ageCategoryId: string; gender: Gender; weightKg: number } | null) {
  return useSWR(
    input ? (["weight-class", "calculate", input.ageCategoryId, input.gender, input.weightKg] as const) : null,
    ([, , ageCategoryId, gender, weightKg]) => calculateWeightClass({ ageCategoryId, gender, weightKg }),
    swrReadOptions,
  );
}
