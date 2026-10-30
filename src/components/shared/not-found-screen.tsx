"use client";

import { ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function NotFoundScreen({
  title,
  description,
  backHref,
  backLabel,
  className,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  className?: string;
}) {
  return (
    <Empty className={cn("rounded-3xl border border-[var(--card-line)] bg-card p-6 shadow-[var(--card-shadow)]", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12 rounded-2xl bg-brand-50 text-accent-ink">
          <SearchX className="size-6" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="text-[15px] font-extrabold text-ink">{title}</EmptyTitle>
        <EmptyDescription className="text-[11px] leading-5 text-ink-subtle">{description}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button
          variant="brand"
          className="h-11 w-full rounded-xl text-[12px] font-extrabold"
          render={<Link href={backHref} />}
          nativeButton={false}
        >
          <ChevronRight data-icon="inline-start" aria-hidden="true" />
          {backLabel}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
