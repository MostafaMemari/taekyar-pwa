import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ActionDock } from "@/features/coach/components/action-dock";

export function FormDock({
  cancelHref,
  submitLabel,
  icon: Icon,
  pending = false,
}: {
  cancelHref: string;
  submitLabel: string;
  icon?: LucideIcon;
  pending?: boolean;
}) {
  return (
    <ActionDock>
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--card-line)] bg-card/95 p-2 shadow-[var(--card-shadow)] backdrop-blur">
        <Button variant="outline" className="h-11 flex-1 rounded-xl" render={<Link href={cancelHref} />} nativeButton={false}>
          انصراف
        </Button>
        <Button type="submit" variant="brand" className="h-11 flex-[2] rounded-xl text-[12.5px]" disabled={pending}>
          {Icon ? <Icon data-icon="inline-start" aria-hidden="true" /> : null}
          {pending ? "در حال ذخیره..." : submitLabel}
        </Button>
      </div>
    </ActionDock>
  );
}
