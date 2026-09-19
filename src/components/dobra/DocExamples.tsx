import { Check, X } from "lucide-react";
import { useT } from "@/lib/i18n";

type Props = { good: string; avoid: string };

/** Two small reference photos showing an acceptable and an unacceptable upload. */
export function DocExamples({ good, avoid }: Props) {
  const t = useT();
  const items = [
    { src: good, ok: true, label: t("driver.documents.examples.good") },
    { src: avoid, ok: false, label: t("driver.documents.examples.avoid") },
  ];

  return (
    <div className="flex gap-3">
      {items.map((item) => (
        <figure key={item.label} className="min-w-0 flex-1 space-y-1">
          <img
            src={item.src}
            alt={item.label}
            loading="lazy"
            width={816}
            height={816}
            className="aspect-square w-full rounded-xl object-cover"
          />
          <figcaption
            className={`flex items-center gap-1 text-xs font-medium ${
              item.ok ? "text-foreground" : "text-destructive"
            }`}
          >
            {item.ok ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            {item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
