import { Bell, Landmark } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ATTENDANCE_META, type AttendanceStatus } from "@/components/coach/coach-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/digits";
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

export function CoachBell({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="اعلان ها"
      className={cn("relative size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20", className)}
    >
      <Bell aria-hidden="true" />
      <Badge className="absolute -end-1 -top-1 size-[18px] justify-center rounded-full border-2 border-brand-600 bg-white p-0 text-[8.5px] font-extrabold text-accent-ink">
        ۲
      </Badge>
    </Button>
  );
}

export function AttendanceStatusText({ status, className }: { status: AttendanceStatus; className?: string }) {
  const meta = ATTENDANCE_META[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-[10.5px] font-extrabold",
        status === "PRESENT" && "text-success",
        status === "LATE" && "text-warning",
        status === "ABSENT" && "text-danger",
        status === "EXCUSED" && "text-info",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function PersonAvatar({ name, className, fallbackClassName }: { name: string; className?: string; fallbackClassName?: string }) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className={cn("bg-brand-50 text-[13px] font-extrabold text-accent-ink", fallbackClassName)}>
        {name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}

export function SectionHeading({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      <span className="h-4 w-1 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />
      <h2 className="text-[14px] font-extrabold text-ink">{title}</h2>
      {action ? <div className="ms-auto">{action}</div> : null}
    </div>
  );
}

export function SessionTime({ start, end, className }: { start: string; end: string; className?: string }) {
  return (
    <span className={className}>
      <span dir="ltr">{toPersianDigits(start)}</span> تا <span dir="ltr">{toPersianDigits(end)}</span>
    </span>
  );
}

export function GymContext({
  subtitle = "فضای کاری فعال شما — حضور و غیاب و کلاس بندی این باشگاه",
  actionLabel = "تغییر",
  className,
}: {
  subtitle?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <Link
      href="/coach/clubs"
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-[var(--card-line)] bg-card p-3 shadow-[var(--card-shadow)] transition duration-150 active:scale-[0.99]",
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
        <Landmark className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-extrabold text-ink">باشگاه شهدای گمنام</b>
        <span className="mt-0.5 block truncate text-[10.5px] font-medium text-ink-subtle">{subtitle}</span>
      </span>
      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-accent-ink transition-colors group-hover:bg-brand-100">
        {actionLabel}
      </span>
    </Link>
  );
}
