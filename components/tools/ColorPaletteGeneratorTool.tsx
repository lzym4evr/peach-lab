"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type PaletteType =
    | "analogous"
    | "monochrome"
    | "complementary"
    | "triadic"
    | "random";

type PaletteSettings = {
    baseColor: string;
    paletteType: PaletteType;
    colorCount: number;
};

const defaultSettings: PaletteSettings = {
    baseColor: "#F28C6F",
    paletteType: "analogous",
    colorCount: 5,
};

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function getRandomNumber(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function getRandomHexColor() {
    const value = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();

    return `#${value}`;
}

function hexToRgb(hex: string) {
    const safeHex = getSafeHexColor(hex, "#F28C6F");
    const cleanHex = safeHex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (value: number) => {
        return Math.round(Math.max(0, Math.min(255, value)))
            .toString(16)
            .padStart(2, "0")
            .toUpperCase();
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
        const d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        if (max === red) {
            h = (green - blue) / d + (green < blue ? 6 : 0);
        } else if (max === green) {
            h = (blue - red) / d + 2;
        } else {
            h = (red - green) / d + 4;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

function hslToRgb(h: number, s: number, l: number) {
    const hue = (((h % 360) + 360) % 360) / 360;
    const saturation = Math.max(0, Math.min(100, s)) / 100;
    const lightness = Math.max(0, Math.min(100, l)) / 100;

    if (saturation === 0) {
        const gray = lightness * 255;
        return { r: gray, g: gray, b: gray };
    }

    const hueToRgb = (p: number, q: number, t: number) => {
        let nextT = t;

        if (nextT < 0) nextT += 1;
        if (nextT > 1) nextT -= 1;
        if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
        if (nextT < 1 / 2) return q;
        if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;

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
    const rgb = hslToRgb(h, s, l);

    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function generatePalette(settings: PaletteSettings) {
    const safeBaseColor = getSafeHexColor(settings.baseColor, "#F28C6F");
    const rgb = hexToRgb(safeBaseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const count = settings.colorCount;

    if (settings.paletteType === "random") {
        return Array.from({ length: count }, () => getRandomHexColor());
    }

    if (settings.paletteType === "monochrome") {
        const start = Math.max(12, hsl.l - 30);
        const end = Math.min(88, hsl.l + 30);
        const step = count === 1 ? 0 : (end - start) / (count - 1);

        return Array.from({ length: count }, (_, index) => {
            return hslToHex(hsl.h, hsl.s, start + step * index);
        });
    }

    if (settings.paletteType === "complementary") {
        const colors = [
            hslToHex(hsl.h, hsl.s, hsl.l),
            hslToHex(hsl.h + 180, hsl.s, hsl.l),
            hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.min(88, hsl.l + 18)),
            hslToHex(hsl.h + 180, Math.max(20, hsl.s - 20), Math.min(88, hsl.l + 18)),
            hslToHex(hsl.h, Math.min(100, hsl.s + 12), Math.max(16, hsl.l - 16)),
            hslToHex(
                hsl.h + 180,
                Math.min(100, hsl.s + 12),
                Math.max(16, hsl.l - 16),
            ),
        ];

        return colors.slice(0, count);
    }

    if (settings.paletteType === "triadic") {
        const colors = [
            hslToHex(hsl.h, hsl.s, hsl.l),
            hslToHex(hsl.h + 120, hsl.s, hsl.l),
            hslToHex(hsl.h + 240, hsl.s, hsl.l),
            hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.min(88, hsl.l + 18)),
            hslToHex(hsl.h + 120, Math.max(20, hsl.s - 20), Math.min(88, hsl.l + 18)),
            hslToHex(hsl.h + 240, Math.max(20, hsl.s - 20), Math.min(88, hsl.l + 18)),
        ];

        return colors.slice(0, count);
    }

    const range = 44;
    const start = hsl.h - range / 2;
    const step = count === 1 ? 0 : range / (count - 1);

    return Array.from({ length: count }, (_, index) => {
        return hslToHex(start + step * index, hsl.s, hsl.l);
    });
}

export default function ColorPaletteGeneratorTool() {
    const text = t.colorPaletteGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] =
        useState<PaletteSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const palette = useMemo(() => generatePalette(settings), [settings]);

    const cssOutput = useMemo(() => {
        return `:root {
${palette
                .map((color, index) => `  --color-${index + 1}: ${color};`)
                .join("\n")}
}`;
    }, [palette]);

    function updateSetting<K extends keyof PaletteSettings>(
        key: K,
        value: PaletteSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleShuffle() {
        const paletteTypes: PaletteType[] = [
            "analogous",
            "monochrome",
            "complementary",
            "triadic",
            "random",
        ];

        setSettings((current) => ({
            ...current,

            // Shuffle:
            // Keep user base color.
            // Randomize palette type and color count.
            paletteType: paletteTypes[Math.floor(Math.random() * paletteTypes.length)],
            colorCount: getRandomNumber(4, 6),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        const paletteTypes: PaletteType[] = [
            "analogous",
            "monochrome",
            "complementary",
            "triadic",
            "random",
        ];

        setSettings({
            // Random All:
            // Randomize base color, palette type, and color count.
            baseColor: getRandomHexColor(),
            paletteType: paletteTypes[Math.floor(Math.random() * paletteTypes.length)],
            colorCount: getRandomNumber(4, 6),
        });

        setCopiedKey("");
        setCopyError("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setCopiedKey("");
        setCopyError("");
    }

    async function copyText(value: string, key: string) {
        try {
            await navigator.clipboard.writeText(value);

            setCopiedKey(key);
            setCopyError("");

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopiedKey("");
            }, 1500);
        } catch {
            setCopyError(text.copyError);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h3 className="font-semibold text-gray-900">
                                {text.previewTitle}
                            </h3>

                            <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-[#F1E5DF]">
                            <div className="grid min-h-[260px] grid-cols-1 sm:grid-cols-5">
                                {palette.map((color, index) => {
                                    const key = `preview-color-${index}`;

                                    return (
                                        <button
                                            key={`${color}-${index}`}
                                            type="button"
                                            onClick={() => copyText(color, key)}
                                            className="group relative min-h-[120px] transition hover:scale-[1.02]"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-gray-800 opacity-90 shadow-sm transition group-hover:opacity-100">
                                                {copiedKey === key ? text.copied : color}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                            <code>{cssOutput}</code>
                        </pre>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => copyText(palette.join(", "), "copy-palette")}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {copiedKey === "copy-palette" ? text.copied : text.copyPalette}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.reset}
                            </button>
                        </div>

                        {copyError ? (
                            <p className="mt-3 text-sm font-medium text-red-500">
                                {copyError}
                            </p>
                        ) : null}
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">
                        {text.controlsTitle}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shuffle}
                        </button>

                        <button
                            type="button"
                            onClick={handleRandomAll}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.randomAll}
                        </button>
                    </div>

                    <div className="mt-5 space-y-5">
                        <ColorInput
                            label={text.baseColorLabel}
                            value={settings.baseColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("baseColor", value)}
                        />

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-800">
                                {text.paletteTypeLabel}
                            </span>

                            <select
                                value={settings.paletteType}
                                onChange={(event) =>
                                    updateSetting("paletteType", event.target.value as PaletteType)
                                }
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            >
                                <option value="analogous">{text.analogous}</option>
                                <option value="monochrome">{text.monochrome}</option>
                                <option value="complementary">{text.complementary}</option>
                                <option value="triadic">{text.triadic}</option>
                                <option value="random">{text.random}</option>
                            </select>
                        </label>

                        <RangeInput
                            label={text.colorCountLabel}
                            value={settings.colorCount}
                            min={3}
                            max={6}
                            suffix=""
                            onChange={(value) => updateSetting("colorCount", value)}
                        />

                        <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                            <h4 className="text-sm font-semibold text-gray-900">
                                HEX Values
                            </h4>

                            <div className="mt-3 space-y-2">
                                {palette.map((color, index) => {
                                    const key = `value-color-${index}`;

                                    return (
                                        <button
                                            key={`${color}-value-${index}`}
                                            type="button"
                                            onClick={() => copyText(color, key)}
                                            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#F1E5DF] bg-white p-3 text-left transition hover:bg-[#FFF7F3]"
                                        >
                                            <span
                                                className="h-8 w-8 rounded-xl border border-[#F1E5DF]"
                                                style={{ backgroundColor: color }}
                                            />

                                            <span className="font-mono text-sm font-semibold text-gray-700">
                                                {copiedKey === key ? text.copied : color}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ColorInput({
    label,
    value,
    fallback,
    onChange,
}: {
    label: string;
    value: string;
    fallback: string;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : fallback;

    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[58px_1fr] gap-3">
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}

function RangeInput({
    label,
    value,
    min,
    max,
    suffix,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">{label}</span>

                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {value}
                    {suffix}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full accent-[#F28C6F]"
            />
        </label>
    );
}