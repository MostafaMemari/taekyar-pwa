"use client";

import { ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { WheelColumn } from "@/components/shared/wheel-column";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toPersianDigits } from "@/lib/digits";
import { cn } from "@/lib/utils";

type TimeParts = { hour: number; minute: number };

type TimePickerProps = {
  id?: string;
  title: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue?: string;
};

const DEFAULT_TIME: TimeParts = { hour: 17, minute: 0 };

function parseTime(value: string): TimeParts | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function formatTime({ hour, minute }: TimeParts) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function twoDigits(value: number) {
  return toPersianDigits(String(value).padStart(2, "0"));
}

export function TimePicker({ id, title, value, onChange, defaultValue }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TimeParts>(DEFAULT_TIME);

  const display = parseTime(value);

  const handleOpen = () => {
    setDraft(parseTime(value) ?? parseTime(defaultValue ?? "") ?? DEFAULT_TIME);
    setOpen(true);
  };

  const confirm = () => {
    onChange(formatTime(draft));
    setOpen(false);
  };

  return (
    <>
      <Button
        id={id}
        type="button"
        variant="field"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn("relative h-12 w-full rounded-xl px-11 text-sm font-semibold", display ? "text-ink" : "text-muted-foreground")}
        onClick={handleOpen}
      >
        <Clock className="pointer-events-none absolute start-3.5 text-ink-subtle" aria-hidden="true" />
        <span className="truncate tabular-nums">{display ? toPersianDigits(formatTime(display)) : "انتخاب ساعت"}</span>
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
              ساعت را به صورت ۲۴ ساعته و با کشیدن ستون ها انتخاب کنید.
            </SheetDescription>
          </SheetHeader>

          <div className="rounded-2xl bg-muted/60 px-3 pt-3 pb-2">
            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold text-ink-subtle">
              <span>دقیقه</span>
              <span>ساعت</span>
            </div>

            <div className="relative mt-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-11 -translate-y-1/2 rounded-xl border border-primary/25 bg-background shadow-[0_2px_10px_-2px_rgba(17,24,39,0.14)]"
              />

              <div className="relative z-10 grid grid-cols-2 gap-2">
                <WheelColumn
                  className="min-w-0"
                  ariaLabel="دقیقه"
                  min={0}
                  max={59}
                  value={draft.minute}
                  onChange={(minute) => setDraft((current) => ({ ...current, minute }))}
                  formatValue={twoDigits}
                  scrollKey={open}
                  showBand={false}
                />

                <WheelColumn
                  className="min-w-0"
                  ariaLabel="ساعت"
                  min={0}
                  max={23}
                  value={draft.hour}
                  onChange={(hour) => setDraft((current) => ({ ...current, hour }))}
                  formatValue={twoDigits}
                  scrollKey={open}
                  showBand={false}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row gap-3 p-0 pt-1">
            <Button type="button" variant="outline" size="cta" className="flex-1" onClick={() => setOpen(false)}>
              انصراف
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
