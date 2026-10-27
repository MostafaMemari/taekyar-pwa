import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { LogoMark, TaekyarWordmark } from "@/components/shared/taekyar-mark";
import { cn } from "@/lib/utils";

type AuthHeaderProps = {
  subtitle: string;
  trailing?: ReactNode;
  className?: string;
};

export function AuthBrandHeader({ subtitle, trailing, className }: AuthHeaderProps) {
  return (
    <>
      <div className={cn("auth-brand flex flex-1 items-center gap-3", className)}>
        <LogoMark className="size-[52px] rounded-[18px]">
          <Sparkles className="size-6" aria-hidden="true" />
        </LogoMark>
        <span className="min-w-0">
          <TaekyarWordmark subtitle={subtitle} />
        </span>
      </div>
      {trailing ?? <span className="belt-motif w-16" aria-hidden="true" />}
    </>
  );
}
