import useSWR from "swr";
import { fetchUnreadNotificationCount } from "@/features/coach/lib/notification-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useUnreadNotifications() {
  return useSWR(["notification", "unread"] as const, fetchUnreadNotificationCount, swrReadOptions);
}
