import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { useImageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  eager?: boolean;
};

/** Lazy image with a shimmer placeholder and a soft fade-in once loaded. */
export function StoredImage({ value, alt, className, width, height, eager }: Props) {
  const url = useImageUrl(value);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const loaded = !!url && loadedUrl === url;
  const contain = className?.includes("object-contain");

  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-muted", className)}>
      {!loaded ? (
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-gradient-to-r from-muted via-secondary/40 to-muted bg-[length:200%_100%] animate-pulse"
        >
          {!url || failed ? <ImageIcon className="size-6 text-foreground/25" /> : null}
        </div>
      ) : null}
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 400px"
          onLoad={() => setLoadedUrl(url)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-center transition-opacity duration-500",
            contain ? "object-contain" : "object-cover",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </div>
  );
}
