import { cn } from "@/lib/utils";

export function DobraLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-script text-brand leading-none tracking-tight select-none",
        className,
      )}
    >
      Dobra
    </span>
  );
}
