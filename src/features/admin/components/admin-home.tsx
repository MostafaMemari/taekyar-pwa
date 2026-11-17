"use client";

import { Award, CalendarRange, ChevronLeft, LogOut, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminBand } from "@/features/admin/components/admin-band";
import { logoutSession } from "@/features/auth/api";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/admin/belts", title: "کمربندها", description: "رتبه ها، سطح و بازه اعطا", icon: Award, tile: "bg-brand-50 text-accent-ink" },
  {
    href: "/admin/age-categories",
    title: "رده های سنی",
    description: "بازه تاریخ تولد هر رده",
    icon: CalendarRange,
    tile: "bg-muted text-ink-muted",
  },
  {
    href: "/admin/belt-exams",
    title: "آزمون های کمربند",
    description: "دوره ها، جنسیت و بازه کمربند",
    icon: Trophy,
    tile: "bg-warning-soft text-warning",
  },
];

export function AdminHome() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await logoutSession();
    router.replace("/login");
  };

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand
          title="پنل مدیریت"
          subtitle="مدیریت داده های پایه و منابع سامانه"
          icon={ShieldCheck}
          chip={
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white">
              ادمین
            </span>
          }
          action={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="خروج از حساب"
              disabled={pending}
              onClick={signOut}
              className="size-11 shrink-0 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <LogOut aria-hidden="true" />
            </Button>
          }
        />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5", PAGE_ENTER)}>
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.href} href={section.href} className="block transition duration-150 active:scale-[0.995]">
              <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", section.tile)} aria-hidden="true">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink">{section.title}</b>
                  <span className="mt-0.5 block truncate text-[12px] font-semibold text-ink-subtle">{section.description}</span>
                </span>

                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Card>
            </Link>
          );
        })}
      </CoachSheet>
    </main>
  );
}
