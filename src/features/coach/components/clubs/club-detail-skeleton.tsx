import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ClubClassesSkeleton } from "./club-classes-skeleton";

export function ClubDetailSkeleton() {
  return (
    <main>
      <CoachBand>
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-11 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href="/coach/clubs" />}
            nativeButton={false}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <span className="size-11 rounded-full border border-white/20 bg-white/10" aria-hidden="true" />
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <Skeleton className="size-16 shrink-0 rounded-2xl bg-white/20" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-1/2 bg-white/25" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full bg-white/15" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </CoachBand>

      <CoachSheet>
        <output className="flex flex-col gap-4" aria-label="در حال بارگذاری مشخصات باشگاه">
          <div className="grid h-11 w-full grid-cols-2 gap-1 rounded-full bg-muted p-1">
            <Skeleton className="rounded-full" />
            <Skeleton className="rounded-full" />
          </div>

          <ClubClassesSkeleton />
        </output>
      </CoachSheet>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 flex justify-center">
        <div className="pointer-events-auto grid w-full max-w-md grid-cols-2 gap-3 px-4">
          <Skeleton className="h-12 rounded-full" />
          <Skeleton className="h-12 rounded-full" />
        </div>
      </div>
    </main>
  );
}
