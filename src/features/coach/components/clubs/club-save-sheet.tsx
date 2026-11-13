"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ding-toaster";
import { AuthField } from "@/components/shared/auth-field";
import { AuthFormError } from "@/components/shared/auth-form-error";
import { AuthInput } from "@/components/shared/auth-input";
import { SheetActions } from "@/components/shared/sheet-actions";
import { Button } from "@/components/ui/button";
import { SheetFrame } from "@/features/coach/components/coach-sheet-frame";
import { useSaveClub } from "@/features/coach/hooks/use-club-mutations";
import { useClub } from "@/features/coach/hooks/use-clubs";
import { useSaveClubFee } from "@/features/coach/hooks/use-fee-mutations";
import type { ClubInput } from "@/features/coach/lib/club-api";
import { type ClubFormValues, clubFormSchema, clubToForm, emptyClubForm } from "@/features/coach/lib/club-form-model";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, formatMoney } from "@/lib/digits";
import { ClubFormFieldsSkeleton } from "./club-form-fields-skeleton";
import { ClubInfoFields } from "./club-info-fields";

export function ClubSaveSheet({ open, onOpenChange, clubId }: { open: boolean; onOpenChange: (open: boolean) => void; clubId?: string }) {
  return (
    <SheetFrame
      open={open}
      onOpenChange={onOpenChange}
      title={clubId ? "ویرایش باشگاه" : "ثبت باشگاه جدید"}
      description={clubId ? "نام و آدرس باشگاه را ویرایش کنید" : "نام باشگاه را وارد کنید و در صورت نیاز شهریه ماهانه را ثبت کنید"}
    >
      <ClubSaveSheetForm open={open} onOpenChange={onOpenChange} clubId={clubId} />
    </SheetFrame>
  );
}

// Stays mounted inside the always-mounted sheet; refills once per open so a fresh create never
// inherits the previous entries and a revalidation while typing never clobbers them.
function ClubSaveSheetForm({ open, onOpenChange, clubId }: { open: boolean; onOpenChange: (open: boolean) => void; clubId?: string }) {
  const router = useRouter();
  const { data: club, isLoading } = useClub(clubId);
  const save = useSaveClub(clubId);
  const saveFee = useSaveClubFee();
  // The first fee rides the create flow; edits are handled on the fee page.
  const [fee, setFee] = useState("");

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: emptyClubForm,
  });

  const filled = useRef(false);

  useEffect(() => {
    if (!open) {
      filled.current = false;
      return;
    }
    if (filled.current || (clubId !== undefined && !club)) return;

    filled.current = true;
    reset(club ? clubToForm(club) : emptyClubForm);
  }, [open, club, clubId, reset]);

  const feeInvalid = fee !== "" && Number(fee) <= 0;

  const submit = handleSubmit(async (values) => {
    const input: ClubInput = { name: values.name, address: values.address || null };

    try {
      const saved = await save.trigger(input);
      try {
        if (fee !== "") await saveFee.trigger({ clubId: saved.id, monthlyAmount: Number(fee) });
      } catch (feeError) {
        if (feeError instanceof ApiError && feeError.status === 401) {
          router.replace("/login");
          return;
        }
        toast.error(apiErrorMessage(feeError));
      }
      toast.success(clubId ? "باشگاه ذخیره شد" : "باشگاه ثبت شد");
      onOpenChange(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
      else toast.error(apiErrorMessage(requestError));
    }
  });

  return (
    <>
      <div className="no-scrollbar mt-3 flex max-h-[68dvh] flex-col gap-4 overflow-y-auto">
        {clubId !== undefined && isLoading && !club ? (
          <ClubFormFieldsSkeleton />
        ) : (
          <ClubInfoFields
            control={control}
            gender={club?.gender ?? null}
            nameError={errors.name?.message}
            addressError={errors.address?.message}
          />
        )}
        {clubId !== undefined ? null : (
          <AuthField label="شهریه ماهانه (تومان)" htmlFor="clubSaveFee" optional hint="نخستین نرخ از همین ماه اعمال می شود">
            <AuthInput
              id="clubSaveFee"
              inputMode="numeric"
              dir="ltr"
              maxLength={15}
              value={fee === "" ? "" : formatMoney(fee)}
              onChange={(event) => setFee(digitsOnly(event.target.value, 12))}
            />
          </AuthField>
        )}
        <AuthFormError message={save.error ? apiErrorMessage(save.error) : ""} />
      </div>

      <SheetActions className="mt-3" onSecondary={() => onOpenChange(false)} secondaryDisabled={isSubmitting}>
        <Button
          type="button"
          variant="brand"
          className="h-11 flex-[2] rounded-xl text-[12px] font-bold"
          disabled={isSubmitting || feeInvalid}
          onClick={() => void submit()}
        >
          {isSubmitting ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
          {clubId !== undefined ? "ذخیره تغییرات" : "ایجاد باشگاه"}
        </Button>
      </SheetActions>
    </>
  );
}
