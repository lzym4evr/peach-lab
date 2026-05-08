"use client";

import {
    type ChangeEvent,
    type DragEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type GeneratedFavicon = {
    size: number;
    fileName: string;
    dataUrl: string;
};

type ImageInfo = {
    width: number;
    height: number;
};

const faviconSizes = [16, 32, 48, 64, 180, 192, 512];

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

function getHtmlOutput() {
    return `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;
}

function getFileName(size: number) {
    if (size === 180) return "apple-touch-icon.png";
    if (size === 192) return "android-chrome-192x192.png";
    if (size === 512) return "android-chrome-512x512.png";

    return `favicon-${size}x${size}.png`;
}

export default function FaviconGeneratorTool() {
    const text = t.faviconGenerator;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState("");
    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [generatedFavicons, setGeneratedFavicons] = useState<
        GeneratedFavicon[]
    >([]);

    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
    const [transparentBackground, setTransparentBackground] = useState(true);
    const [padding, setPadding] = useState(12);
    const [cornerRadius, setCornerRadius] = useState(18);

    const [isDragging, setIsDragging] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    const htmlOutput = useMemo(() => getHtmlOutput(), []);

    useEffect(() => {
        if (!isSettingsOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isSettingsOpen]);

    function clearGenerated() {
        setGeneratedFavicons([]);
        setStatus("");
        setError("");
        setCopied(false);
        setCopyError("");
    }

    function loadImageFile(file: File) {
        if (!file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
            setError(text.loadError);
            return;
        }

        if (originalUrl) {
            URL.revokeObjectURL(originalUrl);
        }

        const nextUrl = URL.createObjectURL(file);

        setOriginalFile(file);
        setOriginalUrl(nextUrl);
        setImageInfo(null);
        setGeneratedFavicons([]);
        setError("");
        setStatus("");
        setCopied(false);
        setCopyError("");

        const image = new Image();

        image.onload = () => {
            setImageInfo({
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
        };

        image.onerror = () => {
            setError(text.loadError);
        };

        image.src = nextUrl;
    }

    function handleChooseFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        loadImageFile(file);

        event.target.value = "";
    }

    function handleDragOver(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        loadImageFile(file);
    }

    function drawRoundedBackground(
        context: CanvasRenderingContext2D,
        size: number,
        radiusPercent: number,
        color: string,
    ) {
        const radius = (size * radiusPercent) / 100;

        context.beginPath();
        context.moveTo(radius, 0);
        context.lineTo(size - radius, 0);
        context.quadraticCurveTo(size, 0, size, radius);
        context.lineTo(size, size - radius);
        context.quadraticCurveTo(size, size, size - radius, size);
        context.lineTo(radius, size);
        context.quadraticCurveTo(0, size, 0, size - radius);
        context.lineTo(0, radius);
        context.quadraticCurveTo(0, 0, radius, 0);
        context.closePath();

        context.fillStyle = color;
        context.fill();
    }

    async function generateFaviconBySize(image: HTMLImageElement, size: number) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Canvas not supported");
        }

        const safeBackgroundColor = getSafeHexColor(backgroundColor, "#FFFFFF");

        context.clearRect(0, 0, size, size);

        if (!transparentBackground) {
            drawRoundedBackground(context, size, cornerRadius, safeBackgroundColor);
        }

        const safePadding = Math.min(Math.max(padding, 0), 45);
        const innerSize = size * (1 - safePadding / 100);
        const sourceRatio = image.naturalWidth / image.naturalHeight;

        let drawWidth = innerSize;
        let drawHeight = innerSize;

        if (sourceRatio > 1) {
            drawHeight = innerSize / sourceRatio;
        } else {
            drawWidth = innerSize * sourceRatio;
        }

        const x = (size - drawWidth) / 2;
        const y = (size - drawHeight) / 2;

        context.drawImage(image, x, y, drawWidth, drawHeight);

        return {
            size,
            fileName: getFileName(size),
            dataUrl: canvas.toDataURL("image/png"),
        };
    }

    async function handleGenerate() {
        if (!originalFile || !originalUrl) {
            setError(text.noFileError);
            return;
        }

        try {
            const image = new Image();

            image.onload = async () => {
                try {
                    const nextFavicons = await Promise.all(
                        faviconSizes.map((size) => generateFaviconBySize(image, size)),
                    );

                    setGeneratedFavicons(nextFavicons);
                    setStatus(text.ready);
                    setError("");
                    setCopyError("");
                } catch {
                    setError(text.generateError);
                }
            };

            image.onerror = () => {
                setError(text.loadError);
            };

            image.src = originalUrl;
        } catch {
            setError(text.generateError);
        }
    }

    function handleDownloadAll() {
        if (!generatedFavicons.length) return;

        generatedFavicons.forEach((favicon, index) => {
            setTimeout(() => {
                downloadDataUrl(favicon.dataUrl, favicon.fileName);
            }, index * 150);
        });
    }

    async function handleCopyHtml() {
        try {
            await navigator.clipboard.writeText(htmlOutput);

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
            setCopyError(text.copyError);
        }
    }

    function handleReset() {
        setBackgroundColor("#FFFFFF");
        setTransparentBackground(true);
        setPadding(12);
        setCornerRadius(18);
        setGeneratedFavicons([]);
        setStatus("");
        setError("");
        setCopied(false);
        setCopyError("");
    }

    return (
        <>
            <div className="space-y-6">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                    {text.localProcessing}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="min-w-0 space-y-6">
                        <label
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`block cursor-pointer rounded-3xl border-2 border-dashed p-4 text-center transition md:p-8 ${isDragging
                                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                                    : "border-[#F4C8BA] bg-[#FFF7F3] hover:bg-[#FFF0EA]"
                                }`}
                        >
                            <h2 className="text-xl font-semibold leading-tight text-[#111827] md:text-3xl">
                                {text.uploadTitle}
                            </h2>

                            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:mt-3 md:text-base md:leading-7">
                                {text.uploadDescription}
                            </p>

                            <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:mt-3 md:text-sm">
                                {text.dropHint}
                            </p>

                            <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                                {originalFile ? text.changeImage : text.uploadButton}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
                                onChange={handleChooseFile}
                                className="hidden"
                            />

                            <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                                {originalFile?.name || text.emptyTitle}
                            </p>
                        </label>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.previewTitle} />

                                {imageInfo ? (
                                    <span className="shrink-0 rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                                        {imageInfo.width} × {imageInfo.height}px
                                    </span>
                                ) : null}
                            </div>

                            <div className="mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:max-w-[500px] md:p-4">
                                {originalUrl ? (
                                    <div className="flex max-h-full max-w-full items-center justify-center rounded-[26px] border border-[#F1E5DF] bg-white p-2 shadow-sm md:p-3">
                                        <img
                                            src={originalUrl}
                                            alt={text.previewTitle}
                                            className="block max-h-[280px] max-w-full rounded-xl object-contain md:max-h-[340px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="px-5 text-center">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {text.emptyTitle}
                                        </h4>

                                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                            {text.emptyDescription}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4">
                                <SectionHeader title={text.outputTitle} />
                            </div>

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                                <code>{htmlOutput}</code>
                            </pre>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopyHtml}
                                    className="rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                                >
                                    {copied ? text.copied : text.copyHtml}
                                </button>
                            </div>

                            {copyError ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {copyError}
                                </p>
                            ) : null}
                        </section>

                        <div className="lg:hidden">
                            <GeneratedFilesPanel
                                text={text}
                                generatedFavicons={generatedFavicons}
                                status={status}
                                error={error}
                                handleDownloadAll={handleDownloadAll}
                            />
                        </div>
                    </div>

                    <section className="hidden min-w-0 md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm lg:block">
                        <FaviconSettingsPanel
                            text={text}
                            transparentBackground={transparentBackground}
                            backgroundColor={backgroundColor}
                            padding={padding}
                            cornerRadius={cornerRadius}
                            setTransparentBackground={setTransparentBackground}
                            setBackgroundColor={setBackgroundColor}
                            setPadding={setPadding}
                            setCornerRadius={setCornerRadius}
                            clearGenerated={clearGenerated}
                            handleGenerate={handleGenerate}
                            handleReset={handleReset}
                        />

                        <GeneratedFilesPanel
                            text={text}
                            generatedFavicons={generatedFavicons}
                            status={status}
                            error={error}
                            handleDownloadAll={handleDownloadAll}
                            desktop
                        />
                    </section>
                </div>
            </div>

            <MobileActionBar
                text={text}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onGenerate={handleGenerate}
                onDownloadAll={handleDownloadAll}
                onCopyHtml={handleCopyHtml}
                canDownloadAll={generatedFavicons.length > 0}
            />

            {isSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controlsTitle}
                    onClose={() => setIsSettingsOpen(false)}
                >
                    <FaviconSettingsPanel
                        text={text}
                        transparentBackground={transparentBackground}
                        backgroundColor={backgroundColor}
                        padding={padding}
                        cornerRadius={cornerRadius}
                        setTransparentBackground={setTransparentBackground}
                        setBackgroundColor={setBackgroundColor}
                        setPadding={setPadding}
                        setCornerRadius={setCornerRadius}
                        clearGenerated={clearGenerated}
                        handleGenerate={handleGenerate}
                        handleReset={handleReset}
                        compact
                        hideHeader
                    />
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function FaviconSettingsPanel({
    text,
    transparentBackground,
    backgroundColor,
    padding,
    cornerRadius,
    setTransparentBackground,
    setBackgroundColor,
    setPadding,
    setCornerRadius,
    clearGenerated,
    handleGenerate,
    handleReset,
    compact = false,
    hideHeader = false,
}: {
    text: typeof t.faviconGenerator;
    transparentBackground: boolean;
    backgroundColor: string;
    padding: number;
    cornerRadius: number;
    setTransparentBackground: (value: boolean) => void;
    setBackgroundColor: (value: string) => void;
    setPadding: (value: number) => void;
    setCornerRadius: (value: number) => void;
    clearGenerated: () => void;
    handleGenerate: () => void;
    handleReset: () => void;
    compact?: boolean;
    hideHeader?: boolean;
}) {
    return (
        <div>
            {!hideHeader ? <SectionHeader title={text.controlsTitle} /> : null}

            <div className={`${compact ? "space-y-3" : "mt-5 space-y-5"}`}>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] px-4 py-3 transition hover:bg-[#FFF7F3]">
                    <span className="text-sm font-semibold text-gray-800">
                        {text.transparentBackgroundLabel}
                    </span>

                    <input
                        type="checkbox"
                        checked={transparentBackground}
                        onChange={(event) => {
                            setTransparentBackground(event.target.checked);
                            clearGenerated();
                        }}
                        className="h-4 w-4 accent-[#F28C6F]"
                    />
                </label>

                {!transparentBackground ? (
                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={backgroundColor}
                        fallback="#FFFFFF"
                        compact={compact}
                        onChange={(value) => {
                            setBackgroundColor(value);
                            clearGenerated();
                        }}
                    />
                ) : null}

                <RangeInput
                    label={text.paddingLabel}
                    value={padding}
                    min={0}
                    max={45}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setPadding(value);
                        clearGenerated();
                    }}
                />

                <RangeInput
                    label={text.cornerRadiusLabel}
                    value={cornerRadius}
                    min={0}
                    max={50}
                    suffix="%"
                    compact={compact}
                    onChange={(value) => {
                        setCornerRadius(value);
                        clearGenerated();
                    }}
                />

                <button
                    type="button"
                    onClick={handleGenerate}
                    className={`w-full rounded-2xl bg-[#F28C6F] text-sm font-semibold text-white transition hover:bg-[#E6765B] ${compact ? "px-4 py-2.5" : "px-4 py-3"
                        }`}
                >
                    {text.generateFavicons}
                </button>

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

function GeneratedFilesPanel({
    text,
    generatedFavicons,
    status,
    error,
    handleDownloadAll,
    desktop = false,
}: {
    text: typeof t.faviconGenerator;
    generatedFavicons: GeneratedFavicon[];
    status: string;
    error: string;
    handleDownloadAll: () => void;
    desktop?: boolean;
}) {
    return (
        <div className={desktop ? "mt-8 border-t border-[#F1E5DF] pt-6" : ""}>
            <h3 className="font-semibold text-gray-900">
                {text.generatedFiles}
            </h3>

            <div className="mt-4 space-y-3">
                {generatedFavicons.length ? (
                    generatedFavicons.map((favicon) => (
                        <div
                            key={favicon.fileName}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F1E5DF] bg-[#FFF7F3] p-2">
                                    <img
                                        src={favicon.dataUrl}
                                        alt={favicon.fileName}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {favicon.fileName}
                                    </p>
                                    <p className="text-xs font-medium text-gray-500">
                                        {favicon.size} × {favicon.size}px
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    downloadDataUrl(favicon.dataUrl, favicon.fileName)
                                }
                                className="shrink-0 rounded-xl border border-[#F4C8BA] bg-white px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.downloadPng}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-5 text-center">
                        <p className="text-sm leading-6 text-gray-500">
                            {text.emptyDescription}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-4 border-t border-[#F1E5DF] pt-4">
                <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={!generatedFavicons.length}
                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {text.downloadAll}
                </button>
            </div>

            {status ? (
                <p className="mt-3 text-sm text-[#7A5A4F]">
                    {status}
                </p>
            ) : null}

            {error ? (
                <p className="mt-3 text-sm font-medium text-red-500">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

function MobileActionBar({
    text,
    onOpenSettings,
    onGenerate,
    onDownloadAll,
    onCopyHtml,
    canDownloadAll,
}: {
    text: typeof t.faviconGenerator;
    onOpenSettings: () => void;
    onGenerate: () => void;
    onDownloadAll: () => void;
    onCopyHtml: () => void;
    canDownloadAll: boolean;
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
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center text-xs font-semibold text-[#2A1F1B]"
                >
                    {text.settingsButton}
                </button>

                <button
                    type="button"
                    onClick={onGenerate}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-3 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {text.actionGenerate}
                </button>

                <button
                    type="button"
                    onClick={onDownloadAll}
                    disabled={!canDownloadAll}
                    className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 py-3 text-center text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:opacity-45"
                >
                    {text.actionDownloadAll}
                </button>

                <button
                    type="button"
                    onClick={onCopyHtml}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center text-xs font-semibold text-[#E6765B]"
                >
                    {text.actionCopyHtml}
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
        <label className="block">
            <span
                className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
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
                    className={`w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-11" : "h-12"
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