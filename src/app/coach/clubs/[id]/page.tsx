import { ClubDetail } from "@/features/coach/components/clubs/club-detail";

export default async function CoachClubPage({ params }: PageProps<"/coach/clubs/[id]">) {
  const { id } = await params;

  return <ClubDetail clubId={id} />;
}
