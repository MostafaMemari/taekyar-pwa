import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function PersonAvatar({ name, className, fallbackClassName }: { name: string; className?: string; fallbackClassName?: string }) {
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarFallback className={cn("bg-brand-50 text-[13px] font-extrabold text-accent-ink", fallbackClassName)}>
        {name.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
