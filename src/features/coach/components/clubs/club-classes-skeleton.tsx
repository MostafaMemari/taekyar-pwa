import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/features/coach/components/section-heading";

export function ClubClassesSkeleton() {
  return (
    <section>
      <SectionHeading title="کلاس های باشگاه" action={<Skeleton className="h-5 w-14 rounded-full" />} />

      <output className="flex flex-col gap-2.5" aria-label="در حال بارگذاری کلاس های باشگاه">
        {[0, 1].map((index) => (
          <Card key={index} className="flex-row items-center gap-3 px-3.5 py-3">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-2/5" />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="size-4 shrink-0" />
          </Card>
        ))}
      </output>
    </section>
  );
}
