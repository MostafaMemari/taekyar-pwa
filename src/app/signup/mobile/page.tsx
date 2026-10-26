import { Suspense } from "react";
import { SignupMobileForm } from "@/features/auth/forms/signup-mobile-form";

export default function SignupMobilePage() {
  return (
    <Suspense>
      <SignupMobileForm />
    </Suspense>
  );
}
