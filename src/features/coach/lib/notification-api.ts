import { authRequest, authRequestWithMeta } from "@/features/auth/api";

type UnreadCount = { message: string; unreadCount: number };

export type NotificationType = "INSURANCE_EXPIRING" | "PHOTO_EXPIRING" | "BELT_UPGRADE_DUE" | "BELT_PROMOTION" | "GENERAL";

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
  createdAt: string;
};

export const NOTIFICATIONS_PAGE_SIZE = 100;

// shortcut: QueryNotificationDto does not convert `isRead`/`type` from the query string, so the screen filters the fetched page on the client.
export function fetchNotifications(): Promise<NotificationRecord[]> {
  return authRequestWithMeta<NotificationRecord[]>(
    `notifications?page=1&take=${NOTIFICATIONS_PAGE_SIZE}&sortBy=sentAt&sortDirection=desc`,
  ).then(({ data }) => data);
}

export function markAllNotificationsRead(): Promise<void> {
  return authRequest<unknown>("notifications/read-all", { method: "patch" }).then(() => undefined);
}

export function fetchUnreadNotificationCount(): Promise<number> {
  return authRequest<UnreadCount>("notifications/unread-count").then((result) => result.unreadCount);
}
