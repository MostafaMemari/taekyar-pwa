import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { markAllNotificationsRead, markNotificationRead } from "@/features/coach/lib/notification-api";

const revalidateNotifications = () => mutate((key) => Array.isArray(key) && key[0] === "notification");

export function useMarkAllNotificationsRead() {
  return useSWRMutation(["notification", "read-all"] as const, async () => {
    await markAllNotificationsRead();
    await revalidateNotifications();
  });
}

export function useMarkNotificationRead() {
  return useSWRMutation(["notification", "read"] as const, async (_key: unknown, { arg }: { arg: string }) => {
    await markNotificationRead(arg);
    await revalidateNotifications();
  });
}
