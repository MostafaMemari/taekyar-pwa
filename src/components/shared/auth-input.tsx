import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type AuthInputProps = ComponentProps<"input"> & { icon?: LucideIcon };

export function AuthInput({ icon: Icon, className, ...props }: AuthInputProps) {
  if (!Icon) {
    return <Input className={cn("h-12 rounded-xl px-4 text-center text-sm", className)} {...props} />;
  }

  return (
    <InputGroup className="h-12 rounded-xl">
      <InputGroupAddon className="ps-3.5 pe-0 text-ink-subtle transition-colors group-focus-within/input-group:text-ring">
        <Icon aria-hidden="true" />
      </InputGroupAddon>
      <InputGroupInput className={cn("h-full px-3 text-center text-sm", className)} {...props} />
    </InputGroup>
  );
}
