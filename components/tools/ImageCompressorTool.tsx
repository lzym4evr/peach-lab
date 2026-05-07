"use client";

import {
    type ChangeEvent,
    type DragEvent,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
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

type ImageCompressorText = typeof t.imageCompressor;

const formatOptions: { label: string; value: OutputFormat }[] = [
    { label: "JPG", value: "image/jpeg" },
    { label: "PNG", value: "image/png" },
    { label: "WebP", value: "image/webp" },
];

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

function getOutputFileName(originalName: string, format: OutputFormat) {
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
    return `${nameWithoutExtension || "peach-lab-image"}-compressed.${getFileExtension(
        format
    )}`;
}

function getShortLabel(label: string) {
    return label
        .replace(/\s+Image$/i, "")
        .replace(/\s+Size$/i, "")
        .trim();
}

export default function ImageCompressorTool() {
    const text = t.imageCompressor;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const originalUrlRef = useRef("");
    const compressedUrlRef = useRef("");

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

    useEffect(() => {
        return () => {
            if (originalUrlRef.current) {
                URL.revokeObjectURL(originalUrlRef.current);
            }

            if (compressedUrlRef.current) {
                URL.revokeObjectURL(compressedUrlRef.current);
            }
        };
    }, []);

    const savedPercent = useMemo(() => {
        if (!originalFile || !compressedBlob) return 0;

        const saved = originalFile.size - compressedBlob.size;
        const percent = Math.round((saved / originalFile.size) * 100);

        return Math.max(percent, 0);
    }, [originalFile, compressedBlob]);

    const originalSizeText = originalFile ? formatBytes(originalFile.size) : "-";
    const compressedSizeText = compressedBlob ? formatBytes(compressedBlob.size) : "-";
    const savedText = compressedBlob ? `${savedPercent}%` : "0%";

    const originalShort = getShortLabel(text.originalSize);
    const compressedShort = text.newLabel || getShortLabel(text.compressedSize);
    const downloadShort = text.download || getShortLabel(text.downloadImage);

    function clearCompressedResult() {
        if (compressedUrlRef.current) {
            URL.revokeObjectURL(compressedUrlRef.current);
        }

        compressedUrlRef.current = "";
        setCompressedUrl("");
        setCompressedBlob(null);
        setCompressedInfo(null);
        setStatus("");
        setIsCompareOpen(false);
    }

    function loadImageFile(file: File) {
        if (!file.type.startsWith("image/")) {
            setError(text.loadError);
            return;
        }

        if (originalUrlRef.current) {
            URL.revokeObjectURL(originalUrlRef.current);
        }

        clearCompressedResult();

        const nextUrl = URL.createObjectURL(file);
        originalUrlRef.current = nextUrl;

        setOriginalFile(file);
        setOriginalUrl(nextUrl);
        setOriginalInfo(null);
        setError("");
        setStatus("");
        setViewer(null);

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

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
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

                        const nextCompressedUrl = URL.createObjectURL(blob);
                        compressedUrlRef.current = nextCompressedUrl;

                        setCompressedUrl(nextCompressedUrl);
                        setCompressedBlob(blob);
                        setCompressedInfo({
                            width: image.naturalWidth,
                            height: image.naturalHeight,
                        });
                        setStatus(text.imageCompressedSuccessfully);
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
        link.download = getOutputFileName(originalFile.name, outputFormat);
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
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] px-5 py-4 text-sm leading-7 text-[#7C6761] md:px-6 md:py-5">
                    {text.localProcessing}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="order-2 space-y-6 lg:order-1">
                        {originalFile ? (
                            <ImagePreviewCard
                                title={text.originalImage}
                                imageUrl={originalUrl}
                                imageInfo={originalInfo}
                                sizeText={originalSizeText}
                                previewText={text.preview}
                                onPreview={openOriginalPreview}
                                emptyText={text.noImageYet}
                            />
                        ) : null}

                        {originalFile ? (
                            <ImagePreviewCard
                                title={text.compressedImage}
                                imageUrl={compressedUrl}
                                imageInfo={compressedInfo}
                                sizeText={compressedSizeText}
                                previewText={text.preview}
                                onPreview={openCompressedPreview}
                                emptyText={text.compressedPlaceholder}
                            />
                        ) : null}
                    </div>

                    <div className="order-1 space-y-6 lg:order-2">
                        <div
                            className={`rounded-3xl border bg-[#FFF7F3] p-5 md:p-6 ${isDragging
                                    ? "border-[#F28C6F] ring-2 ring-[#F4C8BA]"
                                    : "border-[#F1E5DF]"
                                }`}
                        >
                            <div
                                className="rounded-3xl border-2 border-dashed border-[#F4C8BA] p-4 text-center transition md:p-8"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                            >
                                <h3 className="text-2xl font-semibold tracking-tight text-[#2A1F1B]">
                                    {text.uploadTitle}
                                </h3>

                                <p className="mt-2 text-base leading-7 text-[#7C6761] md:mt-3">
                                    {text.uploadDescription}
                                </p>

                                <p className="mt-2 text-sm leading-6 text-[#9A847C] md:mt-3">
                                    {text.supportedFormats}
                                </p>

                                <p className="mt-3 text-sm leading-6 text-[#9A847C]">
                                    {text.dropHint}
                                </p>

                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center justify-center rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    {originalFile ? text.changeImage : text.uploadButton}
                                </button>

                                <p className="mt-4 text-sm text-[#7C6761]">
                                    {originalFile?.name || text.noFileSelected}
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleChooseFile}
                                />
                            </div>
                        </div>

                        {originalFile ? (
                            <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm md:p-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-[#2A1F1B]">
                                            {text.quality}
                                        </label>

                                        <div className="space-y-3">
                                            <input
                                                type="range"
                                                min={30}
                                                max={95}
                                                step={1}
                                                value={quality}
                                                onChange={(event) => setQuality(Number(event.target.value))}
                                                className="w-full accent-[#F28C6F]"
                                                disabled={isProcessing}
                                            />

                                            <div className="flex items-center justify-between text-sm text-[#7C6761]">
                                                <span>30</span>
                                                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 font-medium text-[#2A1F1B]">
                                                    {quality}%
                                                </span>
                                                <span>95</span>
                                            </div>

                                            <p className="text-sm leading-6 text-[#9A847C]">
                                                {text.qualityHint}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-3 block text-sm font-medium text-[#2A1F1B]">
                                            {text.outputFormat}
                                        </label>

                                        <select
                                            value={outputFormat}
                                            onChange={(event) =>
                                                setOutputFormat(event.target.value as OutputFormat)
                                            }
                                            className="w-full rounded-2xl border border-[#E7D8D1] bg-white px-4 py-3 text-base text-[#2A1F1B] outline-none transition focus:border-[#F28C6F] focus:ring-2 focus:ring-[#F4C8BA]"
                                            disabled={isProcessing}
                                        >
                                            {formatOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCompress}
                                        disabled={isProcessing}
                                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#F28C6F] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isProcessing ? text.processing : text.compressImage}
                                    </button>

                                    {status ? (
                                        <p className="text-sm text-[#7C6761]">{status}</p>
                                    ) : null}

                                    {error ? <p className="text-sm text-red-500">{error}</p> : null}
                                </div>
                            </div>
                        ) : null}

                        {originalFile ? (
                            <div className="hidden rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm md:block md:p-6">
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <span className="h-10 w-2 rounded-full bg-[#F28C6F]" />
                                        <h3 className="text-2xl font-semibold tracking-tight text-[#2A1F1B]">
                                            {text.resultTitle}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <StatCard
                                            label={text.originalSize}
                                            value={originalSizeText}
                                        />
                                        <StatCard
                                            label={text.compressedSize}
                                            value={compressedSizeText}
                                        />
                                        <StatCard label={text.saved} value={savedText} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={openCompare}
                                            disabled={!compressedBlob}
                                            className="inline-flex items-center justify-center rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {text.compare}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            disabled={!compressedBlob}
                                            className="inline-flex items-center justify-center rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {text.downloadImage}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <MobileActionBar
                text={text}
                originalLabel={originalShort}
                compressedLabel={compressedShort}
                downloadLabel={downloadShort}
                originalValue={originalSizeText}
                compressedValue={compressedSizeText}
                savedValue={savedText}
                canOriginal={Boolean(originalUrl)}
                canCompare={Boolean(originalUrl && compressedUrl)}
                canDownload={Boolean(compressedBlob)}
                onOriginalClick={openOriginalPreview}
                onCompressedClick={openCompare}
                onSavedClick={openCompare}
                onDownload={handleDownload}
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
                <CompareView
                    originalUrl={originalUrl}
                    compressedUrl={compressedUrl}
                    originalLabel={text.originalImage}
                    compressedLabel={text.newLabel || text.compressedImage}
                    title={text.compareTitle || text.compare}
                    description={text.compareDescription}
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
    imageInfo,
    sizeText,
    previewText,
    onPreview,
    emptyText,
}: {
    title: string;
    imageUrl: string;
    imageInfo: ImageInfo | null;
    sizeText: string;
    previewText: string;
    onPreview: () => void;
    emptyText: string;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm md:p-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="h-10 w-2 rounded-full bg-[#F28C6F]" />
                    <h3 className="text-2xl font-semibold tracking-tight text-[#2A1F1B]">
                        {title}
                    </h3>
                </div>

                <div className="rounded-3xl bg-[#FFF7F3] p-4">
                    {imageUrl ? (
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-3xl bg-white">
                                <div className="flex items-center justify-center p-3">
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="max-h-[420px] w-auto max-w-full rounded-2xl object-contain"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={onPreview}
                                    className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#7C6761] shadow-sm backdrop-blur"
                                >
                                    {previewText}
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#7C6761]">
                                <span>
                                    {imageInfo
                                        ? `${imageInfo.width} × ${imageInfo.height}px`
                                        : "-"}
                                </span>
                                <span>{sizeText}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-3xl border-2 border-dashed border-[#F4C8BA] px-5 py-12 text-center text-sm leading-6 text-[#9A847C]">
                            {emptyText}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-5">
            <p className="text-sm leading-6 text-[#9A847C]">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-[#2A1F1B]">
                {value}
            </p>
        </div>
    );
}

function MobileActionBar({
    text,
    originalLabel,
    compressedLabel,
    downloadLabel,
    originalValue,
    compressedValue,
    savedValue,
    canOriginal,
    canCompare,
    canDownload,
    onOriginalClick,
    onCompressedClick,
    onSavedClick,
    onDownload,
}: {
    text: ImageCompressorText;
    originalLabel: string;
    compressedLabel: string;
    downloadLabel: string;
    originalValue: string;
    compressedValue: string;
    savedValue: string;
    canOriginal: boolean;
    canCompare: boolean;
    canDownload: boolean;
    onOriginalClick: () => void;
    onCompressedClick: () => void;
    onSavedClick: () => void;
    onDownload: () => void;
}) {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
            <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] border border-[#F4C8BA] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(42,31,27,0.10)]">
                <p className="mb-3 text-center text-sm text-[#8C746C]">
                    {text.actionHint}
                </p>

                <div className="grid grid-cols-4 gap-2">
                    <ActionTile
                        label={originalLabel}
                        value={originalValue}
                        onClick={onOriginalClick}
                        disabled={!canOriginal}
                    />
                    <ActionTile
                        label={compressedLabel}
                        value={compressedValue}
                        onClick={onCompressedClick}
                        disabled={!canCompare}
                    />
                    <ActionTile
                        label={text.saved}
                        value={savedValue}
                        onClick={onSavedClick}
                        disabled={!canCompare}
                    />
                    <button
                        type="button"
                        onClick={onDownload}
                        disabled={!canDownload}
                        className="flex min-h-[92px] flex-col items-center justify-center rounded-[24px] bg-[#F28C6F] px-2 py-3 text-center text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="text-sm font-medium leading-5">{downloadLabel}</span>
                        <span className="mt-2 text-sm font-semibold leading-5">
                            {canDownload ? text.ready : text.notReady}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function ActionTile({
    label,
    value,
    onClick,
    disabled,
}: {
    label: string;
    value: string;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex min-h-[92px] flex-col items-center justify-center rounded-[24px] border border-[#EDE2DC] bg-white px-2 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="text-sm font-medium leading-5 text-[#8C746C]">{label}</span>
            <span className="mt-2 text-sm font-semibold leading-5 text-[#2A1F1B]">
                {value}
            </span>
        </button>
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
        <div className="fixed inset-0 z-50 bg-[rgba(24,18,15,0.72)] p-4 backdrop-blur-sm">
            <div className="mx-auto flex h-full max-w-6xl flex-col">
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-medium text-[#2A1F1B] shadow-sm"
                    >
                        {closeText}
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[32px] bg-white/10 p-3">
                    <img
                        src={url}
                        alt={title}
                        className="max-h-full max-w-full rounded-[28px] object-contain"
                    />
                </div>
            </div>
        </div>
    );
}

function CompareView({
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
    const [position, setPosition] = useState(50);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);

    function updatePosition(clientX: number) {
        const box = boxRef.current;
        if (!box) return;

        const rect = box.getBoundingClientRect();
        const percent = ((clientX - rect.left) / rect.width) * 100;
        const clamped = Math.min(100, Math.max(0, percent));
        setPosition(clamped);
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        isDraggingRef.current = true;
        updatePosition(event.clientX);
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        if (!isDraggingRef.current) return;
        updatePosition(event.clientX);
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
        isDraggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    }

    function handlePointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-[rgba(24,18,15,0.72)] p-4 backdrop-blur-sm">
            <div className="mx-auto flex h-full max-w-6xl flex-col">
                <div className="mb-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-medium text-[#2A1F1B] shadow-sm"
                    >
                        {closeText}
                    </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
                    <div className="mb-5 text-center">
                        <h3 className="text-3xl font-semibold tracking-tight text-white">
                            {title}
                        </h3>
                        <p className="mt-2 max-w-2xl text-base leading-7 text-white/85">
                            {description}
                        </p>
                    </div>

                    <div className="w-full rounded-[32px] bg-white/10 p-3">
                        <div
                            ref={boxRef}
                            className="relative mx-auto w-full overflow-hidden rounded-[28px] bg-black/20 touch-none"
                            style={{
                                aspectRatio: imageInfo
                                    ? `${imageInfo.width} / ${imageInfo.height}`
                                    : "16 / 9",
                            }}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerLeave}
                        >
                            <img
                                src={compressedUrl}
                                alt={compressedLabel}
                                className="absolute inset-0 h-full w-full object-contain"
                                draggable={false}
                            />

                            <div
                                className="absolute inset-0"
                                style={{
                                    clipPath: `inset(0 ${100 - position}% 0 0)`,
                                }}
                            >
                                <img
                                    src={originalUrl}
                                    alt={originalLabel}
                                    className="absolute inset-0 h-full w-full object-contain"
                                    draggable={false}
                                />
                            </div>

                            <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-[#7C6761] shadow-sm">
                                {originalLabel}
                            </div>

                            <div className="pointer-events-none absolute right-5 top-5 rounded-full bg-white/92 px-4 py-2 text-sm font-medium text-[#7C6761] shadow-sm">
                                {compressedLabel}
                            </div>

                            <div
                                className="pointer-events-none absolute inset-y-0 z-10 w-1 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                                style={{ left: `calc(${position}% - 2px)` }}
                            />

                            <div
                                className="pointer-events-none absolute top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-3xl text-[#F28C6F] shadow-[0_10px_30px_rgba(42,31,27,0.18)]"
                                style={{ left: `${position}%` }}
                            >
                                ↔
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}