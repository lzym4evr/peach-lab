"use client";

import { useRef, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type ImageInfo = {
    name: string;
    type: string;
    width: number;
    height: number;
    previewUrl: string;
};

type OutputInfo = {
    previewUrl: string;
    width: number;
    height: number;
    format: string;
};

export default function ImageResizerTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [outputInfo, setOutputInfo] = useState<OutputInfo | null>(null);
    const [newWidth, setNewWidth] = useState(0);
    const [newHeight, setNewHeight] = useState(0);
    const [lockRatio, setLockRatio] = useState(true);
    const [outputFormat, setOutputFormat] = useState("image/png");
    const [quality, setQuality] = useState(90);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    function processFile(file: File) {
        setError("");
        setOutputInfo(null);

        if (!file.type.startsWith("image/")) {
            setError(t.imageResizer.invalidImage);
            return;
        }

        if (imageInfo?.previewUrl) {
            URL.revokeObjectURL(imageInfo.previewUrl);
        }

        if (outputInfo?.previewUrl) {
            URL.revokeObjectURL(outputInfo.previewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            setImageInfo({
                name: file.name,
                type: file.type,
                width: image.naturalWidth,
                height: image.naturalHeight,
                previewUrl,
            });

            setNewWidth(image.naturalWidth);
            setNewHeight(image.naturalHeight);
        };

        image.onerror = () => {
            setError(t.imageResizer.readError);
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

    function handleWidthChange(value: number) {
        setNewWidth(value);

        if (lockRatio && imageInfo && imageInfo.width > 0) {
            const ratio = imageInfo.height / imageInfo.width;
            setNewHeight(Math.round(value * ratio));
        }
    }

    function handleHeightChange(value: number) {
        setNewHeight(value);

        if (lockRatio && imageInfo && imageInfo.height > 0) {
            const ratio = imageInfo.width / imageInfo.height;
            setNewWidth(Math.round(value * ratio));
        }
    }

    function resizeImage() {
        if (!imageInfo) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const image = new Image();

        image.onload = () => {
            canvas.width = newWidth;
            canvas.height = newHeight;

            const context = canvas.getContext("2d");
            if (!context) return;

            context.clearRect(0, 0, newWidth, newHeight);
            context.drawImage(image, 0, 0, newWidth, newHeight);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return;

                    if (outputInfo?.previewUrl) {
                        URL.revokeObjectURL(outputInfo.previewUrl);
                    }

                    const previewUrl = URL.createObjectURL(blob);

                    setOutputInfo({
                        previewUrl,
                        width: newWidth,
                        height: newHeight,
                        format: outputFormat,
                    });
                },
                outputFormat,
                quality / 100
            );
        };

        image.src = imageInfo.previewUrl;
    }

    function downloadImage() {
        if (!outputInfo) return;

        const extension =
            outputFormat === "image/jpeg"
                ? "jpg"
                : outputFormat === "image/webp"
                    ? "webp"
                    : "png";

        const baseName = imageInfo?.name.replace(/\.[^/.]+$/, "") || "image";

        const link = document.createElement("a");
        link.href = outputInfo.previewUrl;
        link.download = `${baseName}-resized.${extension}`;
        link.click();
    }

    function clearImage() {
        if (imageInfo?.previewUrl) {
            URL.revokeObjectURL(imageInfo.previewUrl);
        }

        if (outputInfo?.previewUrl) {
            URL.revokeObjectURL(outputInfo.previewUrl);
        }

        setImageInfo(null);
        setOutputInfo(null);
        setNewWidth(0);
        setNewHeight(0);
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
                    ↔️
                </div>

                <h2 className="text-xl font-semibold">{t.imageResizer.uploadTitle}</h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {t.imageResizer.uploadDescription}
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]">
                    {t.imageResizer.chooseImage}
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
                        <SectionTitle
                            title={t.imageResizer.originalImage}
                            right={
                                <button
                                    onClick={clearImage}
                                    className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                                >
                                    {t.common.clear}
                                </button>
                            }
                        />

                        <div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-4">
                            <img
                                src={imageInfo.previewUrl}
                                alt={imageInfo.name}
                                className="max-h-80 max-w-full rounded-xl object-contain"
                            />
                        </div>

                        <div className="mt-4 space-y-1 text-sm text-gray-500">
                            <p className="break-all">{imageInfo.name}</p>
                            <p>
                                {t.imageResizer.originalSize}: {imageInfo.width}px ×{" "}
                                {imageInfo.height}px
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <SectionTitle title={t.imageResizer.resizedOutput} />

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.imageResizer.newWidth}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newWidth}
                                    onChange={(event) =>
                                        handleWidthChange(Number(event.target.value))
                                    }
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.imageResizer.newHeight}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newHeight}
                                    onChange={(event) =>
                                        handleHeightChange(Number(event.target.value))
                                    }
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>
                        </div>

                        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <input
                                type="checkbox"
                                checked={lockRatio}
                                onChange={(event) => setLockRatio(event.target.checked)}
                                className="h-4 w-4 accent-[#F28C6F]"
                            />
                            {t.imageResizer.lockAspectRatio}
                        </label>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.imageResizer.outputFormat}
                                </label>

                                <select
                                    value={outputFormat}
                                    onChange={(event) => setOutputFormat(event.target.value)}
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                >
                                    <option value="image/png">PNG</option>
                                    <option value="image/jpeg">JPEG</option>
                                    <option value="image/webp">WebP</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.imageResizer.quality}: {quality}%
                                </label>

                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={quality}
                                    onChange={(event) => setQuality(Number(event.target.value))}
                                    disabled={outputFormat === "image/png"}
                                    className="w-full accent-[#F28C6F] disabled:opacity-40"
                                />
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={resizeImage}
                                className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {t.imageResizer.resizeImage}
                            </button>

                            <button
                                onClick={downloadImage}
                                disabled={!outputInfo}
                                className="rounded-xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {t.imageResizer.downloadImage}
                            </button>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {t.common.localProcessing}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {t.imageResizer.localProcessingDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {outputInfo && (
                <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <SectionTitle title={t.imageResizer.resizedOutput} />

                    <div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-4">
                        <img
                            src={outputInfo.previewUrl}
                            alt={t.imageResizer.resizedOutput}
                            className="max-h-80 max-w-full rounded-xl object-contain"
                        />
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        {outputInfo.width}px × {outputInfo.height}px
                    </p>
                </div>
            )}

            {!outputInfo && imageInfo && (
                <div className="rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center text-sm text-gray-500">
                    {t.imageResizer.noOutput}
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}