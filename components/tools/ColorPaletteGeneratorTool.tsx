"use client";

import { useMemo, useState } from "react";
import {
    Check,
    ChevronDown,
    Clipboard,
    Copy,
    Dice5,
    Download,
    Shuffle,
} from "lucide-react";

type PaletteType =
    | "analogous"
    | "monochromatic"
    | "complementary"
    | "triadic"
    | "pastel";

const PALETTE_TYPES: { label: string; value: PaletteType }[] = [
    { label: "Analogous", value: "analogous" },
    { label: "Monochromatic", value: "monochromatic" },
    { label: "Complementary", value: "complementary" },
    { label: "Triadic", value: "triadic" },
    { label: "Pastel", value: "pastel" },
];

const COLOR_COUNTS = [3, 4, 5, 6, 7, 8];

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function rgbToHex(r: number, g: number, b: number) {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = clamp(Math.round(x), 0, 255).toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    ).toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / d + 2;
                break;

            case b:
                h = (r - g) / d + 4;
                break;
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
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r1 = 0;
    let g1 = 0;
    let b1 = 0;

    if (h >= 0 && h < 60) {
        r1 = c;
        g1 = x;
    } else if (h >= 60 && h < 120) {
        r1 = x;
        g1 = c;
    } else if (h >= 120 && h < 180) {
        g1 = c;
        b1 = x;
    } else if (h >= 180 && h < 240) {
        g1 = x;
        b1 = c;
    } else if (h >= 240 && h < 300) {
        r1 = x;
        b1 = c;
    } else {
        r1 = c;
        b1 = x;
    }

    return {
        r: (r1 + m) * 255,
        g: (g1 + m) * 255,
        b: (b1 + m) * 255,
    };
}

function hslToHex(h: number, s: number, l: number) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function hexToHsl(hex: string) {
    const rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

function getRandomHex() {
    return rgbToHex(
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256)
    );
}

function getRandomPaletteType(): PaletteType {
    const randomIndex = Math.floor(Math.random() * PALETTE_TYPES.length);
    return PALETTE_TYPES[randomIndex].value;
}

function getRandomColorCount() {
    return COLOR_COUNTS[Math.floor(Math.random() * COLOR_COUNTS.length)];
}

function generatePalette(
    baseColor: string,
    paletteType: PaletteType,
    colorCount: number
) {
    const base = hexToHsl(baseColor);
    const colors: string[] = [];

    for (let index = 0; index < colorCount; index++) {
        const ratio = colorCount === 1 ? 0 : index / (colorCount - 1);

        let h = base.h;
        let s = base.s;
        let l = base.l;

        if (paletteType === "analogous") {
            const spread = 56;
            h = base.h - spread / 2 + spread * ratio;
            s = clamp(base.s + (index % 2 === 0 ? 4 : -4), 38, 86);
            l = clamp(base.l + (ratio - 0.5) * 18, 42, 84);
        }

        if (paletteType === "monochromatic") {
            h = base.h;
            s = clamp(base.s + (ratio - 0.5) * 18, 30, 88);
            l = clamp(24 + ratio * 58, 22, 86);
        }

        if (paletteType === "complementary") {
            const useComplement = index >= Math.ceil(colorCount / 2);
            h = useComplement ? base.h + 180 : base.h;
            s = clamp(base.s + (ratio - 0.5) * 14, 36, 88);
            l = clamp(base.l + (ratio - 0.5) * 24, 28, 86);
        }

        if (paletteType === "triadic") {
            const triadOffset = [0, 120, 240][index % 3];
            h = base.h + triadOffset;
            s = clamp(base.s + (ratio - 0.5) * 12, 36, 88);
            l = clamp(base.l + (index % 2 === 0 ? 8 : -8), 34, 84);
        }

        if (paletteType === "pastel") {
            h = base.h - 32 + ratio * 64;
            s = clamp(42 + ratio * 18, 36, 68);
            l = clamp(76 + (index % 2 === 0 ? 4 : -4), 68, 90);
        }

        colors.push(hslToHex(h, s, l));
    }

    return colors;
}

function getCssOutput(colors: string[]) {
    const colorLines = colors
        .map((color, index) => `  --color-${index + 1}: ${color};`)
        .join("\n");

    return `.palette {
${colorLines}
}`;
}

export default function ColorPaletteGeneratorTool() {
    const [baseColor, setBaseColor] = useState("#FF6A5B");
    const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
    const [colorCount, setColorCount] = useState(5);
    const [copied, setCopied] = useState(false);

    const palette = useMemo(() => {
        return generatePalette(baseColor, paletteType, colorCount);
    }, [baseColor, paletteType, colorCount]);

    const cssOutput = useMemo(() => {
        return getCssOutput(palette);
    }, [palette]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
        }
    };

    const handleShuffle = () => {
        /**
         * Shuffle:
         * Keep the current base color, randomize the other settings.
         */
        setPaletteType(getRandomPaletteType());
        setColorCount(getRandomColorCount());
    };

    const handleRandomAll = () => {
        /**
         * Random All:
         * Randomize color, palette type, and color count.
         */
        setBaseColor(getRandomHex());
        setPaletteType(getRandomPaletteType());
        setColorCount(getRandomColorCount());
    };

    const handleDownload = () => {
        const content = [
            "Peach Lab Color Palette",
            "",
            "HEX Values:",
            ...palette.map((color, index) => `${index + 1}. ${color}`),
            "",
            "CSS:",
            cssOutput,
        ].join("\n");

        const blob = new Blob([content], {
            type: "text/plain;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "peach-lab-color-palette.txt";
        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                Palette Preview
                            </h2>
                        </div>

                        <div
                            className="grid gap-2 md:gap-4"
                            style={{
                                gridTemplateColumns: `repeat(${palette.length}, minmax(0, 1fr))`,
                            }}
                        >
                            {palette.map((color, index) => (
                                <div
                                    key={`${color}-${index}`}
                                    className="group relative overflow-hidden rounded-2xl border border-[#F1E5DF] shadow-sm"
                                >
                                    <div
                                        className="h-28 md:h-64"
                                        style={{
                                            backgroundColor: color,
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => handleCopy(color)}
                                        className="absolute bottom-2 left-1/2 w-[calc(100%-10px)] -translate-x-1/2 rounded-lg bg-white/90 px-1 py-1 text-center text-[9px] font-semibold leading-none text-[#2A1F1B] shadow-sm backdrop-blur transition hover:bg-white md:bottom-3 md:w-auto md:min-w-[72px] md:px-3 md:py-1.5 md:text-xs md:leading-normal"
                                        aria-label={`Copy ${color}`}
                                    >
                                        {color}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-6">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                CSS Output
                            </h2>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm leading-7 text-[#2A1F1B]">
                            <code>{cssOutput}</code>
                        </pre>

                        <button
                            type="button"
                            onClick={() => handleCopy(cssOutput)}
                            className="mt-4 hidden w-fit items-center justify-center gap-2 rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:inline-flex"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4" />
                                    Copy CSS
                                </>
                            )}
                        </button>
                    </section>
                </div>

                <aside className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-6 lg:self-start">
                    <h2 className="mb-4 text-lg font-semibold text-[#2A1F1B]">
                        Controls
                    </h2>

                    <div className="mb-5 hidden grid-cols-2 gap-3 md:grid">
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="flex min-h-[68px] items-center justify-center gap-3 rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-[#F28C6F] transition hover:bg-[#FFF7F3]"
                        >
                            <Shuffle className="h-5 w-5" />
                            <span className="text-left">
                                <span className="block text-sm font-semibold">Shuffle</span>
                                <span className="block text-xs text-[#A17F74]">
                                    Keep colors
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleRandomAll}
                            className="flex min-h-[68px] items-center justify-center gap-3 rounded-2xl bg-[#F28C6F] px-4 py-3 text-white shadow-sm transition hover:bg-[#E6765B]"
                        >
                            <Dice5 className="h-5 w-5" />
                            <span className="text-left">
                                <span className="block text-sm font-semibold">
                                    Random All
                                </span>
                                <span className="block text-xs text-white/85">
                                    New palette
                                </span>
                            </span>
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                                Base Color
                            </label>

                            <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5DF] bg-white px-3 py-2">
                                <input
                                    type="color"
                                    value={baseColor}
                                    onChange={(event) =>
                                        setBaseColor(event.target.value.toUpperCase())
                                    }
                                    className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                                    aria-label="Choose base color"
                                />

                                <input
                                    type="text"
                                    value={baseColor}
                                    onChange={(event) => {
                                        const value = event.target.value.toUpperCase();

                                        if (/^#[0-9A-F]{0,6}$/.test(value)) {
                                            setBaseColor(value);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (!/^#[0-9A-F]{6}$/.test(baseColor)) {
                                            setBaseColor("#FF6A5B");
                                        }
                                    }}
                                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#2A1F1B] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                                Palette Type
                            </label>

                            <div className="relative">
                                <select
                                    value={paletteType}
                                    onChange={(event) =>
                                        setPaletteType(event.target.value as PaletteType)
                                    }
                                    className="w-full appearance-none rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm font-medium text-[#2A1F1B] outline-none transition focus:border-[#F28C6F]"
                                >
                                    {PALETTE_TYPES.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A17F74]" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                                Color Count
                            </label>

                            <div className="grid grid-cols-3 gap-2 md:grid-cols-6 lg:grid-cols-3">
                                {COLOR_COUNTS.map((count) => {
                                    const isActive = colorCount === count;

                                    return (
                                        <button
                                            key={count}
                                            type="button"
                                            onClick={() => setColorCount(count)}
                                            className={[
                                                "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                                                isActive
                                                    ? "border-[#F4C8BA] bg-[#FFF1EC] text-[#F28C6F]"
                                                    : "border-[#F1E5DF] bg-white text-[#5F514C] hover:bg-[#FFF7F3]",
                                            ].join(" ")}
                                        >
                                            {count}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                                Hex Values
                            </label>

                            <div className="space-y-2">
                                {palette.map((color, index) => (
                                    <div
                                        key={`${color}-row-${index}`}
                                        className="flex items-center gap-3 rounded-xl border border-[#F1E5DF] bg-white px-3 py-2"
                                    >
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FFF7F3] text-xs font-semibold text-[#A17F74]">
                                            {index + 1}
                                        </span>

                                        <span
                                            className="h-5 w-5 shrink-0 rounded-md border border-[#F1E5DF]"
                                            style={{ backgroundColor: color }}
                                        />

                                        <span className="min-w-0 flex-1 text-sm font-medium text-[#2A1F1B]">
                                            {color}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(color)}
                                            className="shrink-0 rounded-lg p-1.5 text-[#5F514C] transition hover:bg-[#FFF7F3] hover:text-[#F28C6F]"
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
                            className="hidden w-full items-center justify-center gap-2 rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:inline-flex"
                        >
                            <Download className="h-4 w-4" />
                            Download Palette
                        </button>
                    </div>
                </aside>
            </div>

            <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
                <div className="rounded-[24px] border border-[#F1E5DF] bg-white/95 p-3 shadow-[0_12px_30px_rgba(42,31,27,0.16)] backdrop-blur">
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-1.5 text-center text-[#F28C6F]"
                        >
                            <Shuffle className="mb-1 h-5 w-5" />
                            <span className="text-xs font-semibold leading-tight">
                                Shuffle
                            </span>
                            <span className="mt-0.5 text-[10px] leading-tight text-[#A17F74]">
                                Keep colors
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleRandomAll}
                            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl bg-[#F28C6F] px-1.5 text-center text-white shadow-sm"
                        >
                            <Dice5 className="mb-1 h-5 w-5" />
                            <span className="text-xs font-semibold leading-tight">
                                Random All
                            </span>
                            <span className="mt-0.5 text-[10px] leading-tight text-white/85">
                                New palette
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleCopy(cssOutput)}
                            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white px-1.5 text-center text-[#2A1F1B]"
                        >
                            {copied ? (
                                <Check className="mb-1 h-5 w-5" />
                            ) : (
                                <Copy className="mb-1 h-5 w-5" />
                            )}
                            <span className="text-xs font-semibold leading-tight">
                                {copied ? "Copied" : "Copy"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl bg-[#F28C6F] px-1.5 text-center text-white shadow-sm"
                        >
                            <Download className="mb-1 h-5 w-5" />
                            <span className="text-xs font-semibold leading-tight">
                                Download
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}