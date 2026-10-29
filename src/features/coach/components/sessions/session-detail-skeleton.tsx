import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";

export function SessionDetailSkeleton() {
  return (
    <main>
      <CoachBand watermark="کلاس">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="بازگشت"
            className="size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            render={<Link href="/coach/sessions" />}
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
        <output className="flex flex-col gap-4" aria-label="در حال بارگذاری مشخصات کلاس">
          <Card className="gap-0 p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="mt-1.5 h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[var(--line-1)] pt-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-2/5" />
            </div>
          </Card>

          <Skeleton className="h-16 w-full rounded-xl" />

          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-5 w-28" />
            {[0, 1, 2].map((index) => (
              <Card key={index} className="flex-row items-center gap-3 px-4 py-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-2/5" />
                  <Skeleton className="mt-1.5 h-2.5 w-1/4" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </Card>
            ))}
          </div>
        </output>
      </CoachSheet>
    </main>
  );
}
