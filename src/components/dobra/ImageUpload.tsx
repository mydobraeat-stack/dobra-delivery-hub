import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/dobra/StoredImage";
import { uploadImage, type ImageBucket } from "@/lib/storage";
import { useT } from "@/lib/i18n";

type Props = {
  bucket: ImageBucket;
  value: string | null;
  onChange: (value: string) => void;
  label: string;
};

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageUpload({ bucket, value, onChange, label }: Props) {
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

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <StoredImage
          value={value}
          alt={value ? label : ""}
          className="size-20 shrink-0 rounded-xl object-cover"
          width={320}
          height={320}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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
            <Upload className="size-4" aria-hidden />
          )}
          {value ? t("vendor.imageUpload.replacePhoto") : t("vendor.imageUpload.uploadPhoto")}
        </Button>
      </div>
    </div>
  );
}
