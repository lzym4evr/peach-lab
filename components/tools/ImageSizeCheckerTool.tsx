"use client";

import {
    type ChangeEvent,
    type DragEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type ImageInfo = {
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
    ratio: string;
    transparent: boolean | null;
    previewUrl: string;
};

type InfoCardItem = {
    key: string;
    label: string;
    value: string;
};

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getAspectRatio(width: number, height: number) {
    function gcd(a: number, b: number): number {
        return b === 0 ? a : gcd(b, a % b);
    }

    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
}

function checkTransparentPixels(image: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 3; index < data.length; index += 4) {
        if (data[index] < 255) {
            return true;
        }
    }

    return false;
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }
}

export default function ImageSizeCheckerTool() {
    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copiedResult, setCopiedResult] = useState(false);
    const [copiedItem, setCopiedItem] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            if (imageInfo?.previewUrl) {
                URL.revokeObjectURL(imageInfo.previewUrl);
            }
        };
    }, [imageInfo]);

    function getTransparencyText(info: ImageInfo) {
        if (info.transparent === null) {
            return t.imageSizeChecker.notChecked;
        }

        return info.transparent ? t.imageSizeChecker.yes : t.imageSizeChecker.no;
    }

    function processFile(file: File) {
        setError("");
        setCopiedResult(false);
        setCopiedItem("");

        if (!file.type.startsWith("image/")) {
            setError(t.imageSizeChecker.invalidImage);
            return;
        }

        if (imageInfo?.previewUrl) {
            URL.revokeObjectURL(imageInfo.previewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            let transparent: boolean | null = null;

            if (file.type === "image/png" || file.type === "image/webp") {
                try {
                    transparent = checkTransparentPixels(image);
                } catch {
                    transparent = null;
                }
            }

            setImageInfo({
                name: file.name,
                type: file.type || "Unknown",
                size: file.size,
                width: image.naturalWidth,
                height: image.naturalHeight,
                ratio: getAspectRatio(image.naturalWidth, image.naturalHeight),
                transparent,
                previewUrl,
            });
        };

        image.onerror = () => {
            setError(t.imageSizeChecker.readError);
            URL.revokeObjectURL(previewUrl);
        };

        image.src = previewUrl;
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processFile(file);
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

        processFile(file);
    }

    function resetImage() {
        if (imageInfo?.previewUrl) {
            URL.revokeObjectURL(imageInfo.previewUrl);
        }

        setImageInfo(null);
        setError("");
        setIsDragging(false);
        setCopiedResult(false);
        setCopiedItem("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function copyImageResult() {
        if (!imageInfo) return;

        const resultText = `${t.imageSizeChecker.imageInformation}
${t.imageSizeChecker.width}: ${imageInfo.width}px
${t.imageSizeChecker.height}: ${imageInfo.height}px
${t.imageSizeChecker.aspectRatio}: ${imageInfo.ratio}
${t.imageSizeChecker.fileSize}: ${formatFileSize(imageInfo.size)}
${t.imageSizeChecker.format}: ${imageInfo.type}
${t.imageSizeChecker.transparency}: ${getTransparencyText(imageInfo)}`;

        await copyToClipboard(resultText);
        setCopiedResult(true);

        setTimeout(() => {
            setCopiedResult(false);
        }, 1500);
    }

    async function copySingleItem(key: string, value: string) {
        await copyToClipboard(value);
        setCopiedItem(key);

        setTimeout(() => {
            setCopiedItem((current) => (current === key ? "" : current));
        }, 1500);
    }

    const infoCards: InfoCardItem[] = imageInfo
        ? [
            {
                key: "width",
                label: t.imageSizeChecker.width,
                value: `${imageInfo.width}px`,
            },
            {
                key: "height",
                label: t.imageSizeChecker.height,
                value: `${imageInfo.height}px`,
            },
            {
                key: "ratio",
                label: t.imageSizeChecker.aspectRatio,
                value: imageInfo.ratio,
            },
            {
                key: "size",
                label: t.imageSizeChecker.fileSize,
                value: formatFileSize(imageInfo.size),
            },
            {
                key: "format",
                label: t.imageSizeChecker.format,
                value: imageInfo.type,
            },
            {
                key: "transparency",
                label: t.imageSizeChecker.transparency,
                value: getTransparencyText(imageInfo),
            },
        ]
        : [];

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                <p className="font-semibold text-[#2A1F1B]">
                    {t.common.localProcessing}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                    {t.imageSizeChecker.localProcessingDescription}
                </p>
            </div>

            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block cursor-pointer rounded-[32px] border-2 border-dashed px-6 py-8 text-center transition md:px-8 md:py-10 ${isDragging
                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                    : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-4xl shadow-sm">
                    🖼️
                </div>

                <h2 className="mx-auto mt-6 max-w-xl text-2xl font-semibold leading-tight text-[#2A1F1B] md:text-3xl">
                    {t.imageSizeChecker.uploadTitle}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                    {t.imageSizeChecker.uploadDescription}
                </p>

                <p className="mx-auto mt-4 max-w-2xl text-xs font-medium leading-6 text-[#A17F74] md:text-sm">
                    {t.imageSizeChecker.supportedFormats}
                </p>

                <div className="mt-7 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:px-8 md:py-3.5 md:text-base">
                    {t.imageSizeChecker.chooseImage}
                </div>

                <p className="mt-5 break-all text-sm text-gray-500">
                    {imageInfo?.name || t.imageSizeChecker.noFileSelected}
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
            </label>

            {imageInfo && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionTitle
                            title={t.imageSizeChecker.preview}
                            right={
                                <button
                                    type="button"
                                    onClick={resetImage}
                                    className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                                >
                                    {t.common.clear}
                                </button>
                            }
                        />

                        <div className="mt-4 rounded-2xl bg-[#FFFDFC] p-3 md:p-4">
                            <div className="flex justify-center">
                                <img
                                    src={imageInfo.previewUrl}
                                    alt={imageInfo.name}
                                    className="max-h-[360px] w-auto max-w-full rounded-xl object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionTitle
                            title={t.imageSizeChecker.imageInformation}
                            right={
                                <button
                                    type="button"
                                    onClick={copyImageResult}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copiedResult
                                        ? t.common.copied
                                        : t.imageSizeChecker.copyResult}
                                </button>
                            }
                        />

                        <p className="mt-2 text-xs text-gray-500">
                            {t.imageSizeChecker.tapValueToCopy}
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {infoCards.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => copySingleItem(item.key, item.value)}
                                    className="min-w-0 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3 text-left transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3] active:scale-[0.99] md:p-4"
                                >
                                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-500 md:text-xs">
                                        {item.label}
                                    </p>

                                    <p className="mt-2 break-all text-lg font-semibold text-[#2A1F1B] md:text-2xl md:font-bold">
                                        {copiedItem === item.key
                                            ? t.common.copied
                                            : item.value}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}