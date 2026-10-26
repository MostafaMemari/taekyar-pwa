"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { verifyOtp } from "@/features/auth/api";
import { clearPendingSignup } from "@/features/auth/pending-signup";
import { saveSession } from "@/features/auth/session";
import { apiErrorMessage } from "@/lib/api/client";

export const MISSING_MOBILE_MESSAGE = "شماره موبایل مشخص نیست. به صفحه ورود برگردید.";

export function useVerifyOtp(mobile: string) {
  const router = useRouter();
  const [error, setError] = useState("");

  const verify = async (code: string) => {
    if (!mobile) {
      setError(MISSING_MOBILE_MESSAGE);
      return;
    }

    setError("");

    try {
      const result = await verifyOtp(mobile, code);
      saveSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        userId: result.userId,
        role: result.type,
      });
      clearPendingSignup();

      if (result.type === "COACH") {
        router.replace("/coach");
      } else {
        router.replace(result.student?.id ? "/student" : "/complete-profile");
      }
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  return { verify, error, setError };
}
