"use client";

import { useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

type OutputFormat = "png" | "jpeg" | "webp";

type ImageInfo = {
    width: number;
    height: number;
    format: string;
    size: number;
};

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, index);

    return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function getFormatLabel(file: File) {
    if (file.type === "image/jpeg") return "JPG";
    if (file.type === "image/png") return "PNG";
    if (file.type === "image/webp") return "WebP";
    if (file.type === "image/svg+xml") return "SVG";
    if (file.type === "image/gif") return "GIF";
    if (file.type === "image/avif") return "AVIF";

    const extension = file.name.split(".").pop()?.toUpperCase();
    return extension || "Image";
}

function getOutputMimeType(format: OutputFormat) {
    if (format === "png") return "image/png";
    if (format === "jpeg") return "image/jpeg";
    return "image/webp";
}

function getOutputExtension(format: OutputFormat) {
    if (format === "jpeg") return "jpg";
    return format;
}

function createImageFromUrl(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Image load failed"));
        image.src = url;
    });
}

export default function ImageConverterTool() {
    const messages = t.imageConverter;

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState("");
    const [convertedUrl, setConvertedUrl] = useState("");
    const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);

    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [convertedSize, setConvertedSize] = useState(0);

    const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
    const [quality, setQuality] = useState(90);
    const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

    const [isDragging, setIsDragging] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        };
    }, [originalUrl, convertedUrl]);

    async function loadFile(nextFile: File) {
        setError("");
        setStatus("");

        if (!nextFile.type.startsWith("image/")) {
            setError(t.common.uploadError);
            return;
        }

        const url = URL.createObjectURL(nextFile);

        try {
            const image = await createImageFromUrl(url);

            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (convertedUrl) URL.revokeObjectURL(convertedUrl);

            setFile(nextFile);
            setOriginalUrl(url);
            setConvertedUrl("");
            setConvertedBlob(null);
            setConvertedSize(0);

            setImageInfo({
                width: image.naturalWidth,
                height: image.naturalHeight,
                format: getFormatLabel(nextFile),
                size: nextFile.size,
            });
        } catch {
            URL.revokeObjectURL(url);
            setError(messages.loadError);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextFile = event.target.files?.[0];

        if (!nextFile) {
            return;
        }

        loadFile(nextFile);
        event.target.value = "";
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);

        const nextFile = event.dataTransfer.files?.[0];

        if (!nextFile) {
            return;
        }

        loadFile(nextFile);
    }

    async function convertImage() {
        if (!file || !originalUrl || !imageInfo) {
            setError(messages.noFileError);
            return;
        }

        setIsConverting(true);
        setError("");
        setStatus("");

        try {
            const image = await createImageFromUrl(originalUrl);
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Canvas is not supported");
            }

            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            if (outputFormat === "jpeg") {
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }

            context.drawImage(image, 0, 0);

            const mimeType = getOutputMimeType(outputFormat);

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    resolve,
                    mimeType,
                    outputFormat === "png" ? undefined : quality / 100
                );
            });

            if (!blob) {
                throw new Error("Blob conversion failed");
            }

            if (convertedUrl) URL.revokeObjectURL(convertedUrl);

            const nextUrl = URL.createObjectURL(blob);

            setConvertedBlob(blob);
            setConvertedUrl(nextUrl);
            setConvertedSize(blob.size);
            setStatus(messages.ready);
            setIsSettingsOpen(false);
        } catch {
            setError(messages.convertError);
        } finally {
            setIsConverting(false);
        }
    }

    function downloadImage() {
        if (!convertedBlob || !file) {
            setError(messages.noFileError);
            return;
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const extension = getOutputExtension(outputFormat);
        const url = URL.createObjectURL(convertedBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}-converted.${extension}`;
        link.click();

        URL.revokeObjectURL(url);
    }

    function resetTool() {
        if (originalUrl) URL.revokeObjectURL(originalUrl);
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);

        setFile(null);
        setOriginalUrl("");
        setConvertedUrl("");
        setConvertedBlob(null);
        setImageInfo(null);
        setConvertedSize(0);
        setStatus("");
        setError("");
        setOutputFormat("webp");
        setQuality(90);
        setBackgroundColor("#FFFFFF");
        setIsSettingsOpen(false);
    }

    const savedPercent =
        imageInfo && convertedSize
            ? Math.round(((imageInfo.size - convertedSize) / imageInfo.size) * 100)
            : 0;

    const outputLabel =
        outputFormat === "jpeg"
            ? messages.formatJpg
            : outputFormat === "png"
                ? messages.formatPng
                : messages.formatWebp;

    const settingsPanel = (
        <div className="space-y-5">
            <div>
                <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                    {messages.outputFormat}
                </label>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: "png", label: messages.formatPng },
                        { value: "jpeg", label: messages.formatJpg },
                        { value: "webp", label: messages.formatWebp },
                    ].map((format) => (
                        <button
                            key={format.value}
                            type="button"
                            onClick={() => setOutputFormat(format.value as OutputFormat)}
                            className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${outputFormat === format.value
                                    ? "border-[#F28C6F] bg-[#FFF0EA] text-[#E6765B]"
                                    : "border-[#F1E5DF] bg-white text-gray-600 hover:border-[#F28C6F]"
                                }`}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {outputFormat !== "png" && (
                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-[#2A1F1B]">
                            {messages.quality}
                        </label>
                        <span className="text-sm font-semibold text-[#E6765B]">
                            {quality}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(event) => setQuality(Number(event.target.value))}
                        className="w-full accent-[#F28C6F]"
                    />
                </div>
            )}

            {outputFormat === "jpeg" && (
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                        {messages.backgroundColor}
                    </label>

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            className="h-11 w-14 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                        />
                        <input
                            value={backgroundColor}
                            onChange={(event) => setBackgroundColor(event.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm outline-none focus:border-[#F28C6F]"
                        />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                        {messages.backgroundHint}
                    </p>
                </div>
            )}

            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={convertImage}
                    disabled={!file || isConverting}
                    className="rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {isConverting ? messages.converting : messages.convertImage}
                </button>

                <button
                    type="button"
                    onClick={resetTool}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#FFF7F3]"
                >
                    {messages.reset}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-5 pb-28 md:space-y-6 md:pb-1 lg:pb-0">
            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-sm leading-6 text-gray-600">
                <span className="font-semibold text-[#E6765B]">
                    {t.common.localProcessing}:
                </span>{" "}
                {messages.localProcessing.replace("Local processing: ", "")}
            </div>

            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-3xl border-2 border-dashed p-4 text-center transition md:p-8 ${isDragging
                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                        : "border-[#F4C8BA] bg-white"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,image/avif"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <h2 className="text-lg font-semibold text-[#2A1F1B]">
                    {messages.uploadTitle}
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 md:mt-3">
                    {messages.uploadDescription}
                </p>

                <p className="mt-2 text-xs text-gray-400 md:mt-3">
                    {messages.supportedFormats}
                </p>

                <button
                    type="button"
                    className="mt-4 rounded-2xl bg-[#F28C6F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5"
                >
                    {file ? messages.changeImage : messages.uploadButton}
                </button>

                <p className="mt-3 text-sm text-gray-500">
                    {file ? file.name : messages.noFileSelected}
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-5">
                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                {messages.originalImage}
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {imageInfo
                                    ? `${imageInfo.width} × ${imageInfo.height}px · ${imageInfo.format}`
                                    : messages.emptyDescription}
                            </p>
                        </div>

                        {originalUrl ? (
                            <div className="flex justify-center rounded-2xl bg-[#FFF7F3] p-3">
                                <img
                                    src={originalUrl}
                                    alt={messages.originalImage}
                                    className="max-h-[260px] max-w-full object-contain md:max-h-[320px]"
                                />
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-[#FFF7F3] p-8 text-center">
                                <h3 className="text-base font-semibold text-[#2A1F1B]">
                                    {messages.emptyTitle}
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    {messages.emptyDescription}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                    {messages.outputTitle}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {status || `${messages.outputFormat}: ${outputLabel}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={downloadImage}
                                disabled={!convertedBlob}
                                className="hidden rounded-2xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40 md:inline-flex"
                            >
                                {messages.downloadImage}
                            </button>
                        </div>

                        {convertedUrl ? (
                            <div className="flex justify-center rounded-2xl bg-[#FFF7F3] p-3">
                                <img
                                    src={convertedUrl}
                                    alt={messages.convertedImage}
                                    className="max-h-[260px] max-w-full object-contain md:max-h-[320px]"
                                />
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-[#FFF7F3] p-8 text-center text-sm text-gray-500">
                                {messages.convertImage}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm md:p-5 lg:block">
                    <h2 className="text-lg font-semibold text-[#2A1F1B]">
                        {messages.settingsTitle}
                    </h2>

                    <div className="mt-5">{settingsPanel}</div>

                    {imageInfo && (
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-[#FFF7F3] p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    {messages.originalSize}
                                </p>
                                <p className="mt-1 text-xl font-semibold text-[#2A1F1B]">
                                    {formatBytes(imageInfo.size)}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#FFF7F3] p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    {messages.convertedSize}
                                </p>
                                <p className="mt-1 text-xl font-semibold text-[#2A1F1B]">
                                    {convertedSize ? formatBytes(convertedSize) : "—"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#FFF7F3] p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    {messages.dimensions}
                                </p>
                                <p className="mt-1 text-xl font-semibold text-[#2A1F1B]">
                                    {imageInfo.width}×{imageInfo.height}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#FFF7F3] p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                    {messages.saved}
                                </p>
                                <p className="mt-1 text-xl font-semibold text-[#2A1F1B]">
                                    {convertedSize ? `${savedPercent}%` : "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    {status && (
                        <p className="mt-5 rounded-2xl bg-[#FFF7F3] px-4 py-3 text-sm text-[#E6765B]">
                            {status}
                        </p>
                    )}

                    {error && (
                        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>
            </div>

            {(status || error) && (
                <div className="lg:hidden">
                    {status && (
                        <p className="rounded-2xl bg-[#FFF7F3] px-4 py-3 text-sm text-[#E6765B]">
                            {status}
                        </p>
                    )}

                    {error && (
                        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>
            )}

            {isSettingsOpen && (
                <div className="fixed inset-0 z-[80] bg-black/25 lg:hidden">
                    <button
                        type="button"
                        aria-label={messages.close}
                        className="absolute inset-0 h-full w-full cursor-default"
                        onClick={() => setIsSettingsOpen(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] border border-[#F1E5DF] bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="h-5 w-1 rounded-full bg-[#F28C6F]" />
                                <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                    {messages.settingsTitle}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F1E5DF] text-lg text-gray-500 transition hover:bg-[#FFF7F3]"
                            >
                                ×
                            </button>
                        </div>

                        {settingsPanel}
                    </div>
                </div>
            )}

            <div
                className="fixed bottom-4 left-4 right-4 z-[70] rounded-[1.75rem] border border-[#F4C8BA] bg-white/95 p-2 shadow-[0_16px_40px_rgba(42,31,27,0.16)] backdrop-blur lg:hidden"
                style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
            >
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-2.5 text-center transition hover:bg-[#FFF7F3]"
                    >
                        <span className="block text-[11px] font-semibold text-gray-400">
                            {messages.outputFormat}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-[#2A1F1B]">
                            {outputLabel}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={convertImage}
                        disabled={!file || isConverting}
                        className="rounded-2xl bg-[#F28C6F] px-2 py-2.5 text-center text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="block text-[11px] font-semibold text-white/80">
                            {isConverting ? messages.converting : messages.actionConvert}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold">
                            {convertedBlob ? messages.readyShort : messages.notReady}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={downloadImage}
                        disabled={!convertedBlob}
                        className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 py-2.5 text-center transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span className="block text-[11px] font-semibold text-gray-400">
                            {messages.actionDownload}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-[#E6765B]">
                            {convertedSize ? formatBytes(convertedSize) : "—"}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}