import { Suspense } from "react";
import { GuestOnly } from "@/features/auth/components/guest-only";
import { VerifyOtpForm } from "@/features/auth/forms/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <GuestOnly>
      <Suspense>
        <VerifyOtpForm />
      </Suspense>
    </GuestOnly>
  );
}
