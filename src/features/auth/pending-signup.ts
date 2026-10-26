import type { CoachSignupData, StudentSignupData } from "@/features/auth/api";

export type PendingSignup =
  | { kind: "student"; studentData: StudentSignupData; mobile?: string }
  | { kind: "coach"; coachData: CoachSignupData; mobile?: string };

const STORAGE_KEY = "taekyar.auth.pending-signup";

export function savePendingSignup(pending: PendingSignup) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

export function readPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PendingSignup;
    if (parsed.kind === "student" && parsed.studentData) return parsed;
    if (parsed.kind === "coach" && parsed.coachData) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function setPendingSignupMobile(mobile: string) {
  const pending = readPendingSignup();
  if (pending) savePendingSignup({ ...pending, mobile });
}

export function clearPendingSignup() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
