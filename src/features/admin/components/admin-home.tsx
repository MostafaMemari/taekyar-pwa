"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { logoutSession } from "@/features/auth/api";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10" aria-hidden="true">
              <ShieldCheck className="size-5 text-white" />
            </span>
            <span className="min-w-0">
              <span className="flex min-w-0 items-center gap-2">
                <h1 className="page-title min-w-0 truncate">پنل مدیریت</h1>
                <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white">
                  ادمین
                </span>
              </span>
              <p className="truncate text-[12px] font-medium leading-5 text-white/70">مدیریت داده های پایه و منابع سامانه</p>
            </span>
          </div>

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
        </div>
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-3", PAGE_ENTER)}>
        <Card className="items-center gap-2 rounded-2xl px-4 py-8 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-accent-ink" aria-hidden="true">
            <ShieldCheck className="size-6" />
          </span>
          <b className="text-[13px] font-extrabold text-ink">این بخش در حال آماده سازی است</b>
          <p className="text-[12px] font-medium text-ink-subtle">همه بخش های مدیریت از همین صفحه اضافه می شوند</p>
        </Card>
      </CoachSheet>
    </main>
  );
}
