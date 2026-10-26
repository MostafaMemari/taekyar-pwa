import { notFound } from "next/navigation";
import { ClubDetail } from "@/features/coach/components/clubs/club-detail";
import { getClub } from "@/features/coach/lib/coach-data";

export default async function CoachClubPage({ params }: PageProps<"/coach/clubs/[id]">) {
  const { id } = await params;
  const club = getClub(id);

  if (!club) notFound();

  return <ClubDetail club={club} />;
}
