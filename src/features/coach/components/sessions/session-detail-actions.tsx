"use client";

import { Loader2, Minus, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useChangeSessionStatus } from "@/features/coach/hooks/use-session-mutations";
import type { ClassSessionRecord } from "@/features/coach/lib/session-api";
import { ApiError, apiErrorMessage } from "@/lib/api/client";

export function SessionDetailActions({
  session,
  menuOpen,
  onMenuOpenChange,
}: {
  session: ClassSessionRecord;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const changeStatus = useChangeSessionStatus(session.id);

  const isActive = session.isActive;
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
      if (isActive) router.push("/coach/sessions");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <>
      <SheetFrame
        open={menuOpen}
        onOpenChange={onMenuOpenChange}
        title="عملیات کلاس"
        description={`عملیات قابل انجام برای ${session.name}`}
      >
        <div className="flex flex-col gap-1 py-1">
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12px] font-extrabold text-ink-body"
            onClick={() => {
              onMenuOpenChange(false);
              router.push(`/coach/sessions/${session.id}/edit`);
            }}
          >
            <Pencil className="text-ink-muted" aria-hidden="true" />
            ویرایش کلاس
          </Button>
          <Button
            variant="ghost"
            className={
              isActive
                ? "h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12px] font-extrabold text-destructive hover:bg-danger-soft hover:text-danger"
                : "h-12 w-full justify-start gap-3 rounded-xl px-3 text-[12px] font-extrabold text-ink-body"
            }
            onClick={openConfirm}
          >
            {isActive ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {isActive ? "غیرفعال کردن کلاس" : "فعال کردن کلاس"}
          </Button>
        </div>
      </SheetFrame>

      <SheetFrame
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? "غیرفعال کردن کلاس" : "فعال کردن کلاس"}
        description={isActive ? "تایید غیرفعال کردن کلاس" : "تایید فعال کردن کلاس"}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[11px] leading-5 text-ink-muted">
          {isActive
            ? `با غیرفعال کردن ${session.name}، این کلاس از فهرست کلاس های فعال خارج می شود. این کار قابل بازگشت است.`
            : `با فعال کردن ${session.name}، دوباره می توانید این کلاس را مدیریت کنید.`}
        </p>

        {error ? <p className="pt-2 text-[11px] font-bold leading-5 text-danger">{error}</p> : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setConfirmOpen(false)} disabled={pending}>
            انصراف
          </Button>
          <Button
            variant={isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12px] font-extrabold"
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
