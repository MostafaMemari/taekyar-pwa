import useSWR from "swr";
import { fetchInvitations, INVITATIONS_PAGE_SIZE } from "@/features/coach/lib/invitation-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useInvitations() {
  return useSWR(["invitation", "list", INVITATIONS_PAGE_SIZE] as const, fetchInvitations, swrReadOptions);
}
