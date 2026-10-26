"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { requestCoachSignupOtp, requestLoginOtp, requestStudentSignupOtp } from "@/features/auth/api";
import { MISSING_MOBILE_MESSAGE } from "@/features/auth/hooks/use-verify-otp";
import { readPendingSignup } from "@/features/auth/pending-signup";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";

const RESEND_SECONDS = 120;

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${toPersianDigits(String(minutes))}:${toPersianDigits(String(rest).padStart(2, "0"))}`;
}

type ResendControlProps = {
  mobile: string;
  fromSignup: boolean;
  onError: (message: string) => void;
};

export function ResendControl({ mobile, fromSignup, onError }: ResendControlProps) {
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => setSecondsLeft((left) => left - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const resend = async () => {
    if (resending) return;

    if (!fromSignup) {
      if (!mobile) {
        onError(MISSING_MOBILE_MESSAGE);
        return;
      }

      setResending(true);
      onError("");

      try {
        await requestLoginOtp(mobile);
        setSecondsLeft(RESEND_SECONDS);
      } catch (requestError) {
        onError(apiErrorMessage(requestError));
      } finally {
        setResending(false);
      }
      return;
    }

    const signup = readPendingSignup();
    if (!signup?.mobile) {
      onError("اطلاعات ثبت نام پیدا نشد. لطفاً دوباره ثبت نام کنید.");
      return;
    }

    setResending(true);
    onError("");

    try {
      if (signup.kind === "student") {
        await requestStudentSignupOtp(signup.mobile, signup.studentData);
      } else {
        await requestCoachSignupOtp(signup.mobile, signup.coachData);
      }

      setSecondsLeft(RESEND_SECONDS);
    } catch (requestError) {
      onError(apiErrorMessage(requestError));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mt-5 text-center">
      {secondsLeft > 0 ? (
        <p className="text-[12px] font-semibold text-ink-subtle" aria-live="polite">
          ارسال مجدد تا {formatCountdown(secondsLeft)}
        </p>
      ) : (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-[12px] font-bold text-accent-ink"
          disabled={resending}
          onClick={resend}
        >
          {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
        </Button>
      )}
    </div>
  );
}
