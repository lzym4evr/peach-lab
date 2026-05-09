"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type Point = {
    x: number;
    y: number;
};

function createRandomPoints(count: number, minRadius: number, maxRadius: number) {
    const points: Point[] = [];
    const centerX = 150;
    const centerY = 150;

    for (let index = 0; index < count; index++) {
        const angle = (Math.PI * 2 * index) / count;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);

        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
        });
    }

    return points;
}

function createSmoothPath(points: Point[], smoothness: number) {
    if (points.length < 2) return "";

    let path = "";

    for (let index = 0; index < points.length; index++) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const previous = points[(index - 1 + points.length) % points.length];

        const controlDistance = smoothness / 100;

        const controlPoint1 = {
            x: current.x + (next.x - previous.x) * controlDistance,
            y: current.y + (next.y - previous.y) * controlDistance,
        };

        const nextNext = points[(index + 2) % points.length];

        const controlPoint2 = {
            x: next.x - (nextNext.x - current.x) * controlDistance,
            y: next.y - (nextNext.y - current.y) * controlDistance,
        };

        if (index === 0) {
            path += `M ${current.x.toFixed(2)} ${current.y.toFixed(2)} `;
        }

        path += `C ${controlPoint1.x.toFixed(2)} ${controlPoint1.y.toFixed(
            2,
        )}, ${controlPoint2.x.toFixed(2)} ${controlPoint2.y.toFixed(
            2,
        )}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
    }

    path += "Z";

    return path;
}

export default function BlobGeneratorTool() {
    const text = t.blobGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const copyErrorText =
        (text as { copyError?: string }).copyError ??
        "Copy failed. Please copy the SVG manually.";

    const [pointsCount, setPointsCount] = useState(8);
    const [smoothness, setSmoothness] = useState(28);
    const [color, setColor] = useState("#F28C6F");
    const [points, setPoints] = useState(() => createRandomPoints(8, 80, 125));
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const path = useMemo(() => {
        return createSmoothPath(points, smoothness);
    }, [points, smoothness]);

    const svgCode = useMemo(() => {
        return `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" fill="${color}" />
</svg>`;
    }, [path, color]);

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

    function generateBlob() {
        setPoints(createRandomPoints(pointsCount, 80, 125));
        clearCopyState();
    }

    async function copySvg() {
        try {
            await navigator.clipboard.writeText(svgCode);

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

    function downloadSvg() {
        const blob = new Blob([svgCode], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "peach-lab-blob.svg";
        link.click();

        URL.revokeObjectURL(url);
    }

    const previewPanel = (
        <BlobPreview path={path} color={color} />
    );

    const desktopSettingsPanel = (
        <BlobSettingsPanel
            text={text}
            pointsCount={pointsCount}
            smoothness={smoothness}
            color={color}
            setPointsCount={setPointsCount}
            setSmoothness={setSmoothness}
            setColor={setColor}
            setPoints={setPoints}
            clearCopyState={clearCopyState}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <BlobSettingsPanel
            text={text}
            pointsCount={pointsCount}
            smoothness={smoothness}
            color={color}
            setPointsCount={setPointsCount}
            setSmoothness={setSmoothness}
            setColor={setColor}
            setPoints={setPoints}
            clearCopyState={clearCopyState}
            compact
        />
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <SectionHeader title={text.previewTitle} />

                                <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                    {text.previewDescription}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={generateBlob}
                                className="hidden rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] md:inline-flex"
                            >
                                {text.generate}
                            </button>
                        </div>

                        <div className="mt-5">{previewPanel}</div>
                    </section>

                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <SectionHeader title={text.svgCode} />

                            <button
                                type="button"
                                onClick={copySvg}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copied ? t.common.copied : text.copySvg}
                            </button>
                        </div>

                        <pre className="max-h-80 overflow-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                            <code>{svgCode}</code>
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
                            onClick={downloadSvg}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.downloadSvg}
                        </button>
                    </div>
                </section>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                downloadText={actionDownloadText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onDownload={downloadSvg}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <BlobMiniPreview path={path} color={color} />

                        <button
                            type="button"
                            onClick={generateBlob}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.generate}
                        </button>

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function BlobPreview({ path, color }: { path: string; color: string }) {
    return (
        <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-[#FFF7F3] p-6 md:min-h-96 md:p-8">
            <svg
                width="300"
                height="300"
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full max-h-72 w-full max-w-72 drop-shadow-sm md:h-72 md:w-72"
            >
                <path d={path} fill={color} />
            </svg>
        </div>
    );
}

function BlobMiniPreview({ path, color }: { path: string; color: string }) {
    return (
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-5">
            <svg
                width="300"
                height="300"
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full max-h-52 w-full max-w-52 drop-shadow-sm"
            >
                <path d={path} fill={color} />
            </svg>
        </div>
    );
}

function BlobSettingsPanel({
    text,
    pointsCount,
    smoothness,
    color,
    setPointsCount,
    setSmoothness,
    setColor,
    setPoints,
    clearCopyState,
    compact = false,
}: {
    text: typeof t.blobGenerator;
    pointsCount: number;
    smoothness: number;
    color: string;
    setPointsCount: (value: number) => void;
    setSmoothness: (value: number) => void;
    setColor: (value: string) => void;
    setPoints: (value: Point[]) => void;
    clearCopyState: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            {compact ? (
                <CompactColorInput
                    label={text.fillColor}
                    value={color}
                    onChange={(value) => {
                        setColor(value);
                        clearCopyState();
                    }}
                />
            ) : (
                <ColorInput
                    label={text.fillColor}
                    value={color}
                    onChange={(value) => {
                        setColor(value);
                        clearCopyState();
                    }}
                />
            )}

            <RangeInput
                label={text.points}
                value={pointsCount}
                min={5}
                max={14}
                suffix=""
                compact={compact}
                onChange={(value) => {
                    setPointsCount(value);
                    setPoints(createRandomPoints(value, 80, 125));
                    clearCopyState();
                }}
            />

            <RangeInput
                label={text.smoothness}
                value={smoothness}
                min={10}
                max={45}
                suffix=""
                compact={compact}
                onChange={(value) => {
                    setSmoothness(value);
                    clearCopyState();
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
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block truncate text-[10px] font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[42px_1fr] gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 min-w-0 rounded-xl border border-[#F1E5DF] px-3 text-xs font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
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