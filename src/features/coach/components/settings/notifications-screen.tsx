"use client";

import { Camera, Check, Info, Loader2, type LucideIcon, Medal, ShieldCheck, Trophy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { ErrorState } from "@/features/coach/components/error-state";
import { useMarkAllNotificationsRead } from "@/features/coach/hooks/use-notification-mutations";
import { useNotifications } from "@/features/coach/hooks/use-notifications";
import type { NotificationRecord, NotificationType } from "@/features/coach/lib/notification-api";
import { apiErrorMessage } from "@/lib/api/client";
import { toJalaliDate } from "@/lib/jalali";
import { cn } from "@/lib/utils";

const NOTIFICATION_META: Record<NotificationType, { icon: LucideIcon; box: string; bar: string }> = {
  INSURANCE_EXPIRING: { icon: ShieldCheck, box: "bg-warning-soft text-warning", bar: "bg-warning" },
  PHOTO_EXPIRING: { icon: Camera, box: "bg-info-soft text-info", bar: "bg-info" },
  BELT_UPGRADE_DUE: { icon: Medal, box: "bg-brand-50 text-accent-ink", bar: "bg-brand-600" },
  BELT_PROMOTION: { icon: Trophy, box: "bg-success-soft text-success", bar: "bg-success" },
  GENERAL: { icon: Info, box: "bg-muted text-ink-muted", bar: "bg-ink-faint" },
};

const FILTERS: { value: "all" | "unread" | NotificationType; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "unread", label: "خوانده نشده" },
  { value: "INSURANCE_EXPIRING", label: "بیمه ورزشی" },
  { value: "PHOTO_EXPIRING", label: "عکس پرونده" },
  { value: "BELT_UPGRADE_DUE", label: "ارتقاء کمربند" },
  { value: "BELT_PROMOTION", label: "تبریک ارتقاء" },
  { value: "GENERAL", label: "عمومی" },
];

const relativeFormatter = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });

function relativeTime(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return relativeFormatter.format(days, "day");

  return toJalaliDate(iso);
}

function NotificationCard({ notification }: { notification: NotificationRecord }) {
  const meta = NOTIFICATION_META[notification.type];
  const Icon = meta.icon;

  return (
    <Card className={cn("relative flex-row items-start gap-3 rounded-2xl px-3.5 py-3.5", notification.isRead && "opacity-80")}>
      {notification.isRead ? null : <span className={cn("absolute inset-y-3 end-0 w-1 rounded-full", meta.bar)} aria-hidden="true" />}

      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", meta.box)}>
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 pe-2">
        <div className="flex items-center gap-2">
          <b className="truncate text-[13px] font-extrabold text-ink">{notification.title}</b>
          {notification.isRead ? null : <span className="size-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />}
        </div>
        <p className="mt-1 text-[11.5px] leading-5 text-ink-subtle">{notification.body}</p>
        <p className="mt-1.5 text-[10px] font-semibold text-ink-faint">{relativeTime(notification.sentAt)}</p>
      </div>
    </Card>
  );
}

export function NotificationsScreen() {
  const { data, error, isLoading, mutate } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");

  const notifications = data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const visible = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader
        title="اعلان ها"
        backHref="/coach/profile"
        action={
          <Button
            variant="ghost"
            size="icon"
            aria-label="علامت گذاری همه به عنوان خوانده شده"
            title="علامت گذاری همه به عنوان خوانده شده"
            className="size-10 rounded-xl text-ink-body"
            onClick={() => void markAll.trigger()}
            disabled={!unreadCount || markAll.isMutating}
          >
            {markAll.isMutating ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
          </Button>
        }
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
              filter === option.value
                ? "border-transparent bg-brand-600 text-white"
                : "border-[var(--line-2)] bg-card text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {markAll.error ? <p className="mt-3 text-[11px] font-bold leading-5 text-danger">{apiErrorMessage(markAll.error)}</p> : null}

      {error ? (
        <ErrorState className="mt-4" title="خواندن اعلان ها انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      ) : isLoading && !data ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-[92px] rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="mt-4 rounded-2xl px-4 py-6 text-center text-[12px] font-semibold text-ink-muted">اعلانی برای نمایش نیست.</Card>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          {visible.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </main>
  );
}
