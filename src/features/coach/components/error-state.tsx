import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  message,
  onRetry,
  className,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Alert className={cn("rounded-2xl border-none bg-danger-soft/60 p-3.5 text-start", className)}>
      <AlertTitle className="text-[12px] font-extrabold text-danger">{title}</AlertTitle>
      <AlertDescription className="text-[11px] leading-5 text-ink-muted">{message}</AlertDescription>
      <Button type="button" variant="outline" size="sm" className="mt-3 rounded-lg" onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        تلاش دوباره
      </Button>
    </Alert>
  );
}
