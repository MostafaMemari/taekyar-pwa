import { Suspense } from "react";
import { GuestOnly } from "@/features/auth/components/session-guard";
import { SignupMobileForm } from "@/features/auth/forms/signup-mobile-form";

export default function SignupMobilePage() {
  return (
    <GuestOnly>
      <Suspense>
        <SignupMobileForm />
      </Suspense>
    </GuestOnly>
  );
}
