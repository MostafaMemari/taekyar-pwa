"use client";

import { ChevronLeft, Download, Globe, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AdminBand } from "@/features/admin/components/admin-band";
import { FederationImportSheet } from "@/features/admin/components/federation-import-sheet";
import { FederationSyncSheet } from "@/features/admin/components/federation-sync-sheet";
import { CoachBand } from "@/features/coach/components/coach-band";
import { CoachSheet } from "@/features/coach/components/coach-sheet";
import { PAGE_ENTER } from "@/features/coach/components/page-enter";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    key: "import",
    title: "ورود هنرجویان مربی",
    description: "ثبت هنرجوها از سامانه فدراسیون",
    icon: Download,
    tile: "bg-success-soft text-success",
  },
  {
    key: "sync",
    title: "همگام سازی هنرجویان",
    description: "به روزرسانی کمربند و پروفایل با فدراسیون",
    icon: RefreshCw,
    tile: "bg-info-soft text-info",
  },
] as const;

export function FederationScreen() {
  const [openAction, setOpenAction] = useState<"import" | "sync" | null>(null);

  return (
    <main>
      <CoachBand className={PAGE_ENTER}>
        <AdminBand title="فدراسیون" icon={Globe} backHref="/admin" />
      </CoachBand>

      <CoachSheet className={cn("flex flex-col gap-2.5 pb-10", PAGE_ENTER)}>
        {ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => setOpenAction(action.key)}
              className="block w-full text-start transition duration-150 active:scale-[0.995]"
            >
              <Card className="flex-row items-center gap-3 rounded-2xl px-3 py-3">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", action.tile)} aria-hidden="true">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-extrabold text-ink">{action.title}</b>
                  <span className="mt-0.5 block truncate text-[12px] font-semibold text-ink-subtle">{action.description}</span>
                </span>

                <ChevronLeft className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              </Card>
            </button>
          );
        })}
      </CoachSheet>

      <FederationImportSheet open={openAction === "import"} onOpenChange={(open) => setOpenAction(open ? "import" : null)} />
      <FederationSyncSheet open={openAction === "sync"} onOpenChange={(open) => setOpenAction(open ? "sync" : null)} />
    </main>
  );
}
