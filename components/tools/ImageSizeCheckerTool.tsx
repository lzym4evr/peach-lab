"use client";

import { useState } from "react";
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

    function processFile(file: File) {
        setError("");

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

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processFile(file);
    }

    function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
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
    }

    return (
        <div className="space-y-6">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${isDragging
                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                        : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
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
                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {t.imageSizeChecker.preview}
                            </h3>

                            <button
                                onClick={resetImage}
                                className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                            >
                                {t.common.clear}
                            </button>
                        </div>

                        <div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-4">
                            <img
                                src={imageInfo.previewUrl}
                                alt={imageInfo.name}
                                className="max-h-80 max-w-full rounded-xl object-contain"
                            />
                        </div>

                        <p className="mt-4 break-all text-sm text-gray-500">
                            {imageInfo.name}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">
                            {t.imageSizeChecker.imageInformation}
                        </h3>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.width}
                                </p>
                                <p className="mt-2 text-2xl font-bold">{imageInfo.width}px</p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.height}
                                </p>
                                <p className="mt-2 text-2xl font-bold">{imageInfo.height}px</p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.aspectRatio}
                                </p>
                                <p className="mt-2 text-2xl font-bold">{imageInfo.ratio}</p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.fileSize}
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    {formatFileSize(imageInfo.size)}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.format}
                                </p>
                                <p className="mt-2 text-lg font-bold">{imageInfo.type}</p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.imageSizeChecker.transparency}
                                </p>
                                <p className="mt-2 text-lg font-bold">
                                    {imageInfo.transparent === null
                                        ? t.imageSizeChecker.notChecked
                                        : imageInfo.transparent
                                            ? t.imageSizeChecker.yes
                                            : t.imageSizeChecker.no}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {t.common.localProcessing}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {t.imageSizeChecker.localProcessingDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}