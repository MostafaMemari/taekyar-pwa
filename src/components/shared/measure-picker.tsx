"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { WheelColumn } from "@/components/shared/wheel-column";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

type MeasurePickerProps = {
  id?: string;
  title: string;
  unit: string;
  icon: LucideIcon;
  min: number;
  max: number;
  defaultValue: number;
  value: string;
  onChange: (value: string) => void;
};

export function MeasurePicker({ id, title, unit, icon: Icon, min, max, defaultValue, value, onChange }: MeasurePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(defaultValue);

  const handleOpen = () => {
    setDraft(value ? Number(value) : defaultValue);
    setOpen(true);
  };

  const confirm = () => {
    onChange(String(draft));
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="outline"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn("relative h-12 w-full rounded-xl px-11 text-sm font-semibold", value ? "text-ink" : "text-muted-foreground")}
        onClick={handleOpen}
      >
        <Icon className="pointer-events-none absolute start-3.5 text-ink-subtle" aria-hidden="true" />
        <span className="truncate">{value ? `${toPersianDigits(value)} ${unit}` : "انتخاب کنید"}</span>
        <ChevronDown className="pointer-events-none absolute end-3.5 text-ink-faint" aria-hidden="true" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto w-full max-w-md rounded-t-3xl px-5 pt-2 pb-[max(18px,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden="true" />

          <SheetHeader className="gap-1 p-0 text-center">
            <SheetTitle className="text-base font-extrabold text-ink">انتخاب {title}</SheetTitle>
            <SheetDescription className="text-[11px] font-medium leading-5 text-ink-subtle">
              ستون اعداد را بالا یا پایین بکشید — از {toPersianDigits(String(min))} تا {toPersianDigits(String(max))} {unit}
            </SheetDescription>
          </SheetHeader>

          <div className="rounded-2xl bg-muted/60 px-3 py-4">
            <div className="relative">
              <WheelColumn
                ariaLabel={title}
                min={min}
                max={max}
                value={draft}
                onChange={setDraft}
                onSelect={(next) => {
                  onChange(String(next));
                  setOpen(false);
                }}
                scrollKey={open}
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute end-4 top-1/2 z-20 -translate-y-1/2 text-[11px] font-semibold text-ink-subtle"
              >
                {unit}
              </span>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 p-0 pt-1">
            <Button type="button" variant="outline" size="cta" className="flex-1" disabled={!value} onClick={clear}>
              پاک کردن
            </Button>
            <Button type="button" variant="brand" size="cta" className="flex-[2]" onClick={confirm}>
              تایید
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
