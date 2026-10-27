import Link from "next/link";
import { AuthScreen } from "@/components/shared/auth-screen";
import { GuestOnly } from "@/features/auth/components/session-guard";
import { CoachSignupForm } from "@/features/auth/forms/coach-signup-form";

export const metadata = { title: "ثبت نام مربی" };

export default function CoachSignupPage() {
  return (
    <GuestOnly>
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
    </GuestOnly>
  );
}
