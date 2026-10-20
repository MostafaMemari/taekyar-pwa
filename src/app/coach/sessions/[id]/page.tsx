import { notFound } from "next/navigation";
import { SessionDetailView } from "@/components/coach/sessions/session-detail";
import { getSession } from "@/lib/coach/session-data";

export default async function SessionPage({ params }: PageProps<"/coach/sessions/[id]">) {
  const { id } = await params;

  if (!getSession(id)) notFound();

  return <SessionDetailView key={id} sessionId={id} />;
}
