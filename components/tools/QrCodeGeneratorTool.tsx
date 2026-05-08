"use client";

import {
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import QRCode from "qrcode";
import { t } from "@/data/messages";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

type QrSettings = {
    content: string;
    size: number;
    margin: number;
    foregroundColor: string;
    backgroundColor: string;
    errorCorrectionLevel: ErrorCorrectionLevel;
};

const defaultSettings: QrSettings = {
    content: "https://peachlab.tools",
    size: 320,
    margin: 2,
    foregroundColor: "#2A1F1B",
    backgroundColor: "#FFFFFF",
    errorCorrectionLevel: "M",
};

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

function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

export default function QrCodeGeneratorTool() {
    const text = t.qrCodeGenerator;

    const [settings, setSettings] = useState<QrSettings>(defaultSettings);
    const [pngUrl, setPngUrl] = useState("");
    const [svgOutput, setSvgOutput] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const safeForegroundColor = getSafeHexColor(
        settings.foregroundColor,
        "#2A1F1B",
    );
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFFFFF",
    );

    const qrOptions = useMemo(() => {
        return {
            width: settings.size,
            margin: settings.margin,
            errorCorrectionLevel: settings.errorCorrectionLevel,
            color: {
                dark: safeForegroundColor,
                light: safeBackgroundColor,
            },
        };
    }, [
        settings.size,
        settings.margin,
        settings.errorCorrectionLevel,
        safeForegroundColor,
        safeBackgroundColor,
    ]);

    useEffect(() => {
        async function generateQrCode() {
            if (!settings.content.trim()) {
                setPngUrl("");
                setSvgOutput("");
                setError("");
                return;
            }

            try {
                const nextPngUrl = await QRCode.toDataURL(settings.content, qrOptions);
                const nextSvg = await QRCode.toString(settings.content, {
                    ...qrOptions,
                    type: "svg",
                });

                setPngUrl(nextPngUrl);
                setSvgOutput(nextSvg);
                setError("");
            } catch {
                setPngUrl("");
                setSvgOutput("");
                setError(text.generateError);
            }
        }

        generateQrCode();
    }, [settings, qrOptions, text.generateError]);

    useEffect(() => {
        if (!isControlsOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isControlsOpen]);

    function updateSetting<K extends keyof QrSettings>(
        key: K,
        value: QrSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setStatus("");
    }

    function handleShuffle() {
        const levels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

        setSettings((current) => ({
            ...current,
            size: getRandomNumber(220, 520),
            margin: getRandomNumber(1, 5),
            errorCorrectionLevel: levels[Math.floor(Math.random() * levels.length)],
        }));

        setStatus("");
    }

    function handleRandomAll() {
        const levels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

        setSettings((current) => ({
            ...current,
            size: getRandomNumber(220, 520),
            margin: getRandomNumber(1, 5),
            foregroundColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            errorCorrectionLevel: levels[Math.floor(Math.random() * levels.length)],
        }));

        setStatus("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setStatus("");
        setError("");
    }

    async function handleCopySvg() {
        if (!svgOutput) return;

        try {
            await navigator.clipboard.writeText(svgOutput);
            setStatus(text.copied);
            setError("");
        } catch {
            setError(text.copyError);
        }
    }

    function handleDownloadPng() {
        if (!pngUrl) return;

        downloadDataUrl(pngUrl, "peach-lab-qr-code.png");
    }

    function handleDownloadSvg() {
        if (!svgOutput) return;

        downloadTextFile(svgOutput, "peach-lab-qr-code.svg");
    }

    return (
        <>
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="min-w-0 space-y-6">
                        <section>
                            <SectionHeader
                                title={text.previewTitle}
                                description={text.previewDescription}
                            />

                            <div className="mx-auto mt-5 flex aspect-square w-full max-w-[420px] items-center justify-center rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:max-w-[500px] md:p-4">
                                {pngUrl ? (
                                    <div className="rounded-[26px] border border-[#F1E5DF] bg-white p-2 shadow-sm md:p-3">
                                        <img
                                            src={pngUrl}
                                            alt={text.previewTitle}
                                            className="block h-auto w-full max-w-[280px] object-contain md:max-w-[340px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {text.emptyTitle}
                                        </h4>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} compact />

                                <button
                                    type="button"
                                    onClick={handleCopySvg}
                                    className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                                >
                                    {text.copySvg}
                                </button>
                            </div>

                            <textarea
                                value={svgOutput}
                                readOnly
                                placeholder={text.emptyTitle}
                                className="min-h-[240px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-7 text-gray-700 outline-none"
                            />

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleDownloadPng}
                                    disabled={!pngUrl}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {text.downloadPng}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadSvg}
                                    disabled={!svgOutput}
                                    className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {text.downloadSvg}
                                </button>
                            </div>

                            {status ? (
                                <p className="mt-3 text-sm text-[#7A5A4F]">{status}</p>
                            ) : null}

                            {error ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            ) : null}
                        </section>
                    </div>

                    <section className="hidden min-w-0 lg:block">
                        <ControlsPanel
                            text={text}
                            settings={settings}
                            updateSetting={updateSetting}
                            handleShuffle={handleShuffle}
                            handleRandomAll={handleRandomAll}
                            handleReset={handleReset}
                            showQuickActions
                        />
                    </section>
                </div>
            </div>

            <MobileActionBar
                text={text}
                canDownloadPng={!!pngUrl}
                canDownloadSvg={!!svgOutput}
                onShuffle={handleShuffle}
                onRandomAll={handleRandomAll}
                onOpenControls={() => setIsControlsOpen(true)}
                onDownloadPng={handleDownloadPng}
            />

            {isControlsOpen ? (
                <MobileControlsSheet
                    title={text.controlsTitle}
                    onClose={() => setIsControlsOpen(false)}
                >
                    <ControlsPanel
                        text={text}
                        settings={settings}
                        updateSetting={updateSetting}
                        handleShuffle={handleShuffle}
                        handleRandomAll={handleRandomAll}
                        handleReset={handleReset}
                        showQuickActions={false}
                        compact
                        hideHeader
                    />
                </MobileControlsSheet>
            ) : null}
        </>
    );
}

function SectionHeader({
    title,
    description,
    compact = false,
}: {
    title: string;
    description?: string;
    compact?: boolean;
}) {
    return (
        <div>
            <div className="flex items-center gap-3">
                <span
                    className={`w-1.5 rounded-full bg-[#F28C6F] ${compact ? "h-6" : "h-7"
                        }`}
                />
                <h3
                    className={`font-semibold text-gray-900 ${compact ? "text-base" : "text-lg"
                        }`}
                >
                    {title}
                </h3>
            </div>

            {description ? (
                <p className="mt-2 max-w-[420px] text-sm leading-6 text-gray-500">
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function ControlsPanel({
    text,
    settings,
    updateSetting,
    handleShuffle,
    handleRandomAll,
    handleReset,
    showQuickActions,
    compact = false,
    hideHeader = false,
}: {
    text: typeof t.qrCodeGenerator;
    settings: QrSettings;
    updateSetting: <K extends keyof QrSettings>(
        key: K,
        value: QrSettings[K],
    ) => void;
    handleShuffle: () => void;
    handleRandomAll: () => void;
    handleReset: () => void;
    showQuickActions: boolean;
    compact?: boolean;
    hideHeader?: boolean;
}) {
    return (
        <div className="min-w-0">
            {!hideHeader ? (
                <SectionHeader title={text.controlsTitle} compact={compact} />
            ) : null}

            {showQuickActions ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleShuffle}
                        className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    >
                        {text.shuffle}
                    </button>

                    <button
                        type="button"
                        onClick={handleRandomAll}
                        className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {text.randomAll}
                    </button>
                </div>
            ) : null}

            <div className={`${compact ? "space-y-3" : "mt-5 space-y-5"}`}>
                <label className="block">
                    <span
                        className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {text.contentLabel}
                    </span>

                    <textarea
                        value={settings.content}
                        onChange={(event) => updateSetting("content", event.target.value)}
                        placeholder={text.contentPlaceholder}
                        className={`w-full resize-y rounded-2xl border border-[#F1E5DF] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "min-h-[86px]" : "min-h-[120px]"
                            }`}
                    />
                </label>

                <RangeInput
                    label={text.sizeLabel}
                    value={settings.size}
                    min={160}
                    max={800}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => updateSetting("size", value)}
                />

                <RangeInput
                    label={text.marginLabel}
                    value={settings.margin}
                    min={0}
                    max={10}
                    suffix=""
                    compact={compact}
                    onChange={(value) => updateSetting("margin", value)}
                />

                <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-5"}>
                    <ColorInput
                        label={text.foregroundColorLabel}
                        value={settings.foregroundColor}
                        fallback="#2A1F1B"
                        compact={compact}
                        onChange={(value) => updateSetting("foregroundColor", value)}
                    />

                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        fallback="#FFFFFF"
                        compact={compact}
                        onChange={(value) => updateSetting("backgroundColor", value)}
                    />
                </div>

                <label className="block">
                    <span
                        className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {text.errorCorrectionLabel}
                    </span>

                    <select
                        value={settings.errorCorrectionLevel}
                        onChange={(event) =>
                            updateSetting(
                                "errorCorrectionLevel",
                                event.target.value as ErrorCorrectionLevel,
                            )
                        }
                        className={`w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-11" : "h-12"
                            }`}
                    >
                        <option value="L">{text.low}</option>
                        <option value="M">{text.medium}</option>
                        <option value="Q">{text.quartile}</option>
                        <option value="H">{text.high}</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={handleReset}
                    className={`w-full rounded-2xl border border-[#F4C8BA] bg-white text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] ${compact ? "px-4 py-2.5" : "px-4 py-3"
                        }`}
                >
                    {text.reset}
                </button>
            </div>
        </div>
    );
}

function MobileActionBar({
    text,
    canDownloadPng,
    canDownloadSvg,
    onShuffle,
    onRandomAll,
    onOpenControls,
    onDownloadPng,
}: {
    text: typeof t.qrCodeGenerator;
    canDownloadPng: boolean;
    canDownloadSvg: boolean;
    onShuffle: () => void;
    onRandomAll: () => void;
    onOpenControls: () => void;
    onDownloadPng: () => void;
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
                `${Math.ceil(rect.height + 28)}px`,
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-4 gap-2 rounded-[30px] border border-[#F4C8BA] bg-white/95 p-3 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onShuffle}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center text-xs font-semibold text-[#E6765B]"
                >
                    {text.shuffle}
                </button>

                <button
                    type="button"
                    onClick={onRandomAll}
                    className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 py-3 text-center text-xs font-semibold text-[#E6765B]"
                >
                    {text.randomAll}
                </button>

                <button
                    type="button"
                    onClick={onOpenControls}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center text-xs font-semibold text-[#2A1F1B]"
                >
                    {text.controlsTitle}
                </button>

                <button
                    type="button"
                    onClick={onDownloadPng}
                    disabled={!canDownloadPng || !canDownloadSvg}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-3 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:bg-[#F8D9CF] disabled:opacity-75"
                >
                    PNG
                </button>
            </div>
        </div>
    );
}

function MobileControlsSheet({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-24 backdrop-blur-sm lg:hidden"
            onClick={onClose}
        >
            <div
                className="ml-auto flex h-full max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)]"
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
                        onClick={onClose}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-2xl font-semibold leading-none text-[#2A1F1B] transition hover:bg-[#FFF0EA]"
                    >
                        ×
                    </button>
                </div>

                <div className="overflow-y-auto px-4 pb-4 pt-2">{children}</div>
            </div>
        </div>
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
                className={`mb-2 block truncate font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={
                    compact
                        ? "grid grid-cols-[42px_1fr] gap-2"
                        : "grid grid-cols-[58px_1fr] gap-3"
                }
            >
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-11" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full min-w-0 rounded-xl border border-[#F1E5DF] px-2 text-xs font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-11" : "h-12 md:px-4 md:text-sm"
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