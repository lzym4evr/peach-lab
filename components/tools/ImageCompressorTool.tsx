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

type OriginalInfo = {
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
    previewUrl: string;
};

type CompressedInfo = {
    size: number;
    width: number;
    height: number;
    format: string;
    previewUrl: string;
    blob: Blob;
};

type ViewerState = {
    title: string;
    url: string;
};

function formatFileSize(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "-";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getExtension(format: string) {
    if (format === "image/jpeg") return "jpg";
    if (format === "image/webp") return "webp";
    return "png";
}

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Failed to read file."));
        };

        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to load image."));
        image.src = src;
    });
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality?: number
) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Failed to create blob."));
                    return;
                }

                resolve(blob);
            },
            type,
            quality
        );
    });
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
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[70] bg-black/70 px-4 py-6">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-white px-6 py-3 text-base font-medium text-[#2A1F1B] shadow-sm transition hover:bg-[#FFF7F3]"
                    >
                        {closeText}
                    </button>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
                    <div className="w-full rounded-[28px] bg-transparent">
                        <img
                            src={url}
                            alt={title}
                            className="mx-auto max-h-[78vh] w-auto max-w-full rounded-[24px] object-contain shadow-2xl"
                            draggable={false}
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
    onClose,
}: {
    originalUrl: string;
    compressedUrl: string;
    originalLabel: string;
    compressedLabel: string;
    title: string;
    description: string;
    closeText: string;
    onClose: () => void;
}) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (event: PointerEvent) => {
            if (!wrapperRef.current) return;

            event.preventDefault();

            const rect = wrapperRef.current.getBoundingClientRect();
            const next =
                ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;

            setPosition(Math.min(100, Math.max(0, next)));
        };

        const handlePointerUp = () => {
            setIsDragging(false);
        };

        window.addEventListener("pointermove", handlePointerMove, {
            passive: false,
        });
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [isDragging]);

    function updateFromPointer(clientX: number) {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const next = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
        setPosition(Math.min(100, Math.max(0, next)));
    }

    function handlePointerDown(
        event: React.PointerEvent<HTMLDivElement | HTMLButtonElement>
    ) {
        event.preventDefault();
        updateFromPointer(event.clientX);
        setIsDragging(true);
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/70 px-4 py-6">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full bg-white px-6 py-3 text-base font-medium text-[#2A1F1B] shadow-sm transition hover:bg-[#FFF7F3]"
                    >
                        {closeText}
                    </button>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
                    <div className="w-full">
                        <h3 className="text-center text-3xl font-semibold text-white">
                            {title}
                        </h3>

                        <p className="mx-auto mt-2 max-w-2xl text-center text-base leading-7 text-white/90 md:text-lg">
                            {description}
                        </p>

                        <div
                            ref={wrapperRef}
                            onPointerDown={handlePointerDown}
                            className="relative mx-auto mt-6 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-[28px] border-[10px] border-white/10 bg-[#3E3E3E] shadow-2xl select-none"
                            style={{ touchAction: "none", userSelect: "none" }}
                        >
                            <img
                                src={compressedUrl}
                                alt={compressedLabel}
                                className="absolute inset-0 h-full w-full object-contain"
                                draggable={false}
                            />

                            <div
                                className="absolute inset-y-0 left-0 overflow-hidden"
                                style={{ width: `${position}%` }}
                            >
                                <img
                                    src={originalUrl}
                                    alt={originalLabel}
                                    className="absolute inset-0 h-full w-full object-contain"
                                    style={{
                                        width: `${100 / Math.max(position, 0.001)}%`,
                                        maxWidth: "none",
                                    }}
                                    draggable={false}
                                />
                            </div>

                            <div
                                className="absolute inset-y-0"
                                style={{ left: `${position}%` }}
                            >
                                <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]" />
                            </div>

                            <button
                                type="button"
                                onPointerDown={handlePointerDown}
                                className="absolute top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-4xl text-[#F28C6F] shadow-xl transition active:scale-95"
                                style={{ left: `${position}%`, touchAction: "none" }}
                            >
                                ↔
                            </button>

                            <div className="absolute left-5 top-5 rounded-full bg-white px-5 py-2 text-base font-medium text-[#8D6F67] shadow-sm">
                                {originalLabel}
                            </div>

                            <div className="absolute right-5 top-5 rounded-full bg-white px-5 py-2 text-base font-medium text-[#8D6F67] shadow-sm">
                                {compressedLabel}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImageCompressorTool() {
    const text = t.imageCompressor;

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [originalInfo, setOriginalInfo] = useState<OriginalInfo | null>(null);
    const [compressedInfo, setCompressedInfo] =
        useState<CompressedInfo | null>(null);

    const [quality, setQuality] = useState(78);
    const [outputFormat, setOutputFormat] = useState("image/jpeg");
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<"idle" | "ready">("idle");
    const [error, setError] = useState("");
    const [viewer, setViewer] = useState<ViewerState | null>(null);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    const savedPercentage = useMemo(() => {
        if (!originalInfo || !compressedInfo || originalInfo.size <= 0) {
            return 0;
        }

        return Math.max(
            0,
            Math.round((1 - compressedInfo.size / originalInfo.size) * 100)
        );
    }, [originalInfo, compressedInfo]);

    async function processFile(file: File) {
        setError("");
        setStatus("idle");
        setCompressedInfo(null);

        if (!file.type.startsWith("image/")) {
            setError(text.loadError);
            return;
        }

        try {
            const previewUrl = await readFileAsDataUrl(file);
            const image = await loadImage(previewUrl);

            setOriginalInfo({
                name: file.name,
                type: file.type || "image/*",
                size: file.size,
                width: image.naturalWidth,
                height: image.naturalHeight,
                previewUrl,
            });
        } catch {
            setError(text.loadError);
        }
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        void processFile(file);
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

        void processFile(file);
    }

    async function handleCompress() {
        if (!originalInfo) {
            setError(text.noFileError);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        setError("");
        setIsProcessing(true);

        try {
            const image = await loadImage(originalInfo.previewUrl);

            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            const context = canvas.getContext("2d");
            if (!context) {
                throw new Error("Canvas context failed.");
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const blob = await canvasToBlob(
                canvas,
                outputFormat,
                quality / 100
            );

            const previewUrl = canvas.toDataURL(outputFormat, quality / 100);

            setCompressedInfo({
                size: blob.size,
                width: image.naturalWidth,
                height: image.naturalHeight,
                format: outputFormat,
                previewUrl,
                blob,
            });

            setStatus("ready");
        } catch {
            setError(text.compressError);
            setCompressedInfo(null);
            setStatus("idle");
        } finally {
            setIsProcessing(false);
        }
    }

    function handleDownload() {
        if (!compressedInfo || !originalInfo) return;

        const link = document.createElement("a");
        const url = URL.createObjectURL(compressedInfo.blob);
        const baseName = originalInfo.name.replace(/\.[^/.]+$/, "");
        const extension = getExtension(compressedInfo.format);

        link.href = url;
        link.download = `${baseName}-compressed.${extension}`;
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);
    }

    function openOriginalPreview() {
        if (!originalInfo) return;

        setViewer({
            title: text.originalImage,
            url: originalInfo.previewUrl,
        });
    }

    function openNewPreview() {
        if (!compressedInfo) return;

        setViewer({
            title: text.compressedImage,
            url: compressedInfo.previewUrl,
        });
    }

    function openCompare() {
        if (!originalInfo || !compressedInfo) return;
        setIsCompareOpen(true);
    }

    const hasOriginal = !!originalInfo;
    const hasCompressed = !!compressedInfo;

    return (
        <div className="space-y-6 pb-28 md:pb-0">
            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                <p className="text-sm leading-7 text-[#6B5B56] md:text-base">
                    {text.localProcessing}
                </p>
            </div>

            <div className="space-y-5 pb-1 md:space-y-6 lg:pb-0">
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`block cursor-pointer rounded-3xl border-2 border-dashed p-4 text-center transition md:p-8 ${isDragging
                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                        : "border-[#F4C8BA] bg-[#FFF7F3]"
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
                        {hasOriginal ? text.changeImage : text.uploadButton}
                    </div>

                    <p className="mt-4 break-all text-sm text-gray-500 md:mt-5">
                        {originalInfo?.name || text.noFileSelected}
                    </p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {error ? (
                        <p className="mt-4 text-sm text-red-500">{error}</p>
                    ) : null}
                </label>
            </div>

            {hasOriginal ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <div className="space-y-6">
                        <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <SectionTitle title={text.originalImage} />

                            <div className="mt-4 rounded-2xl bg-[#FFFDFC] p-3 md:p-4">
                                <button
                                    type="button"
                                    onClick={openOriginalPreview}
                                    className="group block w-full"
                                >
                                    <div className="flex justify-center overflow-hidden rounded-2xl">
                                        <img
                                            src={originalInfo.previewUrl}
                                            alt={originalInfo.name}
                                            className="max-h-[360px] w-auto max-w-full rounded-2xl object-contain transition group-hover:scale-[1.01]"
                                            draggable={false}
                                        />
                                    </div>
                                </button>
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-gray-500">
                                <p className="break-all">{originalInfo.name}</p>
                                <p>
                                    {originalInfo.width}px × {originalInfo.height}px
                                </p>
                                <p>{formatFileSize(originalInfo.size)}</p>
                            </div>
                        </div>

                        {hasCompressed ? (
                            <div className="hidden md:block md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <SectionTitle title={text.compressedImage} />

                                <div className="mt-4 rounded-2xl bg-[#FFFDFC] p-3 md:p-4">
                                    <button
                                        type="button"
                                        onClick={openNewPreview}
                                        className="group block w-full"
                                    >
                                        <div className="flex justify-center overflow-hidden rounded-2xl">
                                            <img
                                                src={compressedInfo.previewUrl}
                                                alt={text.compressedImage}
                                                className="max-h-[360px] w-auto max-w-full rounded-2xl object-contain transition group-hover:scale-[1.01]"
                                                draggable={false}
                                            />
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-gray-500">
                                    <p>
                                        {compressedInfo.width}px ×{" "}
                                        {compressedInfo.height}px
                                    </p>
                                    <p>{formatFileSize(compressedInfo.size)}</p>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                            <SectionTitle title={text.controlsTitle} />

                            <div className="mt-5">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-[#2A1F1B]">
                                        {text.qualityLabel}
                                    </label>
                                    <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-sm text-[#8D6F67]">
                                        {quality}%
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min={10}
                                    max={100}
                                    step={1}
                                    value={quality}
                                    onChange={(event) =>
                                        setQuality(Number(event.target.value))
                                    }
                                    className="block w-full accent-[#F28C6F]"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                                    {text.formatLabel}
                                </label>

                                <select
                                    value={outputFormat}
                                    onChange={(event) =>
                                        setOutputFormat(event.target.value)
                                    }
                                    className="h-14 w-full rounded-3xl border border-[#F1E5DF] bg-white px-5 text-base text-[#2A1F1B] outline-none transition focus:border-[#F28C6F]"
                                >
                                    <option value="image/jpeg">JPG</option>
                                    <option value="image/png">PNG</option>
                                    <option value="image/webp">WebP</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleCompress}
                                disabled={!hasOriginal || isProcessing}
                                className={`mt-5 w-full rounded-3xl px-6 py-4 text-base font-semibold text-white shadow-sm transition ${hasOriginal && !isProcessing
                                    ? "bg-[#F28C6F] hover:bg-[#E6765B]"
                                    : "cursor-not-allowed bg-[#F8D9CF]"
                                    }`}
                            >
                                {isProcessing ? text.processing : text.compressImage}
                            </button>

                            {status === "ready" ? (
                                <p className="mt-5 text-base text-[#6B5B56]">
                                    {text.ready}
                                </p>
                            ) : null}
                        </div>

                        {hasCompressed ? (
                            <div className="hidden md:block rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                                <SectionTitle title={text.outputTitle} />

                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[#8D6F67]">
                                            {text.originalSize}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold text-[#2A1F1B]">
                                            {formatFileSize(originalInfo.size)}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[#8D6F67]">
                                            {text.compressedSize}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold text-[#2A1F1B]">
                                            {formatFileSize(compressedInfo.size)}
                                        </p>
                                    </div>

                                    <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                        <p className="text-xs font-medium uppercase tracking-wide text-[#8D6F67]">
                                            {text.saved}
                                        </p>
                                        <p className="mt-3 text-2xl font-semibold text-[#2A1F1B]">
                                            {savedPercentage}%
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={openCompare}
                                        className="rounded-3xl border border-[#F4C8BA] bg-white px-5 py-4 text-base font-semibold text-[#D17F66] transition hover:bg-[#FFF7F3]"
                                    >
                                        {text.compare}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="rounded-3xl bg-[#F28C6F] px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                    >
                                        {text.downloadImage}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <canvas ref={canvasRef} className="hidden" />

            <div className="md:hidden">
                <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 pb-[max(0px,env(safe-area-inset-bottom))]">
                    <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] border border-[#F4C8BA] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(42,31,27,0.10)]">
                        <p className="mb-2 text-center text-xs font-medium text-[#8D6F67]">
                            {text.actionBarHint}
                        </p>

                        <div className="grid grid-cols-4 gap-2">
                            <button
                                type="button"
                                onClick={openOriginalPreview}
                                disabled={!hasOriginal}
                                className={`rounded-[22px] border px-2 py-3 text-center transition ${hasOriginal
                                        ? "border-[#F1E5DF] bg-white"
                                        : "border-[#F1E5DF] bg-white opacity-60"
                                    }`}
                            >
                                <p className="text-sm font-medium text-[#8D6F67]">
                                    {text.originalLabel}
                                </p>
                                <p className="mt-1.5 text-[15px] font-semibold leading-5 text-[#2A1F1B]">
                                    {hasOriginal ? formatFileSize(originalInfo.size) : "-"}
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={openNewPreview}
                                disabled={!hasCompressed}
                                className={`rounded-[22px] border px-2 py-3 text-center transition ${hasCompressed
                                        ? "border-[#F1E5DF] bg-white"
                                        : "border-[#F1E5DF] bg-white opacity-60"
                                    }`}
                            >
                                <p className="text-sm font-medium text-[#8D6F67]">
                                    {text.newLabel}
                                </p>
                                <p className="mt-1.5 text-[15px] font-semibold leading-5 text-[#2A1F1B]">
                                    {hasCompressed ? formatFileSize(compressedInfo.size) : "-"}
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={openCompare}
                                disabled={!hasCompressed}
                                className={`rounded-[22px] border px-2 py-3 text-center transition ${hasCompressed
                                        ? "border-[#F1E5DF] bg-white"
                                        : "border-[#F1E5DF] bg-white opacity-60"
                                    }`}
                            >
                                <p className="text-sm font-medium text-[#8D6F67]">
                                    {text.saved}
                                </p>
                                <p className="mt-1.5 text-[15px] font-semibold leading-5 text-[#2A1F1B]">
                                    {hasCompressed ? `${savedPercentage}%` : "0%"}
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={!hasCompressed}
                                className={`rounded-[22px] px-2 py-3 text-center transition ${hasCompressed
                                        ? "bg-[#F28C6F] text-white shadow-sm hover:bg-[#E6765B]"
                                        : "bg-[#F8D9CF] text-white"
                                    }`}
                            >
                                <p className="text-sm font-medium">
                                    {text.download}
                                </p>
                                <p className="mt-1.5 text-[15px] font-semibold leading-5">
                                    {hasCompressed ? text.readyStatus : text.notReadyStatus}
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewer ? (
                <ImageViewer
                    title={viewer.title}
                    url={viewer.url}
                    closeText={text.close}
                    onClose={() => setViewer(null)}
                />
            ) : null}

            {isCompareOpen && originalInfo && compressedInfo ? (
                <CompareViewer
                    originalUrl={originalInfo.previewUrl}
                    compressedUrl={compressedInfo.previewUrl}
                    originalLabel={text.originalLabel}
                    compressedLabel={text.newLabel}
                    title={text.beforeAfterTitle}
                    description={text.beforeAfterDescription}
                    closeText={text.close}
                    onClose={() => setIsCompareOpen(false)}
                />
            ) : null}
        </div>
    );
}