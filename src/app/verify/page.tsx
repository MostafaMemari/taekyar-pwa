import { Suspense } from "react";
import { VerifyOtpForm } from "@/features/auth/forms/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
