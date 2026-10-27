import { ClubForm } from "@/features/coach/components/clubs/club-form";

export const metadata = { title: "ثبت باشگاه جدید" };

export default function NewClubPage() {
  return <ClubForm mode="create" />;
}
