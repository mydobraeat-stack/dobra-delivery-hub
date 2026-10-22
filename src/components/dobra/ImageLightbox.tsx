import { useEffect } from "react";
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
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
      className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-ink-solid/90 p-4 duration-200"
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label={t("common.actions.close")}
        className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-soft transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-5" aria-hidden />
      </button>
      {url ? (
        <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
          <TransformWrapper minScale={1} maxScale={5} doubleClick={{ mode: "toggle", step: 2 }} centerOnInit>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <img
                    src={url}
                    alt={alt}
                    className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-soft"
                  />
                </TransformComponent>
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {[
                    { icon: ZoomOut, fn: () => zoomOut(), label: "−" },
                    { icon: RotateCcw, fn: () => resetTransform(), label: "reset" },
                    { icon: ZoomIn, fn: () => zoomIn(), label: "+" },
                  ].map(({ icon: Icon, fn, label }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={fn}
                      className="grid size-11 place-items-center rounded-full bg-background/90 text-foreground shadow-soft transition hover:scale-105"
                    >
                      <Icon className="size-5" aria-hidden />
                    </button>
                  ))}
                </div>
              </>
            )}
          </TransformWrapper>
        </div>
      ) : (
        <div className="size-24 animate-pulse rounded-2xl bg-background/20" aria-hidden />
      )}
    </div>
  );
}
