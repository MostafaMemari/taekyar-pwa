"use client";

import { Minus, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { Button } from "@/components/ui/button";
import type { SessionDetail } from "@/lib/coach/session-data";

export function SessionDetailActions({
  detail,
  menuOpen,
  onMenuOpenChange,
}: {
  detail: SessionDetail;
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
      <SheetFrame open={menuOpen} onOpenChange={onMenuOpenChange} title="عملیات کلاس" description={`عملیات قابل انجام برای ${detail.name}`}>
        <div className="flex flex-col gap-1 py-1">
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-ink-body"
            onClick={() => {
              onMenuOpenChange(false);
              router.push(`/coach/sessions/${detail.id}/edit`);
            }}
          >
            <Pencil className="text-ink-muted" aria-hidden="true" />
            ویرایش کلاس
          </Button>
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
            onClick={openDeactivate}
          >
            <Minus aria-hidden="true" />
            غیرفعال سازی کلاس
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame open={deactivateOpen} onOpenChange={setDeactivateOpen} title="غیرفعال سازی کلاس" description="تایید غیرفعال سازی کلاس">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          با غیرفعال سازی {detail.name}، این کلاس از لیست کلاس های فعال خارج می شود و حضور و غیاب جدید برای آن ثبت نمی شود.
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
              router.push("/coach/sessions");
            }}
          >
            غیرفعال سازی
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
