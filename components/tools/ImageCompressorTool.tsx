"use client";

import {
    type ChangeEvent,
    type DragEvent,
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

function getOutputFileName(originalName: string, format: OutputFormat) {
    const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");

    if (format === "image/jpeg") {
        return `${nameWithoutExtension || "peach-lab-image"}-compressed.jpg`;
    }

    if (format === "image/webp") {
        return `${nameWithoutExtension || "peach-lab-image"}-compressed.webp`;
    }

    return `${nameWithoutExtension || "peach-lab-image"}-compressed.png`;
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

    const savedPercent = useMemo(() => {
        if (!originalFile || !compressedBlob) return 0;

        const saved = originalFile.size - compressedBlob.size;
        const percent = Math.round((saved / originalFile.size) * 100);

        return Math.max(percent, 0);
    }, [originalFile, compressedBlob]);

    const originalSizeText = originalFile ? formatBytes(originalFile.size) : "-";
    const compressedSizeText = compressedBlob ? formatBytes(compressedBlob.size) : "-";
    const savedText = `${savedPercent}%`;

    const originalShort = getShortLabel(text.originalSize);
    const compressedShort = getShortLabel(text.compressedSize);
    const downloadShort = getShortLabel(text.download ?? text.downloadImage);

    useEffect(() => {
        return () => {
            if (originalUrl) {
                URL.revokeObjectURL(originalUrl);
            }

            if (compressedUrl) {
                URL.revokeObjectURL(compressedUrl);
            }
        };
    }, [originalUrl, compressedUrl]);

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
                    outputFormat === "image/png" ? undefined : quality / 100,
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

    return (
        <>
            <div className="space-y-6 pb-2 md:pb-0">
                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#7A5A4F]">
                    {text.localProcessing}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="min-w-0 space-y-6">
                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <SectionTitle
                                title={text.uploadTitle}
                                titleClassName="text-xl md:text-2xl"
                            />

                            <p className="mt-3 text-sm leading-6 text-gray-500">
                                {text.uploadDescription}
                            </p>

                            {text.supportedFormats ? (
                                <p className="mt-2 text-xs font-medium leading-6 text-[#A17F74] md:text-sm">
                                    {text.supportedFormats}
                                </p>
                            ) : null}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleChooseFile}
                                className="hidden"
                            />

                            <div
                                role="button"
                                tabIndex={0}
                                onClick={() => fileInputRef.current?.click()}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`mt-5 cursor-pointer rounded-3xl border border-dashed px-5 py-6 text-center transition md:px-6 md:py-7 ${isDragging
                                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                                        : "border-[#F4C8BA] bg-[#FFF7F3] hover:bg-[#FFF0EA]"
                                    }`}
                            >
                                <p className="text-lg font-semibold text-[#2A1F1B]">
                                    {originalFile
                                        ? text.changeImage
                                        : text.dropTitle ?? "Drag and drop an image here"}
                                </p>

                                <p className="mx-auto mt-2 max-w-md break-all text-sm leading-6 text-gray-500">
                                    {originalFile
                                        ? originalFile.name
                                        : text.dropHint}
                                </p>

                                <div className="mt-5 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]">
                                    {originalFile ? text.changeImage : text.uploadButton}
                                </div>

                                <p className="mt-4 break-all text-sm text-gray-500">
                                    {originalFile?.name || text.noFileSelected}
                                </p>
                            </div>
                        </section>

                        {originalUrl ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <ImagePreviewCard
                                    title={text.originalImage}
                                    imageUrl={originalUrl}
                                    size={originalSizeText}
                                    info={originalInfo}
                                    onPreview={() =>
                                        setViewer({
                                            title: text.originalImage,
                                            url: originalUrl,
                                        })
                                    }
                                />

                                <ImagePreviewCard
                                    title={text.compressedImage}
                                    imageUrl={compressedUrl}
                                    size={compressedSizeText}
                                    info={compressedInfo}
                                    emptyText={
                                        text.waitingCompress ??
                                        "Click Compress to preview the compressed result."
                                    }
                                    onPreview={() => {
                                        if (!compressedUrl) return;

                                        setViewer({
                                            title: text.compressedImage,
                                            url: compressedUrl,
                                        });
                                    }}
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

                    <section className="min-w-0 md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionTitle
                            title={text.settingsTitle ?? text.controlsTitle}
                            titleClassName="text-xl md:text-2xl"
                        />

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
                                    setError("");
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
                                        setError("");
                                    }}
                                    className="h-12 w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
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
                                {isProcessing
                                    ? text.processing
                                    : text.compress ?? text.compressImage}
                            </button>

                            {(status || error) ? (
                                <div className="space-y-2">
                                    {status ? (
                                        <p className="text-sm text-[#7A5A4F]">{status}</p>
                                    ) : null}

                                    {error ? (
                                        <p className="text-sm font-medium text-red-500">
                                            {error}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6 hidden border-t border-[#F1E5DF] pt-5 md:block">
                            <SectionTitle
                                title={text.outputTitle}
                                titleClassName="text-xl md:text-2xl"
                            />

                            <div className="mt-4 grid grid-cols-1 gap-3">
                                <InfoBox
                                    label={text.originalSize}
                                    value={originalSizeText}
                                />

                                <InfoBox
                                    label={text.compressedSize}
                                    value={compressedSizeText}
                                />

                                <InfoBox
                                    label={text.saved}
                                    value={savedText}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={!compressedBlob}
                                className="mt-5 w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {text.download ?? text.downloadImage}
                            </button>
                        </div>
                    </section>
                </div>

                {originalFile ? (
                    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
                        <div className="rounded-[30px] border border-[#F4C8BA] bg-white/95 p-3 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur">
                            <div className="grid grid-cols-4 gap-2">
                                <ActionInfoItem
                                    label={originalShort}
                                    value={originalSizeText}
                                />

                                <ActionInfoItem
                                    label={compressedShort}
                                    value={compressedSizeText}
                                />

                                <ActionInfoItem
                                    label={text.saved}
                                    value={savedText}
                                />

                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={!compressedBlob}
                                    className="flex min-h-[76px] flex-col items-center justify-center rounded-2xl bg-[#F28C6F] px-2 text-center text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:bg-[#F8D9CF] disabled:text-white"
                                >
                                    <span className="text-sm font-semibold leading-5">
                                        {downloadShort}
                                    </span>
                                    <span className="mt-1 text-[11px] leading-4 text-white/85">
                                        {compressedBlob ? "Ready" : "Not ready"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <style jsx global>{`
                    @media (max-width: 767px) {
                        footer {
                            padding-bottom: calc(118px + env(safe-area-inset-bottom, 0px)) !important;
                        }
                    }
                `}</style>
            </div>

            {viewer ? (
                <ImageViewer
                    title={viewer.title}
                    url={viewer.url}
                    onClose={() => setViewer(null)}
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
    onPreview,
}: {
    title: string;
    imageUrl: string;
    size: string;
    info: ImageInfo | null;
    emptyText?: string;
    onPreview: () => void;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="h-6 w-2 shrink-0 rounded-full bg-[#F28C6F]" />
                    <h4 className="truncate text-lg font-semibold text-[#2A1F1B]">
                        {title}
                    </h4>
                </div>

                <span className="shrink-0 rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {size}
                </span>
            </div>

            {imageUrl ? (
                <button
                    type="button"
                    onClick={onPreview}
                    className="group block w-full rounded-2xl bg-[#FFF7F3] p-3 text-left transition hover:bg-[#FFF0EA]"
                >
                    <div className="relative flex items-center justify-center">
                        <img
                            src={imageUrl}
                            alt={title}
                            className="mx-auto block max-h-[220px] max-w-full rounded-xl object-contain md:max-h-[280px]"
                        />

                        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#7A5A4F] shadow-sm">
                            Preview
                        </span>
                    </div>
                </button>
            ) : (
                <div className="rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] px-4 py-7 text-center">
                    <p className="text-sm leading-6 text-gray-500">{emptyText}</p>
                </div>
            )}

            {info ? (
                <p className="mt-3 text-xs font-semibold text-gray-500">
                    {info.width} × {info.height}px
                </p>
            ) : null}
        </div>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9C7B70]">
                {label}
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
        </div>
    );
}

function ActionInfoItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-h-[76px] flex-col items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] px-2 text-center">
            <span className="text-[11px] font-medium leading-4 text-[#9C7B70]">
                {label}
            </span>
            <span className="mt-1 text-sm font-semibold leading-5 text-[#2A1F1B]">
                {value}
            </span>
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

function ImageViewer({
    title,
    url,
    onClose,
}: {
    title: string;
    url: string;
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
                Close
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