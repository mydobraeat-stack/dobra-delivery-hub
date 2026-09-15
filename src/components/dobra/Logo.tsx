import { cn } from "@/lib/utils";
import logoAsset from "@/assets/dobra-logo.png.asset.json";

export function DobraLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex select-none items-center leading-none", className)}>
      <img
        src={logoAsset.url}
        alt="Dobra"
        width={969}
        height={426}
        className="h-[1.1em] w-auto max-w-full object-contain"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
