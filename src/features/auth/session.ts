export type SessionRole = "COACH" | "STUDENT" | "ADMIN";

export const HOME_BY_ROLE: Record<SessionRole, string> = { COACH: "/coach", STUDENT: "/student", ADMIN: "/admin" };

export type StoredSession = {
  userId: string;
  role: SessionRole;
};

const STORAGE_KEY = "taekyar.auth.session";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (parsed.userId && parsed.role) return parsed as StoredSession;
    return null;
  } catch {
    return null;
  }
}

export function getSessionId(): string | null {
  const token = accessToken?.split(".")[1];
  if (!token) return null;

  try {
    const payload = token.replace(/-/g, "+").replace(/_/g, "/");
    const parsed = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="))) as { sessionId?: unknown };
    return typeof parsed.sessionId === "string" ? parsed.sessionId : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  accessToken = null;
  window.localStorage.removeItem(STORAGE_KEY);
}
