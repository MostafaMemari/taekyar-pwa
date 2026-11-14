"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ding-toaster";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { CoachActionMenu } from "@/features/coach/components/coach-action-menu";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useDeleteClub } from "@/features/coach/hooks/use-club-mutations";
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteClub = useDeleteClub();

  const openDelete = () => {
    onMenuOpenChange(false);
    deleteClub.reset();
    setDeleteOpen(true);
  };

  const applyDelete = async () => {
    try {
      await deleteClub.trigger(club.id);
      setDeleteOpen(false);
      toast.success("باشگاه حذف شد");
      router.push("/coach/clubs");
    } catch (requestError) {
      // The sheet renders the failure inline, so a ding would just duplicate it.
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  const deletePending = deleteClub.isMutating;
  const deleteError = deleteClub.error ? apiErrorMessage(deleteClub.error) : "";

  return (
    <>
      <SheetFrame open={menuOpen} onOpenChange={onMenuOpenChange} title="عملیات باشگاه" description={`عملیات قابل انجام برای ${club.name}`}>
        <CoachActionMenu items={[{ icon: Trash2, label: "حذف باشگاه", tone: "danger", onSelect: openDelete }]} />
      </SheetFrame>

      <SheetFrame open={deleteOpen} onOpenChange={setDeleteOpen} title="حذف باشگاه" description="تایید حذف باشگاه">
        <p className="rounded-xl bg-danger-soft/60 p-3 text-[12px] leading-5 text-ink-muted">
          با حذف {club.name}، همه کلاس ها و اعضای آن حذف می شوند. باشگاهی که پرداخت یا سابقه حضور و غیاب داشته باشد حذف نمی شود
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
            {deletePending ? "در حال حذف..." : "حذف باشگاه"}
          </Button>
        </SheetActions>
      </SheetFrame>
    </>
  );
}
