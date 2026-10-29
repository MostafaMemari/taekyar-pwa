import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SessionCardSkeleton() {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-xl" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-1.5 h-3 w-1/3" />

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <Skeleton className="mt-1 size-4 shrink-0" />
      </div>
    </Card>
  );
}

export function SessionsSkeleton() {
  return (
    <output className="mt-3 flex flex-col gap-3" aria-label="در حال بارگذاری کلاس ها">
      <SessionCardSkeleton />
      <SessionCardSkeleton />
    </output>
  );
}
