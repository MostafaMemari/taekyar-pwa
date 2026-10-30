import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/digits";

export function StudentsPagination({
  page,
  perPage,
  total,
  onPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold text-ink-subtle tabular-nums">
        نمایش {toPersianDigits(String(from))}–{toPersianDigits(String(to))} از {toPersianDigits(String(total))}
      </span>

      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="صفحه قبل"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="صفحه بعد"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
