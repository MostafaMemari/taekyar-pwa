import { Suspense } from "react";
import { LoginForm } from "@/features/auth/forms/login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
