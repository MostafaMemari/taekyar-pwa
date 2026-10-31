import useSWR from "swr";
import { fetchAccountSessions } from "@/features/coach/lib/account-session-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useAccountSessions() {
  return useSWR(["account-session", "list"] as const, fetchAccountSessions, swrReadOptions);
}
