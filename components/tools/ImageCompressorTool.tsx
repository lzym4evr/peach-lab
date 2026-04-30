"use client";

import {
    ChangeEvent,
    DragEvent,
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
        format,
    )}`;
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
        <div className="space-y-6">
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                {text.localProcessing}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {text.uploadTitle}
                                </h3>

                                <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                    {text.uploadDescription}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {originalFile ? text.changeImage : text.uploadButton}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleChooseFile}
                                className="hidden"
                            />
                        </div>

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
                            className={`mb-5 cursor-pointer rounded-3xl border border-dashed p-6 text-center transition ${isDragging
                                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                                    : "border-[#F4C8BA] bg-[#FFF7F3] hover:bg-[#FFF0EA]"
                                }`}
                        >
                            <p className="text-sm font-semibold text-[#E6765B]">
                                {originalFile ? text.changeImage : text.uploadButton}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {text.dropHint}
                            </p>
                        </div>

                        {originalUrl ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                <ImagePreviewCard
                                    title={text.originalImage}
                                    imageUrl={originalUrl}
                                    size={originalFile ? formatBytes(originalFile.size) : "-"}
                                    info={originalInfo}
                                />

                                <ImagePreviewCard
                                    title={text.compressedImage}
                                    imageUrl={compressedUrl}
                                    size={compressedBlob ? formatBytes(compressedBlob.size) : "-"}
                                    info={compressedInfo}
                                    emptyText={text.emptyDescription}
                                />
                            </div>
                        ) : (
                            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {text.emptyTitle}
                                    </h4>

                                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                        {text.emptyDescription}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">
                        {text.controlsTitle}
                    </h3>

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
                    </div>

                    <div className="mt-8 border-t border-[#F1E5DF] pt-6">
                        <h3 className="font-semibold text-gray-900">
                            {text.outputTitle}
                        </h3>

                        <div className="mt-4 grid grid-cols-1 gap-3">
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

                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!compressedBlob}
                            className="mt-5 w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {text.downloadImage}
                        </button>

                        {status ? (
                            <p className="mt-3 text-sm text-[#7A5A4F]">{status}</p>
                        ) : null}

                        {error ? (
                            <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}

function ImagePreviewCard({
    title,
    imageUrl,
    size,
    info,
    emptyText,
}: {
    title: string;
    imageUrl: string;
    size: string;
    info: ImageInfo | null;
    emptyText?: string;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>

                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {size}
                </span>
            </div>

            {imageUrl ? (
                <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-[#FFF7F3]">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="max-h-[320px] w-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center">
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