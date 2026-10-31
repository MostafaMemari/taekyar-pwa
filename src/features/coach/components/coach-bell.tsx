"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnreadNotifications } from "@/features/coach/hooks/use-unread-notifications";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

export function CoachBell({ className }: { className?: string }) {
  const { data: unread } = useUnreadNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="اعلان ها"
      className={cn("relative size-10 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20", className)}
      render={<Link href="/coach/notifications" />}
      nativeButton={false}
    >
      <Bell aria-hidden="true" />
      {unread ? (
        <Badge className="absolute -end-1 -top-1 size-[18px] justify-center rounded-full border-2 border-brand-600 bg-white p-0 text-[9px] font-extrabold text-accent-ink">
          {toPersianDigits(String(unread))}
        </Badge>
      ) : null}
    </Button>
  );
}
