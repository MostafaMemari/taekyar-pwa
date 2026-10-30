import { AttendanceMarker } from "@/features/coach/components/sessions/attendance-marker";

export const metadata = { title: "ثبت حضور و غیاب" };

export default async function SessionAttendancePage({ params, searchParams }: PageProps<"/coach/sessions/[id]/attendance">) {
  const { id } = await params;
  const query = await searchParams;
  const initialDate = typeof query.date === "string" ? query.date : "";

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <AttendanceMarker sessionId={id} initialDate={initialDate} />
    </main>
  );
}
