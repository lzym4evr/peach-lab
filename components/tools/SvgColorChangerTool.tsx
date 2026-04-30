"use client";

import { useMemo, useState } from "react";
import { t } from "@/data/messages";

type SvgInfo = {
    name: string;
    size: number;
    content: string;
};

function normalizeHexColor(value: string) {
    let color = value.trim();

    if (!color.startsWith("#")) {
        color = `#${color}`;
    }

    if (/^#[0-9a-fA-F]{3}$/.test(color)) {
        const short = color.replace("#", "");
        color = `#${short
            .split("")
            .map((char) => char + char)
            .join("")}`;
    }

    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
        return null;
    }

    return color.toUpperCase();
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function extractHexColors(svgContent: string) {
    const matches = svgContent.match(/#[0-9a-fA-F]{3,6}\b/g) || [];

    const normalized = matches
        .map((color) => normalizeHexColor(color))
        .filter(Boolean) as string[];

    return Array.from(new Set(normalized));
}

function replaceSvgColor(svgContent: string, fromColor: string, toColor: string) {
    const normalizedFrom = normalizeHexColor(fromColor);
    const normalizedTo = normalizeHexColor(toColor);

    if (!normalizedFrom || !normalizedTo) {
        return svgContent;
    }

    const shortFrom = normalizedFrom
        .replace("#", "")
        .match(/^([0-9A-F])\1([0-9A-F])\2([0-9A-F])\3$/);

    const colorPatterns = [normalizedFrom];

    if (shortFrom) {
        colorPatterns.push(`#${shortFrom[1]}${shortFrom[2]}${shortFrom[3]}`);
    }

    let updatedContent = svgContent;

    colorPatterns.forEach((color) => {
        const escapedColor = color.replace("#", "\\#");
        const regex = new RegExp(escapedColor, "gi");
        updatedContent = updatedContent.replace(regex, normalizedTo);
    });

    return updatedContent;
}

export default function SvgColorChangerTool() {
    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [svgContent, setSvgContent] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newColor, setNewColor] = useState("#F28C6F");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);

    const detectedColors = useMemo(() => {
        return extractHexColors(svgContent);
    }, [svgContent]);

    const previewUrl = useMemo(() => {
        if (!svgContent) return "";

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        return URL.createObjectURL(blob);
    }, [svgContent]);

    function saveHistory() {
        if (!svgContent) return;

        setHistory((previousHistory) => [...previousHistory, svgContent]);
        setRedoHistory([]);
    }

    function undoLastChange() {
        setHistory((previousHistory) => {
            if (previousHistory.length === 0) {
                return previousHistory;
            }

            const lastContent = previousHistory[previousHistory.length - 1];
            const nextHistory = previousHistory.slice(0, -1);
            const colors = extractHexColors(lastContent);

            setRedoHistory((previousRedoHistory) => [
                ...previousRedoHistory,
                svgContent,
            ]);

            setSvgContent(lastContent);
            setSelectedColor(colors[0] || "");

            return nextHistory;
        });
    }

    function redoLastChange() {
        setRedoHistory((previousRedoHistory) => {
            if (previousRedoHistory.length === 0) {
                return previousRedoHistory;
            }

            const nextContent = previousRedoHistory[previousRedoHistory.length - 1];
            const nextRedoHistory = previousRedoHistory.slice(0, -1);
            const colors = extractHexColors(nextContent);

            setHistory((previousHistory) => [...previousHistory, svgContent]);

            setSvgContent(nextContent);
            setSelectedColor(colors[0] || "");

            return nextRedoHistory;
        });
    }

    function processSvgFile(file: File) {
        setError("");
        setCopied(false);

        if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
            setError(t.svgColorChanger.invalidSvg);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const content = String(reader.result || "");

            if (!content.includes("<svg")) {
                setError(t.svgColorChanger.invalidSvgContent);
                return;
            }

            const colors = extractHexColors(content);

            setSvgInfo({
                name: file.name,
                size: file.size,
                content,
            });

            setSvgContent(content);
            setSelectedColor(colors[0] || "");
            setHistory([]);
            setRedoHistory([]);
        };

        reader.onerror = () => {
            setError(t.svgColorChanger.readError);
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

    function replaceSelectedColor() {
        if (!selectedColor) return;

        saveHistory();

        const updatedContent = replaceSvgColor(svgContent, selectedColor, newColor);
        const colors = extractHexColors(updatedContent);
        const normalizedNewColor = normalizeHexColor(newColor);

        setSvgContent(updatedContent);
        setSelectedColor(
            normalizedNewColor && colors.includes(normalizedNewColor)
                ? normalizedNewColor
                : colors[0] || ""
        );
    }

    function replaceAllColors() {
        if (detectedColors.length === 0) return;

        saveHistory();

        let updatedContent = svgContent;

        detectedColors.forEach((color) => {
            updatedContent = replaceSvgColor(updatedContent, color, newColor);
        });

        const colors = extractHexColors(updatedContent);
        const normalizedNewColor = normalizeHexColor(newColor);

        setSvgContent(updatedContent);
        setSelectedColor(
            normalizedNewColor && colors.includes(normalizedNewColor)
                ? normalizedNewColor
                : colors[0] || ""
        );
    }

    async function copySvg() {
        await navigator.clipboard.writeText(svgContent);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    }

    function downloadSvg() {
        if (!svgInfo) return;

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const baseName = svgInfo.name.replace(/\.svg$/i, "");

        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}-updated.svg`;
        link.click();

        URL.revokeObjectURL(url);
    }

    function clearSvg() {
        setSvgInfo(null);
        setSvgContent("");
        setSelectedColor("");
        setNewColor("#F28C6F");
        setError("");
        setCopied(false);
        setHistory([]);
        setRedoHistory([]);
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
                    🎛️
                </div>

                <h2 className="text-xl font-semibold">
                    {t.svgColorChanger.uploadTitle}
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {t.svgColorChanger.uploadDescription}
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]">
                    {t.svgColorChanger.chooseSvg}
                </div>

                <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </label>

            {!svgInfo && (
                <div className="rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center text-sm text-gray-500">
                    {t.svgColorChanger.emptyState}
                </div>
            )}

            {svgInfo && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {t.svgColorChanger.svgPreview}
                            </h3>

                            <button
                                onClick={clearSvg}
                                className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                            >
                                {t.common.clear}
                            </button>
                        </div>

                        <div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-6">
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt={svgInfo.name}
                                    className="max-h-80 max-w-full object-contain"
                                />
                            )}
                        </div>

                        <div className="mt-4 space-y-1 text-sm text-gray-500">
                            <p className="break-all">{svgInfo.name}</p>
                            <p>{formatFileSize(svgInfo.size)}</p>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {t.common.localProcessing}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {t.svgColorChanger.localProcessingDescription}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900">
                            {t.svgColorChanger.colorControls}
                        </h3>

                        <div className="mt-5 space-y-5">
                            <div>
                                <p className="mb-3 text-sm font-semibold text-gray-800">
                                    {t.svgColorChanger.detectedColors}
                                </p>

                                {detectedColors.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {detectedColors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${selectedColor === color
                                                    ? "border-[#F28C6F] bg-[#FFF0EA] text-[#E6765B]"
                                                    : "border-[#F1E5DF] bg-white text-gray-700 hover:border-[#F28C6F]"
                                                    }`}
                                            >
                                                <span
                                                    className="h-5 w-5 rounded-md border border-[#F1E5DF]"
                                                    style={{ backgroundColor: color }}
                                                />
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-5 text-sm text-gray-500">
                                        {t.svgColorChanger.noColors}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                                        {t.svgColorChanger.originalColor}
                                    </label>

                                    <input
                                        value={selectedColor}
                                        onChange={(event) => setSelectedColor(event.target.value)}
                                        placeholder="#000000"
                                        className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                                        {t.svgColorChanger.newColor}
                                    </label>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={normalizeHexColor(newColor) || "#F28C6F"}
                                            onChange={(event) =>
                                                setNewColor(event.target.value.toUpperCase())
                                            }
                                            className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                                        />

                                        <input
                                            value={newColor}
                                            onChange={(event) => setNewColor(event.target.value)}
                                            className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={replaceSelectedColor}
                                    disabled={!selectedColor}
                                    className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t.svgColorChanger.replaceColor}
                                </button>

                                <button
                                    onClick={replaceAllColors}
                                    disabled={detectedColors.length === 0}
                                    className="rounded-xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t.svgColorChanger.replaceAllColors}
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={undoLastChange}
                                    disabled={history.length === 0}
                                    className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t.svgColorChanger.undo}
                                </button>

                                <button
                                    onClick={redoLastChange}
                                    disabled={redoHistory.length === 0}
                                    className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {t.svgColorChanger.redo}
                                </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={copySvg}
                                    className="rounded-xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#F28C6F]"
                                >
                                    {copied ? t.common.copied : t.svgColorChanger.copySvg}
                                </button>

                                <button
                                    onClick={downloadSvg}
                                    className="rounded-xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                                >
                                    {t.svgColorChanger.downloadSvg}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {svgInfo && (
                <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <h3 className="font-semibold text-gray-900">
                            {t.svgColorChanger.svgCode}
                        </h3>

                        <button
                            onClick={copySvg}
                            className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                        >
                            {copied ? t.common.copied : t.common.copy}
                        </button>
                    </div>

                    <textarea
                        value={svgContent}
                        onChange={(event) => setSvgContent(event.target.value)}
                        className="min-h-80 w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                    />
                </div>
            )}
        </div>
    );
}