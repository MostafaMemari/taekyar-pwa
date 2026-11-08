"use client";

import { Camera, Loader2, Plus } from "lucide-react";
import { useRef } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PhotoPickerProps = {
  label: string;
  hint: string;
  optional?: boolean;
  imageSrc?: string | null;
  pending?: boolean;
  onSelectFile?: (file: File) => void;
};

export function PhotoPicker({ label, hint, optional = false, imageSrc, pending = false, onSelectFile }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => inputRef.current?.click();

  return (
    <Card className="items-center gap-3 p-4">
      <Button
        type="button"
        variant="outline"
        className="relative size-[72px] shrink-0 overflow-hidden rounded-full border-dashed p-0"
        aria-label={`انتخاب ${label}`}
        onClick={onSelectFile ? open : undefined}
        disabled={pending}
      >
        {imageSrc ? (
          <Avatar className="size-full rounded-full">
            <AvatarImage src={imageSrc} alt={label} className="size-full object-cover" />
          </Avatar>
        ) : (
          <Camera className="size-7" aria-hidden="true" />
        )}
        <span className="absolute -end-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
        </span>
      </Button>
      {onSelectFile ? (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelectFile(file);
            event.target.value = "";
          }}
        />
      ) : null}
      <div className="text-center">
        <b className="block text-[13px] font-extrabold text-ink">
          {label}
          {optional ? <span className="text-[12px] font-bold text-ink-subtle"> (اختیاری)</span> : null}
        </b>
        <span className="mt-0.5 block text-[12px] font-semibold text-ink-subtle">{pending ? "در حال آپلود..." : hint}</span>
      </div>
    </Card>
  );
}
