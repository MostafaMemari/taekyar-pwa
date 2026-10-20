"use client";

import { Minus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { Button } from "@/components/ui/button";
import type { Club } from "@/lib/coach/coach-data";

export function ClubDetailActions({
  club,
  menuOpen,
  onMenuOpenChange,
}: {
  club: Club;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const openDeactivate = () => {
    onMenuOpenChange(false);
    setDeactivateOpen(true);
  };

  return (
    <>
      <SheetFrame open={menuOpen} onOpenChange={onMenuOpenChange} title="عملیات باشگاه" description={`عملیات قابل انجام برای ${club.name}`}>
        <div className="flex flex-col gap-1 py-1">
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-ink-body"
            onClick={() => {
              onMenuOpenChange(false);
              router.push(`/coach/clubs/${club.id}/edit`);
            }}
          >
            <Pencil className="text-ink-muted" aria-hidden="true" />
            ویرایش باشگاه
          </Button>
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
            onClick={openDeactivate}
          >
            <Minus aria-hidden="true" />
            غیرفعال کردن باشگاه
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="غیرفعال کردن باشگاه"
        description="تایید غیرفعال کردن باشگاه"
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          با غیرفعال کردن {club.name}، کلاس ها و حضور و غیاب این باشگاه از دسترس خارج می شود. این کار قابل بازگشت است.
        </p>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setDeactivateOpen(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12.5px] font-extrabold"
            onClick={() => {
              setDeactivateOpen(false);
              router.push("/coach/clubs");
            }}
          >
            غیرفعال کردن
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
