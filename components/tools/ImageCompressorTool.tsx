"use client";

import {
    type ChangeEvent,
    type DragEvent,
    type PointerEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

type ImageInfo = {
    width: number;
    height: number;
};

type ViewerState = {
    title: string;
    url: string;
} | null;

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 KB";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / 1024 ** index;

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function getFileExtension(format: OutputFormat) {
    if (format === "image/jpeg") return "jpg";
    if (format === "image/webp") return "webp";
    return "png";
}

function getOutputFileName(
    originalName: string,
    format: OutputFormat,
    defaultFileName: string,
    compressedFileSuffix: string
) {
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
    const safeName = nameWithoutExtension || defaultFileName;

    return `${safeName}-${compressedFileSuffix}.${getFileExtension(format)}`;
}

export default function ImageCompressorTool() {
    const text = t.imageCompressor;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const formatOptions: { label: string; value: OutputFormat }[] = [
        { label: text.formatJpg, value: "image/jpeg" },
        { label: text.formatPng, value: "image/png" },
        { label: text.formatWebp, value: "image/webp" },
    ];

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState("");
    const [compressedUrl, setCompressedUrl] = useState("");
    const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
    const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null);
    const [compressedInfo, setCompressedInfo] = useState<ImageInfo | null>(null);

    const [quality, setQuality] = useState(78);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");

    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const [viewer, setViewer] = useState<ViewerState>(null);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    const savedPercent = useMemo(() => {
        if (!originalFile || !compressedBlob) return 0;

        const saved = originalFile.size - compressedBlob.size;
        const percent = Math.round((saved / originalFile.size) * 100);

        return Math.max(percent, 0);
    }, [originalFile, compressedBlob]);

    function clearCompressedResult() {
        if (compressedUrl) {
            URL.revokeObjectURL(compressedUrl);
        }

        setCompressedUrl("");
        setCompressedBlob(null);
        setCompressedInfo(null);
        setStatus("");
    }

    function loadImageFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setError(text.loadError);
            return;
        }

        if (originalUrl) {
            URL.revokeObjectURL(originalUrl);
        }

        clearCompressedResult();

        const nextUrl = URL.createObjectURL(file);

        setOriginalFile(file);
        setOriginalUrl(nextUrl);
        setOriginalInfo(null);
        setError("");
        setStatus("");
        setViewer(null);
        setIsCompareOpen(false);

        const image = new Image();

        image.onload = () => {
            setOriginalInfo({
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

    async function handleCompress() {
        if (!originalFile || !originalUrl) {
            setError(text.noFileError);
            return;
        }

        setIsProcessing(true);
        setError("");
        setStatus("");

        try {
            const image = new Image();

            image.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;

                const context = canvas.getContext("2d");

                if (!context) {
                    setError(text.compressError);
                    setIsProcessing(false);
                    return;
                }

                if (outputFormat === "image/jpeg") {
                    context.fillStyle = "#FFFFFF";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            setError(text.compressError);
                            setIsProcessing(false);
                            return;
                        }

                        clearCompressedResult();

                        if (originalFile && blob.size >= originalFile.size) {
                            setCompressedUrl("");
                            setCompressedBlob(null);
                            setCompressedInfo(null);
                            setStatus("");
                            setError(text.noSavings);
                            setIsProcessing(false);
                            return;
                        }

                        const nextCompressedUrl = URL.createObjectURL(blob);

                        setCompressedUrl(nextCompressedUrl);
                        setCompressedBlob(blob);
                        setCompressedInfo({
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                        });
                        setStatus(text.ready);
                        setIsProcessing(false);
                    },
                    outputFormat,
                    outputFormat === "image/png" ? undefined : quality / 100
                );
            };

            image.onerror = () => {
                setError(text.loadError);
                setIsProcessing(false);
            };

            image.src = originalUrl;
        } catch {
            setError(text.compressError);
            setIsProcessing(false);
        }
    }

    function handleDownload() {
        if (!compressedBlob || !compressedUrl || !originalFile) return;

        const link = document.createElement("a");
        link.href = compressedUrl;
        link.download = getOutputFileName(
            originalFile.name,
            outputFormat,
            text.defaultFileName,
            text.compressedFileSuffix
        );
        link.click();
    }

    function openOriginalPreview() {
        if (!originalUrl) return;

        setViewer({
            title: text.originalImage,
            url: originalUrl,
        });
    }

    function openCompressedPreview() {
        if (!compressedUrl) return;

        setViewer({
            title: text.compressedImage,
            url: compressedUrl,
        });
    }

    function openCompare() {
        if (!originalUrl || !compressedUrl) return;
        setIsCompareOpen(true);
    }

    return (
        <>
            <div className="space-y-6">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#7A5A4F]">
                    {text.localProcessing}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="min-w-0 space-y-5">
                        <section>
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
                                    {text.supportedFormats}
                                </p>

                                <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                                    {originalFile ? text.changeImage : text.uploadButton}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleChooseFile}
                                    className="hidden"
                                />

                                <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                                    {originalFile?.name || text.noFileSelected}
                                </p>
                            </label>
                        </section>

                        {originalUrl ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <ImagePreviewCard
                                    title={text.originalImage}
                                    imageUrl={originalUrl}
                                    size={originalFile ? formatBytes(originalFile.size) : "-"}
                                    info={originalInfo}
                                    previewText={text.preview}
                                    onPreview={openOriginalPreview}
                                />

                                <ImagePreviewCard
                                    title={text.compressedImage}
                                    imageUrl={compressedUrl}
                                    size={compressedBlob ? formatBytes(compressedBlob.size) : "-"}
                                    info={compressedInfo}
                                    previewText={text.preview}
                                    emptyText={
                                        compressedBlob
                                            ? text.emptyDescription
                                            : text.waitingCompress
                                    }
                                    onPreview={openCompressedPreview}
                                />
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] px-6 py-8 text-center">
                                <h4 className="text-lg font-semibold text-gray-900">
                                    {text.emptyTitle}
                                </h4>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                    {text.emptyDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    <section className="min-w-0 lg:self-start md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionTitle title={text.settingsTitle || text.controlsTitle} />

                        <div className="mt-5 space-y-5">
                            <RangeInput
                                label={text.qualityLabel}
                                value={quality}
                                min={10}
                                max={100}
                                suffix="%"
                                onChange={(value) => {
                                    setQuality(value);
                                    clearCompressedResult();
                                }}
                            />

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-gray-800">
                                    {text.formatLabel}
                                </span>

                                <select
                                    value={outputFormat}
                                    onChange={(event) => {
                                        setOutputFormat(event.target.value as OutputFormat);
                                        clearCompressedResult();
                                    }}
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                >
                                    {formatOptions.map((format) => (
                                        <option key={format.value} value={format.value}>
                                            {format.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                type="button"
                                onClick={handleCompress}
                                disabled={isProcessing}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isProcessing ? text.processing : text.compressImage}
                            </button>

                            {status ? (
                                <p className="text-sm text-[#7A5A4F]">{status}</p>
                            ) : null}

                            {error ? (
                                <p className="text-sm font-medium text-red-500">{error}</p>
                            ) : null}
                        </div>

                        <div className="mt-8 hidden border-t border-[#F1E5DF] pt-6 lg:block">
                            <SectionTitle title={text.outputTitle} />

                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <InfoBox
                                    label={text.originalSize}
                                    value={originalFile ? formatBytes(originalFile.size) : "-"}
                                />

                                <InfoBox
                                    label={text.compressedSize}
                                    value={compressedBlob ? formatBytes(compressedBlob.size) : "-"}
                                />

                                <InfoBox label={text.saved} value={`${savedPercent}%`} />
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={openCompare}
                                    disabled={!compressedUrl}
                                    className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {text.compare}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={!compressedBlob}
                                    className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {text.downloadImage}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <MobileActionBar
                originalSize={originalFile ? formatBytes(originalFile.size) : "-"}
                compressedSize={compressedBlob ? formatBytes(compressedBlob.size) : "-"}
                savedPercent={savedPercent}
                canDownload={!!compressedBlob}
                onOriginalClick={openOriginalPreview}
                onCompressedClick={openCompare}
                onDownload={handleDownload}
                text={text}
            />

            {viewer ? (
                <ImageViewer
                    title={viewer.title}
                    url={viewer.url}
                    closeText={text.close}
                    onClose={() => setViewer(null)}
                />
            ) : null}

            {isCompareOpen && originalUrl && compressedUrl ? (
                <CompareViewer
                    originalUrl={originalUrl}
                    compressedUrl={compressedUrl}
                    originalLabel={text.originalImage}
                    compressedLabel={text.compressedImage}
                    title={text.beforeAfterTitle}
                    description={text.beforeAfterDescription}
                    closeText={text.close}
                    imageInfo={originalInfo}
                    onClose={() => setIsCompareOpen(false)}
                />
            ) : null}
        </>
    );
}

function ImagePreviewCard({
    title,
    imageUrl,
    size,
    info,
    emptyText,
    previewText,
    onPreview,
}: {
    title: string;
    imageUrl: string;
    size: string;
    info: ImageInfo | null;
    emptyText?: string;
    previewText: string;
    onPreview?: () => void;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm">
            <div className="mb-3">
                <SectionTitle title={title} titleClassName="text-lg md:text-xl" />
            </div>

            {imageUrl ? (
                <button
                    type="button"
                    onClick={onPreview}
                    className="block w-full rounded-2xl bg-[#FFF7F3] p-3 text-left transition hover:bg-[#FFF0EA]"
                >
                    <div className="relative flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="block max-h-[260px] max-w-full rounded-xl object-contain md:max-h-[320px]"
                        />

                        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#7A5A4F] shadow-sm">
                            {previewText}
                        </span>
                    </div>
                </button>
            ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-5 text-center md:min-h-[200px]">
                    <p className="text-sm leading-6 text-gray-500">{emptyText}</p>
                </div>
            )}

            {info ? (
                <p className="mt-3 text-xs font-semibold text-gray-500">
                    {info.width} × {info.height}px
                    <span className="mx-2 text-[#D6C3BB]">·</span>
                    {size}
                </p>
            ) : null}
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9C7B70]">
                {label}
            </p>

            <p className="mt-2 break-all text-base font-bold text-gray-900 md:text-lg">
                {value}
            </p>
        </div>
    );
}

function RangeInput({
    label,
    value,
    min,
    max,
    suffix,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">{label}</span>

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
    originalSize,
    compressedSize,
    savedPercent,
    canDownload,
    onOriginalClick,
    onCompressedClick,
    onDownload,
    text,
}: {
    originalSize: string;
    compressedSize: string;
    savedPercent: number;
    canDownload: boolean;
    onOriginalClick: () => void;
    onCompressedClick: () => void;
    onDownload: () => void;
    text: typeof t.imageCompressor;
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
                `${Math.ceil(rect.height + 24)}px`
            );
        };

        const timer = window.setTimeout(updateSpace, 0);
        window.addEventListener("resize", updateSpace);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", updateSpace);
            document.documentElement.style.removeProperty("--mobile-action-bar-space");
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[60] px-3 lg:hidden">
            <div
                ref={actionBarRef}
                className="pointer-events-auto mx-auto max-w-md rounded-[30px] border border-[#F4C8BA] bg-white/95 p-3 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <p className="mb-2 text-center text-xs font-medium text-[#9C7B70]">
                    {text.actionBarHint}
                </p>

                <div className="grid grid-cols-4 gap-2">
                    <button
                        type="button"
                        onClick={onOriginalClick}
                        className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center"
                    >
                        <span className="block text-xs font-medium text-[#9C7B70]">
                            {text.actionOriginal}
                        </span>
                        <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#2A1F1B]">
                            {originalSize}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onCompressedClick}
                        disabled={!canDownload}
                        className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center disabled:opacity-45"
                    >
                        <span className="block text-xs font-medium text-[#9C7B70]">
                            {text.actionNew}
                        </span>
                        <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#2A1F1B]">
                            {compressedSize}
                        </span>
                    </button>

                    <div className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center">
                        <span className="block text-xs font-medium text-[#9C7B70]">
                            {text.actionSaved}
                        </span>
                        <span className="mt-1 block text-[12px] font-semibold leading-5 text-[#2A1F1B]">
                            {savedPercent}%
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onDownload}
                        disabled={!canDownload}
                        className="rounded-2xl bg-[#F28C6F] px-2 py-3 text-center text-white shadow-sm transition hover:bg-[#E6765B] disabled:bg-[#F8D9CF] disabled:opacity-75"
                    >
                        <span className="block text-sm font-semibold">
                            {text.download}
                        </span>
                        <span className="mt-1 block text-xs text-white/85">
                            {canDownload ? text.actionReady : text.actionNotReady}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImageViewer({
    title,
    url,
    closeText,
    onClose,
}: {
    title: string;
    url: string;
    closeText: string;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[70] bg-black/75 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#2A1F1B] shadow-sm"
            >
                {closeText}
            </button>

            <div className="flex h-full items-center justify-center">
                <div
                    className="w-full max-w-5xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="mb-3 text-center text-sm font-medium text-white/85">
                        {title}
                    </div>

                    <div className="flex items-center justify-center rounded-3xl bg-white/10 p-3 md:p-6">
                        <img
                            src={url}
                            alt={title}
                            className="max-h-[82vh] max-w-full rounded-2xl object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompareViewer({
    originalUrl,
    compressedUrl,
    originalLabel,
    compressedLabel,
    title,
    description,
    closeText,
    imageInfo,
    onClose,
}: {
    originalUrl: string;
    compressedUrl: string;
    originalLabel: string;
    compressedLabel: string;
    title: string;
    description: string;
    closeText: string;
    imageInfo: ImageInfo | null;
    onClose: () => void;
}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState(50);

    function updatePosition(clientX: number) {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const nextPosition = ((clientX - rect.left) / rect.width) * 100;

        setPosition(Math.min(Math.max(nextPosition, 6), 94));
    }

    function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePosition(event.clientX);
    }

    function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        if (event.buttons !== 1) return;

        event.preventDefault();
        updatePosition(event.clientX);
    }

    const aspectRatio =
        imageInfo && imageInfo.width > 0 && imageInfo.height > 0
            ? `${imageInfo.width} / ${imageInfo.height}`
            : "16 / 9";

    return (
        <div
            className="fixed inset-0 z-[70] select-none bg-black/75 p-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#2A1F1B] shadow-sm"
            >
                {closeText}
            </button>

            <div className="flex h-full items-center justify-center">
                <div
                    className="w-full max-w-5xl select-none"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="mb-4 select-none text-center">
                        <h3 className="text-lg font-semibold text-white">
                            {title}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                            {description}
                        </p>
                    </div>

                    <div
                        ref={containerRef}
                        role="slider"
                        tabIndex={0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(position)}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        className="relative mx-auto w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-3xl bg-white/10 p-2 md:p-4"
                    >
                        <div
                            className="relative mx-auto max-h-[78vh] max-w-full select-none overflow-hidden rounded-2xl bg-black/20"
                            style={{
                                aspectRatio,
                                WebkitUserSelect: "none",
                                userSelect: "none",
                            }}
                        >
                            <img
                                src={compressedUrl}
                                alt={compressedLabel}
                                className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                                draggable={false}
                            />

                            <img
                                src={originalUrl}
                                alt={originalLabel}
                                className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
                                style={{
                                    clipPath: `inset(0 ${100 - position}% 0 0)`,
                                }}
                                draggable={false}
                            />

                            <div
                                className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(42,31,27,0.15)]"
                                style={{ left: `${position}%` }}
                            />

                            <div
                                className="pointer-events-none absolute top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-lg font-bold leading-none text-[#F28C6F] shadow-md md:h-16 md:w-16 md:text-xl"
                                style={{ left: `${position}%` }}
                            >
                                ↔
                            </div>

                            <span className="pointer-events-none absolute left-3 top-3 select-none rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#7A5A4F] shadow-sm">
                                {originalLabel}
                            </span>

                            <span className="pointer-events-none absolute right-3 top-3 select-none rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#7A5A4F] shadow-sm">
                                {compressedLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}