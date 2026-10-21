import { Landmark } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/coach/coach-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { StudentProfile } from "@/lib/coach/student-profile-data";
import { cn } from "@/lib/utils";

export function StudentClubsPanel({ profile }: { profile: StudentProfile }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2.5">
        {profile.clubs.map((club) => (
          <Card key={club.name} className="flex-row items-center gap-3 p-3.5">
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                club.active ? "bg-info-soft text-info" : "bg-muted text-ink-subtle",
              )}
            >
              <Landmark className="size-5" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-ink">{club.name}</p>
              <p className="mt-0.5 text-[11px] text-ink-subtle">
                {club.active ? `عضویت از ${club.joinedAt ?? "—"}` : `تاریخ خروج: ${club.removedAt ?? "—"}`}
              </p>
            </div>

            <StatusBadge tone={club.active ? "success" : "neutral"}>{club.active ? "فعال" : "غیرفعال"}</StatusBadge>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        className="h-11 w-full rounded-xl text-[12px] font-extrabold"
        render={<Link href="/coach/clubs" />}
        nativeButton={false}
      >
        افزودن به باشگاه
      </Button>
    </div>
  );
}
