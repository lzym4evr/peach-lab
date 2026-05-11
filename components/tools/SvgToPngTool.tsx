"use client";

import { useEffect, useRef, useState } from "react";
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
    const text = t.svgToPng;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    const supportedFormats =
        (text as { supportedFormats?: string }).supportedFormats ??
        "Supports SVG files.";

    const dropHint =
        (text as { dropHint?: string }).dropHint ??
        "Drag and drop an SVG here, or click to choose a file.";

    const noFileSelected =
        (text as { noFileSelected?: string }).noFileSelected ??
        "No file selected";

    useEffect(() => {
        return () => {
            if (svgInfo?.previewUrl) {
                URL.revokeObjectURL(svgInfo.previewUrl);
            }
        };
    }, [svgInfo?.previewUrl]);

    function processSvgFile(file: File) {
        setError("");

        if (
            !file.name.toLowerCase().endsWith(".svg") &&
            file.type !== "image/svg+xml"
        ) {
            setError(text.invalidSvg);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const content = String(reader.result || "");

            if (!content.includes("<svg")) {
                setError(text.invalidSvgContent);
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
            setError("");
        };

        reader.onerror = () => {
            setError(text.readError);
        };

        reader.readAsText(file);
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processSvgFile(file);

        event.target.value = "";
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
            const safeWidth = Math.max(1, width);
            const safeHeight = Math.max(1, height);

            const canvas = document.createElement("canvas");
            canvas.width = safeWidth;
            canvas.height = safeHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                setError(text.canvasUnsupported);
                URL.revokeObjectURL(url);
                return;
            }

            context.clearRect(0, 0, safeWidth, safeHeight);
            context.drawImage(image, 0, 0, safeWidth, safeHeight);

            const pngUrl = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = svgInfo.name.replace(/\.svg$/i, "") + ".png";
            link.click();

            URL.revokeObjectURL(url);
        };

        image.onerror = () => {
            setError(text.convertError);
            URL.revokeObjectURL(url);
        };

        image.src = url;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                <p className="font-semibold text-[#2A1F1B]">
                    {t.common.localProcessing}
                </p>
                <p className="mt-2 leading-6 text-gray-500">
                    {text.localProcessingDescription}
                </p>
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
                    {supportedFormats}
                </p>

                <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:mt-3 md:text-sm">
                    {dropHint}
                </p>

                <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                    {text.chooseSvg}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                    {svgInfo?.name || noFileSelected}
                </p>

                {error ? (
                    <p className="mt-4 text-sm font-medium text-red-500">
                        {error}
                    </p>
                ) : null}
            </label>

            {svgInfo ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <SectionHeader title={text.svgPreview} />

                            <button
                                type="button"
                                onClick={clearSvg}
                                className="shrink-0 rounded-xl border border-[#F4C8BA] bg-white px-3 py-2 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {t.common.clear}
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                            <img
                                src={svgInfo.previewUrl}
                                alt={svgInfo.name}
                                className="block max-h-[420px] max-w-full object-contain"
                            />
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-gray-500 sm:grid-cols-2">
                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {text.fileName ?? "File Name"}
                                </p>
                                <p className="mt-1 break-all font-medium text-gray-700">
                                    {svgInfo.name}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {text.fileSize ?? "File Size"}
                                </p>
                                <p className="mt-1 font-medium text-gray-700">
                                    {formatFileSize(svgInfo.size)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <SectionHeader title={text.exportPng} />

                        <div className="mt-5 grid grid-cols-2 gap-4">
                            <NumberInput
                                label={text.width}
                                value={width}
                                min={1}
                                onChange={setWidth}
                            />

                            <NumberInput
                                label={text.height}
                                value={height}
                                min={1}
                                onChange={setHeight}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={downloadPng}
                            className="mt-6 w-full rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                        >
                            {text.downloadPng}
                        </button>
                    </section>
                </div>
            ) : null}
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

function NumberInput({
    label,
    value,
    min,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    onChange: (value: number) => void;
}) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    function handleChange(nextValue: string) {
        setInputValue(nextValue);

        if (nextValue.trim() === "") return;

        const parsedValue = Number(nextValue);

        if (!Number.isNaN(parsedValue)) {
            onChange(Math.max(min, parsedValue));
        }
    }

    return (
        <label className="block min-w-0">
            <span className="mb-2 block truncate text-sm font-semibold text-gray-800">
                {label}
            </span>

            <input
                type="number"
                min={min}
                value={inputValue}
                onChange={(event) => handleChange(event.target.value)}
                onBlur={() => {
                    if (inputValue.trim() === "") {
                        setInputValue(String(value));
                    }
                }}
                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
            />
        </label>
    );
}