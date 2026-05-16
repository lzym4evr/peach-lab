"use client";

import {
    type ChangeEvent,
    type DragEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
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
    const value = bytes / 1024 ** index;

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
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
    const text = t.imageConverter;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ??
        "Convert Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    useEffect(() => {
        return () => {
            if (originalUrl) {
                URL.revokeObjectURL(originalUrl);
            }
        };
    }, [originalUrl]);

    useEffect(() => {
        return () => {
            if (convertedUrl) {
                URL.revokeObjectURL(convertedUrl);
            }
        };
    }, [convertedUrl]);

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
            setError(text.loadError);
        }
    }

    function handleChooseFile(event: ChangeEvent<HTMLInputElement>) {
        const nextFile = event.target.files?.[0];

        if (!nextFile) return;

        loadFile(nextFile);
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

        const nextFile = event.dataTransfer.files?.[0];

        if (!nextFile) return;

        loadFile(nextFile);
    }

    async function handleConvert() {
        if (!file || !originalUrl || !imageInfo) {
            setError(text.noFileError);
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

            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    resolve,
                    getOutputMimeType(outputFormat),
                    outputFormat === "png" ? undefined : quality / 100,
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
            setStatus(text.ready);
        } catch {
            setError(text.convertError);
        } finally {
            setIsConverting(false);
        }
    }

    function handleDownload() {
        if (!convertedBlob || !file) {
            setError(text.noFileError);
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

    function handleReset() {
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
        setIsMobileSettingsOpen(false);
    }

    const savedPercent =
        imageInfo && convertedSize
            ? Math.max(
                Math.round(
                    ((imageInfo.size - convertedSize) / imageInfo.size) *
                    100,
                ),
                0,
            )
            : 0;

    const outputLabel =
        outputFormat === "jpeg"
            ? text.formatJpg
            : outputFormat === "png"
                ? text.formatPng
                : text.formatWebp;

    const settingsPanel = (
        <ImageConverterSettingsPanel
            text={text}
            outputFormat={outputFormat}
            quality={quality}
            backgroundColor={backgroundColor}
            imageInfo={imageInfo}
            convertedSize={convertedSize}
            savedPercent={savedPercent}
            status={status}
            error={error}
            isConverting={isConverting}
            setOutputFormat={setOutputFormat}
            setQuality={setQuality}
            setBackgroundColor={setBackgroundColor}
            handleConvert={handleConvert}
            handleReset={handleReset}
            handleDownload={handleDownload}
        />
    );

    const mobileSettingsPanel = (
        <ImageConverterSettingsPanel
            text={text}
            outputFormat={outputFormat}
            quality={quality}
            backgroundColor={backgroundColor}
            imageInfo={imageInfo}
            convertedSize={convertedSize}
            savedPercent={savedPercent}
            status={status}
            error={error}
            isConverting={isConverting}
            setOutputFormat={setOutputFormat}
            setQuality={setQuality}
            setBackgroundColor={setBackgroundColor}
            handleConvert={handleConvert}
            handleReset={handleReset}
            handleDownload={handleDownload}
            compact
        />
    );

    return (
        <>
            <div className="space-y-6 pb-2 lg:pb-0">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#7A5A4F]">
                    {text.localProcessing}
                </div>

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

                    <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:mt-3 md:text-sm">
                        {text.dropHint}
                    </p>

                    <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                        {file ? text.changeImage : text.uploadButton}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,image/avif"
                        onChange={handleChooseFile}
                        className="hidden"
                    />

                    <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                        {file ? file.name : text.noFileSelected}
                    </p>

                    {error && !file ? (
                        <p className="mt-4 text-sm font-medium text-red-500">
                            {error}
                        </p>
                    ) : null}
                </label>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="min-w-0 space-y-6">
                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.originalImage} />

                                {file ? (
                                    <span className="hidden max-w-[220px] truncate rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F] md:block">
                                        {file.name}
                                    </span>
                                ) : null}
                            </div>

                            {originalUrl && imageInfo ? (
                                <div className="overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:p-4">
                                    <div className="flex items-center justify-center rounded-2xl bg-white/70 p-3 md:p-4">
                                        <img
                                            src={originalUrl}
                                            alt={text.originalImage}
                                            className="max-h-[220px] max-w-full object-contain md:max-h-[320px]"
                                        />
                                    </div>

                                    <p className="mt-3 text-center text-xs font-medium text-[#7A5A4F] md:text-sm">
                                        {imageInfo.width} × {imageInfo.height}px ·{" "}
                                        {imageInfo.format} ·{" "}
                                        {formatBytes(imageInfo.size)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center md:min-h-[260px]">
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

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} />
                            </div>

                            {convertedUrl ? (
                                <div className="overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:p-4">
                                    <div className="flex items-center justify-center rounded-2xl bg-white/70 p-3 md:p-4">
                                        <img
                                            src={convertedUrl}
                                            alt={text.convertedImage}
                                            className="max-h-[220px] max-w-full object-contain md:max-h-[320px]"
                                        />
                                    </div>

                                    <p className="mt-3 text-center text-xs font-medium text-[#7A5A4F] md:text-sm">
                                        {outputLabel} ·{" "}
                                        {formatBytes(convertedSize)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex min-h-[150px] items-center justify-center rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center md:min-h-[220px]">
                                    <p className="text-sm leading-6 text-gray-500">
                                        {text.convertImage}
                                    </p>
                                </div>
                            )}

                            {error && file ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            ) : null}
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        {settingsPanel}
                    </section>
                </div>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.settingsTitle}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    {mobileSettingsPanel}
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function ImageConverterSettingsPanel({
    text,
    outputFormat,
    quality,
    backgroundColor,
    imageInfo,
    convertedSize,
    savedPercent,
    status,
    error,
    isConverting,
    setOutputFormat,
    setQuality,
    setBackgroundColor,
    handleConvert,
    handleReset,
    handleDownload,
    compact = false,
}: {
    text: typeof t.imageConverter;
    outputFormat: OutputFormat;
    quality: number;
    backgroundColor: string;
    imageInfo: ImageInfo | null;
    convertedSize: number;
    savedPercent: number;
    status: string;
    error: string;
    isConverting: boolean;
    setOutputFormat: (value: OutputFormat) => void;
    setQuality: (value: number) => void;
    setBackgroundColor: (value: string) => void;
    handleConvert: () => void;
    handleReset: () => void;
    handleDownload: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-4" : ""}>
            {!compact ? <SectionHeader title={text.settingsTitle} /> : null}

            <div className={compact ? "space-y-4" : "mt-5 space-y-5"}>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                        {text.outputFormat}
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: "png", label: text.formatPng },
                            { value: "jpeg", label: text.formatJpg },
                            { value: "webp", label: text.formatWebp },
                        ].map((format) => (
                            <button
                                key={format.value}
                                type="button"
                                onClick={() =>
                                    setOutputFormat(format.value as OutputFormat)
                                }
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

                {outputFormat !== "png" ? (
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <label className="text-sm font-semibold text-[#2A1F1B]">
                                {text.quality}
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
                            onChange={(event) =>
                                setQuality(Number(event.target.value))
                            }
                            className="w-full accent-[#F28C6F]"
                        />
                    </div>
                ) : null}

                {outputFormat === "jpeg" ? (
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-[#2A1F1B]">
                            {text.backgroundColor}
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={backgroundColor}
                                onChange={(event) =>
                                    setBackgroundColor(event.target.value)
                                }
                                className="h-11 w-14 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                            />

                            <input
                                value={backgroundColor}
                                onChange={(event) =>
                                    setBackgroundColor(event.target.value)
                                }
                                className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm outline-none focus:border-[#F28C6F]"
                            />
                        </div>

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                            {text.backgroundHint}
                        </p>
                    </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleConvert}
                        disabled={!imageInfo || isConverting}
                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isConverting ? text.converting : text.convertImage}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    >
                        {text.reset}
                    </button>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900">
                        {text.convertedImage}
                    </h3>

                    <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
                        <InfoBox
                            label={text.originalSize}
                            value={imageInfo ? formatBytes(imageInfo.size) : "-"}
                        />

                        <InfoBox
                            label={text.convertedSize}
                            value={convertedSize ? formatBytes(convertedSize) : "-"}
                        />

                        <InfoBox
                            label={text.saved}
                            value={convertedSize ? `${savedPercent}%` : "-"}
                        />
                    </div>

                    {convertedSize ? (
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="mt-4 w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                        >
                            {text.downloadImage}
                        </button>
                    ) : null}

                    {status ? (
                        <p className="mt-3 text-sm text-[#7A5A4F]">
                            {status}
                        </p>
                    ) : null}

                    {error && !imageInfo ? (
                        <p className="mt-3 text-sm font-medium text-red-500">
                            {error}
                        </p>
                    ) : null}
                </div>
            </div>
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
                className="pointer-events-auto mx-auto max-w-md rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
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
        const previousOverflow = document.body.style.overflow;
        const previousTouchAction = document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
        };
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[70] overscroll-none bg-[#2A1F1B]/35 px-3 pb-3 pt-24 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
            onTouchMove={(event) => event.preventDefault()}
        >
            <div
                className={`ml-auto flex h-full max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 px-4 pb-2 pt-4">
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

                <div
                    className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 pb-4 pt-2"
                    onTouchMove={(event) => event.stopPropagation()}
                >
                    {children}
                </div>
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

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5 lg:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C7B70] lg:text-xs">
                {label}
            </p>

            <p className="mt-1 text-base font-bold text-gray-900 lg:mt-2 lg:text-lg">
                {value}
            </p>
        </div>
    );
}