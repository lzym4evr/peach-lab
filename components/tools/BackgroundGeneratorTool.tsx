"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
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

    const desktopSettingsPanel = (
        <SettingsPanel
            text={text}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            baseColor={baseColor}
            accentColor1={accentColor1}
            accentColor2={accentColor2}
            blobSize={blobSize}
            blur={blur}
            offsetX={offsetX}
            offsetY={offsetY}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setBaseColor={setBaseColor}
            setAccentColor1={setAccentColor1}
            setAccentColor2={setAccentColor2}
            setBlobSize={setBlobSize}
            setBlur={setBlur}
            showPreview={showPreview}
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
            blobSize={blobSize}
            blur={blur}
            offsetX={offsetX}
            offsetY={offsetY}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setBaseColor={setBaseColor}
            setAccentColor1={setAccentColor1}
            setAccentColor2={setAccentColor2}
            setBlobSize={setBlobSize}
            setBlur={setBlur}
            showPreview={showPreview}
            compact
        />
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(128px,160px)] lg:items-start">
                            <div className="min-w-0">
                                <SectionHeader title={text.previewTitle} />

                                <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                    {text.previewDescription}
                                </p>
                            </div>

                            <div className="hidden gap-2 lg:grid">
                                <button
                                    type="button"
                                    onClick={shuffleBackground}
                                    className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                                >
                                    {text.shuffle}
                                </button>

                                <button
                                    type="button"
                                    onClick={randomAll}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                                >
                                    {text.randomAll}
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
                            {getCssOutput()}
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
                shuffleText={text.shuffle}
                randomText={text.randomAll}
                downloadText={actionDownloadText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onShuffle={shuffleBackground}
                onRandom={randomAll}
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
    blobSize,
    blur,
    offsetX,
    offsetY,
    setCanvasWidth,
    setCanvasHeight,
    setBaseColor,
    setAccentColor1,
    setAccentColor2,
    setBlobSize,
    setBlur,
    showPreview,
    compact = false,
}: {
    text: typeof t.backgroundGenerator;
    canvasWidth: number;
    canvasHeight: number;
    baseColor: string;
    accentColor1: string;
    accentColor2: string;
    blobSize: number;
    blur: number;
    offsetX: number;
    offsetY: number;
    setCanvasWidth: (value: number) => void;
    setCanvasHeight: (value: number) => void;
    setBaseColor: (value: string) => void;
    setAccentColor1: (value: string) => void;
    setAccentColor2: (value: string) => void;
    setBlobSize: (value: number) => void;
    setBlur: (value: number) => void;
    showPreview: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            {compact ? (
                <BackgroundMiniPreview
                    canvasWidth={canvasWidth}
                    canvasHeight={canvasHeight}
                    baseColor={baseColor}
                    accentColor1={accentColor1}
                    accentColor2={accentColor2}
                    blobSize={blobSize}
                    offsetX={offsetX}
                    offsetY={offsetY}
                />
            ) : null}

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
        </div>
    );
}

function BackgroundMiniPreview({
    canvasWidth,
    canvasHeight,
    baseColor,
    accentColor1,
    accentColor2,
    blobSize,
    offsetX,
    offsetY,
}: {
    canvasWidth: number;
    canvasHeight: number;
    baseColor: string;
    accentColor1: string;
    accentColor2: string;
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
        <div className="flex h-24 w-full items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5">
            <div
                className="overflow-hidden rounded-xl border border-[#F1E5DF] shadow-sm"
                style={{
                    aspectRatio: `${safeWidth} / ${safeHeight}`,
                    width: fillWidth ? "100%" : "auto",
                    height: fillWidth ? "auto" : "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    background: `
                        radial-gradient(circle at ${offsetX}% ${offsetY}%, ${accentColor1} 0%, transparent ${blobSize}%),
                        radial-gradient(circle at ${100 - offsetX}% ${100 - offsetY}%, ${accentColor2} 0%, transparent ${blobSize}%),
                        ${baseColor}
                    `,
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
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
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
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
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
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block truncate text-[10px] font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[34px_1fr] gap-1.5">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
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
                    className={`block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
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
    shuffleText,
    randomText,
    downloadText,
    onOpenSettings,
    onShuffle,
    onRandom,
    onDownload,
}: {
    settingsButtonText: string;
    shuffleText: string;
    randomText: string;
    downloadText: string;
    onOpenSettings: () => void;
    onShuffle: () => void;
    onRandom: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-1.5 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onShuffle}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-1.5 py-2.5 text-center text-[11px] font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF7F3]"
                >
                    {shuffleText}
                </button>

                <button
                    type="button"
                    onClick={onRandom}
                    className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-1.5 py-2.5 text-center text-[11px] font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF0EA]"
                >
                    {randomText}
                </button>

                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-1.5 py-2.5 text-center text-[11px] font-semibold leading-tight text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-1.5 py-2.5 text-center text-[11px] font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
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
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-28 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[72vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 px-4 pb-1.5 pt-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="h-6 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />
                        <h3 className="truncate text-base font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-xl font-semibold leading-none text-[#2A1F1B] transition hover:bg-[#FFF0EA]"
                    >
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto px-3 pb-3 pt-2">{children}</div>
            </div>
        </div>
    );
}