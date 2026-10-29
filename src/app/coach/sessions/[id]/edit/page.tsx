import { SessionForm } from "@/features/coach/components/sessions/session-form";

export const metadata = { title: "ویرایش کلاس" };

export default async function EditSessionPage({ params }: PageProps<"/coach/sessions/[id]/edit">) {
  const { id } = await params;

  return <SessionForm mode="edit" sessionId={id} />;
}
