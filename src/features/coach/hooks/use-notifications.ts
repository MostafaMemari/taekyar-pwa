import useSWR from "swr";
import { fetchNotifications } from "@/features/coach/lib/notification-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useNotifications() {
  return useSWR(["notification", "list"] as const, fetchNotifications, swrReadOptions);
}
