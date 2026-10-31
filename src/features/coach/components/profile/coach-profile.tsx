"use client";

import { Bell, ChevronLeft, type LucideIcon, Palette, Pencil, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { BeltStrip } from "@/components/shared/taekyar-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachBell } from "@/features/coach/components/coach-bell";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { StatusBadge } from "@/features/coach/components/status-badge";
import { useCoachProfile } from "@/features/coach/hooks/use-coach-profile";
import { useUnreadNotifications } from "@/features/coach/hooks/use-unread-notifications";
import { coachBeltLabel, GENDER_META } from "@/features/coach/lib/coach-data";
import { beltKeyOf } from "@/features/coach/lib/students-options";
import { apiErrorMessage } from "@/lib/api/client";
import { toPersianDigits } from "@/lib/digits";
import { toJalaliDate } from "@/lib/jalali";
import { PROVINCES } from "@/lib/provinces";
import { getStudentBeltMeta } from "@/lib/student-belts";

const MENU_ITEMS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Pencil, label: "ویرایش پروفایل", href: "/coach/profile/edit" },
  { icon: Bell, label: "اعلان ها", href: "/coach/notifications" },
  { icon: ShieldCheck, label: "نشست ها و امنیت", href: "/coach/settings/security" },
  { icon: Palette, label: "نمایش و رنگ", href: "/coach/settings/appearance" },
  { icon: Settings, label: "تنظیمات", href: "/coach/settings" },
];

function MenuRow({ icon: Icon, label, href, badge }: { icon: LucideIcon; label: string; href: string; badge?: string }) {
  return (
    <Button
      variant="ghost"
      className="h-12 w-full justify-start gap-3 rounded-none px-4 text-[12px] font-extrabold text-ink-body hover:bg-muted/50"
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

export function CoachProfile() {
  const { data: profile, error, isLoading, mutate } = useCoachProfile();
  const { data: unread } = useUnreadNotifications();

  if (error) {
    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <ErrorState title="خواندن پروفایل انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
      </main>
    );
  }

  if (isLoading && !profile) {
    return (
      <main className="px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-64 rounded-2xl" />
      </main>
    );
  }

  if (!profile) return null;

  const beltKey = profile.belt ? beltKeyOf(profile.belt) : null;
  const belt = beltKey ? getStudentBeltMeta(beltKey) : null;
  const province = PROVINCES.find((option) => option.value === profile.province)?.label ?? profile.province;
  const infoRows = [
    { label: "نام و نام خانوادگی", value: profile.fullName },
    { label: "کد ملی", value: toPersianDigits(profile.nationalCode), ltr: true },
    { label: "جنسیت", value: GENDER_META[profile.gender].label },
    { label: "استان", value: province },
    { label: "تاریخ تولد", value: profile.birthDate ? toPersianDigits(toJalaliDate(profile.birthDate)) : "—", ltr: true },
    { label: "شماره موبایل", value: toPersianDigits(profile.mobile), ltr: true },
    { label: "کمربند", value: "", belt: true },
  ];

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300">
      <CoachBand>
        <div className="flex items-center justify-between gap-3">
          <span className="hero-chip border-white/20 bg-white/10 text-white backdrop-blur-sm">پروفایل مربی</span>
          <CoachBell />
        </div>

        <div className="mt-3 flex items-center gap-3.5">
          <Avatar className="size-16 shrink-0 ring-2 ring-white/25">
            <AvatarFallback className="bg-white/15 text-xl font-extrabold text-white">{profile.fullName.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[20px] font-extrabold leading-7">{profile.fullName}</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-white/65" dir="ltr">
              {toPersianDigits(profile.mobile)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {beltKey ? (
                <span className="meta-glass">
                  <span className="size-2.5 rounded-full bg-ink ring-2 ring-white/30" aria-hidden="true" />
                  {coachBeltLabel(beltKey)}
                </span>
              ) : null}
              <span className="meta-glass">{province}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-xl bg-white px-3 text-[11px] font-extrabold text-accent-ink hover:bg-white/90"
            render={<Link href="/coach/profile/edit" />}
            nativeButton={false}
          >
            <Pencil data-icon="inline-start" aria-hidden="true" />
            ویرایش
          </Button>
        </div>
      </CoachBand>

      <CoachSheet className="flex flex-col gap-5">
        <Card className="gap-0 p-0">
          <div className="px-4 pt-4">
            <SectionHeading title="اطلاعات مربی" className="mb-0" />
          </div>

          <dl className="mt-2 px-4 pb-2">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 border-b border-[var(--line-2)] py-2.5 last:border-b-0"
              >
                <dt className="text-[11px] font-medium text-ink-subtle">{row.label}</dt>
                <dd className="flex items-center gap-1.5 text-[12px] font-extrabold text-ink" dir={row.ltr ? "ltr" : undefined}>
                  {row.belt ? (
                    belt && beltKey ? (
                      <>
                        <BeltStrip color={belt.color} knotColor="#111827" stripes={belt.stripeCount} className="size-auto w-9" />
                        <span>{coachBeltLabel(beltKey)}</span>
                      </>
                    ) : (
                      <span>ثبت نشده</span>
                    )
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-[var(--line-2)] px-4 py-2">
            <Button
              variant="ghost"
              className="w-full gap-1.5 rounded-xl text-[12px] font-extrabold text-accent-ink hover:bg-brand-50"
              render={<Link href="/coach/profile/edit" />}
              nativeButton={false}
            >
              <Pencil data-icon="inline-start" aria-hidden="true" />
              ویرایش پروفایل
            </Button>
          </div>
        </Card>

        <section>
          <SectionHeading title="تنظیمات" />
          <Card className="gap-0 p-0">
            {MENU_ITEMS.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 ? <Separator /> : null}
                <MenuRow
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  badge={item.label === "اعلان ها" && unread ? `${toPersianDigits(String(unread))} خوانده نشده` : undefined}
                />
              </Fragment>
            ))}
          </Card>

          <Card className="mt-3 gap-0 p-0">
            <LogoutButton />
          </Card>
        </section>
      </CoachSheet>
    </main>
  );
}
