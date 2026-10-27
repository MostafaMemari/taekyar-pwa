export type SessionRole = "COACH" | "STUDENT";

export const HOME_BY_ROLE: Record<SessionRole, string> = { COACH: "/coach", STUDENT: "/student" };

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: SessionRole;
};

const STORAGE_KEY = "taekyar.auth.session";

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (parsed.accessToken && parsed.refreshToken && parsed.userId && parsed.role) return parsed as StoredSession;
    return null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
