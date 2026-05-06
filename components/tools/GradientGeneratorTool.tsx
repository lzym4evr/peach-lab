"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export default function GradientGeneratorTool() {
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

    const [isSettingsRendered, setIsSettingsRendered] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const visibleColors = useMemo(() => {
        return colors.slice(0, colorCount);
    }, [colors, colorCount]);

    function getRadialPositionLabel(position: RadialPosition) {
        const labels: Record<RadialPosition, string> = {
            center: t.gradientGenerator.center,
            top: t.gradientGenerator.top,
            bottom: t.gradientGenerator.bottom,
            left: t.gradientGenerator.left,
            right: t.gradientGenerator.right,
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
            return `${t.gradientGenerator.radial} · ${colorCount} ${t.gradientGenerator.colors} · ${getRadialPositionLabel(radialPosition)}`;
        }

        return `${t.gradientGenerator.linear} · ${colorCount} ${t.gradientGenerator.colors} · ${angle}°`;
    }, [angle, colorCount, gradientType, radialPosition]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isSettingsRendered) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const raf = requestAnimationFrame(() => {
            setIsSettingsVisible(true);
        });

        return () => {
            cancelAnimationFrame(raf);
            document.body.style.overflow = previousOverflow;
        };
    }, [isSettingsRendered]);

    async function copyCss() {
        await navigator.clipboard.writeText(`background: ${cssValue};`);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
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
        return RADIAL_POSITIONS[
            Math.floor(Math.random() * RADIAL_POSITIONS.length)
        ];
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

    function openSettings() {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        setIsSettingsRendered(true);
    }

    function closeSettings() {
        setIsSettingsVisible(false);

        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        closeTimerRef.current = setTimeout(() => {
            setIsSettingsRendered(false);
        }, 260);
    }

    function renderTypeControls() {
        return (
            <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4">
                <label className="mb-3 block text-sm font-semibold text-gray-800">
                    {t.gradientGenerator.gradientType}
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setGradientType("linear")}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${gradientType === "linear"
                                ? "bg-[#F28C6F] text-white shadow-sm"
                                : "border border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                            }`}
                    >
                        {t.gradientGenerator.linear}
                    </button>

                    <button
                        type="button"
                        onClick={() => setGradientType("radial")}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${gradientType === "radial"
                                ? "bg-[#F28C6F] text-white shadow-sm"
                                : "border border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                            }`}
                    >
                        {t.gradientGenerator.radial}
                    </button>
                </div>
            </div>
        );
    }

    function renderColorCountControls() {
        return (
            <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4">
                <label className="mb-3 block text-sm font-semibold text-gray-800">
                    {t.gradientGenerator.colorCount}
                </label>

                <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map((count) => (
                        <button
                            key={count}
                            type="button"
                            onClick={() => setColorCount(count)}
                            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${colorCount === count
                                    ? "bg-[#F28C6F] text-white shadow-sm"
                                    : "border border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                }`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    function renderColorControls() {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {visibleColors.map((color, index) => (
                    <div
                        key={`color-${index}`}
                        className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4"
                    >
                        <label className="mb-3 block text-sm font-semibold text-gray-800">
                            {t.gradientGenerator.color} {index + 1}
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(event) => updateColor(index, event.target.value)}
                                className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                            />

                            <input
                                value={color}
                                onChange={(event) => updateColor(index, event.target.value)}
                                className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] bg-white px-3 py-3 text-sm font-medium uppercase outline-none focus:border-[#F28C6F]"
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function renderAngleOrPositionControls() {
        if (gradientType === "linear") {
            return (
                <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.gradientGenerator.angle}: {angle}°
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(event) => setAngle(Number(event.target.value))}
                        className="w-full accent-[#F28C6F]"
                    />

                    <div className="mt-4 grid grid-cols-5 gap-2">
                        {ANGLE_PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAngle(preset)}
                                className={`rounded-xl px-2 py-2 text-sm font-semibold transition ${angle === preset
                                        ? "bg-[#F28C6F] text-white shadow-sm"
                                        : "border border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {preset}°
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4">
                <label className="mb-3 block text-sm font-semibold text-gray-800">
                    {t.gradientGenerator.position}
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {RADIAL_POSITIONS.map((position) => (
                        <button
                            key={position}
                            type="button"
                            onClick={() => setRadialPosition(position)}
                            className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${radialPosition === position
                                    ? "bg-[#F28C6F] text-white shadow-sm"
                                    : "border border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                }`}
                        >
                            {getRadialPositionLabel(position)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    function renderSettingsControls() {
        return (
            <>
                <div className="grid gap-4 md:grid-cols-2">
                    {renderTypeControls()}
                    {renderColorCountControls()}
                </div>

                {renderColorControls()}

                {renderAngleOrPositionControls()}
            </>
        );
    }

    return (
        <>
            <div className="space-y-4 md:space-y-6">
                <div
                    className="flex min-h-48 items-end rounded-3xl border border-[#F1E5DF] p-5 shadow-sm md:min-h-72"
                    style={{ background: cssValue }}
                >
                    <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {t.gradientGenerator.preview}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {gradientType === "linear"
                                ? `${angle}° ${t.gradientGenerator.gradient}`
                                : `${t.gradientGenerator.radial} ${getRadialPositionLabel(radialPosition)}`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={shuffleGradient}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] md:min-w-[128px]"
                    >
                        {t.gradientGenerator.shuffle}
                    </button>

                    <button
                        type="button"
                        onClick={randomGradient}
                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:min-w-[128px]"
                    >
                        {t.gradientGenerator.random}
                    </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#F1E5DF] bg-white p-4 md:hidden">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#2A1F1B]">
                            {t.gradientGenerator.gradientSettings}
                        </p>
                        <p className="mt-1 truncate text-sm text-gray-500">
                            {gradientSummary}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openSettings}
                        className="shrink-0 rounded-2xl bg-[#F28C6F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {t.gradientGenerator.edit}
                    </button>
                </div>

                <div className="hidden space-y-6 md:block">
                    {renderSettingsControls()}
                </div>

                <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-gray-800">
                            {t.gradientGenerator.cssOutput}
                        </h3>

                        <button
                            onClick={copyCss}
                            className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                        >
                            {copied ? t.common.copied : t.gradientGenerator.copyCss}
                        </button>
                    </div>

                    <pre className="overflow-x-auto rounded-xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                        {`background: ${cssValue};`}
                    </pre>
                </div>
            </div>

            {isSettingsRendered && (
                <div
                    className={`fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${isSettingsVisible ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={closeSettings}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        className={`fixed inset-x-0 bottom-0 h-[66dvh] rounded-t-[2rem] border-t border-[#F1E5DF] bg-white px-4 pb-5 pt-4 shadow-2xl transition-transform duration-300 ease-out ${isSettingsVisible ? "translate-y-0" : "translate-y-full"
                            }`}
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-[#2A1F1B]">
                                    {t.gradientGenerator.gradientSettings}
                                </h3>
                                <p className="mt-1 truncate text-sm text-gray-500">
                                    {gradientSummary}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeSettings}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-2xl leading-none text-[#2A1F1B] transition hover:bg-[#FFEDE6]"
                                aria-label={t.gradientGenerator.cancel}
                            >
                                ×
                            </button>
                        </div>

                        <div className="h-[calc(100%-112px)] overflow-y-auto pb-4">
                            <div className="space-y-5">
                                {renderSettingsControls()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-[#F1E5DF] bg-white pt-3">
                            <button
                                type="button"
                                onClick={closeSettings}
                                className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                            >
                                {t.gradientGenerator.cancel}
                            </button>

                            <button
                                type="button"
                                onClick={closeSettings}
                                className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {t.gradientGenerator.apply}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}