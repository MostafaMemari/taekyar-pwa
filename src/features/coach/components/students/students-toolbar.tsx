import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function StudentsToolbar({
  query,
  onQueryChange,
  sortActive,
  sortOpen,
  onOpenSort,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  sortActive: boolean;
  sortOpen: boolean;
  onOpenSort: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line-2)] bg-[var(--canvas)]/95 px-4 pb-3 pt-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <InputGroup className="h-11 min-w-0 flex-1 rounded-xl">
          <InputGroupInput
            type="search"
            placeholder="جستجو بر اساس نام، کد ملی یا کلاس..."
            aria-label="جستجوی هنرجو"
            className="text-[13px]"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <Search className="size-4 text-ink-subtle" aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>

        <Button
          type="button"
          variant="field"
          size="icon"
          aria-label="مرتب سازی"
          aria-haspopup="dialog"
          aria-expanded={sortOpen}
          className="relative size-11 shrink-0 rounded-xl"
          onClick={onOpenSort}
        >
          <ArrowUpDown aria-hidden="true" />
          {sortActive ? <span className="absolute end-2 top-2 size-1.5 rounded-full bg-brand-500" aria-hidden="true" /> : null}
        </Button>
      </div>
    </div>
  );
}
