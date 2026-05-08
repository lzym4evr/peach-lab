"use client";

import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type PatternType = "dots" | "grid" | "diagonal-lines" | "checkerboard";

const patternTypes: PatternType[] = [
    "dots",
    "grid",
    "diagonal-lines",
    "checkerboard",
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

function getPatternLabel(text: typeof t.patternGenerator, patternType: PatternType) {
    if (patternType === "grid") return text.grid;
    if (patternType === "diagonal-lines") return text.diagonalLines;
    if (patternType === "checkerboard") return text.checkerboard;

    return text.dots;
}

function getPatternCssOutput({
    patternType,
    patternSize,
    spacing,
    foregroundColor,
    backgroundColor,
    offsetX,
    offsetY,
}: {
    patternType: PatternType;
    patternSize: number;
    spacing: number;
    foregroundColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
}) {
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
        const lineWidth = Math.max(1, Math.round(patternSize / 4));

        return `background-color: ${safeBackgroundColor};
background-image: repeating-linear-gradient(45deg, ${safeForegroundColor} 0, ${safeForegroundColor} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing}px);
background-position: ${offsetX}px ${offsetY}px;`;
    }

    return `background-color: ${safeBackgroundColor};
background-image: linear-gradient(45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(-45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${safeForegroundColor} 75%), linear-gradient(-45deg, transparent 75%, ${safeForegroundColor} 75%);
background-size: ${spacing * 2}px ${spacing * 2}px;
background-position: ${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY + spacing
        }px, ${offsetX + spacing}px ${offsetY - spacing}px, ${offsetX - spacing
        }px ${offsetY}px;`;
}

function getPatternPreviewStyle({
    patternType,
    patternSize,
    spacing,
    foregroundColor,
    backgroundColor,
    offsetX,
    offsetY,
}: {
    patternType: PatternType;
    patternSize: number;
    spacing: number;
    foregroundColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
}) {
    const safeForegroundColor = getSafeHexColor(foregroundColor, "#F28C6F");
    const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFF7F3");

    if (patternType === "dots") {
        const dotSize = Math.round(patternSize / 2);

        return {
            backgroundColor: safeBackgroundColor,
            backgroundImage: `radial-gradient(${safeForegroundColor} ${dotSize}px, transparent ${dotSize}px)`,
            backgroundSize: `${spacing}px ${spacing}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
        };
    }

    if (patternType === "grid") {
        return {
            backgroundColor: safeBackgroundColor,
            backgroundImage: `linear-gradient(${safeForegroundColor} 1px, transparent 1px), linear-gradient(90deg, ${safeForegroundColor} 1px, transparent 1px)`,
            backgroundSize: `${spacing}px ${spacing}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
        };
    }

    if (patternType === "diagonal-lines") {
        const lineWidth = Math.max(1, Math.round(patternSize / 4));

        return {
            backgroundColor: safeBackgroundColor,
            backgroundImage: `repeating-linear-gradient(45deg, ${safeForegroundColor} 0, ${safeForegroundColor} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing}px)`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
        };
    }

    return {
        backgroundColor: safeBackgroundColor,
        backgroundImage: `linear-gradient(45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(-45deg, ${safeForegroundColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${safeForegroundColor} 75%), linear-gradient(-45deg, transparent 75%, ${safeForegroundColor} 75%)`,
        backgroundSize: `${spacing * 2}px ${spacing * 2}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px, ${offsetX}px ${offsetY + spacing
            }px, ${offsetX + spacing}px ${offsetY - spacing}px, ${offsetX - spacing
            }px ${offsetY}px`,
    };
}

export default function PatternGeneratorTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const text = t.patternGenerator;

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

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
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

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
            for (
                let x = offsetX + spacing / 2;
                x < canvasWidth + spacing;
                x += spacing
            ) {
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
            for (
                let x = -canvasHeight + offsetX;
                x < canvasWidth + spacing;
                x += spacing
            ) {
                context.beginPath();
                context.moveTo(x, canvasHeight);
                context.lineTo(x + canvasHeight, 0);
                context.stroke();
            }
        }

        if (patternType === "checkerboard") {
            for (
                let x = offsetX - spacing;
                x < canvasWidth + spacing;
                x += spacing
            ) {
                for (
                    let y = offsetY - spacing;
                    y < canvasHeight + spacing;
                    y += spacing
                ) {
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
        const nextSpacing = getRandomNumber(20, 70);

        setPatternType(
            patternTypes[Math.floor(Math.random() * patternTypes.length)],
        );
        setPatternSize(getRandomNumber(6, 30));
        setSpacing(nextSpacing);
        setOffsetX(getRandomNumber(0, nextSpacing));
        setOffsetY(getRandomNumber(0, nextSpacing));
        setHasPreview(true);
    }

    function randomAll() {
        const nextSize = getRandomCanvasSize();
        const nextSpacing = getRandomNumber(20, 70);

        setCanvasWidth(nextSize.width);
        setCanvasHeight(nextSize.height);
        setPatternType(
            patternTypes[Math.floor(Math.random() * patternTypes.length)],
        );
        setPatternSize(getRandomNumber(6, 30));
        setSpacing(nextSpacing);
        setForegroundColor(getRandomHexColor());
        setBackgroundColor(getRandomHexColor());
        setOffsetX(getRandomNumber(0, nextSpacing));
        setOffsetY(getRandomNumber(0, nextSpacing));
        setHasPreview(true);
    }

    function getCssOutput() {
        return getPatternCssOutput({
            patternType,
            patternSize,
            spacing,
            foregroundColor,
            backgroundColor,
            offsetX,
            offsetY,
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
            drawPattern();

            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "peach-lab-pattern.png";
            link.click();
        }, 0);
    }

    const desktopSettingsPanel = (
        <PatternSettingsPanel
            text={text}
            patternType={patternType}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            patternSize={patternSize}
            spacing={spacing}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            setPatternType={setPatternType}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setPatternSize={setPatternSize}
            setSpacing={setSpacing}
            setForegroundColor={setForegroundColor}
            setBackgroundColor={setBackgroundColor}
            showPreview={showPreview}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <PatternSettingsPanel
            text={text}
            patternType={patternType}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            patternSize={patternSize}
            spacing={spacing}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            setPatternType={setPatternType}
            setCanvasWidth={setCanvasWidth}
            setCanvasHeight={setCanvasHeight}
            setPatternSize={setPatternSize}
            setSpacing={setSpacing}
            setForegroundColor={setForegroundColor}
            setBackgroundColor={setBackgroundColor}
            showPreview={showPreview}
            compact
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
                shuffleText={text.shufflePattern}
                randomText={text.randomAll}
                downloadText={actionDownloadText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onShuffle={shufflePattern}
                onRandom={randomAll}
                onDownload={downloadPng}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <PatternMiniPreview
                            patternType={patternType}
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                            patternSize={patternSize}
                            spacing={spacing}
                            foregroundColor={foregroundColor}
                            backgroundColor={backgroundColor}
                            offsetX={offsetX}
                            offsetY={offsetY}
                        />

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function PatternSettingsPanel({
    text,
    patternType,
    canvasWidth,
    canvasHeight,
    patternSize,
    spacing,
    foregroundColor,
    backgroundColor,
    setPatternType,
    setCanvasWidth,
    setCanvasHeight,
    setPatternSize,
    setSpacing,
    setForegroundColor,
    setBackgroundColor,
    showPreview,
    compact = false,
}: {
    text: typeof t.patternGenerator;
    patternType: PatternType;
    canvasWidth: number;
    canvasHeight: number;
    patternSize: number;
    spacing: number;
    foregroundColor: string;
    backgroundColor: string;
    setPatternType: (value: PatternType) => void;
    setCanvasWidth: (value: number) => void;
    setCanvasHeight: (value: number) => void;
    setPatternSize: (value: number) => void;
    setSpacing: (value: number) => void;
    setForegroundColor: (value: string) => void;
    setBackgroundColor: (value: string) => void;
    showPreview: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div>
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {text.patternType}
                </span>

                <div
                    className={
                        compact
                            ? "grid grid-cols-2 gap-2"
                            : "grid grid-cols-2 gap-3"
                    }
                >
                    {patternTypes.map((item) => {
                        const isActive = patternType === item;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => {
                                    setPatternType(item);
                                    showPreview();
                                }}
                                className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getPatternLabel(text, item)}
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
                    max={3000}
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
                    max={3000}
                    compact={compact}
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
                compact={compact}
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
                compact={compact}
                onChange={(value) => {
                    setSpacing(value);
                    showPreview();
                }}
            />

            {compact ? (
                <div className="grid grid-cols-2 gap-2">
                    <CompactColorInput
                        label={text.foregroundColor}
                        value={foregroundColor}
                        fallback="#F28C6F"
                        onChange={(value) => {
                            setForegroundColor(value);
                            showPreview();
                        }}
                    />

                    <CompactColorInput
                        label={text.backgroundColor}
                        value={backgroundColor}
                        fallback="#FFF7F3"
                        onChange={(value) => {
                            setBackgroundColor(value);
                            showPreview();
                        }}
                    />
                </div>
            ) : (
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
            )}
        </div>
    );
}

function PatternMiniPreview({
    patternType,
    canvasWidth,
    canvasHeight,
    patternSize,
    spacing,
    foregroundColor,
    backgroundColor,
    offsetX,
    offsetY,
}: {
    patternType: PatternType;
    canvasWidth: number;
    canvasHeight: number;
    patternSize: number;
    spacing: number;
    foregroundColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
}) {
    const safeWidth = Math.max(canvasWidth, 1);
    const safeHeight = Math.max(canvasHeight, 1);
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
                    ...getPatternPreviewStyle({
                        patternType,
                        patternSize,
                        spacing,
                        foregroundColor,
                        backgroundColor,
                        offsetX,
                        offsetY,
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