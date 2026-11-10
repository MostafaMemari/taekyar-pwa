import { ClubFeePanel } from "@/features/coach/components/clubs/fee/club-fee-panel";

export const metadata = { title: "شهریه باشگاه" };

export default async function ClubFeePage({ params }: PageProps<"/coach/clubs/[id]/fee">) {
  const { id } = await params;

  return <ClubFeePanel clubId={id} />;
}
