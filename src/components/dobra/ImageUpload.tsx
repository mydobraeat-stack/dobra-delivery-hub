import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/dobra/StoredImage";
import { uploadImage, type ImageBucket } from "@/lib/storage";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  bucket: ImageBucket;
  value: string | null;
  onChange: (value: string) => void;
  label: string;
  /** Opens the device camera directly instead of the gallery. */
  capture?: "user" | "environment";
};

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUpload({ bucket, value, onChange, label, capture }: Props) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("vendor.imageUpload.invalidFile"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("vendor.imageUpload.tooLarge"));
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadImage(bucket, file));
      toast.success(t("vendor.imageUpload.uploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("vendor.imageUpload.uploadFailed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const Icon = capture ? Camera : Upload;

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={label}
          className={cn(
            "group relative grid size-24 shrink-0 place-items-center rounded-full p-[3px]",
            "bg-[conic-gradient(var(--tw-gradient-stops))] from-primary via-sun to-primary",
            "transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            busy && "animate-pulse",
          )}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full bg-primary/30 transition-opacity duration-500",
              busy ? "animate-ping opacity-100" : "opacity-0 group-hover:opacity-60",
            )}
            aria-hidden
          />
          <span className="relative grid size-full place-items-center overflow-hidden rounded-full bg-background">
            {value ? (
              <StoredImage
                value={value}
                alt={label}
                className="size-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                width={320}
                height={320}
              />
            ) : busy ? (
              <Loader2 className="size-5 animate-spin text-foreground/60" aria-hidden />
            ) : (
              <Icon className="size-5 text-foreground/50" aria-hidden />
            )}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          {...(capture ? { capture } : {})}
          className="hidden"
          aria-label={label}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Icon className="size-4" aria-hidden />
          )}
          {capture
            ? t(value ? "driver.documents.retakePhoto" : "driver.documents.takePhoto")
            : t(value ? "vendor.imageUpload.replacePhoto" : "vendor.imageUpload.uploadPhoto")}
        </Button>
      </div>
    </div>
  );
}
