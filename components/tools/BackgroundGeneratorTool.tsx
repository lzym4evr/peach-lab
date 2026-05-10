"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

type BackgroundStyle = "softBlob" | "mesh" | "aurora" | "spotlight";

const backgroundStyles: BackgroundStyle[] = [
    "softBlob",
    "mesh",
    "aurora",
    "spotlight",
];

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

function hexToRgb(hex: string) {
    const safeHex = getSafeHexColor(hex, "#F28C6F");
    const cleanHex = safeHex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

function hexToRgba(hex: string, alpha: number) {
    const rgb = hexToRgb(hex);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function getStyleLabel(text: typeof t.backgroundGenerator, style: BackgroundStyle) {
    const labels = text as {
        styleSoftBlob?: string;
        styleMesh?: string;
        styleAurora?: string;
        styleSpotlight?: string;
    };

    if (style === "mesh") return labels.styleMesh ?? "Mesh";
    if (style === "aurora") return labels.styleAurora ?? "Aurora";
    if (style === "spotlight") return labels.styleSpotlight ?? "Spotlight";

    return labels.styleSoftBlob ?? "Soft Blob";
}

export default function BackgroundGeneratorTool() {
    const text = t.backgroundGenerator;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copyErrorText =
        (text as { copyError?: string }).copyError ??
        "Copy failed. Please copy the CSS manually.";

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const [canvasWidth, setCanvasWidth] = useState(1200);
    const [canvasHeight, setCanvasHeight] = useState(800);
    const [baseColor, setBaseColor] = useState("#FFF7F3");
    const [accentColor1, setAccentColor1] = useState("#F28C6F");
    const [accentColor2, setAccentColor2] = useState("#FFD6C8");
    const [backgroundStyle, setBackgroundStyle] =
        useState<BackgroundStyle>("softBlob");
    const [intensity, setIntensity] = useState(75);
    const [grain, setGrain] = useState(0);
    const [blobSize, setBlobSize] = useState(55);
    const [blur, setBlur] = useState(70);
    const [offsetX, setOffsetX] = useState(28);
    const [offsetY, setOffsetY] = useState(35);
    const [hasPreview, setHasPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function clearCopyState() {
        setCopied(false);
        setCopyError("");
    }

    function drawSoftBlobBackground(context: CanvasRenderingContext2D) {
        const alpha = intensity / 100;
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
            `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${0.9 * alpha})`,
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
            `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${0.85 * alpha})`,
        );
        secondGradient.addColorStop(
            1,
            `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, 0)`,
        );

        context.fillStyle = secondGradient;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.filter = "none";
    }

    function drawMeshBackground(context: CanvasRenderingContext2D) {
        const alpha = intensity / 100;
        const size = Math.round(
            (Math.min(canvasWidth, canvasHeight) * blobSize) / 100,
        );

        context.filter = `blur(${blur}px)`;

        const points = [
            {
                x: offsetX,
                y: offsetY,
                color: accentColor1,
                alpha: 0.85 * alpha,
            },
            {
                x: 100 - offsetX,
                y: 100 - offsetY,
                color: accentColor2,
                alpha: 0.8 * alpha,
            },
            {
                x: 50,
                y: 18,
                color: accentColor2,
                alpha: 0.55 * alpha,
            },
            {
                x: 18,
                y: 82,
                color: accentColor1,
                alpha: 0.45 * alpha,
            },
        ];

        points.forEach((point) => {
            const gradient = context.createRadialGradient(
                (canvasWidth * point.x) / 100,
                (canvasHeight * point.y) / 100,
                0,
                (canvasWidth * point.x) / 100,
                (canvasHeight * point.y) / 100,
                size,
            );

            const rgb = hexToRgb(point.color);

            gradient.addColorStop(
                0,
                `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${point.alpha})`,
            );
            gradient.addColorStop(
                1,
                `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`,
            );

            context.fillStyle = gradient;
            context.fillRect(0, 0, canvasWidth, canvasHeight);
        });

        context.filter = "none";
    }

    function drawAuroraBackground(context: CanvasRenderingContext2D) {
        const alpha = intensity / 100;

        context.filter = `blur(${blur}px)`;

        const first = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        first.addColorStop(0, hexToRgba(accentColor1, 0));
        first.addColorStop(0.45, hexToRgba(accentColor1, 0.75 * alpha));
        first.addColorStop(1, hexToRgba(accentColor1, 0));

        context.fillStyle = first;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const second = context.createLinearGradient(canvasWidth, 0, 0, canvasHeight);
        second.addColorStop(0, hexToRgba(accentColor2, 0));
        second.addColorStop(0.5, hexToRgba(accentColor2, 0.7 * alpha));
        second.addColorStop(1, hexToRgba(accentColor2, 0));

        context.fillStyle = second;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.filter = "none";
    }

    function drawSpotlightBackground(context: CanvasRenderingContext2D) {
        const alpha = intensity / 100;
        const size = Math.round(
            (Math.min(canvasWidth, canvasHeight) * (blobSize + 20)) / 100,
        );

        const center = context.createRadialGradient(
            canvasWidth / 2,
            canvasHeight * 0.42,
            0,
            canvasWidth / 2,
            canvasHeight * 0.42,
            size,
        );

        center.addColorStop(0, hexToRgba(accentColor1, 0.85 * alpha));
        center.addColorStop(0.55, hexToRgba(accentColor2, 0.35 * alpha));
        center.addColorStop(1, hexToRgba(accentColor2, 0));

        context.fillStyle = center;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        const edge = context.createRadialGradient(
            canvasWidth / 2,
            canvasHeight / 2,
            Math.min(canvasWidth, canvasHeight) * 0.15,
            canvasWidth / 2,
            canvasHeight / 2,
            Math.max(canvasWidth, canvasHeight) * 0.7,
        );

        edge.addColorStop(0, "rgba(255,255,255,0)");
        edge.addColorStop(1, hexToRgba(accentColor2, 0.32 * alpha));

        context.fillStyle = edge;
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawGrain(context: CanvasRenderingContext2D) {
        if (grain <= 0) return;

        const noiseSize = 180;
        const noiseCanvas = document.createElement("canvas");
        noiseCanvas.width = noiseSize;
        noiseCanvas.height = noiseSize;

        const noiseContext = noiseCanvas.getContext("2d");
        if (!noiseContext) return;

        const imageData = noiseContext.createImageData(noiseSize, noiseSize);
        const data = imageData.data;
        const alpha = Math.round((grain / 100) * 42);

        for (let i = 0; i < data.length; i += 4) {
            const value = Math.floor(Math.random() * 255);

            data[i] = value;
            data[i + 1] = value;
            data[i + 2] = value;
            data[i + 3] = alpha;
        }

        noiseContext.putImageData(imageData, 0, 0);

        const pattern = context.createPattern(noiseCanvas, "repeat");
        if (!pattern) return;

        context.fillStyle = pattern;
        context.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    function drawBackground() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const context = canvas.getContext("2d");
        if (!context) return;

        const safeBaseColor = getSafeHexColor(baseColor, "#FFF7F3");

        context.fillStyle = safeBaseColor;
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        if (backgroundStyle === "mesh") {
            drawMeshBackground(context);
        } else if (backgroundStyle === "aurora") {
            drawAuroraBackground(context);
        } else if (backgroundStyle === "spotlight") {
            drawSpotlightBackground(context);
        } else {
            drawSoftBlobBackground(context);
        }

        drawGrain(context);
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
        backgroundStyle,
        intensity,
        grain,
        blobSize,
        blur,
        offsetX,
        offsetY,
        hasPreview,
    ]);

    function showPreview() {
        setHasPreview(true);
        clearCopyState();
    }

    function shuffleBackground() {
        const nextStyle =
            backgroundStyles[Math.floor(Math.random() * backgroundStyles.length)];

        setBackgroundStyle(nextStyle);
        setIntensity(getRandomNumber(45, 100));
        setGrain(getRandomNumber(0, 18));
        setBlobSize(getRandomNumber(35, 80));
        setBlur(getRandomNumber(40, 120));
        setOffsetX(getRandomNumber(15, 70));
        setOffsetY(getRandomNumber(15, 70));
        setHasPreview(true);
        clearCopyState();
    }

    function randomAll() {
        const sizes = [
            { width: 1200, height: 800 },
            { width: 1600, height: 900 },
            { width: 1080, height: 1080 },
            { width: 1080, height: 1920 },
            { width: 1920, height: 1080 },
        ];
        const nextSize = sizes[Math.floor(Math.random() * sizes.length)];
        const nextStyle =
            backgroundStyles[Math.floor(Math.random() * backgroundStyles.length)];

        setCanvasWidth(nextSize.width);
        setCanvasHeight(nextSize.height);
        setBaseColor(getRandomHexColor());
        setAccentColor1(getRandomHexColor());
        setAccentColor2(getRandomHexColor());
        setBackgroundStyle(nextStyle);
        setIntensity(getRandomNumber(45, 100));
        setGrain(getRandomNumber(0, 18));
        setBlobSize(getRandomNumber(35, 80));
        setBlur(getRandomNumber(40, 120));
        setOffsetX(getRandomNumber(15, 70));
        setOffsetY(getRandomNumber(15, 70));
        setHasPreview(true);
        clearCopyState();
    }

    function getCssOutput() {
        const alpha = intensity / 100;
        const grainComment =
            grain > 0 ? `\n/* ${text.grainCssComment} */` : "";

        const safeBaseColor = getSafeHexColor(baseColor, "#FFF7F3");
        const safeAccentColor1 = getSafeHexColor(accentColor1, "#F28C6F");
        const safeAccentColor2 = getSafeHexColor(accentColor2, "#FFD6C8");

        if (backgroundStyle === "mesh") {
            return `background:
  radial-gradient(circle at ${offsetX}% ${offsetY}%, ${hexToRgba(safeAccentColor1, 0.85 * alpha)} 0%, transparent ${blobSize}%),
  radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${hexToRgba(safeAccentColor2, 0.8 * alpha)} 0%, transparent ${blobSize}%),
  radial-gradient(circle at 50% 18%, ${hexToRgba(safeAccentColor2, 0.55 * alpha)} 0%, transparent ${blobSize}%),
  radial-gradient(circle at 18% 82%, ${hexToRgba(safeAccentColor1, 0.45 * alpha)} 0%, transparent ${blobSize}%),
  ${safeBaseColor};${grainComment}`;
        }

        if (backgroundStyle === "aurora") {
            return `background:
  linear-gradient(135deg, transparent 0%, ${hexToRgba(safeAccentColor1, 0.75 * alpha)} 45%, transparent 100%),
  linear-gradient(45deg, transparent 0%, ${hexToRgba(safeAccentColor2, 0.7 * alpha)} 50%, transparent 100%),
  ${safeBaseColor};${grainComment}`;
        }

        if (backgroundStyle === "spotlight") {
            return `background:
  radial-gradient(circle at 50% 42%, ${hexToRgba(safeAccentColor1, 0.85 * alpha)} 0%, ${hexToRgba(safeAccentColor2, 0.35 * alpha)} 55%, transparent ${blobSize + 20}%),
  radial-gradient(circle at 50% 50%, transparent 15%, ${hexToRgba(safeAccentColor2, 0.32 * alpha)} 100%),
  ${safeBaseColor};${grainComment}`;
        }

        return `background:
  radial-gradient(circle at ${offsetX}% ${offsetY}%, ${hexToRgba(safeAccentColor1, 0.9 * alpha)} 0%, transparent ${blobSize}%),
  radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${hexToRgba(safeAccentColor2, 0.85 * alpha)} 0%, transparent ${blobSize}%),
  ${safeBaseColor};${grainComment}`;
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

    const desktopSettingsPanel = (
        <SettingsPanel
            text={text}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            baseColor={baseColor}
            accentColor1={accentColor1}
            accentColor2={accentColor2}
            backgroundStyle={backgroundStyle}
            intensity={intensity}
            grain={grain}
            blobSize={blobSize}
            blur={blur}
            offsetX={offsetX}
            offsetY={offsetY}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setBaseColor={setBaseColor}
            setAccentColor1={setAccentColor1}
            setAccentColor2={setAccentColor2}
            setBackgroundStyle={setBackgroundStyle}
            setIntensity={setIntensity}
            setGrain={setGrain}
            setBlobSize={setBlobSize}
            setBlur={setBlur}
            setOffsetX={setOffsetX}
            setOffsetY={setOffsetY}
            showPreview={showPreview}
            onShuffle={shuffleBackground}
            onRandom={randomAll}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <SettingsPanel
            text={text}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            baseColor={baseColor}
            accentColor1={accentColor1}
            accentColor2={accentColor2}
            backgroundStyle={backgroundStyle}
            intensity={intensity}
            grain={grain}
            blobSize={blobSize}
            blur={blur}
            offsetX={offsetX}
            offsetY={offsetY}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setBaseColor={setBaseColor}
            setAccentColor1={setAccentColor1}
            setAccentColor2={setAccentColor2}
            setBackgroundStyle={setBackgroundStyle}
            setIntensity={setIntensity}
            setGrain={setGrain}
            setBlobSize={setBlobSize}
            setBlur={setBlur}
            setOffsetX={setOffsetX}
            setOffsetY={setOffsetY}
            showPreview={showPreview}
            onShuffle={shuffleBackground}
            onRandom={randomAll}
            compact
        />
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="min-w-0">
                            <SectionHeader title={text.previewTitle} />

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
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
                                        {text.emptyHint}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <SectionHeader title={text.cssTitle} />

                            <button
                                type="button"
                                onClick={copyCss}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copied ? t.common.copied : text.copyCss}
                            </button>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                            <code>{getCssOutput()}</code>
                        </pre>

                        {copyError ? (
                            <p className="mt-3 text-sm font-medium text-red-500">
                                {copyError}
                            </p>
                        ) : null}
                    </section>
                </div>

                <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                    <SectionHeader title={text.controls} />

                    <div className="mt-5 space-y-5">
                        {desktopSettingsPanel}

                        <button
                            type="button"
                            onClick={downloadPng}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.downloadPng}
                        </button>
                    </div>
                </section>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                downloadText={actionDownloadText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onDownload={downloadPng}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    {mobileSettingsPanel}
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function SettingsPanel({
    text,
    canvasWidth,
    canvasHeight,
    baseColor,
    accentColor1,
    accentColor2,
    backgroundStyle,
    intensity,
    grain,
    blobSize,
    blur,
    offsetX,
    offsetY,
    setCanvasWidth,
    setCanvasHeight,
    setBaseColor,
    setAccentColor1,
    setAccentColor2,
    setBackgroundStyle,
    setIntensity,
    setGrain,
    setBlobSize,
    setBlur,
    setOffsetX,
    setOffsetY,
    showPreview,
    onShuffle,
    onRandom,
    compact = false,
}: {
    text: typeof t.backgroundGenerator;
    canvasWidth: number;
    canvasHeight: number;
    baseColor: string;
    accentColor1: string;
    accentColor2: string;
    backgroundStyle: BackgroundStyle;
    intensity: number;
    grain: number;
    blobSize: number;
    blur: number;
    offsetX: number;
    offsetY: number;
    setCanvasWidth: (value: number) => void;
    setCanvasHeight: (value: number) => void;
    setBaseColor: (value: string) => void;
    setAccentColor1: (value: string) => void;
    setAccentColor2: (value: string) => void;
    setBackgroundStyle: (value: BackgroundStyle) => void;
    setIntensity: (value: number) => void;
    setGrain: (value: number) => void;
    setBlobSize: (value: number) => void;
    setBlur: (value: number) => void;
    setOffsetX: (value: number) => void;
    setOffsetY: (value: number) => void;
    showPreview: () => void;
    onShuffle: () => void;
    onRandom: () => void;
    compact?: boolean;
}) {
    const backgroundStyleLabel =
        (text as { backgroundStyle?: string }).backgroundStyle ??
        "Background Style";
    const intensityLabel =
        (text as { intensity?: string }).intensity ?? "Intensity";
    const grainLabel = (text as { grain?: string }).grain ?? "Grain";

    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            {compact ? (
                <BackgroundMiniPreview
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    baseColor={baseColor}
                    accentColor1={accentColor1}
                    accentColor2={accentColor2}
                    backgroundStyle={backgroundStyle}
                    intensity={intensity}
                    grain={grain}
                    blobSize={blobSize}
                    offsetX={offsetX}
                    offsetY={offsetY}
                />
            ) : null}

            {!compact ? (
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onShuffle}
                        className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    >
                        {text.shuffle}
                    </button>

                    <button
                        type="button"
                        onClick={onRandom}
                        className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {text.randomAll}
                    </button>
                </div>
            ) : null}

            <div>
                {compact ? (
                    <div className="mb-2 flex flex-nowrap items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs font-semibold text-gray-800">
                            {backgroundStyleLabel}
                        </span>

                        <div className="grid shrink-0 grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={onShuffle}
                                className="h-8 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 text-[11px] font-semibold leading-none text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.shuffle}
                            </button>

                            <button
                                type="button"
                                onClick={onRandom}
                                className="h-8 rounded-xl bg-[#F28C6F] px-2 text-[11px] font-semibold leading-none text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {text.randomAll}
                            </button>
                        </div>
                    </div>
                ) : (
                    <span className="mb-2 block text-sm font-semibold text-gray-800">
                        {backgroundStyleLabel}
                    </span>
                )}

                <div
                    className={
                        compact
                            ? "grid grid-cols-2 gap-2"
                            : "grid grid-cols-2 gap-3"
                    }
                >
                    {backgroundStyles.map((style) => {
                        const isActive = backgroundStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => {
                                    setBackgroundStyle(style);
                                    showPreview();
                                }}
                                className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getStyleLabel(text, style)}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-3"
                        : "grid gap-4 sm:grid-cols-2"
                }
            >
                <NumberInput
                    label={text.canvasWidth}
                    value={canvasWidth}
                    min={100}
                    max={4000}
                    compact={compact}
                    onChange={(value) => {
                        setCanvasWidth(value);
                        showPreview();
                    }}
                />

                <NumberInput
                    label={text.canvasHeight}
                    value={canvasHeight}
                    min={100}
                    max={4000}
                    compact={compact}
                    onChange={(value) => {
                        setCanvasHeight(value);
                        showPreview();
                    }}
                />
            </div>

            {compact ? (
                <div className="grid grid-cols-3 gap-2">
                    <CompactColorInput
                        label={text.baseColor}
                        value={baseColor}
                        onChange={(value) => {
                            setBaseColor(value);
                            showPreview();
                        }}
                    />

                    <CompactColorInput
                        label={text.accentColor1}
                        value={accentColor1}
                        onChange={(value) => {
                            setAccentColor1(value);
                            showPreview();
                        }}
                    />

                    <CompactColorInput
                        label={text.accentColor2}
                        value={accentColor2}
                        onChange={(value) => {
                            setAccentColor2(value);
                            showPreview();
                        }}
                    />
                </div>
            ) : (
                <>
                    <ColorInput
                        label={text.baseColor}
                        value={baseColor}
                        onChange={(value) => {
                            setBaseColor(value);
                            showPreview();
                        }}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <ColorInput
                            label={text.accentColor1}
                            value={accentColor1}
                            onChange={(value) => {
                                setAccentColor1(value);
                                showPreview();
                            }}
                        />

                        <ColorInput
                            label={text.accentColor2}
                            value={accentColor2}
                            onChange={(value) => {
                                setAccentColor2(value);
                                showPreview();
                            }}
                        />
                    </div>
                </>
            )}

            <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-5"}>
                <RangeInput
                    label={intensityLabel}
                    value={intensity}
                    min={0}
                    max={100}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setIntensity(value);
                        showPreview();
                    }}
                />

                <RangeInput
                    label={grainLabel}
                    value={grain}
                    min={0}
                    max={30}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setGrain(value);
                        showPreview();
                    }}
                />

                <RangeInput
                    label={text.blobSize}
                    value={blobSize}
                    min={10}
                    max={90}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setBlobSize(value);
                        showPreview();
                    }}
                />

                <RangeInput
                    label={text.blur}
                    value={blur}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => {
                        setBlur(value);
                        showPreview();
                    }}
                />

                <RangeInput
                    label={text.offsetX}
                    value={offsetX}
                    min={0}
                    max={100}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setOffsetX(value);
                        showPreview();
                    }}
                />

                <RangeInput
                    label={text.offsetY}
                    value={offsetY}
                    min={0}
                    max={100}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setOffsetY(value);
                        showPreview();
                    }}
                />
            </div>
        </div>
    );
}

function getCssBackgroundValue({
    baseColor,
    accentColor1,
    accentColor2,
    backgroundStyle,
    intensity,
    blobSize,
    offsetX,
    offsetY,
}: {
    baseColor: string;
    accentColor1: string;
    accentColor2: string;
    backgroundStyle: BackgroundStyle;
    intensity: number;
    blobSize: number;
    offsetX: number;
    offsetY: number;
}) {
    const alpha = intensity / 100;
    const safeBaseColor = getSafeHexColor(baseColor, "#FFF7F3");
    const safeAccentColor1 = getSafeHexColor(accentColor1, "#F28C6F");
    const safeAccentColor2 = getSafeHexColor(accentColor2, "#FFD6C8");

    if (backgroundStyle === "mesh") {
        return `
            radial-gradient(circle at ${offsetX}% ${offsetY}%, ${hexToRgba(safeAccentColor1, 0.85 * alpha)} 0%, transparent ${blobSize}%),
            radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${hexToRgba(safeAccentColor2, 0.8 * alpha)} 0%, transparent ${blobSize}%),
            radial-gradient(circle at 50% 18%, ${hexToRgba(safeAccentColor2, 0.55 * alpha)} 0%, transparent ${blobSize}%),
            radial-gradient(circle at 18% 82%, ${hexToRgba(safeAccentColor1, 0.45 * alpha)} 0%, transparent ${blobSize}%),
            ${safeBaseColor}
        `;
    }

    if (backgroundStyle === "aurora") {
        return `
            linear-gradient(135deg, transparent 0%, ${hexToRgba(safeAccentColor1, 0.75 * alpha)} 45%, transparent 100%),
            linear-gradient(45deg, transparent 0%, ${hexToRgba(safeAccentColor2, 0.7 * alpha)} 50%, transparent 100%),
            ${safeBaseColor}
        `;
    }

    if (backgroundStyle === "spotlight") {
        return `
            radial-gradient(circle at 50% 42%, ${hexToRgba(safeAccentColor1, 0.85 * alpha)} 0%, ${hexToRgba(safeAccentColor2, 0.35 * alpha)} 55%, transparent ${blobSize + 20}%),
            radial-gradient(circle at 50% 50%, transparent 15%, ${hexToRgba(safeAccentColor2, 0.32 * alpha)} 100%),
            ${safeBaseColor}
        `;
    }

    return `
        radial-gradient(circle at ${offsetX}% ${offsetY}%, ${hexToRgba(safeAccentColor1, 0.9 * alpha)} 0%, transparent ${blobSize}%),
        radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${hexToRgba(safeAccentColor2, 0.85 * alpha)} 0%, transparent ${blobSize}%),
        ${safeBaseColor}
    `;
}

function BackgroundMiniPreview({
    canvasWidth,
    canvasHeight,
    baseColor,
    accentColor1,
    accentColor2,
    backgroundStyle,
    intensity,
    grain,
    blobSize,
    offsetX,
    offsetY,
}: {
    canvasWidth: number;
    canvasHeight: number;
    baseColor: string;
    accentColor1: string;
    accentColor2: string;
    backgroundStyle: BackgroundStyle;
    intensity: number;
    grain: number;
    blobSize: number;
    offsetX: number;
    offsetY: number;
}) {
    const safeWidth = Math.max(canvasWidth, 1);
    const safeHeight = Math.max(canvasHeight, 1);
    const previewRatio = safeWidth / safeHeight;
    const containerRatio = 3.4;
    const fillWidth = previewRatio >= containerRatio;

    return (
        <div className="sticky top-0 z-10 flex h-36 w-full items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5">
            <div
                className="relative overflow-hidden rounded-xl border border-[#F1E5DF] shadow-sm"
                style={{
                    aspectRatio: `${safeWidth} / ${safeHeight}`,
                    width: fillWidth ? "100%" : "auto",
                    height: fillWidth ? "auto" : "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    background: getCssBackgroundValue({
                        baseColor,
                        accentColor1,
                        accentColor2,
                        backgroundStyle,
                        intensity,
                        blobSize,
                        offsetX,
                        offsetY,
                    }),
                }}
            >
                {grain > 0 ? (
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            opacity: Math.min(grain / 35, 0.65),
                            backgroundImage:
                                "radial-gradient(circle, rgba(42,31,27,0.24) 1px, transparent 1px)",
                            backgroundSize: "5px 5px",
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#F28C6F]" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
    );
}

function NumberInput({
    label,
    value,
    min,
    max,
    compact = false,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    compact?: boolean;
    onChange: (value: number) => void;
}) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    function handleChange(nextValue: string) {
        setInputValue(nextValue);

        if (nextValue.trim() === "") {
            return;
        }

        const parsedValue = Number(nextValue);

        if (!Number.isNaN(parsedValue)) {
            onChange(parsedValue);
        }
    }

    return (
        <label className="block min-w-0">
            <span
                className={`mb-2 block truncate font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <input
                type="number"
                min={min}
                max={max}
                value={inputValue}
                onChange={(event) => handleChange(event.target.value)}
                onBlur={() => {
                    if (inputValue.trim() === "") {
                        setInputValue(String(value));
                    }
                }}
                className={`w-full rounded-xl border border-[#F1E5DF] px-3 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-10" : "h-12"
                    }`}
            />
        </label>
    );
}

function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : "#F28C6F";

    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}

function CompactColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : "#F28C6F";

    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block truncate text-[10px] font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[34px_1fr] gap-1.5">
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 min-w-0 rounded-xl border border-[#F1E5DF] px-2 text-[10px] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
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
    compact = false,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    compact?: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block min-w-0">
            <div
                className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 ${compact ? "mb-1.5" : "mb-2"
                    }`}
            >
                <span
                    className={`min-w-0 truncate whitespace-nowrap font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {label}
                </span>

                <span className="min-w-[44px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-1 text-center text-xs font-semibold text-[#7A5A4F]">
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

function MobileActionBar({
    settingsButtonText,
    downloadText,
    onOpenSettings,
    onDownload,
}: {
    settingsButtonText: string;
    downloadText: string;
    onOpenSettings: () => void;
    onDownload: () => void;
}) {
    const actionBarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateSpace = () => {
            const element = actionBarRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();

            document.documentElement.style.setProperty(
                "--mobile-action-bar-space",
                `${Math.ceil(rect.height + 24)}px`,
            );
        };

        const timer = window.setTimeout(updateSpace, 0);
        window.addEventListener("resize", updateSpace);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", updateSpace);
            document.documentElement.style.removeProperty(
                "--mobile-action-bar-space",
            );
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[60] px-3 lg:hidden">
            <div
                ref={actionBarRef}
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-2 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {downloadText}
                </button>
            </div>
        </div>
    );
}

function MobileSettingsSheet({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[80] bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="h-7 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />
                        <h3 className="truncate text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-2xl font-semibold leading-none text-[#2A1F1B] transition hover:bg-[#FFF0EA]"
                    >
                        ×
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}