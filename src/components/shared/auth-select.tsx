import type { LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AuthSelectOption = { value: string; label: string; description?: string };

type AuthSelectProps = {
  id?: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: readonly AuthSelectOption[];
  icon?: LucideIcon;
  disabled?: boolean;
  itemGap?: boolean;
};

type AuthSelectItem = { value: string | null; label: string; description?: string };

export function AuthSelect({ id, value, onValueChange, placeholder, options, icon: Icon, disabled, itemGap }: AuthSelectProps) {
  const items: AuthSelectItem[] = [{ label: placeholder, value: null }, ...options];

  return (
    <Select items={items} value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className="relative h-12 w-full rounded-xl ps-11 pe-3.5 text-sm">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute start-4 text-ink-subtle transition-colors group-focus-visible/select:text-ring"
            aria-hidden="true"
          />
        ) : null}
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup className={itemGap ? "flex flex-col gap-1.5" : undefined}>
          {items.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="truncate">{item.label}</div>
                {item.description ? <div className="truncate text-[11px] font-medium text-ink-subtle">{item.description}</div> : null}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
