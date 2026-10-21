// Client-side store asset generator for the hidden admin "Store Assets" page.
// Renders everything on HTML canvas using the Dobra theme (yellow sun, brand
// red, ink) and the real logo file. No server work, no external services.

import logoAsset from "@/assets/dobra-logo.png.asset.json";

// Exact theme colors from src/styles.css (:root).
export const BRAND = {
  sun: "oklch(0.88 0.17 96)", // yellow background
  red: "oklch(0.53 0.22 27)", // brand red (buttons / wordmark)
  ink: "oklch(0.22 0.01 90)", // near-black text
  card: "oklch(0.995 0.008 96)", // card white
  muted: "oklch(0.5 0.02 90)",
} as const;

export const FONT_SANS = '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif';
export const FONT_SCRIPT = '"Pacifico", "Brush Script MT", cursive';

export type AssetLang = "en" | "pl";

export interface HeadlineSet {
  home: string;
  restaurants: string;
  menu: string;
  checkout: string;
  tracking: string;
  dashboard: string;
}

export const HEADLINES: Record<AssetLang, HeadlineSet> = {
  en: {
    home: "Order delivery near you.",
    restaurants: "Hundreds of local favourites.",
    menu: "Build your perfect order.",
    checkout: "Pay with BLIK, card or cash.",
    tracking: "Follow your courier live.",
    dashboard: "Run your business with Dobra.",
  },
  pl: {
    home: "Zamów dostawę w okolicy.",
    restaurants: "Setki lokalnych ulubieńców.",
    menu: "Skomponuj idealne zamówienie.",
    checkout: "Płać BLIKIEM, kartą lub gotówką.",
    tracking: "Śledź kuriera na żywo.",
    dashboard: "Prowadź biznes z Dobrą.",
  },
};

export const TAGLINE: Record<AssetLang, string> = {
  en: "Order delivery near you.",
  pl: "Zamów dostawę w okolicy.",
};

let logoPromise: Promise<HTMLImageElement> | null = null;

export function loadLogo(): Promise<HTMLImageElement> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("logo failed to load"));
      img.src = logoAsset.url;
    });
  }
  return logoPromise;
}

export async function ensureFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`700 64px "Plus Jakarta Sans"`),
      document.fonts.load(`400 64px "Pacifico"`),
    ]);
    await document.fonts.ready;
  } catch {
    // Fonts already available or blocked — canvas falls back to system fonts.
  }
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d unavailable");
  return { canvas, ctx };
}

function drawLogoCentered(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  cx: number,
  cy: number,
  targetWidth: number,
) {
  const ratio = logo.naturalHeight / logo.naturalWidth;
  const h = targetWidth * ratio;
  ctx.drawImage(logo, cx - targetWidth / 2, cy - h / 2, targetWidth, h);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ---------------------------------------------------------------- icons

export function renderAppIcon(logo: HTMLImageElement, size: number): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = BRAND.sun;
  ctx.fillRect(0, 0, size, size);
  drawLogoCentered(ctx, logo, size / 2, size / 2, size * 0.62);
  return canvas;
}

export function renderAdaptiveBackground(size = 432): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = BRAND.sun;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function renderAdaptiveForeground(logo: HTMLImageElement, size = 432): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.clearRect(0, 0, size, size);
  // Android safe zone: inner 66% circle. Keep the logo well inside it.
  drawLogoCentered(ctx, logo, size / 2, size / 2, size * 0.44);
  return canvas;
}

// ---------------------------------------------------------------- splash

export function renderSplash(logo: HTMLImageElement, lang: AssetLang): HTMLCanvasElement {
  const w = 1242;
  const h = 2688;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = BRAND.sun;
  ctx.fillRect(0, 0, w, h);
  drawLogoCentered(ctx, logo, w / 2, h / 2 - 120, w * 0.56);
  ctx.fillStyle = BRAND.red;
  ctx.font = `600 54px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(TAGLINE[lang], w / 2, h / 2 + 260);
  return canvas;
}

// ------------------------------------------------------- feature graphic

export function renderFeatureGraphic(logo: HTMLImageElement, lang: AssetLang): HTMLCanvasElement {
  const w = 1024;
  const h = 500;
  const { canvas, ctx } = makeCanvas(w, h);
  ctx.fillStyle = BRAND.sun;
  ctx.fillRect(0, 0, w, h);
  // Red circle accent behind the logo, Glovo-style.
  ctx.fillStyle = BRAND.red;
  ctx.beginPath();
  ctx.arc(w * 0.72, h / 2, 190, 0, Math.PI * 2);
  ctx.fill();
  drawLogoCentered(ctx, logo, w * 0.72, h / 2, 300);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `800 64px ${FONT_SANS}`;
  ctx.textAlign = "left";
  const lines = wrapText(ctx, TAGLINE[lang], 420);
  lines.forEach((line, i) => ctx.fillText(line, 64, h / 2 - 20 + i * 78));
  return canvas;
}

// ----------------------------------------------------------- screenshots

type ScreenKey = keyof HeadlineSet;

const SCREEN_ORDER: ScreenKey[] = [
  "home",
  "restaurants",
  "menu",
  "checkout",
  "tracking",
  "dashboard",
];

const SW = 1290;
const SH = 2796;

function drawPhoneFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Outer frame
  ctx.fillStyle = BRAND.ink;
  roundRect(ctx, x, y, w, h, 90);
  ctx.fill();
  // Screen
  const pad = 22;
  ctx.fillStyle = BRAND.card;
  roundRect(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, 70);
  ctx.fill();
  ctx.save();
  roundRect(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, 70);
  ctx.clip();
  return { sx: x + pad, sy: y + pad, sw: w - pad * 2, sh: h - pad * 2 };
}

function endPhoneFrame(ctx: CanvasRenderingContext2D) {
  ctx.restore();
}

function drawStatusBar(ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number) {
  ctx.fillStyle = BRAND.ink;
  ctx.font = `600 30px ${FONT_SANS}`;
  ctx.textAlign = "left";
  ctx.fillText("9:41", sx + 48, sy + 58);
  // Battery pill
  ctx.strokeStyle = BRAND.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, sx + sw - 110, sy + 34, 62, 30, 8);
  ctx.stroke();
  ctx.fillRect(sx + sw - 104, sy + 40, 40, 18);
}

function drawRedButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
) {
  ctx.fillStyle = BRAND.red;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = BRAND.card;
  ctx.font = `700 34px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + h / 2 + 12);
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, w, h, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(30,30,20,0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Each screen paints a simplified but recognisable slice of the real Dobra UI.
function drawScreenContent(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  key: ScreenKey,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
) {
  ctx.fillStyle = BRAND.sun;
  ctx.fillRect(sx, sy, sw, sh);
  drawStatusBar(ctx, sx, sy, sw);
  const cx = sx + sw / 2;

  if (key === "home") {
    drawLogoCentered(ctx, logo, cx, sy + 220, 340);
    // Location search pill
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, sx + 60, sy + 340, sw - 120, 96, 48);
    ctx.fill();
    ctx.fillStyle = BRAND.muted;
    ctx.font = `500 34px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText("📍  Warsaw — deliver to…", sx + 110, sy + 400);
    // Category chips
    const chips = ["🍕 Pizza", "🥟 Pierogi", "🍔 Burgers", "🍣 Sushi"];
    chips.forEach((c, i) => {
      const cy = sy + 500 + i * 130;
      drawCard(ctx, sx + 60, cy, sw - 120, 104);
      ctx.fillStyle = BRAND.ink;
      ctx.font = `600 38px ${FONT_SANS}`;
      ctx.fillText(c, sx + 110, cy + 66);
    });
    drawRedButton(ctx, sx + 60, sy + sh - 200, sw - 120, 96, "Find food");
  }

  if (key === "restaurants") {
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 52px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText("Near you", sx + 60, sy + 150);
    for (let i = 0; i < 3; i++) {
      const cy = sy + 210 + i * 420;
      drawCard(ctx, sx + 60, cy, sw - 120, 380);
      ctx.fillStyle = BRAND.red;
      roundRect(ctx, sx + 60, cy, sw - 120, 190, 28);
      ctx.fill();
      drawLogoCentered(ctx, logo, cx, cy + 95, 220);
      ctx.fillStyle = BRAND.ink;
      ctx.font = `700 40px ${FONT_SANS}`;
      ctx.fillText(["Pierogi Bar", "Pizza Napoli", "Green Bowl"][i]!, sx + 100, cy + 260);
      ctx.fillStyle = BRAND.muted;
      ctx.font = `500 30px ${FONT_SANS}`;
      ctx.fillText(`★ 4.${7 - i}  ·  ${20 + i * 5}–${30 + i * 5} min  ·  6.90 zł`, sx + 100, cy + 315);
    }
  }

  if (key === "menu") {
    drawCard(ctx, sx + 60, sy + 120, sw - 120, 220);
    drawLogoCentered(ctx, logo, cx, sy + 200, 240);
    ctx.fillStyle = BRAND.ink;
    ctx.font = `700 42px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillText("Pierogi Bar", cx, sy + 300);
    const dishes = [
      ["Pierogi ruskie (9 pcs)", "24.00 zł"],
      ["Zapiekanka", "15.00 zł"],
      ["Pączek", "6.00 zł"],
    ];
    dishes.forEach(([name, price], i) => {
      const cy = sy + 400 + i * 150;
      drawCard(ctx, sx + 60, cy, sw - 120, 120);
      ctx.fillStyle = BRAND.ink;
      ctx.font = `600 34px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText(name!, sx + 100, cy + 48);
      ctx.fillStyle = BRAND.muted;
      ctx.font = `500 30px ${FONT_SANS}`;
      ctx.fillText(price!, sx + 100, cy + 92);
      ctx.fillStyle = BRAND.red;
      ctx.beginPath();
      ctx.arc(sx + sw - 130, cy + 60, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 40px ${FONT_SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("+", sx + sw - 130, cy + 74);
    });
    drawRedButton(ctx, sx + 60, sy + sh - 200, sw - 120, 96, "View basket · 45.00 zł");
  }

  if (key === "checkout") {
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 52px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText("Checkout", sx + 60, sy + 150);
    const rows = [
      ["📍", "Delivery address", "Marszałkowska 1/2, Warszawa"],
      ["⚡", "BLIK", "Pay in seconds"],
      ["💳", "Card", "Visa ·· 4242"],
      ["💵", "Cash", "Pay the courier"],
    ];
    rows.forEach(([icon, title, sub], i) => {
      const cy = sy + 210 + i * 160;
      drawCard(ctx, sx + 60, cy, sw - 120, 130);
      ctx.font = `400 44px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText(icon!, sx + 95, cy + 82);
      ctx.fillStyle = BRAND.ink;
      ctx.font = `700 34px ${FONT_SANS}`;
      ctx.fillText(title!, sx + 175, cy + 55);
      ctx.fillStyle = BRAND.muted;
      ctx.font = `500 28px ${FONT_SANS}`;
      ctx.fillText(sub!, sx + 175, cy + 98);
    });
    drawRedButton(ctx, sx + 60, sy + sh - 200, sw - 120, 96, "Place order · 45.00 zł");
  }

  if (key === "tracking") {
    // Map area
    ctx.fillStyle = "oklch(0.93 0.05 110)";
    ctx.fillRect(sx, sy + 100, sw, sh * 0.45);
    ctx.strokeStyle = BRAND.red;
    ctx.lineWidth = 10;
    ctx.setLineDash([26, 22]);
    ctx.beginPath();
    ctx.moveTo(sx + 120, sy + 700);
    ctx.quadraticCurveTo(cx, sy + 420, sx + sw - 140, sy + 260);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = BRAND.red;
    ctx.beginPath();
    ctx.arc(sx + sw - 140, sy + 260, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BRAND.ink;
    ctx.beginPath();
    ctx.arc(sx + 120, sy + 700, 24, 0, Math.PI * 2);
    ctx.fill();
    // Status card
    drawCard(ctx, sx + 60, sy + sh * 0.52, sw - 120, 420);
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 46px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText("Courier is on the way", sx + 110, sy + sh * 0.52 + 90);
    ctx.fillStyle = BRAND.muted;
    ctx.font = `500 32px ${FONT_SANS}`;
    ctx.fillText("Arriving in 8 min · Jan K.", sx + 110, sy + sh * 0.52 + 150);
    drawRedButton(ctx, sx + 110, sy + sh * 0.52 + 210, sw - 220, 88, "Call courier");
  }

  if (key === "dashboard") {
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 52px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText("Today", sx + 60, sy + 150);
    const stats = [
      ["Orders", "32"],
      ["Revenue", "1 248 zł"],
      ["Avg. rating", "4.8 ★"],
      ["Active couriers", "5"],
    ];
    stats.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx0 = sx + 60 + col * ((sw - 120) / 2 + 20);
      const cy0 = sy + 220 + row * 260;
      const cw = (sw - 120) / 2 - 20;
      drawCard(ctx, cx0, cy0, cw, 220);
      ctx.fillStyle = BRAND.red;
      ctx.font = `800 56px ${FONT_SANS}`;
      ctx.fillText(value!, cx0 + 36, cy0 + 100);
      ctx.fillStyle = BRAND.muted;
      ctx.font = `500 30px ${FONT_SANS}`;
      ctx.fillText(label!, cx0 + 36, cy0 + 160);
    });
    drawRedButton(ctx, sx + 60, sy + sh - 200, sw - 120, 96, "Open for orders");
  }
}

export function renderScreenshot(
  logo: HTMLImageElement,
  key: ScreenKey,
  headline: string,
  background: "yellow" | "red",
): HTMLCanvasElement {
  const { canvas, ctx } = makeCanvas(SW, SH);
  ctx.fillStyle = background === "yellow" ? BRAND.sun : BRAND.red;
  ctx.fillRect(0, 0, SW, SH);

  // Headline
  ctx.fillStyle = background === "yellow" ? BRAND.ink : BRAND.card;
  ctx.font = `800 92px ${FONT_SANS}`;
  ctx.textAlign = "center";
  const lines = wrapText(ctx, headline, SW - 200);
  lines.forEach((line, i) => ctx.fillText(line, SW / 2, 240 + i * 110));

  // Phone mockup, slightly overflowing the bottom like store screenshots do.
  const phoneW = SW * 0.78;
  const phoneH = phoneW * 2.05;
  const px = (SW - phoneW) / 2;
  const py = 240 + lines.length * 110 + 60;
  const { sx, sy, sw, sh } = drawPhoneFrame(ctx, px, py, phoneW, phoneH);
  drawScreenContent(ctx, logo, key, sx, sy, sw, sh);
  endPhoneFrame(ctx);
  return canvas;
}

export const SCREENSHOT_KEYS = SCREEN_ORDER;

// -------------------------------------------------------------- assembly

export interface GeneratedAsset {
  path: string; // path inside the ZIP
  canvas: HTMLCanvasElement;
}

export async function generateAllAssets(
  headlines: HeadlineSet,
  lang: AssetLang,
): Promise<GeneratedAsset[]> {
  await ensureFonts();
  const logo = await loadLogo();

  const assets: GeneratedAsset[] = [
    { path: "icons/app-icon-1024.png", canvas: renderAppIcon(logo, 1024) },
    { path: "icons/app-icon-512.png", canvas: renderAppIcon(logo, 512) },
    { path: "icons/android-adaptive-foreground-432.png", canvas: renderAdaptiveForeground(logo) },
    { path: "icons/android-adaptive-background-432.png", canvas: renderAdaptiveBackground() },
    { path: "splash/splash-1242x2688.png", canvas: renderSplash(logo, lang) },
    { path: "play-store/feature-graphic-1024x500.png", canvas: renderFeatureGraphic(logo, lang) },
  ];

  const bgCycle: Array<"yellow" | "red"> = ["yellow", "red", "yellow", "red", "yellow", "red"];
  SCREEN_ORDER.forEach((key, i) => {
    assets.push({
      path: `app-store/screenshot-${i + 1}-${key}-1290x2796.png`,
      canvas: renderScreenshot(logo, key, headlines[key], bgCycle[i]!),
    });
  });

  return assets;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))), "image/png");
  });
}

export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const blob = await canvasToBlob(canvas);
  const { deliverFile } = await import("@/lib/download");
  await deliverFile(blob, filename);
}

export async function downloadAllAsZip(assets: GeneratedAsset[]) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const asset of assets) {
    zip.file(asset.path, await canvasToBlob(asset.canvas));
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  const { deliverFile } = await import("@/lib/download");
  await deliverFile(blob, "dobra-store-assets.zip");
}
