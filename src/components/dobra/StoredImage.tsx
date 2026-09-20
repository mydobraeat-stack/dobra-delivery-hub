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

export function StoredImage({ value, alt, className, width, height, eager }: Props) {
  const url = useImageUrl(value);

  if (!url) {
    return <div className={cn("shrink-0 bg-muted", className)} aria-hidden />;
  }

  return (
    <img
      src={url}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      className={cn("object-cover object-center", className)}
    />
  );
}
