import { notFound } from "next/navigation";
import { AttendanceMarker } from "@/components/coach/sessions/attendance-marker";
import { getSessionDetail } from "@/lib/coach/session-data";

export const metadata = { title: "ثبت حضور و غیاب" };

export default async function SessionAttendancePage({ params }: PageProps<"/coach/sessions/[id]/attendance">) {
  const { id } = await params;

  if (!getSessionDetail(id)) notFound();

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <AttendanceMarker key={id} sessionId={id} />
    </main>
  );
}
