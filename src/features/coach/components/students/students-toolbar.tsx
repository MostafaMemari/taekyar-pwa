import { ArrowUpDown, ListFilter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toPersianDigits } from "@/lib/digits";

export function StudentsToolbar({
  query,
  onQueryChange,
  filterCount,
  onOpenFilters,
  sortActive,
  onOpenSort,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  filterCount: number;
  onOpenFilters: () => void;
  sortActive: boolean;
  onOpenSort: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mt-4 border-b border-[var(--line-2)] bg-[var(--canvas)]/95 px-4 pb-3 pt-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <InputGroup className="h-11 min-w-0 flex-1 rounded-xl">
          <InputGroupInput
            type="search"
            placeholder="جستجو با نام یا کد ملی..."
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
          aria-label="فیلترها"
          aria-haspopup="dialog"
          className="relative size-11 shrink-0 rounded-xl"
          onClick={onOpenFilters}
        >
          <ListFilter aria-hidden="true" />
          {filterCount > 0 ? (
            <span className="absolute -top-1 -end-1 grid min-w-[16px] place-items-center rounded-full bg-brand-500 px-1 text-[8.5px] font-extrabold leading-4 text-white tabular-nums">
              {toPersianDigits(String(filterCount))}
            </span>
          ) : null}
        </Button>

        <Button
          type="button"
          variant="field"
          size="icon"
          aria-label="مرتب سازی"
          aria-haspopup="dialog"
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
