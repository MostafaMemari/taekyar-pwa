import { GuestOnly } from "@/features/auth/components/session-guard";
import { StudentSignupFlow } from "@/features/auth/forms/student-signup-flow";

export const metadata = { title: "ثبت نام هنرجو" };

export default function StudentSignupPage() {
  return (
    <GuestOnly>
      <StudentSignupFlow />
    </GuestOnly>
  );
}
