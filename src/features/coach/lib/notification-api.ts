import { authRequest } from "@/features/auth/api";

type UnreadCount = { message: string; unreadCount: number };

export function fetchUnreadNotificationCount(): Promise<number> {
  return authRequest<UnreadCount>("notifications/unread-count").then((result) => result.unreadCount);
}
