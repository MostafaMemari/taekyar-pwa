"use client";

import { ClipboardList, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { SheetFrame } from "@/components/coach/coach-sheet-frame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortKey } from "./students-options";

const ADD_OPTIONS = [
  {
    href: "/coach/students/new",
    icon: ClipboardList,
    title: "فرم ثبت هنرجوی جدید",
    description: "ثبت پروفایل کامل هنرجو",
    tile: "bg-brand-50 text-accent-ink",
  },
  {
    href: "/coach/students/invite",
    icon: Send,
    title: "دعوت با شماره تماس یا کد ملی",
    description: "ارسال دعوت نامه به هنرجو",
    tile: "bg-success-soft text-success",
  },
];

export function AddStudentSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();

  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="افزودن هنرجو" description="روش افزودن هنرجوی جدید را انتخاب کنید.">
      <div className="flex flex-col gap-2">
        {ADD_OPTIONS.map((option) => (
          <Button
            key={option.title}
            type="button"
            variant="field"
            className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 whitespace-normal"
            onClick={() => {
              onOpenChange(false);
              router.push(option.href);
            }}
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
              <option.icon aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <b className="block text-[13px] font-extrabold text-ink">{option.title}</b>
              <span className="text-[11px] font-medium text-ink-subtle">{option.description}</span>
            </span>
          </Button>
        ))}
      </div>
    </SheetFrame>
  );
}

export function SortStudentsSheet({
  open,
  onOpenChange,
  sort,
  onSortChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
}) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="مرتب سازی هنرجویان" description="ترتیب نمایش هنرجویان را انتخاب کنید.">
      <RadioGroup
        value={sort}
        onValueChange={(value) => {
          onSortChange(value as SortKey);
          onOpenChange(false);
        }}
        className="gap-2"
      >
        {SORT_OPTIONS.map((option) => (
          <Label
            key={option.value}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-input bg-field px-3 py-2.5 shadow-field transition-colors hover:bg-muted/40",
              sort === option.value && "border-primary/35 bg-brand-50/60",
            )}
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
              <option.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[13px] font-extrabold text-ink">{option.label}</b>
              <span className="text-[11px] font-medium text-ink-subtle">{option.description}</span>
            </span>
            <RadioGroupItem value={option.value} />
          </Label>
        ))}
      </RadioGroup>
    </SheetFrame>
  );
}
