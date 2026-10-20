import { ClipboardList, Send, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS, type SortKey } from "./students-options";

function SheetFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto w-full max-w-md rounded-t-3xl px-5 pt-2 pb-[max(18px,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden="true" />

        <SheetHeader className="flex-row items-center gap-2 p-0">
          <SheetTitle className="flex-1 text-base font-extrabold text-ink">{title}</SheetTitle>
          <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="بستن" />}>
            <X aria-hidden="true" />
          </SheetClose>
        </SheetHeader>
        <SheetDescription className="sr-only">{description}</SheetDescription>

        {children}
      </SheetContent>
    </Sheet>
  );
}

const ADD_OPTIONS = [
  {
    icon: ClipboardList,
    title: "فرم ثبت هنرجوی جدید",
    description: "ثبت پروفایل کامل هنرجو",
    tile: "bg-brand-50 text-accent-ink",
  },
  {
    icon: Send,
    title: "دعوت با شماره تماس یا کد ملی",
    description: "ارسال دعوت نامه به هنرجو",
    tile: "bg-success-soft text-success",
  },
];

export function AddStudentSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <SheetFrame open={open} onOpenChange={onOpenChange} title="افزودن هنرجو" description="روش افزودن هنرجوی جدید را انتخاب کنید.">
      <div className="flex flex-col gap-2">
        {ADD_OPTIONS.map((option) => (
          <SheetClose
            key={option.title}
            render={
              <Button type="button" variant="field" className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 whitespace-normal" />
            }
          >
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", option.tile)}>
              <option.icon aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-start">
              <b className="block text-[13px] font-extrabold text-ink">{option.title}</b>
              <span className="text-[11px] font-medium text-ink-subtle">{option.description}</span>
            </span>
          </SheetClose>
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
