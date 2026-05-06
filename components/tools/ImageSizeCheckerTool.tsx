"use client";

import { type ChangeEvent, type DragEvent, useState } from "react";
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

export default function ImageSizeCheckerTool() {
    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copiedResult, setCopiedResult] = useState(false);

    function getTransparencyText(info: ImageInfo) {
        if (info.transparent === null) {
            return t.imageSizeChecker.notChecked;
        }

        return info.transparent ? t.imageSizeChecker.yes : t.imageSizeChecker.no;
    }

    function processFile(file: File) {
        setError("");
        setCopiedResult(false);

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
    }

    async function copyImageResult() {
        if (!imageInfo) return;

        const resultText = `${t.imageSizeChecker.imageInformation}
Name: ${imageInfo.name}
${t.imageSizeChecker.width}: ${imageInfo.width}px
${t.imageSizeChecker.height}: ${imageInfo.height}px
${t.imageSizeChecker.aspectRatio}: ${imageInfo.ratio}
${t.imageSizeChecker.fileSize}: ${formatFileSize(imageInfo.size)}
${t.imageSizeChecker.format}: ${imageInfo.type}
${t.imageSizeChecker.transparency}: ${getTransparencyText(imageInfo)}`;

        await navigator.clipboard.writeText(resultText);
        setCopiedResult(true);

        setTimeout(() => {
            setCopiedResult(false);
        }, 1500);
    }

    const infoCards = imageInfo
        ? [
            {
                label: t.imageSizeChecker.width,
                value: `${imageInfo.width}px`,
            },
            {
                label: t.imageSizeChecker.height,
                value: `${imageInfo.height}px`,
            },
            {
                label: t.imageSizeChecker.aspectRatio,
                value: imageInfo.ratio,
            },
            {
                label: t.imageSizeChecker.fileSize,
                value: formatFileSize(imageInfo.size),
            },
            {
                label: t.imageSizeChecker.format,
                value: imageInfo.type,
            },
            {
                label: t.imageSizeChecker.transparency,
                value: getTransparencyText(imageInfo),
            },
        ]
        : [];

    return (
        <div className="space-y-6">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition md:p-8 ${isDragging
                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                    : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm md:h-16 md:w-16">
                    🖼️
                </div>

                <h2 className="text-xl font-semibold">
                    {t.imageSizeChecker.uploadTitle}
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {t.imageSizeChecker.uploadDescription}
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]">
                    {t.imageSizeChecker.chooseImage}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
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

                        <div className="mt-4 flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-3 md:min-h-80 md:p-4">
                            <img
                                src={imageInfo.previewUrl}
                                alt={imageInfo.name}
                                className="max-h-56 max-w-full rounded-xl object-contain md:max-h-80"
                            />
                        </div>

                        <p className="mt-3 break-all text-sm text-gray-500 md:mt-4">
                            {imageInfo.name}
                        </p>
                    </div>

                    <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionTitle
                            title={t.imageSizeChecker.imageInformation}
                            right={
                                <button
                                    type="button"
                                    onClick={copyImageResult}
                                    className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copiedResult ? t.common.copied : t.imageSizeChecker.copyResult}
                                </button>
                            }
                        />

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            {infoCards.map((item) => (
                                <div
                                    key={item.label}
                                    className="min-w-0 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3 md:p-4"
                                >
                                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-500 md:text-xs">
                                        {item.label}
                                    </p>

                                    <p className="mt-2 break-words text-xl font-semibold text-[#111827] md:text-2xl">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:mt-5 md:p-4">
                            <p className="text-sm font-semibold text-gray-900">
                                {t.common.localProcessing}
                            </p>
                            <p className="mt-1.5 text-sm leading-6 text-gray-600">
                                {t.imageSizeChecker.localProcessingDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}