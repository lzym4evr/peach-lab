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
            cssText: `color: ${normalizedHex};
background-color: ${normalizedHex};
border-color: ${normalizedHex};`,
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
        <div className="space-y-5 md:space-y-6">
            <div
                className="min-h-56 rounded-3xl border border-[#F1E5DF] p-5 shadow-sm md:min-h-64 md:p-6"
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

            <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
                <div className="grid grid-cols-[0.9fr_1.1fr] gap-3 md:grid-cols-2 md:gap-4">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800 md:mb-3">
                            {t.hexRgbConverter.pickColor}
                        </label>

                        <input
                            type="color"
                            value={colorData?.hex ?? "#F28C6F"}
                            onChange={(event) => handleColorPickerChange(event.target.value)}
                            className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 md:h-14"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800 md:mb-3">
                            {t.hexRgbConverter.hexValue}
                        </label>

                        <input
                            value={hexInput}
                            onChange={(event) => setHexInput(event.target.value)}
                            placeholder="#F28C6F"
                            className="h-12 w-full rounded-xl border border-[#F1E5DF] px-3 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-14 md:px-4"
                        />
                    </div>
                </div>

                {!colorData && (
                    <p className="mt-3 text-sm text-red-500">
                        {t.hexRgbConverter.invalidHexDescription}
                    </p>
                )}
            </div>

            {colorData && (
                <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t.hexRgbConverter.hex}
                            </p>

                            <button
                                onClick={() => copyValue("HEX", colorData.hex)}
                                className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                            >
                                {copied === "HEX"
                                    ? t.common.copied
                                    : t.hexRgbConverter.copyHex}
                            </button>
                        </div>

                        <button
                            onClick={() => copyValue("HEX", colorData.hex)}
                            className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-lg font-semibold text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-xl"
                        >
                            {colorData.hex}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t.hexRgbConverter.rgb}
                            </p>

                            <button
                                onClick={() => copyValue("RGB", colorData.rgbText)}
                                className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                            >
                                {copied === "RGB"
                                    ? t.common.copied
                                    : t.hexRgbConverter.copyRgb}
                            </button>
                        </div>

                        <button
                            onClick={() => copyValue("RGB", colorData.rgbText)}
                            className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-base font-semibold text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-xl"
                        >
                            {colorData.rgbText}
                        </button>
                    </div>

                    <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t.hexRgbConverter.hsl}
                            </p>

                            <button
                                onClick={() => copyValue("HSL", colorData.hslText)}
                                className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                            >
                                {copied === "HSL"
                                    ? t.common.copied
                                    : t.hexRgbConverter.copyHsl}
                            </button>
                        </div>

                        <button
                            onClick={() => copyValue("HSL", colorData.hslText)}
                            className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-base font-semibold text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-xl"
                        >
                            {colorData.hslText}
                        </button>
                    </div>
                </div>
            )}

            {colorData && (
                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                        CSS Output
                    </h3>

                    <pre className="overflow-x-auto rounded-xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                        {colorData.cssText}
                    </pre>

                    <button
                        onClick={() => copyValue("CSS", colorData.cssText)}
                        className="mt-4 w-fit rounded-xl bg-[#F28C6F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {copied === "CSS" ? t.common.copied : "Copy CSS"}
                    </button>
                </div>
            )}

            {colorData && (
                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4 md:p-5">
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