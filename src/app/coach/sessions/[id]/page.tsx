import { notFound } from "next/navigation";
import { SessionDetailView } from "@/features/coach/components/sessions/session-detail";
import { getSession } from "@/features/coach/lib/session-data";

export default async function SessionPage({ params }: PageProps<"/coach/sessions/[id]">) {
  const { id } = await params;

  if (!getSession(id)) notFound();

  return <SessionDetailView key={id} sessionId={id} />;
}
