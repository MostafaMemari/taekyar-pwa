import { ClubForm } from "@/features/coach/components/clubs/club-form";

export const metadata = { title: "ویرایش باشگاه" };

export default async function EditClubPage({ params }: PageProps<"/coach/clubs/[id]/edit">) {
  const { id } = await params;

  return <ClubForm mode="edit" clubId={id} />;
}
