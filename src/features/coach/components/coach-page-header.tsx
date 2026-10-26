import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function CoachPageHeader({
  title,
  backHref,
  subtitle,
  action,
}: {
  title: string;
  backHref: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="بازگشت"
        className="-ms-2 size-10 shrink-0 rounded-xl text-ink-body"
        render={<Link href={backHref} />}
        nativeButton={false}
      >
        <ChevronRight aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-extrabold leading-6 text-ink">{title}</h1>
        {subtitle ? <p className="truncate text-[10.5px] font-medium text-ink-subtle">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
