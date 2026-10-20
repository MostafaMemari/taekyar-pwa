import Link from "next/link";
import { CoachSignupForm } from "@/components/coach/coach-signup-form";
import { AuthScreen } from "@/components/shared/auth-screen";

export const metadata = { title: "ثبت نام مربی" };

export default function CoachSignupPage() {
  return (
    <AuthScreen
      subtitle="ثبت نام مربی"
      backHref="/"
      showHeader={false}
      footer={
        <>
          قبلاً ثبت نام کرده اید؟
          <Link href="/login" className="ms-1 font-bold text-accent-ink">
            ورود
          </Link>
        </>
      }
    >
      <CoachSignupForm />
    </AuthScreen>
  );
}
