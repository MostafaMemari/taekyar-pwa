"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/features/coach/components/form-section";

export function ClubCoverFields() {
  return (
    <FormSection icon={Camera} title="تصویر باشگاه" tone="sky">
      <Button type="button" variant="outline" className="h-24 w-full rounded-xl border-dashed text-[12px] font-bold text-ink-muted">
        <Camera data-icon="inline-start" aria-hidden="true" />
        انتخاب تصویر باشگاه (اختیاری)
      </Button>
      <p className="text-start text-[11px] font-medium leading-5 text-ink-muted">
        تصویر باشگاه اختیاری است؛ آپلود تصویر در این نسخه از سامانه فعال نشده است.
      </p>
    </FormSection>
  );
}
