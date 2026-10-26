import { clearSession, getSession, type SessionRole, saveSession } from "@/features/auth/session";
import { ApiError, apiRequest } from "@/lib/api/client";

export type StudentSignupData = {
  fullName: string;
  nationalCode: string;
  gender: string;
  province: string;
  birthDate: string;
  belt: string;
  beltDate: string;
  insuranceDate?: string;
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

type TokenResponse = { accessToken: string; refreshToken: string };

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

let refreshPromise: Promise<string> | null = null;

export function refreshSession(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = getSession();
    if (!session) throw new ApiError("نشست شما پیدا نشد. دوباره وارد شوید.", 401);

    try {
      const tokens = await apiRequest<TokenResponse>("auth/refresh", {
        method: "post",
        json: { refreshToken: session.refreshToken },
      });

      saveSession({ ...session, ...tokens });
      return tokens.accessToken;
    } catch (error) {
      clearSession();
      throw error;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function withAccessToken<T>(run: (accessToken: string) => Promise<T>): Promise<T> {
  const session = getSession();
  if (!session) throw new ApiError("برای ادامه ابتدا وارد حساب کاربری شوید.", 401);

  try {
    return await run(session.accessToken);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;

    const accessToken = await refreshSession();
    return run(accessToken);
  }
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function completeStudentProfile(data: CompleteStudentProfileData) {
  return withAccessToken((accessToken) =>
    apiRequest<unknown>("auth/complete-profile", { method: "post", json: data, headers: authHeaders(accessToken) }),
  );
}
