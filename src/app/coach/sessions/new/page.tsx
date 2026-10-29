import { SessionForm } from "@/features/coach/components/sessions/session-form";

export const metadata = { title: "ثبت کلاس جدید" };

export default function NewSessionPage() {
  return <SessionForm mode="create" />;
}
