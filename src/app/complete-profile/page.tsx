import { RequireSession } from "@/features/auth/components/session-guard";
import { CompleteProfileForm } from "@/features/auth/forms/complete-profile-form";

export const metadata = { title: "تکمیل پروفایل هنرجو" };

export default function CompleteProfilePage() {
  return (
    <RequireSession forRole="STUDENT">
      <CompleteProfileForm />
    </RequireSession>
  );
}
