import { Suspense } from "react";
import { GuestOnly } from "@/features/auth/components/session-guard";
import { LoginForm } from "@/features/auth/forms/login-form";

export default function LoginPage() {
  return (
    <GuestOnly>
      <Suspense>
        <LoginForm />
      </Suspense>
    </GuestOnly>
  );
}
