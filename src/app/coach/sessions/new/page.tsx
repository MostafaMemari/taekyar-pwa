import { SessionForm } from "@/features/coach/components/sessions/session-form";

export const metadata = { title: "ثبت کلاس جدید" };

export default async function NewSessionPage({ searchParams }: PageProps<"/coach/sessions/new">) {
  const { clubId } = await searchParams;

  return <SessionForm mode="create" initialClubId={typeof clubId === "string" ? clubId : undefined} />;
}
