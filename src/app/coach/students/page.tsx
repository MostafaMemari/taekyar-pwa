import { StudentsDirectory } from "@/features/coach/components/students/students-directory";

export const metadata = { title: "هنرجویان" };

export default function CoachStudentsPage() {
  return (
    <main>
      <StudentsDirectory />
    </main>
  );
}
