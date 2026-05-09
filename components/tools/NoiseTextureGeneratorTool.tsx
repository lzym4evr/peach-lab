"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
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

function getNoiseCssOutput({
    backgroundColor,
    noiseColor,
    density,
    opacity,
}: {
    backgroundColor: string;
    noiseColor: string;
    density: number;
    opacity: number;
}) {
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

function getNoisePreviewStyle({
    backgroundColor,
    noiseColor,
    density,
    opacity,
}: {
    backgroundColor: string;
    noiseColor: string;
    density: number;
    opacity: number;
}) {
    const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");
    const safeNoiseColor = getSafeHexColor(noiseColor, "#111827");
    const dotAlpha = Math.max(0.02, opacity / 100);
    const dotSize = Math.max(1, Math.round(density / 18));
    const spacing = Math.max(3, Math.round(18 - density / 5));
    const rgb = hexToRgb(safeNoiseColor);

    return {
        backgroundColor: safeBackgroundColor,
        backgroundImage: `radial-gradient(rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dotAlpha}) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
    };
}

export default function NoiseTextureGeneratorTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const text = t.noiseTextureGenerator;

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const [density, setDensity] = useState(45);
    const [opacity, setOpacity] = useState(22);
    const [backgroundColor, setBackgroundColor] = useState("#FFF7F3");
    const [noiseColor, setNoiseColor] = useState("#111827");
    const [seed, setSeed] = useState(1);
    const [copied, setCopied] = useState(false);
    const [hasPreview, setHasPreview] = useState(false);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

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
        return getNoiseCssOutput({
            backgroundColor,
            noiseColor,
            density,
            opacity,
        });
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(getCssOutput());
            setCopied(true);

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
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

    const desktopSettingsPanel = (
        <NoiseSettingsPanel
            text={text}
            width={width}
            height={height}
            density={density}
            opacity={opacity}
            backgroundColor={backgroundColor}
            noiseColor={noiseColor}
            setWidth={setWidth}
            setHeight={setHeight}
            setDensity={setDensity}
            setOpacity={setOpacity}
            setBackgroundColor={setBackgroundColor}
            setNoiseColor={setNoiseColor}
            showPreview={showPreview}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <NoiseSettingsPanel
            text={text}
            width={width}
            height={height}
            density={density}
            opacity={opacity}
            backgroundColor={backgroundColor}
            noiseColor={noiseColor}
            setWidth={setWidth}
            setHeight={setHeight}
            setDensity={setDensity}
            setOpacity={setOpacity}
            setBackgroundColor={setBackgroundColor}
            setNoiseColor={setNoiseColor}
            showPreview={showPreview}
            compact
            onShuffle={shuffleNoise}
            onRandom={randomizeAll}
        />
    );

    return (
        <>
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="min-w-0 space-y-6">
                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-5">
                                <SectionHeader title={text.previewTitle} />

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

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.cssTitle} />

                                <button
                                    type="button"
                                    onClick={copyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copied ? t.common.copied : text.copyCss}
                                </button>
                            </div>

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                                <code>{getCssOutput()}</code>
                            </pre>
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        <SectionHeader title={text.controls} />

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
                    <div className="space-y-3">
                        <NoiseMiniPreview
                            width={width}
                            height={height}
                            density={density}
                            opacity={opacity}
                            backgroundColor={backgroundColor}
                            noiseColor={noiseColor}
                        />

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function NoiseSettingsPanel({
    text,
    width,
    height,
    density,
    opacity,
    backgroundColor,
    noiseColor,
    setWidth,
    setHeight,
    setDensity,
    setOpacity,
    setBackgroundColor,
    setNoiseColor,
    showPreview,
    compact = false,
    onShuffle,
    onRandom,
}: {
    text: typeof t.noiseTextureGenerator;
    width: number;
    height: number;
    density: number;
    opacity: number;
    backgroundColor: string;
    noiseColor: string;
    setWidth: (value: number) => void;
    setHeight: (value: number) => void;
    setDensity: (value: number) => void;
    setOpacity: (value: number) => void;
    setBackgroundColor: (value: string) => void;
    setNoiseColor: (value: string) => void;
    showPreview: () => void;
    compact?: boolean;
    onShuffle?: () => void;
    onRandom?: () => void;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            {compact ? (
                <div className="flex flex-nowrap items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs font-semibold text-gray-800">
                        {text.controls}
                    </span>

                    <div className="grid shrink-0 grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={onShuffle}
                            className="h-8 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 text-[11px] font-semibold leading-none text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shuffleNoise}
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
            ) : null}

            {compact ? (
                <div className="grid grid-cols-2 gap-2">
                    <CompactColorInput
                        label={text.backgroundColor}
                        value={backgroundColor}
                        fallback="#FFF7F3"
                        onChange={(value) => {
                            setBackgroundColor(value);
                            showPreview();
                        }}
                    />

                    <CompactColorInput
                        label={text.noiseColor}
                        value={noiseColor}
                        fallback="#111827"
                        onChange={(value) => {
                            setNoiseColor(value);
                            showPreview();
                        }}
                    />
                </div>
            ) : null}

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-3"
                        : "grid gap-4 sm:grid-cols-2"
                }
            >
                <NumberInput
                    label={text.width}
                    value={width}
                    min={100}
                    max={3000}
                    compact={compact}
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
                    compact={compact}
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
                compact={compact}
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
                compact={compact}
                onChange={(value) => {
                    setOpacity(value);
                    showPreview();
                }}
            />

            {!compact ? (
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
            ) : null}
        </div>
    );
}

function NoiseMiniPreview({
    width,
    height,
    density,
    opacity,
    backgroundColor,
    noiseColor,
}: {
    width: number;
    height: number;
    density: number;
    opacity: number;
    backgroundColor: string;
    noiseColor: string;
}) {
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    const previewRatio = safeWidth / safeHeight;
    const containerRatio = 3.4;
    const fillWidth = previewRatio >= containerRatio;

    return (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5">
            <div
                className="overflow-hidden rounded-xl border border-[#F1E5DF] shadow-sm"
                style={{
                    aspectRatio: `${safeWidth} / ${safeHeight}`,
                    width: fillWidth ? "100%" : "auto",
                    height: fillWidth ? "auto" : "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    ...getNoisePreviewStyle({
                        backgroundColor,
                        noiseColor,
                        density,
                        opacity,
                    }),
                }}
            />
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

function CompactColorInput({
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
        <label className="block">
            <div
                className={`flex items-center justify-between gap-4 ${compact ? "mb-1.5" : "mb-2"
                    }`}
            >
                <span
                    className={`font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {label}
                </span>

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
        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-24 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
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

                <div className="overflow-y-auto px-4 pb-4 pt-2">{children}</div>
            </div>
        </div>
    );
}