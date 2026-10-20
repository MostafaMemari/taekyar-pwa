"use client";

import { StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

const REASONS = ["دیر در رسیدن", "بیماری", "مسافرت خانوادگی", "مصدومیت", "امتحان مدرسه", "اطلاع قبلی مربی"];

export function AttendanceNoteSheet({
  open,
  onOpenChange,
  studentName,
  note,
  onSave,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  note: string;
  onSave: (note: string) => void;
  onClear: () => void;
}) {
  const [value, setValue] = useState(note);

  useEffect(() => {
    if (open) setValue(note);
  }, [open, note]);

  const appendReason = (reason: string) => {
    setValue((current) => (current.trim() ? `${current.trim()} · ${reason}` : reason));
  };

  const save = () => {
    const trimmed = value.trim();
    if (trimmed) onSave(trimmed);
    else onClear();
    onOpenChange(false);
  };

  const clear = () => {
    onClear();
    onOpenChange(false);
  };

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="توضیح حضور و غیاب" description={`ثبت توضیح برای ${studentName}`}>
      <div className="flex flex-col gap-4 pt-3">
        <div className="flex items-center gap-2.5 rounded-2xl bg-muted/70 px-3 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-ink">
            <StickyNote className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[12.5px] font-extrabold text-ink">{studentName}</b>
            <span className="mt-0.5 block text-[10px] font-semibold text-ink-subtle">دلیل یا توضیح این وضعیت را ثبت کنید.</span>
          </div>
        </div>

        <div>
          <span className="text-[12px] font-semibold text-ink-body">دلیل پیشنهادی</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REASONS.map((reason) => (
              <Button
                key={reason}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-full px-3 text-[10.5px] font-bold"
                onClick={() => appendReason(reason)}
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel className="text-[12px] font-semibold text-ink-body" htmlFor="attendance-note">
              توضیح تکمیلی
            </FieldLabel>
            <Textarea
              id="attendance-note"
              rows={3}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="مثلا: ۱۵ دقیقه دیر رسید و بخش گرم کردن را از دست داد"
              className="min-h-24 resize-none text-[12.5px]"
            />
          </Field>
        </FieldGroup>

        <div className="flex items-center gap-2">
          <Button type="button" variant="brand" className="h-11 flex-1 rounded-xl text-[12.5px] font-extrabold" onClick={save}>
            ثبت توضیح
          </Button>
          <Button type="button" variant="outline" className="h-11 rounded-xl px-4 text-[12.5px]" onClick={clear}>
            حذف
          </Button>
        </div>

        <p className="text-center text-[10px] leading-5 text-ink-faint">
          نمونه رابط کاربری — توضیح ها فقط در همین صفحه نمایش داده می شوند.
        </p>
      </div>
    </SheetFrame>
  );
}
