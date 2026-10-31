import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { markAllNotificationsRead } from "@/features/coach/lib/notification-api";

const revalidateNotifications = () => mutate((key) => Array.isArray(key) && key[0] === "notification");

export function useMarkAllNotificationsRead() {
  return useSWRMutation(["notification", "read-all"] as const, async () => {
    await markAllNotificationsRead();
    await revalidateNotifications();
  });
}
