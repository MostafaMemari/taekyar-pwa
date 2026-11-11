"use client";

import { Loader2, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { CoachActionMenu } from "@/features/coach/components/coach-action-menu";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useChangeSessionStatus, useDeleteSession } from "@/features/coach/hooks/use-session-mutations";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const changeStatus = useChangeSessionStatus(session.id);
  const deleteSession = useDeleteSession();

  const isActive = session.isActive;
  const pending = changeStatus.isMutating;
  const error = changeStatus.error ? apiErrorMessage(changeStatus.error) : "";
  const deletePending = deleteSession.isMutating;
  const deleteError = deleteSession.error ? apiErrorMessage(deleteSession.error) : "";

  const openConfirm = () => {
    onMenuOpenChange(false);
    changeStatus.reset();
    setConfirmOpen(true);
  };

  const openDelete = () => {
    onMenuOpenChange(false);
    deleteSession.reset();
    setDeleteOpen(true);
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

  const applyDelete = async () => {
    try {
      await deleteSession.trigger(session.id);
      setDeleteOpen(false);
      router.push("/coach/sessions");
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
        <CoachActionMenu
          items={[
            {
              icon: Pencil,
              label: "ویرایش کلاس",
              onSelect: () => {
                onMenuOpenChange(false);
                router.push(`/coach/sessions/${session.id}/edit`);
              },
            },
            {
              icon: isActive ? Minus : Plus,
              label: isActive ? "غیرفعال کردن کلاس" : "فعال کردن کلاس",
              tone: isActive ? "danger" : "default",
              onSelect: openConfirm,
            },
            { icon: Trash2, label: "حذف کلاس", tone: "danger", onSelect: openDelete },
          ]}
        />
      </SheetFrame>

      <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف کلاس" description="تایید حذف کلاس">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف {session.name}، سابقه حضور و غیاب آن هم از دست می رود. این کار قابل بازگشت نیست
        </p>

        {deleteError ? <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{deleteError}</p> : null}

        <SheetActions onSecondary={() => setDeleteOpen(false)} secondaryDisabled={deletePending}>
          <Button
            variant="destructive"
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={() => void applyDelete()}
            disabled={deletePending}
          >
            {deletePending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {deletePending ? "در حال حذف..." : "حذف کلاس"}
          </Button>
        </SheetActions>
      </SheetFrame>

      <SheetFrame
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? "غیرفعال کردن کلاس" : "فعال کردن کلاس"}
        description={isActive ? "تایید غیرفعال کردن کلاس" : "تایید فعال کردن کلاس"}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          {isActive
            ? `با غیرفعال کردن ${session.name}، این کلاس از فهرست کلاس های فعال خارج می شود. این کار قابل بازگشت است`
            : `با فعال کردن ${session.name}، دوباره می توانید این کلاس را مدیریت کنید`}
        </p>

        {error ? <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{error}</p> : null}

        <SheetActions onSecondary={() => setConfirmOpen(false)} secondaryDisabled={pending}>
          <Button
            variant={isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
            onClick={applyStatus}
            disabled={pending}
          >
            {pending ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
            {pending ? "در حال ذخیره..." : isActive ? "غیرفعال کردن" : "فعال کردن"}
          </Button>
        </SheetActions>
      </SheetFrame>
    </>
  );
}
