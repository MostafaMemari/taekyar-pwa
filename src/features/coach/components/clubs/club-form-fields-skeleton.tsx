"use client";

import { Landmark } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSection } from "@/features/coach/components/form-section";

export function ClubFormFieldsSkeleton() {
  return (
    <FormSection icon={Landmark} title="اطلاعات باشگاه">
      <output className="flex flex-col gap-3.5" aria-label="در حال بارگذاری اطلاعات باشگاه">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="min-h-24 w-full rounded-xl" />
          <Skeleton className="h-3 w-16 self-end" />
        </div>
        <Skeleton className="h-[68px] w-full rounded-xl" />
      </output>
    </FormSection>
  );
}
