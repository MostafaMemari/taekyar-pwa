import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AttendanceFormSkeleton() {
  return (
    <output className="flex flex-col gap-4" aria-label="در حال بارگذاری حضور و غیاب">
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="mt-1.5 h-3 w-1/3" />
        </div>
      </div>

      <Card className="gap-0 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="mt-1.5 h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </Card>

      <Skeleton className="h-[72px] w-full rounded-2xl" />

      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-5 w-28" />
        {[0, 1, 2].map((index) => (
          <Card key={index} className="gap-0 p-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="ms-auto h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-9 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </output>
  );
}
