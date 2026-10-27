"use client";

import { Loader2, Minus, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useChangeClubStatus } from "@/features/coach/hooks/use-club-mutations";
import type { ClubRecord } from "@/features/coach/lib/club-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

export function ClubDetailActions({
  club,
  menuOpen,
  onMenuOpenChange,
}: {
  club: ClubRecord;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const changeStatus = useChangeClubStatus(club.id);

  const isActive = club.isActive;
  const pending = changeStatus.isMutating;
  const error = changeStatus.error ? apiErrorMessage(changeStatus.error) : "";

  const openConfirm = () => {
    onMenuOpenChange(false);
    changeStatus.reset();
    setConfirmOpen(true);
  };

  const applyStatus = async () => {
    try {
      await changeStatus.trigger(!isActive);
      setConfirmOpen(false);
      if (isActive) router.push("/coach/clubs");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
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
            className={
              isActive
                ? "h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
                : "h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12.5px] font-extrabold text-ink-body"
            }
            onClick={openConfirm}
          >
            {isActive ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isActive ? "غیرفعال کردن باشگاه" : "فعال کردن باشگاه"}
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? "غیرفعال کردن باشگاه" : "فعال کردن باشگاه"}
        description={isActive ? "تایید غیرفعال کردن باشگاه" : "تایید فعال کردن باشگاه"}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          {isActive
            ? `با غیرفعال کردن ${club.name}، کلاس ها و حضور و غیاب این باشگاه از دسترس خارج می شود. این کار قابل بازگشت است.`
            : `با فعال کردن ${club.name}، دوباره می توانید کلاس و حضور و غیاب آن را مدیریت کنید.`}
        </p>

        {error ? <p className="pt-2 text-[11px] font-bold leading-5 text-danger">{error}</p> : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setConfirmOpen(false)} disabled={pending}>
            انصراف
          </Button>
          <Button
            variant={isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12.5px] font-extrabold"
            onClick={applyStatus}
            disabled={pending}
          >
            {pending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {pending ? "در حال ذخیره..." : isActive ? "غیرفعال کردن" : "فعال کردن"}
          </Button>
        </div>
      </SheetFrame>
    </>
  );
}
