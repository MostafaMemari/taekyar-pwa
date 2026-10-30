import useSWR from "swr";
import { fetchAgeCategories } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useAgeCategories() {
  return useSWR(["age-category", "list"], fetchAgeCategories, swrReadOptions);
}
