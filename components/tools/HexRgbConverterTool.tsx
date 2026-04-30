"use client";

import { useMemo, useState } from "react";
import { t } from "@/data/messages";

function normalizeHex(value: string) {
    let hex = value.trim().replace("#", "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
    }

    return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex: string) {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);

    return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;

    let hue = 0;
    let saturation = 0;

    if (max !== min) {
        const difference = max - min;

        saturation =
            lightness > 0.5
                ? difference / (2 - max - min)
                : difference / (max + min);

        switch (max) {
            case red:
                hue = (green - blue) / difference + (green < blue ? 6 : 0);
                break;
            case green:
                hue = (blue - red) / difference + 2;
                break;
            case blue:
                hue = (red - green) / difference + 4;
                break;
        }

        hue = hue / 6;
    }

    return {
        h: Math.round(hue * 360),
        s: Math.round(saturation * 100),
        l: Math.round(lightness * 100),
    };
}

export default function HexRgbConverterTool() {
    const [hexInput, setHexInput] = useState("#F28C6F");
    const [copied, setCopied] = useState("");

    const colorData = useMemo(() => {
        const normalizedHex = normalizeHex(hexInput);

        if (!normalizedHex) {
            return null;
        }

        const rgb = hexToRgb(normalizedHex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        return {
            hex: normalizedHex,
            rgb,
            hsl,
            rgbText: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            hslText: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        };
    }, [hexInput]);

    async function copyValue(label: string, value: string) {
        await navigator.clipboard.writeText(value);
        setCopied(label);

        setTimeout(() => {
            setCopied("");
        }, 1500);
    }

    function handleColorPickerChange(value: string) {
        setHexInput(value.toUpperCase());
    }

    return (
        <div className="space-y-6">
            <div
                className="min-h-64 rounded-3xl border border-[#F1E5DF] p-6 shadow-sm"
                style={{
                    background: colorData?.hex ?? "#FFF7F3",
                }}
            >
                <div className="inline-flex rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t.hexRgbConverter.previewColor}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {colorData?.hex ?? t.hexRgbConverter.invalidHex}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.hexRgbConverter.pickColor}
                    </label>

                    <input
                        type="color"
                        value={colorData?.hex ?? "#F28C6F"}
                        onChange={(event) => handleColorPickerChange(event.target.value)}
                        className="h-14 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                    />
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.hexRgbConverter.hexValue}
                    </label>

                    <input
                        value={hexInput}
                        onChange={(event) => setHexInput(event.target.value)}
                        placeholder="#F28C6F"
                        className="h-14 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                    />

                    {!colorData && (
                        <p className="mt-2 text-sm text-red-500">
                            {t.hexRgbConverter.invalidHexDescription}
                        </p>
                    )}
                </div>
            </div>

            {colorData && (
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t.hexRgbConverter.hex}
                        </p>
                        <p className="mt-2 break-all text-xl font-bold">
                            {colorData.hex}
                        </p>

                        <button
                            onClick={() => copyValue("HEX", colorData.hex)}
                            className="mt-4 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-2 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {copied === "HEX"
                                ? t.common.copied
                                : t.hexRgbConverter.copyHex}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t.hexRgbConverter.rgb}
                        </p>
                        <p className="mt-2 break-all text-xl font-bold">
                            {colorData.rgbText}
                        </p>

                        <button
                            onClick={() => copyValue("RGB", colorData.rgbText)}
                            className="mt-4 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-2 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {copied === "RGB"
                                ? t.common.copied
                                : t.hexRgbConverter.copyRgb}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t.hexRgbConverter.hsl}
                        </p>
                        <p className="mt-2 break-all text-xl font-bold">
                            {colorData.hslText}
                        </p>

                        <button
                            onClick={() => copyValue("HSL", colorData.hslText)}
                            className="mt-4 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-2 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {copied === "HSL"
                                ? t.common.copied
                                : t.hexRgbConverter.copyHsl}
                        </button>
                    </div>
                </div>
            )}

            {colorData && (
                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                        {t.hexRgbConverter.colorValues}
                    </h3>

                    <pre className="overflow-x-auto rounded-xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                        {`${t.hexRgbConverter.hex}: ${colorData.hex}
${t.hexRgbConverter.rgb}: ${colorData.rgbText}
${t.hexRgbConverter.hsl}: ${colorData.hslText}`}
                    </pre>
                </div>
            )}
        </div>
    );
}