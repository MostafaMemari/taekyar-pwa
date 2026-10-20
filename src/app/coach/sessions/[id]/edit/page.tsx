import { notFound } from "next/navigation";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { SessionForm } from "@/components/coach/sessions/session-form";
import { getSession } from "@/lib/coach/session-data";
import { sessionToForm } from "@/lib/coach/session-form-model";

export const metadata = { title: "ویرایش کلاس" };

export default async function EditSessionPage({ params }: PageProps<"/coach/sessions/[id]/edit">) {
  const { id } = await params;
  const session = getSession(id);

  if (!session) notFound();

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="ویرایش کلاس" subtitle={session.name} backHref={`/coach/sessions/${session.id}`} />
      <SessionForm mode="edit" sessionId={session.id} initial={sessionToForm(session)} />
    </main>
  );
}
