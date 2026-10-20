import { notFound } from "next/navigation";
import { ClubDetail } from "@/components/coach/clubs/club-detail";
import { getClub } from "@/lib/coach/coach-data";

export default async function CoachClubPage({ params }: PageProps<"/coach/clubs/[id]">) {
  const { id } = await params;
  const club = getClub(id);

  if (!club) notFound();

  return <ClubDetail club={club} />;
}
