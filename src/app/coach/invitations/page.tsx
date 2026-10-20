import { Plus } from "lucide-react";
import Link from "next/link";
import { CoachPageHeader } from "@/components/coach/coach-page-header";
import { InvitationsList } from "@/components/coach/students/invitations-list";
import { Button } from "@/components/ui/button";

export const metadata = { title: "دعوت نامه های من" };

export default function InvitationsPage() {
  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader
        title="دعوت نامه های من"
        backHref="/coach/students"
        action={
          <Button
            variant="brand"
            size="sm"
            className="h-8 rounded-lg px-3 text-[10.5px] font-extrabold"
            render={<Link href="/coach/students/invite" />}
            nativeButton={false}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            دعوت نامه جدید
          </Button>
        }
      />
      <InvitationsList />
    </main>
  );
}
