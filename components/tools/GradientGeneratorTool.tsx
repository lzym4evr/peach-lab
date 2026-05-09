"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type GradientType = "linear" | "radial";

const RANDOM_COLORS = [
    "#F28C6F",
    "#FFD6C8",
    "#F59E8B",
    "#FFB38A",
    "#7DD3FC",
    "#A7F3D0",
    "#C4B5FD",
    "#FBCFE8",
    "#FDE68A",
    "#FDBA74",
    "#B88AF2",
    "#5DD6C8",
];

const ANGLE_PRESETS = [0, 45, 90, 135, 180];

const RADIAL_POSITIONS = ["center", "top", "bottom", "left", "right"] as const;

type RadialPosition = (typeof RADIAL_POSITIONS)[number];

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function getRandomColor() {
    return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
}

function getRandomAngle() {
    return Math.floor(Math.random() * 361);
}

function getRandomGradientType(): GradientType {
    return Math.random() > 0.5 ? "linear" : "radial";
}

function getRandomRadialPosition() {
    return RADIAL_POSITIONS[Math.floor(Math.random() * RADIAL_POSITIONS.length)];
}

export default function GradientGeneratorTool() {
    const text = t.gradientGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const [gradientType, setGradientType] = useState<GradientType>("linear");
    const [colorCount, setColorCount] = useState(2);
    const [colors, setColors] = useState([
        "#F28C6F",
        "#FFD6C8",
        "#7DD3FC",
        "#C4B5FD",
    ]);
    const [angle, setAngle] = useState(135);
    const [radialPosition, setRadialPosition] =
        useState<RadialPosition>("center");
    const [copied, setCopied] = useState(false);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const visibleColors = useMemo(() => {
        return colors.slice(0, colorCount).map((color, index) => {
            const fallback = index === 0 ? "#F28C6F" : "#FFD6C8";
            return getSafeHexColor(color, fallback);
        });
    }, [colors, colorCount]);

    function getRadialPositionLabel(position: RadialPosition) {
        const labels: Record<RadialPosition, string> = {
            center: text.center,
            top: text.top,
            bottom: text.bottom,
            left: text.left,
            right: text.right,
        };

        return labels[position];
    }

    const cssValue = useMemo(() => {
        const colorStops = visibleColors.join(", ");

        if (gradientType === "radial") {
            return `radial-gradient(circle at ${radialPosition}, ${colorStops})`;
        }

        return `linear-gradient(${angle}deg, ${colorStops})`;
    }, [angle, gradientType, radialPosition, visibleColors]);

    const gradientSummary = useMemo(() => {
        if (gradientType === "radial") {
            return `${text.radial} · ${colorCount} ${text.colors} · ${getRadialPositionLabel(
                radialPosition,
            )}`;
        }

        return `${text.linear} · ${colorCount} ${text.colors} · ${angle}°`;
    }, [angle, colorCount, gradientType, radialPosition]);

    const cssOutput = `background: ${cssValue};`;

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(cssOutput);
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

    function updateColor(index: number, value: string) {
        setColors((currentColors) => {
            const nextColors = [...currentColors];
            nextColors[index] = value.toUpperCase();
            return nextColors;
        });
    }

    function shuffleGradient() {
        setGradientType(getRandomGradientType());
        setAngle(getRandomAngle());
        setRadialPosition(getRandomRadialPosition());
    }

    function randomGradient() {
        const nextColorCount = Math.floor(Math.random() * 3) + 2;

        setColorCount(nextColorCount);
        setGradientType(getRandomGradientType());
        setAngle(getRandomAngle());
        setRadialPosition(getRandomRadialPosition());
        setColors([getRandomColor(), getRandomColor(), getRandomColor(), getRandomColor()]);
    }

    const previewPanel = (
        <GradientPreview
            cssValue={cssValue}
            gradientType={gradientType}
            angle={angle}
            radialPositionLabel={getRadialPositionLabel(radialPosition)}
            text={text}
        />
    );

    const mobilePreviewPanel = (
        <GradientMiniPreview
            cssValue={cssValue}
            gradientType={gradientType}
            angle={angle}
            radialPositionLabel={getRadialPositionLabel(radialPosition)}
            text={text}
        />
    );

    const desktopSettingsPanel = (
        <GradientSettingsPanel
            text={text}
            gradientType={gradientType}
            colorCount={colorCount}
            colors={colors}
            angle={angle}
            radialPosition={radialPosition}
            setGradientType={setGradientType}
            setColorCount={setColorCount}
            updateColor={updateColor}
            setAngle={setAngle}
            setRadialPosition={setRadialPosition}
            getRadialPositionLabel={getRadialPositionLabel}
            onShuffle={shuffleGradient}
            onRandom={randomGradient}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <GradientSettingsPanel
            text={text}
            gradientType={gradientType}
            colorCount={colorCount}
            colors={colors}
            angle={angle}
            radialPosition={radialPosition}
            setGradientType={setGradientType}
            setColorCount={setColorCount}
            updateColor={updateColor}
            setAngle={setAngle}
            setRadialPosition={setRadialPosition}
            getRadialPositionLabel={getRadialPositionLabel}
            onShuffle={shuffleGradient}
            onRandom={randomGradient}
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
                                <SectionHeader title={text.preview} />

                                <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                    {gradientSummary}
                                </p>
                            </div>

                            {previewPanel}
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.cssOutput} />

                                <button
                                    type="button"
                                    onClick={copyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copied ? t.common.copied : text.copyCss}
                                </button>
                            </div>

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                                <code>{cssOutput}</code>
                            </pre>
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        <SectionHeader title={text.gradientSettings} />

                        <div className="mt-5">{desktopSettingsPanel}</div>
                    </section>
                </div>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.gradientSettings}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="shrink-0 bg-white pb-3">
                            {mobilePreviewPanel}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto pt-1">
                            {mobileSettingsPanel}
                        </div>
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function GradientPreview({
    cssValue,
    gradientType,
    angle,
    radialPositionLabel,
    text,
}: {
    cssValue: string;
    gradientType: GradientType;
    angle: number;
    radialPositionLabel: string;
    text: typeof t.gradientGenerator;
}) {
    return (
        <div
            className="flex aspect-square w-full items-end rounded-3xl border border-[#F1E5DF] p-5 shadow-sm md:aspect-auto md:min-h-[360px] md:p-6"
            style={{ background: cssValue }}
        >
            <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {text.preview}
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                    {gradientType === "linear"
                        ? `${angle}° ${text.gradient}`
                        : `${text.radial} ${radialPositionLabel}`}
                </p>
            </div>
        </div>
    );
}

function GradientMiniPreview({
    cssValue,
    gradientType,
    angle,
    radialPositionLabel,
    text,
}: {
    cssValue: string;
    gradientType: GradientType;
    angle: number;
    radialPositionLabel: string;
    text: typeof t.gradientGenerator;
}) {
    return (
        <div
            className="flex h-36 w-full items-end rounded-2xl border border-[#F1E5DF] p-3 shadow-sm"
            style={{ background: cssValue }}
        >
            <div className="rounded-xl bg-white/85 px-3 py-2 shadow-sm backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    {text.preview}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-gray-900">
                    {gradientType === "linear"
                        ? `${angle}° ${text.gradient}`
                        : `${text.radial} ${radialPositionLabel}`}
                </p>
            </div>
        </div>
    );
}

function GradientSettingsPanel({
    text,
    gradientType,
    colorCount,
    colors,
    angle,
    radialPosition,
    setGradientType,
    setColorCount,
    updateColor,
    setAngle,
    setRadialPosition,
    getRadialPositionLabel,
    onShuffle,
    onRandom,
    compact = false,
}: {
    text: typeof t.gradientGenerator;
    gradientType: GradientType;
    colorCount: number;
    colors: string[];
    angle: number;
    radialPosition: RadialPosition;
    setGradientType: (value: GradientType) => void;
    setColorCount: (value: number) => void;
    updateColor: (index: number, value: string) => void;
    setAngle: (value: number) => void;
    setRadialPosition: (value: RadialPosition) => void;
    getRadialPositionLabel: (value: RadialPosition) => string;
    onShuffle: () => void;
    onRandom: () => void;
    compact?: boolean;
}) {
    const visibleColors = colors.slice(0, colorCount);

    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div>
                {compact ? (
                    <div className="mb-2 flex flex-nowrap items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs font-semibold text-gray-800">
                            {text.gradientType}
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
                                {text.random}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 grid grid-cols-2 gap-3">
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
                                {text.random}
                            </button>
                        </div>

                        <span className="mb-2 block text-sm font-semibold text-gray-800">
                            {text.gradientType}
                        </span>
                    </>
                )}

                <div className="grid grid-cols-2 gap-2">
                    <OptionButton
                        active={gradientType === "linear"}
                        compact={compact}
                        onClick={() => setGradientType("linear")}
                    >
                        {text.linear}
                    </OptionButton>

                    <OptionButton
                        active={gradientType === "radial"}
                        compact={compact}
                        onClick={() => setGradientType("radial")}
                    >
                        {text.radial}
                    </OptionButton>
                </div>
            </div>

            <div>
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {text.colorCount}
                </span>

                <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((count) => (
                        <OptionButton
                            key={count}
                            active={colorCount === count}
                            compact={compact}
                            onClick={() => setColorCount(count)}
                        >
                            {count}
                        </OptionButton>
                    ))}
                </div>
            </div>

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-2"
                        : "grid gap-3 sm:grid-cols-2"
                }
            >
                {visibleColors.map((color, index) => (
                    <ColorInput
                        key={`color-${index}`}
                        label={`${text.color} ${index + 1}`}
                        value={color}
                        fallback={index === 0 ? "#F28C6F" : "#FFD6C8"}
                        compact={compact}
                        onChange={(value) => updateColor(index, value)}
                    />
                ))}
            </div>

            {gradientType === "linear" ? (
                <div>
                    <RangeInput
                        label={text.angle}
                        value={angle}
                        min={0}
                        max={360}
                        suffix="°"
                        compact={compact}
                        onChange={setAngle}
                    />

                    <div className="mt-3 grid grid-cols-5 gap-2">
                        {ANGLE_PRESETS.map((preset) => (
                            <OptionButton
                                key={preset}
                                active={angle === preset}
                                compact={compact}
                                onClick={() => setAngle(preset)}
                            >
                                {preset}°
                            </OptionButton>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <span
                        className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {text.position}
                    </span>

                    <div
                        className={
                            compact
                                ? "grid grid-cols-2 gap-2"
                                : "grid grid-cols-2 gap-3"
                        }
                    >
                        {RADIAL_POSITIONS.map((position) => (
                            <OptionButton
                                key={position}
                                active={radialPosition === position}
                                compact={compact}
                                onClick={() => setRadialPosition(position)}
                            >
                                {getRadialPositionLabel(position)}
                            </OptionButton>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function OptionButton({
    active,
    compact = false,
    children,
    onClick,
}: {
    active: boolean;
    compact?: boolean;
    children: ReactNode;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border font-semibold transition ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                } ${active
                    ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                    : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                }`}
        >
            {children}
        </button>
    );
}

function ColorInput({
    label,
    value,
    fallback,
    compact = false,
    onChange,
}: {
    label: string;
    value: string;
    fallback: string;
    compact?: boolean;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : fallback;

    return (
        <label className="block min-w-0">
            <span
                className={`mb-1.5 block truncate font-semibold text-gray-800 ${compact ? "text-[10px]" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={`grid gap-1.5 ${compact ? "grid-cols-[34px_1fr]" : "grid-cols-[58px_1fr]"
                    }`}
            >
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-10" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full rounded-xl border border-[#F1E5DF] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                            ? "h-10 px-2 text-[11px]"
                            : "h-12 px-4 text-sm"
                        }`}
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
                className={
                    compact
                        ? "mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5"
                        : "mb-2 flex items-center justify-between gap-4"
                }
            >
                <span
                    className={
                        compact
                            ? "min-w-0 truncate whitespace-nowrap text-[11px] font-semibold leading-5 text-gray-800"
                            : "text-sm font-semibold text-gray-800"
                    }
                >
                    {label}
                </span>

                <span
                    className={
                        compact
                            ? "min-w-[40px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-0.5 text-center text-[11px] font-semibold leading-5 text-[#7A5A4F]"
                            : "rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]"
                    }
                >
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

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#F28C6F]" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
    );
}

function MobileActionBar({
    settingsButtonText,
    onOpenSettings,
}: {
    settingsButtonText: string;
    onOpenSettings: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-1 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {settingsButtonText}
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
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-2 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
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

                <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}