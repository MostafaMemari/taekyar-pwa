import useSWR from "swr";
import { fetchCoaches } from "@/features/admin/lib/admin-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useCoaches() {
  return useSWR(["coach", "list"] as const, fetchCoaches, swrReadOptions);
}
