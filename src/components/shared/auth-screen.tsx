"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AuthBrandHeader } from "@/components/shared/auth-brand-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthScreenProps = {
  subtitle: string;
  backHref: string;
  trailing?: ReactNode;
  showHeader?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
};

export function AuthScreen({ subtitle, backHref, trailing, showHeader = true, children, footer, contentClassName }: AuthScreenProps) {
  const router = useRouter();

  return (
    <main className="auth-shell app-frame">
      <section className="flex flex-1 flex-col px-5 pb-8 pt-7">
        {showHeader ? (
          <header className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              aria-label="بازگشت"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push(backHref);
              }}
            >
              <ChevronRight data-icon="inline-start" aria-hidden="true" />
            </Button>
            <AuthBrandHeader subtitle={subtitle} trailing={trailing} />
          </header>
        ) : null}

        <div className={cn("flex flex-1 flex-col", showHeader ? "mt-9" : null, contentClassName)}>{children}</div>

        {footer ? <div className="mt-auto pt-10 text-center text-[12px] text-ink-subtle">{footer}</div> : null}
      </section>
    </main>
  );
}
