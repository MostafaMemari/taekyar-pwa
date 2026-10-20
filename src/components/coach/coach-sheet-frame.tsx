import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function SheetFrame({
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
