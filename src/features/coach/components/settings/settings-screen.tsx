"use client";

import { Bell, CalendarDays, ChevronLeft, Clock, Info, Languages, type LucideIcon, Moon, ShieldCheck, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/shared/taekyar-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CoachPageHeader } from "@/features/coach/components/coach-page-header";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useUnreadNotifications } from "@/features/coach/hooks/use-unread-notifications";
import { toPersianDigits } from "@/lib/digits";
import { ACCENT_SWATCH, ACCENTS } from "@/lib/theme";
import { useThemeStore } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

function LinkRow({ href, icon: Icon, label, badge }: { href: string; icon: LucideIcon; label: string; badge?: string }) {
  return (
    <Button
      variant="ghost"
      className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12px] font-semibold text-ink-body hover:bg-muted/50"
      render={<Link href={href} />}
      nativeButton={false}
    >
      <Icon className="text-ink-muted" aria-hidden="true" />
      <span className="flex-1 text-start">{label}</span>
      {badge ? (
        <StatusBadge tone="brand" className="shrink-0">
          {badge}
        </StatusBadge>
      ) : null}
      <ChevronLeft className="text-ink-faint" aria-hidden="true" />
    </Button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  ltr,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "brand";
  ltr?: boolean;
}) {
  return (
    <div className="flex h-12 items-center gap-3 px-4 text-[12px] font-semibold text-ink-body">
      <Icon className="text-ink-muted" aria-hidden="true" />
      <span className="flex-1 text-start">{label}</span>
      <StatusBadge tone={tone} className="shrink-0">
        <span dir={ltr ? "ltr" : undefined}>{value}</span>
      </StatusBadge>
    </div>
  );
}

export function SettingsScreen() {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccent = useThemeStore((state) => state.setAccent);
  const { data: unread } = useUnreadNotifications();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <main className="min-h-dvh px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachPageHeader title="تنظیمات" backHref="/coach/profile" />

      <section className="mt-5">
        <SectionHeading
          title="نمایش و رنگ"
          action={
            <Button
              variant="link"
              className="h-auto p-0 text-[12px] font-semibold text-accent-ink"
              render={<Link href="/coach/settings/appearance" />}
              nativeButton={false}
            >
              تنظیمات کامل
              <ChevronLeft data-icon="inline-end" aria-hidden="true" />
            </Button>
          }
        />

        <Card className="gap-0 p-3">
          <ToggleGroup
            aria-label="حالت نمایش"
            value={[mode]}
            onValueChange={(next) => {
              const selected = next[0] as "light" | "dark" | undefined;
              if (selected) setMode(selected);
            }}
            variant="segmented"
            spacing={1}
            className="flex w-full rounded-xl bg-muted p-1"
          >
            <ToggleGroupItem value="light" className="h-9 flex-1 gap-1.5 rounded-lg text-[12px] font-semibold">
              <Sun aria-hidden="true" />
              روشن
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="h-9 flex-1 gap-1.5 rounded-lg text-[12px] font-semibold">
              <Moon aria-hidden="true" />
              تاریک
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[var(--line-2)] pt-3.5">
            <span className="text-[12px] font-bold text-ink-subtle">رنگ اصلی</span>
            <div className="flex items-center gap-2">
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={accent === option.id}
                  title={option.label}
                  onClick={() => setAccent(option.id)}
                  className={cn(
                    "size-7 rounded-full transition-opacity hover:opacity-80",
                    accent === option.id && "ring-2 ring-brand-600 ring-offset-2 ring-offset-card",
                  )}
                  style={{ background: ACCENT_SWATCH[option.id] }}
                />
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <SectionHeading title="حساب و امنیت" />
        <Card className="gap-0 overflow-hidden p-0">
          <LinkRow href="/coach/settings/security" icon={ShieldCheck} label="نشست ها و امنیت" />
          <Separator />
          <LinkRow
            href="/coach/notifications"
            icon={Bell}
            label="اعلان ها"
            badge={unread ? `${toPersianDigits(String(unread))} خوانده نشده` : undefined}
          />
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12px] font-semibold text-ink-body hover:bg-muted/50"
            onClick={() => setAboutOpen(true)}
          >
            <Info className="text-ink-muted" aria-hidden="true" />
            <span className="flex-1 text-start">درباره تک یار</span>
            <ChevronLeft className="text-ink-faint" aria-hidden="true" />
          </Button>
        </Card>
      </section>

      <section className="mt-6">
        <SectionHeading title="زبان و منطقه" />
        <Card className="gap-0 overflow-hidden p-0">
          <InfoRow icon={Languages} label="زبان برنامه" value="فارسی" tone="success" />
          <Separator />
          <InfoRow icon={CalendarDays} label="تقویم" value="هجری شمسی" tone="brand" />
          <Separator />
          <InfoRow icon={Clock} label="ساعت رسمی" value="ایران (UTC+3:30)" ltr />
        </Card>
      </section>

      <Card className="mt-6 gap-0 p-0">
        <LogoutButton />
      </Card>

      <p className="mt-5 text-center text-[12px] font-semibold text-ink-faint">تک یار، نسخه نمایشی رابط کاربری</p>

      <SheetFrame open={aboutOpen} onOpenChange={setAboutOpen} title="درباره تک یار" description="معرفی برنامه">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <LogoMark className="size-16 rounded-[22px]" />
          <div>
            <b className="block text-[15px] font-extrabold text-ink">تک یار</b>
            <span className="mt-0.5 block text-[12px] font-semibold text-ink-subtle">همیار تمرین تکواندو: هنرجو، مربی، باشگاه</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            <StatusBadge tone="neutral">نمونه رابط کاربری</StatusBadge>
            <StatusBadge tone="brand">فارسی و راست به چپ</StatusBadge>
          </div>
          <p className="text-[12px] leading-6 text-ink-muted">
            این نسخه برای بررسی جریان های مربی ساخته شده است؛ اطلاعات از حساب شما در سرور خوانده می شود.
          </p>
        </div>
      </SheetFrame>
    </main>
  );
}
