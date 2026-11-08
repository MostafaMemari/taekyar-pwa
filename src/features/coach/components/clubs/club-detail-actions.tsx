"use client";

import { Loader2, Minus, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CoachActionMenu } from "@/features/coach/components/coach-action-menu";
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
        <CoachActionMenu
          items={[
            {
              icon: Pencil,
              label: "ویرایش باشگاه",
              onSelect: () => {
                onMenuOpenChange(false);
                router.push(`/coach/clubs/${club.id}/edit`);
              },
            },
            {
              icon: isActive ? Minus : Plus,
              label: isActive ? "غیرفعال کردن باشگاه" : "فعال کردن باشگاه",
              tone: isActive ? "danger" : "default",
              onSelect: openConfirm,
            },
          ]}
        />
      </SheetFrame>

      <SheetFrame
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? "غیرفعال کردن باشگاه" : "فعال کردن باشگاه"}
        description={isActive ? "تایید غیرفعال کردن باشگاه" : "تایید فعال کردن باشگاه"}
      >
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          {isActive
            ? `با غیرفعال کردن ${club.name}، کلاس ها و حضور و غیاب این باشگاه از دسترس خارج می شود. این کار قابل بازگشت است.`
            : `با فعال کردن ${club.name}، دوباره می توانید کلاس و حضور و غیاب آن را مدیریت کنید.`}
        </p>

        {error ? <p className="pt-2 text-[12px] font-bold leading-5 text-danger">{error}</p> : null}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setConfirmOpen(false)} disabled={pending}>
            انصراف
          </Button>
          <Button
            variant={isActive ? "destructive" : "brand"}
            className="h-11 flex-[2] rounded-xl text-[12px] font-semibold"
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
