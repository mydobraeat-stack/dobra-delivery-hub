import { STATUS_LABEL } from "@/lib/dobra";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  pending: "bg-sun/25 text-foreground",
  accepted: "bg-sun/25 text-foreground",
  preparing: "bg-sun/40 text-foreground",
  ready: "bg-accent/15 text-accent",
  picked_up: "bg-accent/15 text-accent",
  delivered: "bg-foreground/10 text-foreground/70",
  cancelled: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold",
        TONE[status] ?? "bg-muted text-foreground/70",
        className,
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
