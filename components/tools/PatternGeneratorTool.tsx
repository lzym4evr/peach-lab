"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

type PatternType = "dots" | "grid" | "diagonal-lines" | "checkerboard";

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
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

export default function PatternGeneratorTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const text = t.patternGenerator;

    const [patternType, setPatternType] = useState<PatternType>("dots");
    const [canvasWidth, setCanvasWidth] = useState(800);
    const [canvasHeight, setCanvasHeight] = useState(600);
    const [patternSize, setPatternSize] = useState(12);
    const [spacing, setSpacing] = useState(32);
    const [foregroundColor, setForegroundColor] = useState("#F28C6F");
    const [backgroundColor, setBackgroundColor] = useState("#FFF7F3");
    const [hasPreview, setHasPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    function drawPattern() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        const safeForegroundColor = getSafeHexColor(foregroundColor, "#F28C6F");
        const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");

        context.fillStyle = safeBackgroundColor;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.fillStyle = safeForegroundColor;
        context.strokeStyle = safeForegroundColor;
        context.lineWidth = Math.max(1, Math.round(patternSize / 6));

        if (patternType === "dots") {
            for (let x = offsetX + spacing / 2; x < canvasWidth + spacing; x += spacing) {
                for (
                    let y = offsetY + spacing / 2;
                    y < canvasHeight + spacing;
                    y += spacing
                ) {
                    context.beginPath();
                    context.arc(x, y, patternSize / 2, 0, Math.PI * 2);
                    context.fill();
                }
            }
        }

        if (patternType === "grid") {
            for (let x = offsetX; x <= canvasWidth + spacing; x += spacing) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, canvasHeight);
                context.stroke();
            }

            for (let y = offsetY; y <= canvasHeight + spacing; y += spacing) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(canvasWidth, y);
                context.stroke();
            }
        }

        if (patternType === "diagonal-lines") {
            for (let x = -canvasHeight + offsetX; x < canvasWidth + spacing; x += spacing) {
                context.beginPath();
                context.moveTo(x, canvasHeight);
                context.lineTo(x + canvasHeight, 0);
                context.stroke();
            }
        }

        if (patternType === "checkerboard") {
            for (let x = offsetX - spacing; x < canvasWidth + spacing; x += spacing) {
                for (let y = offsetY - spacing; y < canvasHeight + spacing; y += spacing) {
                    const column = Math.floor(x / spacing);
                    const row = Math.floor(y / spacing);

                    if ((column + row) % 2 === 0) {
                        context.fillRect(x, y, spacing, spacing);
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (!hasPreview) return;

        drawPattern();
    }, [
        patternType,
        canvasWidth,
        canvasHeight,
        patternSize,
        spacing,
        foregroundColor,
        backgroundColor,
        offsetX,
        offsetY,
        hasPreview,
    ]);

    function showPreview() {
        setHasPreview(true);
    }

    function shufflePattern() {
        const patternTypes: PatternType[] = [
            "dots",
            "grid",
            "diagonal-lines",
            "checkerboard",
        ];

        const nextSpacing = getRandomNumber(20, 70);

        setPatternType(patternTypes[Math.floor(Math.random() * patternTypes.length)]);
        setPatternSize(getRandomNumber(6, 30));
        setSpacing(nextSpacing);
        setOffsetX(getRandomNumber(0, nextSpacing));
        setOffsetY(getRandomNumber(0, nextSpacing));
        setHasPreview(true);
    }

    function randomAll() {
        const patternTypes: PatternType[] = [
            "dots",
            "grid",
            "diagonal-lines",
            "checkerboard",
        ];

        const nextSize = getRandomCanvasSize();
        const nextSpacing = getRandomNumber(20, 70);

        setCanvasWidth(nextSize.width);
        setCanvasHeight(nextSize.height);
        setPatternType(patternTypes[Math.floor(Math.random() * patternTypes.length)]);
        setPatternSize(getRandomNumber(6, 30));
        setSpacing(nextSpacing);
        setForegroundColor(getRandomHexColor());
        setBackgroundColor(getRandomHexColor());
        setOffsetX(getRandomNumber(0, nextSpacing));
        setOffsetY(getRandomNumber(0, nextSpacing));
        setHasPreview(true);
    }

    function getCssOutput() {
        const safeForegroundColor = getSafeHexColor(foregroundColor, "#F28C6F");
        const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");

        if (patternType === "dots") {
            return `background-color: ${safeBackgroundColor};
background-image: radial-gradient(${safeForegroundColor} ${Math.round(
                patternSize / 2,
            )}px, transparent ${Math.round(patternSize / 2)}px);
background-size: ${spacing}px ${spacing}px;
background-position: ${offsetX}px ${offsetY}px;`;
        }

        if (patternType === "grid") {
            return `background-color: ${safeBackgroundColor};
background-image: linear-gradient(${safeForegroundColor} 1px, transparent 1px), linear-gradient(90deg, ${safeForegroundColor} 1px, transparent 1px);
background-size: ${spacing}px ${spacing}px;
background-position: ${offsetX}px ${offsetY}px;`;
        }

        if (patternType === "diagonal-lines") {
            return `background-color: ${safeBackgroundColor};
background-image: repeating-linear-gradient(45deg, ${safeForegroundColor} 0, ${safeForegroundColor} ${Math.max(
                1,
                Math.round(patternSize / 4),
            )}px, transparent ${Math.max(
                1,
                Math.round(patternSize / 4),
            )}px, transparent ${spacing}px);
background-position: ${offsetX}px ${offsetY}px;`;
        }

        return `background-color: ${safeBackgroundColor};
background-image: linear-gradient(45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(-45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${safeForegroundColor} 75%), linear-gradient(-45deg, transparent 75%, ${safeForegroundColor} 75%);
background-size: ${spacing * 2}px ${spacing * 2}px;
background-position: ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY + spacing
            }px, ${offsetX + spacing}px ${offsetY - spacing}px, ${offsetX - spacing
            }px ${offsetY}px;`;
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
            drawPattern();

            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "peach-lab-pattern.png";
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
                            onClick={shufflePattern}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shufflePattern}
                        </button>

                        <button
                            type="button"
                            onClick={randomAll}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.randomAll}
                        </button>
                    </div>

                    <div className="mt-5 space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-800">
                                {text.patternType}
                            </span>

                            <select
                                value={patternType}
                                onChange={(event) => {
                                    setPatternType(event.target.value as PatternType);
                                    showPreview();
                                }}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            >
                                <option value="dots">{text.dots}</option>
                                <option value="grid">{text.grid}</option>
                                <option value="diagonal-lines">{text.diagonalLines}</option>
                                <option value="checkerboard">{text.checkerboard}</option>
                            </select>
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <NumberInput
                                label={text.canvasWidth}
                                value={canvasWidth}
                                min={100}
                                max={3000}
                                onChange={(value) => {
                                    setCanvasWidth(value);
                                    showPreview();
                                }}
                            />

                            <NumberInput
                                label={text.canvasHeight}
                                value={canvasHeight}
                                min={100}
                                max={3000}
                                onChange={(value) => {
                                    setCanvasHeight(value);
                                    showPreview();
                                }}
                            />
                        </div>

                        <RangeInput
                            label={text.patternSize}
                            value={patternSize}
                            min={2}
                            max={50}
                            suffix="px"
                            onChange={(value) => {
                                setPatternSize(value);
                                showPreview();
                            }}
                        />

                        <RangeInput
                            label={text.spacing}
                            value={spacing}
                            min={8}
                            max={100}
                            suffix="px"
                            onChange={(value) => {
                                setSpacing(value);
                                showPreview();
                            }}
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <ColorInput
                                label={text.foregroundColor}
                                value={foregroundColor}
                                fallback="#F28C6F"
                                onChange={(value) => {
                                    setForegroundColor(value);
                                    showPreview();
                                }}
                            />

                            <ColorInput
                                label={text.backgroundColor}
                                value={backgroundColor}
                                fallback="#FFF7F3"
                                onChange={(value) => {
                                    setBackgroundColor(value);
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