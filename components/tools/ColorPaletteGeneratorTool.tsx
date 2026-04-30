"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  Copy,
  Download,
  Dices,
  Shuffle,
} from "lucide-react";

type PaletteType = "analogous" | "complementary" | "triadic" | "monochromatic";

const paletteTypes: { label: string; value: PaletteType }[] = [
  { label: "Analogous", value: "analogous" },
  { label: "Complementary", value: "complementary" },
  { label: "Triadic", value: "triadic" },
  { label: "Monochromatic", value: "monochromatic" },
];

const colorCounts = [3, 4, 5, 6, 7, 8];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeHex(value: string) {
  const cleaned = value.trim().replace("#", "");

  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase()}`;
  }

  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }

  return "#FF6A5B";
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex).replace("#", "");

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (value: number) =>
    clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      case blue:
        h = (red - green) / delta + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

function hslToRgb(h: number, s: number, l: number) {
  const hue = (((h % 360) + 360) % 360) / 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;

  if (saturation === 0) {
    const gray = lightness * 255;
    return { r: gray, g: gray, b: gray };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let temp = t;

    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;

    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255,
  };
}

function hslToHex(h: number, s: number, l: number) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function getOffsets(type: PaletteType, count: number) {
  if (type === "complementary") {
    const base = [0, 180, 150, 210, 30, -30, 120, 240];
    return base.slice(0, count);
  }

  if (type === "triadic") {
    const base = [0, 120, 240, 90, 150, 210, 270, 30];
    return base.slice(0, count);
  }

  if (type === "monochromatic") {
    return Array.from({ length: count }, (_, index) => index);
  }

  const middle = (count - 1) / 2;
  return Array.from({ length: count }, (_, index) => (index - middle) * 18);
}

function generatePalette(baseHex: string, type: PaletteType, count: number) {
  const { r, g, b } = hexToRgb(baseHex);
  const baseHsl = rgbToHsl(r, g, b);
  const offsets = getOffsets(type, count);

  if (type === "monochromatic") {
    return offsets.map((_, index) => {
      const step = count === 1 ? 0 : index / (count - 1);
      const lightness = clamp(32 + step * 48, 18, 88);
      const saturation = clamp(baseHsl.s + 4 - step * 8, 18, 88);

      return hslToHex(baseHsl.h, saturation, lightness);
    });
  }

  return offsets.map((offset, index) => {
    const step = count === 1 ? 0 : index / (count - 1);
    const lightnessShift = (step - 0.5) * 18;
    const saturationShift = type === "analogous" ? -step * 8 : -step * 4;

    return hslToHex(
      baseHsl.h + offset,
      clamp(baseHsl.s + saturationShift, 20, 90),
      clamp(baseHsl.l + lightnessShift, 24, 86),
    );
  });
}

function getRandomHex() {
  return rgbToHex(
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  );
}

function getRandomPaletteType(current?: PaletteType) {
  const options = current
    ? paletteTypes.filter((item) => item.value !== current)
    : paletteTypes;

  return options[Math.floor(Math.random() * options.length)].value;
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState("#FF6A5B");
  const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
  const [colorCount, setColorCount] = useState(5);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const palette = useMemo(
    () => generatePalette(baseColor, paletteType, colorCount),
    [baseColor, paletteType, colorCount],
  );

  const cssOutput = useMemo(() => {
    const lines = palette.map(
      (color, index) => `  --color-${index + 1}: ${color};`,
    );

    return [".palette {", ...lines, "}"].join("\n");
  }, [palette]);

  const showCopied = (key: string) => {
    setCopiedAction(key);
    window.setTimeout(() => setCopiedAction(null), 1500);
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopied(key);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopied(key);
    }
  };

  const handleShuffle = () => {
    setPaletteType((current) => getRandomPaletteType(current));
  };

  const handleRandomAll = () => {
    setBaseColor(getRandomHex());
    setPaletteType(getRandomPaletteType());
    setColorCount(colorCounts[Math.floor(Math.random() * colorCounts.length)]);
  };

  const handleDownload = () => {
    const blob = new Blob([cssOutput], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "peach-lab-palette.css";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-32 lg:pb-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <div className="min-w-0 space-y-5">
          <section className="rounded-[24px] border border-[#f3ddd4] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-neutral-900">
                Palette Preview
              </h2>
            </div>

            <div
              className="grid gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${palette.length}, minmax(0, 1fr))`,
              }}
            >
              {palette.map((color, index) => (
                <div key={`${color}-${index}`} className="min-w-0">
                  <div
                    className="h-24 rounded-2xl shadow-inner sm:h-28 lg:h-32"
                    style={{ backgroundColor: color }}
                  />
                  <div className="mt-2 truncate text-center text-[11px] font-medium text-neutral-700 sm:text-xs">
                    {color}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#f3ddd4] bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              CSS Output
            </h2>

            <pre className="max-w-full overflow-x-auto rounded-2xl border border-[#f4e1d9] bg-[#fff8f5] p-4 text-xs leading-6 text-neutral-800 sm:text-sm">
              <code>{cssOutput}</code>
            </pre>

            <button
              type="button"
              onClick={() => copyText(cssOutput, "desktop-css")}
              className="mt-4 hidden items-center justify-center gap-2 rounded-xl border border-[#f4b9a9] bg-white px-4 py-2 text-sm font-medium text-[#c96f56] transition hover:bg-[#fff4ef] lg:inline-flex"
            >
              <Copy className="h-4 w-4" />
              {copiedAction === "desktop-css" ? "Copied" : "Copy CSS"}
            </button>
          </section>
        </div>

        <aside className="min-w-0">
          <section className="rounded-[24px] border border-[#f3ddd4] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">
              Controls
            </h2>

            <div className="mb-5 hidden grid-cols-2 gap-3 lg:grid">
              <button
                type="button"
                onClick={handleShuffle}
                className="flex min-h-[64px] items-center justify-center gap-3 rounded-2xl border border-[#f4b9a9] bg-white px-4 py-3 text-[#d96f55] transition hover:bg-[#fff4ef]"
              >
                <Shuffle className="h-5 w-5" />
                <span className="text-left">
                  <span className="block text-sm font-semibold">Shuffle</span>
                  <span className="block text-xs opacity-75">Keep colors</span>
                </span>
              </button>

              <button
                type="button"
                onClick={handleRandomAll}
                className="flex min-h-[64px] items-center justify-center gap-3 rounded-2xl bg-[#f48768] px-4 py-3 text-white shadow-sm transition hover:bg-[#ed7656]"
              >
                <Dices className="h-5 w-5" />
                <span className="text-left">
                  <span className="block text-sm font-semibold">
                    Random All
                  </span>
                  <span className="block text-xs opacity-85">
                    New palette & settings
                  </span>
                </span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="base-color"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Base Color
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#f2ddd5] bg-white px-3 py-2">
                  <input
                    id="base-color"
                    type="color"
                    value={normalizeHex(baseColor)}
                    onChange={(event) => setBaseColor(event.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                    aria-label="Choose base color"
                  />

                  <input
                    value={baseColor}
                    onChange={(event) =>
                      setBaseColor(normalizeHex(event.target.value))
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-800 outline-none"
                    aria-label="Base color hex value"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="palette-type"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  Palette Type
                </label>

                <select
                  id="palette-type"
                  value={paletteType}
                  onChange={(event) =>
                    setPaletteType(event.target.value as PaletteType)
                  }
                  className="w-full rounded-2xl border border-[#f2ddd5] bg-white px-4 py-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-[#f4a28c]"
                >
                  {paletteTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-800">
                  Color Count
                </p>

                <div className="grid grid-cols-6 gap-2">
                  {colorCounts.map((count) => {
                    const active = colorCount === count;

                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setColorCount(count)}
                        className={
                          active
                            ? "rounded-xl border border-[#f48768] bg-[#fff2ed] px-2 py-2 text-sm font-semibold text-[#e46f50]"
                            : "rounded-xl border border-[#f2ddd5] bg-white px-2 py-2 text-sm font-medium text-neutral-600 transition hover:bg-[#fff8f5]"
                        }
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-800">
                  Hex Values
                </p>

                <div className="space-y-2">
                  {palette.map((color, index) => (
                    <div
                      key={`${color}-row-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-[#f2ddd5] bg-white px-3 py-2"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#f2ddd5] text-xs font-medium text-neutral-500">
                        {index + 1}
                      </span>

                      <span
                        className="h-6 w-6 shrink-0 rounded-lg border border-black/5"
                        style={{ backgroundColor: color }}
                      />

                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
                        {color}
                      </span>

                      <button
                        type="button"
                        onClick={() => copyText(color, `hex-${index}`)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-[#fff2ed] hover:text-[#d96f55]"
                        aria-label={`Copy ${color}`}
                      >
                        <Clipboard className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="hidden w-full items-center justify-center gap-2 rounded-2xl border border-[#f2ddd5] bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-[#fff8f5] lg:flex"
              >
                <Download className="h-4 w-4" />
                Download CSS
              </button>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#f3ddd4] bg-white/95 px-3 py-3 shadow-[0_-14px_34px_rgba(244,135,104,0.16)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border border-[#f4b9a9] bg-white px-2 text-[#d96f55]"
          >
            <Shuffle className="mb-1 h-5 w-5" />
            <span className="text-xs font-semibold">Shuffle</span>
            <span className="text-[10px] leading-none opacity-75">
              Keep colors
            </span>
          </button>

          <button
            type="button"
            onClick={handleRandomAll}
            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl bg-[#f48768] px-2 text-white shadow-sm"
          >
            <Dices className="mb-1 h-5 w-5" />
            <span className="text-xs font-semibold">Random All</span>
            <span className="text-[10px] leading-none opacity-85">
              All settings
            </span>
          </button>

          <button
            type="button"
            onClick={() => copyText(cssOutput, "mobile-css")}
            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border border-[#f2ddd5] bg-white px-2 text-neutral-700"
          >
            <Copy className="mb-1 h-5 w-5" />
            <span className="text-xs font-semibold">
              {copiedAction === "mobile-css" ? "Copied" : "Copy"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border border-[#f2ddd5] bg-white px-2 text-neutral-700"
          >
            <Download className="mb-1 h-5 w-5" />
            <span className="text-xs font-semibold">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
