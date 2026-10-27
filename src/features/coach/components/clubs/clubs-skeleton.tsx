import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ClubCardSkeleton() {
  return (
    <Card className="gap-0 p-0">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Skeleton className="size-11 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-1.5 flex gap-1.5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      </div>

      <div className="grid grid-cols-2 border-y border-[var(--line-2)] bg-[var(--surface-2)]">
        {[0, 1].map((index) => (
          <div key={index} className={cn("flex flex-col items-center py-2.5", index > 0 && "border-s border-[var(--line-2)]")}>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="mt-1.5 h-2 w-10" />
          </div>
        ))}
      </div>

      <div className="flex items-start gap-1.5 px-4 pt-3">
        <Skeleton className="mt-1 size-3.5 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-4 pt-3">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      </div>
    </Card>
  );
}

export function ClubsSkeleton() {
  return (
    <output className="mt-4 flex flex-col gap-3.5" aria-label="در حال بارگذاری باشگاه ها">
      <ClubCardSkeleton />
      <ClubCardSkeleton />
    </output>
  );
}
