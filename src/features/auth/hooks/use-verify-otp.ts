"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { verifyOtp } from "@/features/auth/api";
import { clearPendingSignup } from "@/features/auth/pending-signup";
import { saveSession, setAccessToken } from "@/features/auth/session";
import { clearDataCache } from "@/lib/api/cache";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

export const MISSING_MOBILE_MESSAGE = "شماره موبایل مشخص نیست. به صفحه ورود برگردید";

export type VerifyOtpOutcome = "success" | "rejected" | "failed";

export function useVerifyOtp(mobile: string) {
  const router = useRouter();
  const [error, setError] = useState("");

  const verify = async (code: string): Promise<VerifyOtpOutcome> => {
    if (!mobile) {
      setError(MISSING_MOBILE_MESSAGE);
      return "failed";
    }

    setError("");

    try {
      const result = await verifyOtp(mobile, code);
      setAccessToken(result.accessToken);
      saveSession({ userId: result.userId, role: result.type });
      clearPendingSignup();
      void clearDataCache();

      if (result.type === "COACH") {
        router.replace("/coach");
      } else if (result.type === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(result.student?.id ? "/student" : "/complete-profile");
      }
      return "success";
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
      return requestError instanceof ApiError && requestError.status !== undefined ? "rejected" : "failed";
    }
  };

  return { verify, error, setError };
}
