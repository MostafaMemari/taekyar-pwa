"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthField } from "@/components/shared/auth-field";
import { AuthInput } from "@/components/shared/auth-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/coach/components/error-state";
import { SectionHeading } from "@/features/coach/components/section-heading";
import { useClubFee } from "@/features/coach/hooks/use-fee";
import { useSaveClubFee } from "@/features/coach/hooks/use-fee-mutations";
import { ApiError, apiErrorMessage } from "@/lib/api/client";
import { digitsOnly, formatMoney } from "@/lib/digits";

export function FeeSettingsCard({ clubId }: { clubId: string }) {
  const router = useRouter();
  const { data: fee, error, isLoading, mutate } = useClubFee(clubId);
  const save = useSaveClubFee(clubId);
  // Stays null until the coach types, so the stored amount shows through untouched.
  const [amount, setAmount] = useState<string | null>(null);

  const value = amount ?? (fee ? String(Math.trunc(Number(fee.monthlyAmount))) : "");
  const parsed = Number(value);
  const canSave = value !== "" && Number.isFinite(parsed) && parsed > 0;

  const submit = async () => {
    try {
      await save.trigger(parsed);
      setAmount(null);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) router.replace("/login");
    }
  };

  return (
    <section>
      <SectionHeading title="تنظیم شهریه" />
      <Card className="flex flex-col gap-3 p-4">
        {isLoading && !fee ? (
          <Skeleton className="h-12 w-full rounded-xl" />
        ) : error ? (
          <ErrorState title="خواندن شهریه انجام نشد" message={apiErrorMessage(error)} onRetry={() => void mutate()} />
        ) : (
          <>
            <AuthField label="مبلغ شهریه ماهانه (تومان)" htmlFor="clubFeeAmount">
              <AuthInput
                id="clubFeeAmount"
                inputMode="numeric"
                dir="ltr"
                maxLength={15}
                value={value === "" ? "" : formatMoney(value)}
                onChange={(event) => setAmount(digitsOnly(event.target.value, 12))}
              />
            </AuthField>
            {fee ? null : <p className="text-[12px] font-semibold leading-5 text-ink-subtle">شهریه برای این باشگاه تعیین نشده است</p>}
            {save.error ? (
              <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-[12px] font-bold leading-5 text-danger">
                {apiErrorMessage(save.error)}
              </p>
            ) : null}
            <Button
              variant="brand"
              className="h-11 w-full rounded-xl text-[12px] font-extrabold"
              disabled={!canSave || save.isMutating}
              onClick={() => void submit()}
            >
              {save.isMutating ? <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" /> : null}
              {fee ? "ذخیره" : "ثبت شهریه"}
            </Button>
          </>
        )}
      </Card>
    </section>
  );
}
