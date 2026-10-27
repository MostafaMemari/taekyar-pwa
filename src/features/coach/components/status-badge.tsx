import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "danger" | "info" | "brand" | "neutral";

const STATUS_TONES: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  brand: "bg-brand-50 text-accent-ink",
  neutral: "bg-muted text-ink-muted",
};

export function StatusBadge({ tone = "neutral", className, children }: { tone?: StatusTone; className?: string; children: ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={cn("h-auto gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold leading-4", STATUS_TONES[tone], className)}
    >
      {children}
    </Badge>
  );
}
