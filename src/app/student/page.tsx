import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";
import { RequireSession } from "@/features/auth/components/session-guard";

export const metadata = { title: "خانه هنرجو" };

export default function StudentHomePage() {
  return (
    <RequireSession forRole="STUDENT">
      <AuthScreen subtitle="خانه هنرجو" backHref="/">
        <AuthPageTitle>خانه هنرجو</AuthPageTitle>
        <AuthPageLead>صفحه اصلی هنرجو در گام بعدی این پروژه ساخته می شود.</AuthPageLead>
      </AuthScreen>
    </RequireSession>
  );
}
