import type { Options } from "ky";
import type { CoachSignupValues, StudentSignupForm } from "@/features/auth/schemas";
import { clearSession, getAccessToken, type SessionRole, saveSession, setAccessToken } from "@/features/auth/session";
import { clearDataCache } from "@/lib/api/cache";
import { ApiError, apiRequest, apiRequestWithMeta, type PagerMeta } from "@/lib/api/client";
import { toGregorianDate } from "@/lib/jalali";

export type StudentSignupData = {
  fullName: string;
  nationalCode: string;
  gender: string;
  province: string;
  birthDate: string;
  belt: string;
  beltDate: string;
  height?: number;
  weight?: number;
};

export type CoachSignupData = {
  fullName: string;
  nationalCode: string;
  gender: string;
  province: string;
  birthDate?: string;
  belt?: string;
};

export type CompleteStudentProfileData = {
  fullName: string;
  nationalCode: string;
  gender: string;
  birthDate?: string;
  fatherName?: string;
  phoneNumber?: string;
};

type TokenResponse = { accessToken: string };
type RefreshResult = TokenResponse & { userId: string; type: SessionRole };

export type VerifyOtpResult = TokenResponse & {
  userId: string;
  type: SessionRole;
  student?: { id?: string };
  coach?: { id?: string };
};

export function requestLoginOtp(mobile: string) {
  return apiRequest<Record<string, never>>("auth/login", { method: "post", json: { mobile } });
}

export function requestStudentSignupOtp(mobile: string, studentData: StudentSignupData) {
  return apiRequest<Record<string, never>>("auth/student/signup", { method: "post", json: { mobile, studentData } });
}

export function requestCoachSignupOtp(mobile: string, coachData: CoachSignupData) {
  return apiRequest<Record<string, never>>("auth/coach/signup", { method: "post", json: { mobile, coachData } });
}

export function verifyOtp(mobile: string, code: string) {
  return apiRequest<VerifyOtpResult>("auth/verify-otp", { method: "post", json: { mobile, code } });
}

export function toBeltName(value: string) {
  return value.toUpperCase().replace("-", "_");
}

export function toStudentSignupData(values: StudentSignupForm): StudentSignupData {
  return {
    fullName: values.fullName.trim(),
    nationalCode: values.nationalCode,
    gender: values.gender,
    province: values.province,
    birthDate: toGregorianDate(values.birthDate) ?? "",
    belt: toBeltName(values.belt),
    beltDate: toGregorianDate(values.beltDate) ?? "",
    ...(values.height ? { height: Number(values.height) } : {}),
    ...(values.weight ? { weight: Number(values.weight) } : {}),
  };
}

export function toCoachSignupData(values: CoachSignupValues): CoachSignupData {
  return {
    fullName: values.fullName.trim(),
    nationalCode: values.nationalCode,
    gender: values.gender,
    province: values.province,
    ...(values.birthDate ? { birthDate: toGregorianDate(values.birthDate) ?? undefined } : {}),
    ...(values.belt ? { belt: toBeltName(values.belt) } : {}),
  };
}

let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const result = await apiRequest<RefreshResult>("auth/refresh", { method: "post" });

      setAccessToken(result.accessToken);
      saveSession({ userId: result.userId, role: result.type });
      return result.accessToken;
    } catch (error) {
      clearSession();
      throw error;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function ensureAccessToken(): Promise<string> {
  const accessToken = getAccessToken();
  return accessToken ? Promise.resolve(accessToken) : refreshSession();
}

async function withAccessToken<T>(run: (accessToken: string) => Promise<T>): Promise<T> {
  const accessToken = await ensureAccessToken();

  try {
    return await run(accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    return run(await refreshSession());
  }
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function authRequestWithMeta<T>(path: string, options: Options = {}): Promise<{ data: T; pager?: PagerMeta }> {
  return withAccessToken((accessToken) =>
    apiRequestWithMeta<T>(path, { ...options, headers: { ...authHeaders(accessToken), ...options.headers } }),
  );
}

export function authRequest<T>(path: string, options: Options = {}): Promise<T> {
  return authRequestWithMeta<T>(path, options).then((result) => result.data);
}

export function completeStudentProfile(data: CompleteStudentProfileData) {
  return authRequest<unknown>("auth/complete-profile", { method: "post", json: data });
}

export async function logoutSession() {
  try {
    await apiRequest<unknown>("auth/logout", { method: "post" });
  } catch {
    // A failed revoke must not keep the user signed in locally.
  } finally {
    clearSession();
    void clearDataCache();
  }
}
