import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";

export const metadata = { title: "خانه هنرجو" };

export default function StudentHomePage() {
  return (
    <AuthScreen subtitle="خانه هنرجو" backHref="/">
      <AuthPageTitle>خانه هنرجو</AuthPageTitle>
      <AuthPageLead>صفحه اصلی هنرجو در گام بعدی این پروژه ساخته می شود.</AuthPageLead>
    </AuthScreen>
  );
}
