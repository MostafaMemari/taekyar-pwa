import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";

export const metadata = { title: "انتخاب باشگاه مربی" };

export default function CoachClubLoginPage() {
  return (
    <AuthScreen subtitle="ورود مربی" backHref="/verify">
      <AuthPageTitle>انتخاب باشگاه</AuthPageTitle>
      <AuthPageLead>انتخاب باشگاه پس از تایید شماره موبایل در گام بعدی این پروژه ساخته می شود.</AuthPageLead>
    </AuthScreen>
  );
}
