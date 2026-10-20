"use client";

import { Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PhotoPickerProps = {
  label: string;
  hint: string;
  optional?: boolean;
};

export function PhotoPicker({ label, hint, optional = false }: PhotoPickerProps) {
  return (
    <Card className="items-center gap-3 p-4">
      <Button
        type="button"
        variant="outline"
        className="relative size-[72px] shrink-0 rounded-full border-dashed"
        aria-label={`انتخاب ${label}`}
      >
        <Camera className="size-7" aria-hidden="true" />
        <span className="absolute -end-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
          <Plus className="size-3.5" aria-hidden="true" />
        </span>
      </Button>
      <div className="text-center">
        <b className="block text-[13px] font-extrabold text-ink">
          {label}
          {optional ? <span className="text-[9.5px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
        </b>
        <span className="mt-0.5 block text-[10px] font-semibold text-ink-subtle">{hint}</span>
      </div>
    </Card>
  );
}
