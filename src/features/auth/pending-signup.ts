import type { CoachSignupData, StudentSignupData } from "@/features/auth/api";
import type { CoachSignupValues, StudentSignupForm } from "@/features/auth/schemas";

export type PendingSignup =
  | { kind: "student"; studentData: StudentSignupData; mobile?: string }
  | { kind: "coach"; coachData: CoachSignupData; mobile?: string };

export type SignupDraft =
  | { kind: "student"; step: number; values: StudentSignupForm }
  | { kind: "coach"; step: number; values: CoachSignupValues };

const STORAGE_KEY = "taekyar.auth.pending-signup";
const DRAFT_KEY = "taekyar.auth.signup-draft";

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

export function saveSignupDraft(draft: SignupDraft) {
  window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readSignupDraft(): SignupDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SignupDraft;
    if (parsed.kind === "student" && parsed.values) return parsed;
    if (parsed.kind === "coach" && parsed.values) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(DRAFT_KEY);
}
