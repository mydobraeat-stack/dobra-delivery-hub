import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { accountQueryOptions } from "@/lib/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HEADLINES,
  SCREENSHOT_KEYS,
  downloadAllAsZip,
  downloadCanvas,
  ensureFonts,
  generateAllAssets,
  loadLogo,
  renderAppIcon,
  renderAdaptiveBackground,
  renderAdaptiveForeground,
  renderFeatureGraphic,
  renderScreenshot,
  renderSplash,
  type AssetLang,
  type GeneratedAsset,
  type HeadlineSet,
} from "@/lib/store-assets";

export const Route = createFileRoute("/_authenticated/admin/store-assets")({
  component: StoreAssetsPage,
  head: () => ({
    meta: [
      { title: "Store Assets — Dobra Admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Internal tool for generating Dobra app store assets." },
    ],
  }),
});

const SCREEN_LABELS: Record<(typeof SCREENSHOT_KEYS)[number], string> = {
  home: "1 · Home / location search",
  restaurants: "2 · Restaurant list",
  menu: "3 · Menu & add to cart",
  checkout: "4 · Checkout",
  tracking: "5 · Live order tracking",
  dashboard: "6 · Vendor / driver dashboard",
};

function StoreAssetsPage() {
  const navigate = useNavigate();
  const { data, isPending } = useQuery(accountQueryOptions);
  const isSuper = data?.role === "admin";

  const [lang, setLang] = useState<AssetLang>("en");
  const [headlines, setHeadlines] = useState<HeadlineSet>(HEADLINES.en);
  const [previews, setPreviews] = useState<GeneratedAsset[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data && !isSuper) navigate({ to: "/admin/orders", replace: true });
  }, [data, isSuper, navigate]);

  useEffect(() => {
    setHeadlines(HEADLINES[lang]);
  }, [lang]);

  const regenerate = async (set: HeadlineSet, l: AssetLang) => {
    setBusy(true);
    try {
      setPreviews(await generateAllAssets(set, l));
    } catch {
      toast.error("Could not render assets");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (isSuper) void regenerate(HEADLINES.en, "en");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuper]);

  if (isPending || !data || !isSuper) {
    return <div className="p-10 text-center text-foreground/60">Loading…</div>;
  }

  const updateHeadline = (key: (typeof SCREENSHOT_KEYS)[number], value: string) => {
    setHeadlines((prev) => ({ ...prev, [key]: value }));
  };

  const downloadOne = async (kind: string) => {
    setBusy(true);
    try {
      await ensureFonts();
      const logo = await loadLogo();
      switch (kind) {
        case "icon-1024":
          await downloadCanvas(renderAppIcon(logo, 1024), "app-icon-1024.png");
          break;
        case "icon-512":
          await downloadCanvas(renderAppIcon(logo, 512), "app-icon-512.png");
          break;
        case "adaptive-fg":
          await downloadCanvas(renderAdaptiveForeground(logo), "android-adaptive-foreground-432.png");
          break;
        case "adaptive-bg":
          await downloadCanvas(renderAdaptiveBackground(), "android-adaptive-background-432.png");
          break;
        case "splash":
          await downloadCanvas(renderSplash(logo, lang), "splash-1242x2688.png");
          break;
        case "feature":
          await downloadCanvas(renderFeatureGraphic(logo, lang), "feature-graphic-1024x500.png");
          break;
        default: {
          const key = kind as (typeof SCREENSHOT_KEYS)[number];
          const bg = SCREENSHOT_KEYS.indexOf(key) % 2 === 0 ? "yellow" : "red";
          await downloadCanvas(
            renderScreenshot(logo, key, headlines[key], bg),
            `screenshot-${key}-1290x2796.png`,
          );
        }
      }
    } catch {
      toast.error("Download failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Store Assets</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Generate App Store and Google Play artwork from the Dobra brand. Everything is rendered
          in your browser — nothing leaves this device.
        </p>
      </header>

      <section className="rounded-2xl border border-ink/10 bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Headline language</span>
          {(["en", "pl"] as const).map((l) => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? "default" : "outline"}
              onClick={() => setLang(l)}
            >
              {l === "en" ? "English" : "Polski"}
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => void regenerate(headlines, lang)}
          >
            {busy ? "Rendering…" : "Refresh previews"}
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SCREENSHOT_KEYS.map((key) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-medium text-foreground/70">{SCREEN_LABELS[key]}</span>
              <Input
                value={headlines[key]}
                onChange={(e) => updateHeadline(key, e.target.value)}
                maxLength={60}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-card p-5">
        <h2 className="text-lg font-semibold">Icons</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("icon-1024")}>
            App icon 1024×1024
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("icon-512")}>
            Play icon 512×512
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("adaptive-fg")}>
            Adaptive foreground 432×432
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("adaptive-bg")}>
            Adaptive background 432×432
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-card p-5">
        <h2 className="text-lg font-semibold">Splash & feature graphic</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("splash")}>
            Splash 1242×2688
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => void downloadOne("feature")}>
            Play feature graphic 1024×500
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-card p-5">
        <h2 className="text-lg font-semibold">Screenshots 1290×2796</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCREENSHOT_KEYS.map((key) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void downloadOne(key)}
            >
              {SCREEN_LABELS[key]}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-card p-5">
        <Button
          disabled={busy}
          onClick={() =>
            void (async () => {
              setBusy(true);
              try {
                await downloadAllAsZip(await generateAllAssets(headlines, lang));
                toast.success("ZIP downloaded");
              } catch {
                toast.error("ZIP failed");
              } finally {
                setBusy(false);
              }
            })()
          }
        >
          Download all as ZIP
        </Button>
        <p className="mt-2 text-xs text-foreground/50">
          Organised into /icons, /splash, /play-store and /app-store folders.
        </p>
      </section>

      {previews.length > 0 && (
        <section className="rounded-2xl border border-ink/10 bg-card p-5">
          <h2 className="text-lg font-semibold">Previews</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {previews.map((a) => (
              <figure key={a.path} className="space-y-1">
                <img
                  src={a.canvas.toDataURL("image/png")}
                  alt={a.path}
                  className="w-full rounded-lg border border-ink/10 object-contain"
                />
                <figcaption className="break-all text-xs text-foreground/50">{a.path}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
