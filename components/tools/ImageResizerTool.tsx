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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
    const [outputInfo, setOutputInfo] = useState<OutputInfo | null>(null);
    const [newWidth, setNewWidth] = useState(0);
    const [newHeight, setNewHeight] = useState(0);
    const [lockRatio, setLockRatio] = useState(true);
    const [outputFormat, setOutputFormat] = useState("image/png");
    const [quality, setQuality] = useState(90);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        return () => {
            if (imageInfo?.previewUrl) {
                URL.revokeObjectURL(imageInfo.previewUrl);
            }

            if (outputInfo?.previewUrl) {
                URL.revokeObjectURL(outputInfo.previewUrl);
            }
        };
    }, [imageInfo?.previewUrl, outputInfo?.previewUrl]);

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
                type: file.type || "image/*",
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

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processFile(file);
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

        processFile(file);
    }

    function handleWidthChange(value: number) {
        if (!Number.isFinite(value) || value <= 0) {
            setNewWidth(0);
            return;
        }

        setNewWidth(value);

        if (lockRatio && imageInfo && imageInfo.width > 0) {
            const ratio = imageInfo.height / imageInfo.width;
            setNewHeight(Math.max(1, Math.round(value * ratio)));
        }
    }

    function handleHeightChange(value: number) {
        if (!Number.isFinite(value) || value <= 0) {
            setNewHeight(0);
            return;
        }

        setNewHeight(value);

        if (lockRatio && imageInfo && imageInfo.height > 0) {
            const ratio = imageInfo.width / imageInfo.height;
            setNewWidth(Math.max(1, Math.round(value * ratio)));
        }
    }

    function resizeImage() {
        if (!imageInfo || newWidth <= 0 || newHeight <= 0) return;

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

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const canResize = !!imageInfo && newWidth > 0 && newHeight > 0;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                <p className="font-semibold text-[#2A1F1B]">
                    {t.common.localProcessing}
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                    {t.imageResizer.localProcessingDescription}
                </p>
            </div>

            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block cursor-pointer rounded-3xl border-2 border-dashed px-6 py-8 text-center transition md:px-8 md:py-10 ${isDragging
                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                    : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <h2 className="mx-auto mt-6 max-w-xl text-2xl font-semibold leading-tight text-[#2A1F1B] md:text-3xl">
                    {t.imageResizer.uploadTitle}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
                    {t.imageResizer.uploadDescription}
                </p>

                <p className="mx-auto mt-4 max-w-2xl text-xs font-medium leading-6 text-[#A17F74] md:text-sm">
                    {t.imageResizer.supportedFormats}
                </p>

                <div className="mt-7 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:px-8 md:py-3.5 md:text-base">
                    {t.imageResizer.chooseImage}
                </div>

                <p className="mt-5 break-all text-sm text-gray-500">
                    {imageInfo?.name || t.imageResizer.noFileSelected}
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
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <div className="space-y-6">
                        <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <SectionTitle title={t.imageResizer.originalImage} />

                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="rounded-2xl border border-[#F1E5DF] bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                                >
                                    {t.common.clear}
                                </button>
                            </div>

                            <div className="mt-4 rounded-2xl bg-[#FFFDFC] p-3 md:p-4">
                                <div className="flex justify-center">
                                    <img
                                        src={imageInfo.previewUrl}
                                        alt={imageInfo.name}
                                        className="max-h-[360px] w-auto max-w-full rounded-xl object-contain"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-gray-500">
                                <p className="break-all">{imageInfo.name}</p>
                                <p>
                                    {t.imageResizer.originalSize}: {imageInfo.width}px ×{" "}
                                    {imageInfo.height}px
                                </p>
                            </div>
                        </div>

                        {outputInfo && (
                            <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <SectionTitle title={t.imageResizer.resizedOutput} />

                                <div className="mt-4 rounded-2xl bg-[#FFFDFC] p-3 md:p-4">
                                    <div className="flex justify-center">
                                        <img
                                            src={outputInfo.previewUrl}
                                            alt={t.imageResizer.resizedOutput}
                                            className="max-h-[360px] w-auto max-w-full rounded-xl object-contain"
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-sm text-gray-500">
                                    {outputInfo.width}px × {outputInfo.height}px
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <SectionTitle title={t.imageResizer.resizeSettings} />

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                                        {t.imageResizer.newWidth}
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newWidth || ""}
                                        onChange={(event) =>
                                            handleWidthChange(Number(event.target.value))
                                        }
                                        className="h-12 w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 text-sm text-[#2A1F1B] outline-none transition focus:border-[#F28C6F]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                                        {t.imageResizer.newHeight}
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={newHeight || ""}
                                        onChange={(event) =>
                                            handleHeightChange(Number(event.target.value))
                                        }
                                        className="h-12 w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 text-sm text-[#2A1F1B] outline-none transition focus:border-[#F28C6F]"
                                    />
                                </div>
                            </div>

                            <label className="mt-4 flex items-center gap-3 text-sm text-[#2A1F1B]">
                                <input
                                    type="checkbox"
                                    checked={lockRatio}
                                    onChange={(event) => setLockRatio(event.target.checked)}
                                    className="h-4 w-4 rounded border-[#F4C8BA] text-[#F28C6F] focus:ring-[#F28C6F]"
                                />
                                <span>{t.imageResizer.lockAspectRatio}</span>
                            </label>

                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                                    {t.imageResizer.outputFormat}
                                </label>

                                <select
                                    value={outputFormat}
                                    onChange={(event) =>
                                        setOutputFormat(event.target.value)
                                    }
                                    className="h-12 w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 text-sm text-[#2A1F1B] outline-none transition focus:border-[#F28C6F]"
                                >
                                    <option value="image/png">PNG</option>
                                    <option value="image/jpeg">JPEG</option>
                                    <option value="image/webp">WebP</option>
                                </select>
                            </div>

                            <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-[#2A1F1B]">
                                        {t.imageResizer.quality}
                                    </label>
                                    <span className="text-sm text-gray-500">{quality}%</span>
                                </div>

                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="1"
                                    value={quality}
                                    onChange={(event) =>
                                        setQuality(Number(event.target.value))
                                    }
                                    className="block w-full accent-[#F28C6F]"
                                />
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={resizeImage}
                                    disabled={!canResize}
                                    className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${canResize
                                        ? "bg-[#F28C6F] text-white hover:bg-[#E6765B]"
                                        : "cursor-not-allowed bg-[#F8D9CF] text-white"
                                        }`}
                                >
                                    {t.imageResizer.resize}
                                </button>

                                <button
                                    type="button"
                                    onClick={downloadImage}
                                    disabled={!outputInfo}
                                    className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${outputInfo
                                        ? "bg-[#F28C6F] text-white hover:bg-[#E6765B]"
                                        : "cursor-not-allowed bg-[#F8D9CF] text-white"
                                        }`}
                                >
                                    {t.imageResizer.download}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}