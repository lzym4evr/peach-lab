"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function hexToRgb(hex: string) {
    const safeHex = getSafeHexColor(hex, "#111827");
    const cleanHex = safeHex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

function getRandomHexColor() {
    const value = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();

    return `#${value}`;
}

function getRandomNumber(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function getRandomCanvasSize() {
    const sizes = [
        { width: 800, height: 600 },
        { width: 1200, height: 800 },
        { width: 1600, height: 900 },
        { width: 1920, height: 1080 },
        { width: 1080, height: 1080 },
        { width: 1080, height: 1350 },
    ];

    return sizes[Math.floor(Math.random() * sizes.length)];
}

export default function NoiseTextureGeneratorTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const text = t.noiseTextureGenerator;

    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const [density, setDensity] = useState(45);
    const [opacity, setOpacity] = useState(22);
    const [backgroundColor, setBackgroundColor] = useState("#FFF7F3");
    const [noiseColor, setNoiseColor] = useState("#111827");
    const [seed, setSeed] = useState(1);
    const [copied, setCopied] = useState(false);
    const [hasPreview, setHasPreview] = useState(false);

    function generateNoise() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) return;

        const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");
        const safeNoiseColor = getSafeHexColor(noiseColor, "#111827");

        context.fillStyle = safeBackgroundColor;
        context.fillRect(0, 0, width, height);

        const rgb = hexToRgb(safeNoiseColor);
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        const densityValue = density / 100;
        const alphaValue = Math.round((opacity / 100) * 255);

        let randomSeed = seed;

        function seededRandom() {
            randomSeed = (randomSeed * 9301 + 49297) % 233280;
            return randomSeed / 233280;
        }

        for (let index = 0; index < data.length; index += 4) {
            if (seededRandom() < densityValue) {
                data[index] = rgb.r;
                data[index + 1] = rgb.g;
                data[index + 2] = rgb.b;
                data[index + 3] = alphaValue;
            }
        }

        context.putImageData(imageData, 0, 0);
    }

    useEffect(() => {
        if (!hasPreview) return;

        generateNoise();
    }, [
        width,
        height,
        density,
        opacity,
        backgroundColor,
        noiseColor,
        seed,
        hasPreview,
    ]);

    function showPreview() {
        setHasPreview(true);
    }

    function shuffleNoise() {
        setDensity(getRandomNumber(10, 80));
        setOpacity(getRandomNumber(15, 100));
        setSeed(getRandomNumber(1, 999999));
        setHasPreview(true);
    }

    function randomizeAll() {
        const nextSize = getRandomCanvasSize();

        setWidth(nextSize.width);
        setHeight(nextSize.height);
        setBackgroundColor(getRandomHexColor());
        setNoiseColor(getRandomHexColor());
        setDensity(getRandomNumber(10, 80));
        setOpacity(getRandomNumber(15, 100));
        setSeed(getRandomNumber(1, 999999));
        setHasPreview(true);
    }

    function getCssOutput() {
        const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");
        const safeNoiseColor = getSafeHexColor(noiseColor, "#111827");
        const dotAlpha = Math.max(0.02, opacity / 100);
        const dotSize = Math.max(1, Math.round(density / 18));
        const spacing = Math.max(3, Math.round(18 - density / 5));
        const rgb = hexToRgb(safeNoiseColor);

        return `background-color: ${safeBackgroundColor};
background-image: radial-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dotAlpha}) ${dotSize}px, transparent ${dotSize}px);
background-size: ${spacing}px ${spacing}px;`;
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(getCssOutput());
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
        }
    }

    function downloadPng() {
        setHasPreview(true);

        setTimeout(() => {
            generateNoise();

            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "peach-lab-noise-texture.png";
            link.click();
        }, 0);
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

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                            <canvas
                                ref={canvasRef}
                                className={`h-auto max-h-[520px] w-full rounded-2xl object-contain ${hasPreview ? "block" : "hidden"
                                    }`}
                            />

                            {!hasPreview && (
                                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center">
                                    <p className="max-w-xs text-sm leading-6 text-gray-500">
                                        {text.emptyHint}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">{text.cssTitle}</h3>

                            <button
                                type="button"
                                onClick={copyCss}
                                className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                            >
                                {copied ? t.common.copied : t.common.copy}
                            </button>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                            <code>{getCssOutput()}</code>
                        </pre>
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">{text.controls}</h3>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={shuffleNoise}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shuffleNoise}
                        </button>

                        <button
                            type="button"
                            onClick={randomizeAll}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.randomAll}
                        </button>
                    </div>

                    <div className="mt-5 space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <NumberInput
                                label={text.width}
                                value={width}
                                min={100}
                                max={3000}
                                onChange={(value) => {
                                    setWidth(value);
                                    showPreview();
                                }}
                            />

                            <NumberInput
                                label={text.height}
                                value={height}
                                min={100}
                                max={3000}
                                onChange={(value) => {
                                    setHeight(value);
                                    showPreview();
                                }}
                            />
                        </div>

                        <RangeInput
                            label={text.density}
                            value={density}
                            min={1}
                            max={100}
                            suffix="%"
                            onChange={(value) => {
                                setDensity(value);
                                showPreview();
                            }}
                        />

                        <RangeInput
                            label={text.opacity}
                            value={opacity}
                            min={1}
                            max={100}
                            suffix="%"
                            onChange={(value) => {
                                setOpacity(value);
                                showPreview();
                            }}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <ColorInput
                                label={text.backgroundColor}
                                value={backgroundColor}
                                fallback="#FFF7F3"
                                onChange={(value) => {
                                    setBackgroundColor(value);
                                    showPreview();
                                }}
                            />

                            <ColorInput
                                label={text.noiseColor}
                                value={noiseColor}
                                fallback="#111827"
                                onChange={(value) => {
                                    setNoiseColor(value);
                                    showPreview();
                                }}
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={copyCss}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {copied ? t.common.copied : text.copyCss}
                            </button>

                            <button
                                type="button"
                                onClick={downloadPng}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {text.downloadPng}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function NumberInput({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
            />
        </label>
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