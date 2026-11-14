import { SessionsDirectory } from "@/features/coach/components/sessions-directory";

export const metadata = { title: "کلاس ها" };

export default function CoachSessionsPage() {
  return (
    <main>
      <SessionsDirectory />
    </main>
  );
}
