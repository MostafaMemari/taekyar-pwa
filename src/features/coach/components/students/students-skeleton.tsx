import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StudentRowSkeleton() {
  return (
    <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3.5 w-32" />
        <div className="mt-2 flex gap-1.5">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-5 w-12 shrink-0" />
    </Card>
  );
}

export function StudentsSkeleton() {
  return (
    <output className="mt-3 flex flex-col gap-2.5" aria-label="در حال بارگذاری هنرجویان">
      <StudentRowSkeleton />
      <StudentRowSkeleton />
      <StudentRowSkeleton />
    </output>
  );
}
