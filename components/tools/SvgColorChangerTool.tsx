"use client";

import {
    type ChangeEvent,
    type DragEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
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
    const text = t.svgColorChanger;

    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [svgContent, setSvgContent] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newColor, setNewColor] = useState("#F28C6F");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState("");

    const detectedColors = useMemo(() => {
        return extractHexColors(svgContent);
    }, [svgContent]);

    useEffect(() => {
        if (!svgContent) {
            setPreviewUrl("");
            return;
        }

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const nextPreviewUrl = URL.createObjectURL(blob);

        setPreviewUrl(nextPreviewUrl);

        return () => {
            URL.revokeObjectURL(nextPreviewUrl);
        };
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
            setCopied(false);

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
            setCopied(false);

            return nextRedoHistory;
        });
    }

    function processSvgFile(file: File) {
        setError("");
        setCopied(false);

        if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
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
            setCopied(false);
            setError("");
        };

        reader.onerror = () => {
            setError(text.readError);
        };

        reader.readAsText(file);
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processSvgFile(file);

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
                : colors[0] || "",
        );
        setCopied(false);
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
                : colors[0] || "",
        );
        setCopied(false);
    }

    async function copySvg() {
        if (!svgContent) return;

        await navigator.clipboard.writeText(svgContent);
        setCopied(true);

        window.setTimeout(() => {
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
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                <p className="font-semibold text-[#2A1F1B]">
                    {t.common.localProcessing}
                </p>
                <p className="mt-1 leading-6">
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
                    {text.supportedFormats}
                </p>

                <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:text-sm">
                    {text.dropHint}
                </p>

                <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                    {svgInfo ? text.changeSvg : text.chooseSvg}
                </div>

                <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                    {svgInfo?.name || text.noFileSelected}
                </p>

                {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
            </label>

            {!svgInfo ? (
                <div className="rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center text-sm text-gray-500">
                    {text.emptyState}
                </div>
            ) : null}

            {svgInfo ? (
                <>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <SectionHeader title={text.svgPreview} />

                                <button
                                    type="button"
                                    onClick={clearSvg}
                                    className="shrink-0 rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                                >
                                    {t.common.clear}
                                </button>
                            </div>

                            <div className="mt-4 flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-6 md:min-h-80">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt={svgInfo.name}
                                        className="max-h-72 max-w-full object-contain md:max-h-80"
                                    />
                                ) : null}
                            </div>

                            <div className="mt-4 space-y-1 text-sm text-gray-500">
                                <p className="break-all">{svgInfo.name}</p>
                                <p>{formatFileSize(svgInfo.size)}</p>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                            <SectionHeader title={text.colorControls} />

                            <div className="mt-5 space-y-5">
                                <div>
                                    <p className="mb-3 text-sm font-semibold text-gray-800">
                                        {text.detectedColors}
                                    </p>

                                    {detectedColors.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {detectedColors.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${selectedColor === color
                                                        ? "border-[#F28C6F] bg-[#FFF0EA] text-[#E6765B]"
                                                        : "border-[#F1E5DF] bg-white text-gray-700 hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
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
                                            {text.noColors}
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-800">
                                            {text.originalColor}
                                        </span>

                                        <input
                                            value={selectedColor}
                                            onChange={(event) =>
                                                setSelectedColor(event.target.value.toUpperCase())
                                            }
                                            placeholder="#000000"
                                            className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                        />
                                    </label>

                                    <ColorInput
                                        label={text.newColor}
                                        value={newColor}
                                        fallback="#F28C6F"
                                        onChange={setNewColor}
                                    />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={replaceSelectedColor}
                                        disabled={!selectedColor}
                                        className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {text.replaceColor}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={replaceAllColors}
                                        disabled={detectedColors.length === 0}
                                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {text.replaceAllColors}
                                    </button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={undoLastChange}
                                        disabled={history.length === 0}
                                        className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {text.undo}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={redoLastChange}
                                        disabled={redoHistory.length === 0}
                                        className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {text.redo}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={downloadSvg}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                                >
                                    {text.downloadSvg}
                                </button>
                            </div>
                        </section>
                    </div>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <SectionHeader title={text.svgCode} />

                            <button
                                type="button"
                                onClick={copySvg}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copied ? t.common.copied : text.copySvg}
                            </button>
                        </div>

                        <textarea
                            value={svgContent}
                            onChange={(event) => {
                                setSvgContent(event.target.value);
                                setCopied(false);
                            }}
                            className="min-h-80 w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                        />
                    </section>
                </>
            ) : null}
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
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
    const colorPickerValue = normalizeHexColor(value) || fallback;

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
                    className="h-12 min-w-0 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}