import { Landmark } from "lucide-react";
import Link from "next/link";
import { ACTIVE_CLUB } from "@/features/coach/lib/coach-data";
import { cn } from "@/lib/utils";

export function GymContext({
  name = ACTIVE_CLUB.name,
  subtitle = "فضای کاری فعال شما — حضور و غیاب و کلاس بندی این باشگاه",
  actionLabel = "تغییر",
  className,
}: {
  name?: string;
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
        <b className="block truncate text-[13px] font-extrabold text-ink">{name}</b>
        <span className="mt-0.5 block truncate text-[10.5px] font-medium text-ink-subtle">{subtitle}</span>
      </span>
      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-extrabold text-accent-ink transition-colors group-hover:bg-brand-100">
        {actionLabel}
      </span>
    </Link>
  );
}
