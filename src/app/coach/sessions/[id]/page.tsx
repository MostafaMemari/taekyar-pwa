import { SessionDetailView } from "@/features/coach/components/sessions/session-detail";

export default async function SessionPage({ params }: PageProps<"/coach/sessions/[id]">) {
  const { id } = await params;

  return <SessionDetailView key={id} sessionId={id} />;
}
