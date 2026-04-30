"use client";

import {
    ChangeEvent,
    DragEvent,
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
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    const htmlOutput = useMemo(() => getHtmlOutput(), []);

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
        <div className="space-y-6">
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                {text.localProcessing}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
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
                                accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
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
                            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        {text.previewTitle}
                                    </h4>

                                    <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                                        {imageInfo
                                            ? `${imageInfo.width} × ${imageInfo.height}px`
                                            : "-"}
                                    </span>
                                </div>

                                <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-[#FFF7F3] p-8">
                                    <img
                                        src={originalUrl}
                                        alt="Uploaded favicon source"
                                        className="max-h-[260px] w-full object-contain"
                                    />
                                </div>
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

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>
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
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">
                        {text.controlsTitle}
                    </h3>

                    <div className="mt-5 space-y-5">
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
                            onChange={(value) => {
                                setCornerRadius(value);
                                clearGenerated();
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleGenerate}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.generateFavicons}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.reset}
                        </button>
                    </div>

                    <div className="mt-8 border-t border-[#F1E5DF] pt-6">
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
                </section>
            </div>
        </div>
    );
}

function ColorInput({
    label,
    value,
    fallback,
    onChange,
}: {
    label: string;
    value: string;
    fallback: string;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : fallback;

    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[58px_1fr] gap-3">
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
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