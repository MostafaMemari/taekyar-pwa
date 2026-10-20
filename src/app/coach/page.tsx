import { AuthPageLead, AuthPageTitle } from "@/components/shared/auth-brand-header";
import { AuthScreen } from "@/components/shared/auth-screen";

export const metadata = { title: "داشبورد مربی" };

export default function CoachHomePage() {
  return (
    <AuthScreen subtitle="داشبورد مربی" backHref="/">
      <AuthPageTitle>داشبورد مربی</AuthPageTitle>
      <AuthPageLead>داشبورد مربی در گام بعدی این پروژه ساخته می شود.</AuthPageLead>
    </AuthScreen>
  );
}
