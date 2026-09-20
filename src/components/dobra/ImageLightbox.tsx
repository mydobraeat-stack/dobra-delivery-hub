import { useEffect } from "react";
import { X } from "lucide-react";
import { useImageUrl } from "@/lib/storage";
import { useT } from "@/lib/i18n";

type Props = {
  value: string | null;
  alt: string;
  onClose: () => void;
};

/** Full-screen viewer showing the complete, uncropped image. */
export function ImageLightbox({ value, alt, onClose }: Props) {
  const t = useT();
  const url = useImageUrl(value);

  useEffect(() => {
    if (!value) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [value, onClose]);

  if (!value) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-ink/90 p-4 duration-200"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("common.actions.close")}
        className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-soft transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-5" aria-hidden />
      </button>
      {url ? (
        <img
          src={url}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-soft"
        />
      ) : (
        <div className="size-24 animate-pulse rounded-2xl bg-background/20" aria-hidden />
      )}
    </div>
  );
}
