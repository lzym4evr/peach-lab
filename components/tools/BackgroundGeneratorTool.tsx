"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

function getRandomHexColor() {
    const value = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();

    return `#${value}`;
}

function hexToRgb(hex: string) {
    const cleanHex = hex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

export default function BackgroundGeneratorTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copyErrorText =
        (t.backgroundGenerator as { copyError?: string }).copyError ??
        "Copy failed. Please copy the CSS manually.";

    const [canvasWidth, setCanvasWidth] = useState(1200);
    const [canvasHeight, setCanvasHeight] = useState(800);
    const [baseColor, setBaseColor] = useState("#FFF7F3");
    const [accentColor1, setAccentColor1] = useState("#F28C6F");
    const [accentColor2, setAccentColor2] = useState("#FFD6C8");
    const [blobSize, setBlobSize] = useState(55);
    const [blur, setBlur] = useState(70);
    const [offsetX, setOffsetX] = useState(28);
    const [offsetY, setOffsetY] = useState(35);
    const [hasPreview, setHasPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    function drawBackground() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.fillStyle = baseColor;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const size = Math.round(
            (Math.min(canvasWidth, canvasHeight) * blobSize) / 100,
        );

        context.filter = `blur(${blur}px)`;

        const firstGradient = context.createRadialGradient(
            (canvasWidth * offsetX) / 100,
            (canvasHeight * offsetY) / 100,
            0,
            (canvasWidth * offsetX) / 100,
            (canvasHeight * offsetY) / 100,
            size,
        );

        const rgb1 = hexToRgb(accentColor1);

        firstGradient.addColorStop(
            0,
            `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0.9)`,
        );
        firstGradient.addColorStop(
            1,
            `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, 0)`,
        );

        context.fillStyle = firstGradient;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const secondGradient = context.createRadialGradient(
            (canvasWidth * (100 - offsetX)) / 100,
            (canvasHeight * (100 - offsetY)) / 100,
            0,
            (canvasWidth * (100 - offsetX)) / 100,
            (canvasHeight * (100 - offsetY)) / 100,
            size,
        );

        const rgb2 = hexToRgb(accentColor2);

        secondGradient.addColorStop(
            0,
            `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0.85)`,
        );
        secondGradient.addColorStop(
            1,
            `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0)`,
        );

        context.fillStyle = secondGradient;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.filter = "none";
    }

    useEffect(() => {
        if (!hasPreview) return;

        drawBackground();
    }, [
        canvasWidth,
        canvasHeight,
        baseColor,
        accentColor1,
        accentColor2,
        blobSize,
        blur,
        offsetX,
        offsetY,
        hasPreview,
    ]);

    function showPreview() {
        setHasPreview(true);
        setCopied(false);
        setCopyError("");
    }

    function shuffleBackground() {
        setBlobSize(Math.floor(35 + Math.random() * 45));
        setBlur(Math.floor(40 + Math.random() * 80));
        setOffsetX(Math.floor(15 + Math.random() * 70));
        setOffsetY(Math.floor(15 + Math.random() * 70));
        setHasPreview(true);
        setCopied(false);
        setCopyError("");
    }

    function randomAll() {
        setBaseColor(getRandomHexColor());
        setAccentColor1(getRandomHexColor());
        setAccentColor2(getRandomHexColor());
        setBlobSize(Math.floor(35 + Math.random() * 45));
        setBlur(Math.floor(40 + Math.random() * 80));
        setOffsetX(Math.floor(15 + Math.random() * 70));
        setOffsetY(Math.floor(15 + Math.random() * 70));
        setHasPreview(true);
        setCopied(false);
        setCopyError("");
    }

    function getCssOutput() {
        return `background:
  radial-gradient(circle at ${offsetX}% ${offsetY}%, ${accentColor1} 0%, transparent ${blobSize}%),
  radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${accentColor2} 0%, transparent ${blobSize}%),
  ${baseColor};
filter: blur(0px);`;
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(getCssOutput());

            setCopied(true);
            setCopyError("");

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
            setCopyError(copyErrorText);
        }
    }

    function downloadPng() {
        setHasPreview(true);

        setTimeout(() => {
            drawBackground();

            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "peach-lab-background.png";
            link.click();
        }, 0);
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 space-y-6">
                <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(128px,160px)] sm:items-start">
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900">
                                {t.backgroundGenerator.previewTitle}
                            </h3>

                            <p className="mt-2 max-w-[260px] text-sm leading-6 text-gray-500">
                                {t.backgroundGenerator.previewDescription}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <button
                                type="button"
                                onClick={shuffleBackground}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {t.backgroundGenerator.shuffle}
                            </button>

                            <button
                                type="button"
                                onClick={randomAll}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {t.backgroundGenerator.randomAll}
                            </button>
                        </div>
                    </div>

                    <div className="relative mt-5 overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                        <canvas
                            ref={canvasRef}
                            className={`h-auto max-h-[520px] w-full rounded-2xl object-contain ${hasPreview ? "block" : "hidden"
                                }`}
                        />

                        {!hasPreview && (
                            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center">
                                <p className="max-w-xs text-sm leading-6 text-gray-500">
                                    {t.backgroundGenerator.emptyHint}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="mb-3">
                        <h3 className="font-semibold text-gray-900">
                            {t.backgroundGenerator.cssTitle}
                        </h3>
                    </div>

                    <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                        {getCssOutput()}
                    </pre>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={copyCss}
                            className="rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {copied
                                ? t.common.copied
                                : t.backgroundGenerator.copyCss}
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
                    {t.backgroundGenerator.controls}
                </h3>

                <div className="mt-5 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.canvasWidth}
                            </label>

                            <input
                                type="number"
                                min="100"
                                max="4000"
                                value={canvasWidth}
                                onChange={(event) => {
                                    setCanvasWidth(Number(event.target.value));
                                    showPreview();
                                }}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.canvasHeight}
                            </label>

                            <input
                                type="number"
                                min="100"
                                max="4000"
                                value={canvasHeight}
                                onChange={(event) => {
                                    setCanvasHeight(Number(event.target.value));
                                    showPreview();
                                }}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                            {t.backgroundGenerator.baseColor}
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={baseColor}
                                onChange={(event) => {
                                    setBaseColor(event.target.value);
                                    showPreview();
                                }}
                                className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                            />

                            <input
                                value={baseColor}
                                onChange={(event) => {
                                    setBaseColor(event.target.value);
                                    showPreview();
                                }}
                                className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.accentColor1}
                            </label>

                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={accentColor1}
                                    onChange={(event) => {
                                        setAccentColor1(event.target.value);
                                        showPreview();
                                    }}
                                    className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                                />

                                <input
                                    value={accentColor1}
                                    onChange={(event) => {
                                        setAccentColor1(event.target.value);
                                        showPreview();
                                    }}
                                    className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.accentColor2}
                            </label>

                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={accentColor2}
                                    onChange={(event) => {
                                        setAccentColor2(event.target.value);
                                        showPreview();
                                    }}
                                    className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                                />

                                <input
                                    value={accentColor2}
                                    onChange={(event) => {
                                        setAccentColor2(event.target.value);
                                        showPreview();
                                    }}
                                    className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.blobSize}
                            </label>
                            <span className="text-sm text-gray-500">
                                {blobSize}%
                            </span>
                        </div>

                        <input
                            type="range"
                            min="10"
                            max="90"
                            value={blobSize}
                            onChange={(event) => {
                                setBlobSize(Number(event.target.value));
                                showPreview();
                            }}
                            className="w-full accent-[#F28C6F]"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                {t.backgroundGenerator.blur}
                            </label>
                            <span className="text-sm text-gray-500">
                                {blur}px
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="160"
                            value={blur}
                            onChange={(event) => {
                                setBlur(Number(event.target.value));
                                showPreview();
                            }}
                            className="w-full accent-[#F28C6F]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={downloadPng}
                        className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {t.backgroundGenerator.downloadPng}
                    </button>
                </div>
            </section>
        </div>
    );
}