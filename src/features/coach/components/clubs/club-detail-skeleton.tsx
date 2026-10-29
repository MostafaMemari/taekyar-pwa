import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ClubClassesSkeleton } from "./club-classes-skeleton";

export function ClubDetailSkeleton() {
  return (
    <main>
      <CoachBand watermark="باشگاه">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href="/coach/clubs" />}
            nativeButton={false}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <span className="size-10 rounded-full border border-white/20 bg-white/10" aria-hidden="true" />
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <Skeleton className="size-16 shrink-0 rounded-2xl bg-white/20" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-1/2 bg-white/25" />
            <Skeleton className="mt-1.5 h-3 w-3/4 bg-white/15" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full bg-white/15" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </CoachBand>

      <CoachSheet>
        <output className="flex flex-col gap-4" aria-label="در حال بارگذاری مشخصات باشگاه">
          <Card className="gap-0 overflow-hidden p-0">
            <Skeleton className="h-24 w-full rounded-none" />
            <div className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </Card>

          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((index) => (
              <Card key={index} className="items-center gap-1.5 p-3 text-center">
                <Skeleton className="size-8 rounded-lg" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-2 w-12" />
              </Card>
            ))}
          </div>

          <ClubClassesSkeleton />

          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </output>
      </CoachSheet>
    </main>
  );
}
