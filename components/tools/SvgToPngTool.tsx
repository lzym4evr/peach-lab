"use client";

import { useState } from "react";
import { t } from "@/data/messages";

type SvgInfo = {
    name: string;
    size: number;
    content: string;
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

export default function SvgToPngTool() {
    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    function processSvgFile(file: File) {
        setError("");

        if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
            setError(t.svgToPng.invalidSvg);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const content = String(reader.result || "");

            if (!content.includes("<svg")) {
                setError(t.svgToPng.invalidSvgContent);
                return;
            }

            if (svgInfo?.previewUrl) {
                URL.revokeObjectURL(svgInfo.previewUrl);
            }

            const blob = new Blob([content], { type: "image/svg+xml" });
            const previewUrl = URL.createObjectURL(blob);

            setSvgInfo({
                name: file.name,
                size: file.size,
                content,
                previewUrl,
            });
        };

        reader.onerror = () => {
            setError(t.svgToPng.readError);
        };

        reader.readAsText(file);
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processSvgFile(file);
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

        processSvgFile(file);
    }

    function clearSvg() {
        if (svgInfo?.previewUrl) {
            URL.revokeObjectURL(svgInfo.previewUrl);
        }

        setSvgInfo(null);
        setError("");
    }

    function downloadPng() {
        if (!svgInfo) return;

        const image = new Image();
        const svgBlob = new Blob([svgInfo.content], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
                setError(t.svgToPng.canvasUnsupported);
                URL.revokeObjectURL(url);
                return;
            }

            context.clearRect(0, 0, width, height);
            context.drawImage(image, 0, 0, width, height);

            const pngUrl = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = svgInfo.name.replace(/\.svg$/i, "") + ".png";
            link.click();

            URL.revokeObjectURL(url);
        };

        image.onerror = () => {
            setError(t.svgToPng.convertError);
            URL.revokeObjectURL(url);
        };

        image.src = url;
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
                    📄
                </div>

                <h2 className="text-xl font-semibold">{t.svgToPng.uploadTitle}</h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {t.svgToPng.uploadDescription}
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]">
                    {t.svgToPng.chooseSvg}
                </div>

                <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </label>

            {svgInfo && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {t.svgToPng.svgPreview}
                            </h3>

                            <button
                                onClick={clearSvg}
                                className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                            >
                                {t.common.clear}
                            </button>
                        </div>

                        <div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-6">
                            <img
                                src={svgInfo.previewUrl}
                                alt={svgInfo.name}
                                className="max-h-80 max-w-full object-contain"
                            />
                        </div>

                        <div className="mt-4 space-y-1 text-sm text-gray-500">
                            <p className="break-all">{svgInfo.name}</p>
                            <p>{formatFileSize(svgInfo.size)}</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">
                            {t.svgToPng.exportPng}
                        </h3>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.svgToPng.width}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={width}
                                    onChange={(event) => setWidth(Number(event.target.value))}
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-800">
                                    {t.svgToPng.height}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={height}
                                    onChange={(event) => setHeight(Number(event.target.value))}
                                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </div>
                        </div>

                        <button
                            onClick={downloadPng}
                            className="mt-6 w-full rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {t.svgToPng.downloadPng}
                        </button>

                        <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {t.common.localProcessing}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {t.svgToPng.localProcessingDescription}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}