import { authRequest, authRequestWithMeta } from "@/features/auth/api";

export type AccountSession = {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  platform: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export const ACCOUNT_SESSIONS_PAGE_SIZE = 50;

function fetchSessionPage(isActive: boolean): Promise<AccountSession[]> {
  return authRequestWithMeta<AccountSession[]>(
    `sessions?page=1&take=${ACCOUNT_SESSIONS_PAGE_SIZE}&isActive=${isActive}&sortBy=lastUsedAt&sortDirection=desc`,
  ).then(({ data }) => data);
}

// shortcut: QuerySessionDto transforms a missing `isActive` into `false`, so a request without it returns only revoked sessions. Fetch both halves and merge until the DTO stops defaulting.
export async function fetchAccountSessions(): Promise<AccountSession[]> {
  const [active, revoked] = await Promise.all([fetchSessionPage(true), fetchSessionPage(false)]);
  const byId = new Map([...active, ...revoked].map((session) => [session.id, session]));

  return [...byId.values()].sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt));
}

export function revokeAccountSession(id: string): Promise<void> {
  return authRequest<unknown>(`sessions/${id}`, { method: "delete" }).then(() => undefined);
}

export function revokeAllAccountSessions(): Promise<void> {
  return authRequest<unknown>("sessions", { method: "delete", json: { confirm: true } }).then(() => undefined);
}
