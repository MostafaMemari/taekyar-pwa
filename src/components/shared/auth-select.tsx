import type { LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AuthSelectProps = {
  id?: string;
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  icon?: LucideIcon;
  disabled?: boolean;
};

export function AuthSelect({ id, value, onValueChange, placeholder, options, icon: Icon, disabled }: AuthSelectProps) {
  const items = [{ label: placeholder, value: null }, ...options];

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
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value ?? "placeholder"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
