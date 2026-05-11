"use client";

import {
    type ChangeEvent,
    type DragEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type SvgInfo = {
    name: string;
    size: number;
};

function normalizeHexColor(value: string) {
    let color = value.trim();

    if (!color) return null;

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

const checkerboardStyle = {
    backgroundColor: "#FFFFFF",
    backgroundImage:
        "linear-gradient(45deg, #F1E5DF 25%, transparent 25%), linear-gradient(-45deg, #F1E5DF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F1E5DF 75%), linear-gradient(-45deg, transparent 75%, #F1E5DF 75%)",
    backgroundSize: "18px 18px",
    backgroundPosition: "0 0, 0 9px, 9px -9px, -9px 0px",
} as const;

const miniCheckerboardStyle = {
    backgroundColor: "#FFFFFF",
    backgroundImage:
        "linear-gradient(45deg, #F1E5DF 25%, transparent 25%), linear-gradient(-45deg, #F1E5DF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F1E5DF 75%), linear-gradient(-45deg, transparent 75%, #F1E5DF 75%)",
    backgroundSize: "14px 14px",
    backgroundPosition: "0 0, 0 7px, 7px -7px, -7px 0px",
} as const;

export default function SvgColorChangerTool() {
    const text = t.svgColorChanger;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [svgContent, setSvgContent] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newColor, setNewColor] = useState("#F28C6F");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copiedKey, setCopiedKey] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const detectedColors = useMemo(() => {
        return extractHexColors(svgContent);
    }, [svgContent]);

    useEffect(() => {
        if (!svgContent) {
            setPreviewUrl("");
            return;
        }

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [svgContent]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function setTemporaryCopied(key: string) {
        setCopiedKey(key);

        if (copyTimerRef.current) {
            clearTimeout(copyTimerRef.current);
        }

        copyTimerRef.current = setTimeout(() => {
            setCopiedKey("");
        }, 1500);
    }

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
        setCopiedKey("");

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

            const colors = extractHexColors(content);

            setSvgInfo({
                name: file.name,
                size: file.size,
            });

            setSvgContent(content);
            setSelectedColor(colors[0] || "");
            setHistory([]);
            setRedoHistory([]);
            setCopiedKey("");
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
        const normalizedSelectedColor = normalizeHexColor(selectedColor);
        const normalizedNewColor = normalizeHexColor(newColor);

        if (!normalizedSelectedColor || !normalizedNewColor) return;

        saveHistory();

        const updatedContent = replaceSvgColor(
            svgContent,
            normalizedSelectedColor,
            normalizedNewColor,
        );
        const colors = extractHexColors(updatedContent);

        setSvgContent(updatedContent);
        setSelectedColor(
            colors.includes(normalizedNewColor)
                ? normalizedNewColor
                : colors[0] || "",
        );
    }

    function replaceAllColors() {
        const normalizedNewColor = normalizeHexColor(newColor);

        if (!normalizedNewColor || detectedColors.length === 0) return;

        saveHistory();

        let updatedContent = svgContent;

        detectedColors.forEach((color) => {
            updatedContent = replaceSvgColor(updatedContent, color, normalizedNewColor);
        });

        const colors = extractHexColors(updatedContent);

        setSvgContent(updatedContent);
        setSelectedColor(
            colors.includes(normalizedNewColor)
                ? normalizedNewColor
                : colors[0] || "",
        );
    }

    async function copySvg() {
        try {
            await navigator.clipboard.writeText(svgContent);
            setTemporaryCopied("svg");
        } catch {
            setError(text.copyError);
        }
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
        setCopiedKey("");
        setHistory([]);
        setRedoHistory([]);
        setIsMobileSettingsOpen(false);
    }

    const hasSvg = Boolean(svgInfo && svgContent);

    const controlsPanel = (
        <ColorControlsPanel
            text={text}
            detectedColors={detectedColors}
            selectedColor={selectedColor}
            newColor={newColor}
            historyLength={history.length}
            redoLength={redoHistory.length}
            onSelectColor={setSelectedColor}
            onChangeSelectedColor={(value) => setSelectedColor(value.toUpperCase())}
            onChangeNewColor={(value) => setNewColor(value.toUpperCase())}
            onReplaceSelected={replaceSelectedColor}
            onReplaceAll={replaceAllColors}
            onUndo={undoLastChange}
            onRedo={redoLastChange}
        />
    );

    return (
        <>
            <div className="space-y-6 pb-28 lg:pb-0">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 md:p-5">
                    <p className="text-sm font-semibold text-gray-800">
                        {t.common.localProcessing}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {text.localProcessingDescription}
                    </p>
                </div>

                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`block cursor-pointer rounded-3xl border-2 border-dashed p-4 text-center transition md:p-8 ${isDragging
                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                        : "border-[#F4C8BA] bg-[#FFF7F3]"
                        }`}
                >
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {text.uploadTitle}
                    </h2>

                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:mt-3">
                        {text.uploadDescription}
                    </p>

                    <p className="mt-2 text-sm font-medium text-[#C4836C] md:mt-3">
                        {text.supportedFormats}
                    </p>

                    <p className="mt-2 text-sm text-gray-500 md:mt-3">
                        {text.dropHint}
                    </p>

                    <div className="mt-4 md:mt-5">
                        <span className="inline-flex rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]">
                            {text.chooseSvg}
                        </span>
                    </div>

                    <input
                        type="file"
                        accept=".svg,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <p className="mt-3 text-sm text-gray-500">
                        {svgInfo ? svgInfo.name : text.noFileSelected}
                    </p>

                    {error ? (
                        <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                    ) : null}
                </label>

                {hasSvg ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                        <div className="min-w-0 space-y-6">
                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgPreview} />

                                    <button
                                        type="button"
                                        onClick={clearSvg}
                                        className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:text-[#E6765B]"
                                    >
                                        {t.common.clear}
                                    </button>
                                </div>

                                <div
                                    className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-2xl border border-[#F1E5DF] p-6 md:min-h-[320px]"
                                    style={checkerboardStyle}
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt={svgInfo?.name || text.svgPreview}
                                            className="max-h-[240px] max-w-full object-contain md:max-h-[300px]"
                                        />
                                    ) : null}
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-gray-500">
                                    <p className="break-all">{svgInfo?.name || ""}</p>
                                    <p>{svgInfo ? formatFileSize(svgInfo.size) : ""}</p>
                                    <p>{text.previewHint}</p>
                                </div>
                            </section>

                            <section className="md:hidden">
                                <div className="rounded-3xl border border-[#F1E5DF] bg-white p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between gap-4">
                                        <SectionHeader title={text.svgCode} />

                                        <button
                                            type="button"
                                            onClick={copySvg}
                                            className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                        >
                                            {copiedKey === "svg" ? t.common.copied : text.copySvg}
                                        </button>
                                    </div>

                                    <textarea
                                        value={svgContent}
                                        onChange={(event) => setSvgContent(event.target.value)}
                                        className="min-h-[220px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                    />
                                </div>
                            </section>

                            <section className="hidden md:block md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgCode} />

                                    <button
                                        type="button"
                                        onClick={copySvg}
                                        className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                    >
                                        {copiedKey === "svg" ? t.common.copied : text.copySvg}
                                    </button>
                                </div>

                                <textarea
                                    value={svgContent}
                                    onChange={(event) => setSvgContent(event.target.value)}
                                    className="min-h-[320px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </section>
                        </div>

                        <section className="hidden rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                            <SectionHeader title={text.colorControls} />
                            <div className="mt-5 space-y-5">
                                {controlsPanel}

                                <button
                                    type="button"
                                    onClick={downloadSvg}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {text.downloadSvg}
                                </button>
                            </div>
                        </section>
                    </div>
                ) : null}
            </div>

            {hasSvg ? (
                <>
                    <MobileActionBar
                        settingsButtonText={text.settingsButton}
                        downloadButtonText={text.downloadButton}
                        onOpenSettings={() => setIsMobileSettingsOpen(true)}
                        onDownload={downloadSvg}
                    />

                    {isMobileSettingsOpen ? (
                        <MobileSettingsSheet
                            title={text.colorControls}
                            onClose={() => setIsMobileSettingsOpen(false)}
                        >
                            <div className="sticky top-0 z-10 bg-white pb-3">
                                <SvgMiniPreview
                                    previewUrl={previewUrl}
                                    fileName={svgInfo?.name || ""}
                                    previewHint={text.previewHint}
                                />
                            </div>

                            <div className="space-y-4">
                                {controlsPanel}

                                <button
                                    type="button"
                                    onClick={downloadSvg}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {text.downloadSvg}
                                </button>
                            </div>
                        </MobileSettingsSheet>
                    ) : null}
                </>
            ) : null}
        </>
    );
}

function ColorControlsPanel({
    text,
    detectedColors,
    selectedColor,
    newColor,
    historyLength,
    redoLength,
    onSelectColor,
    onChangeSelectedColor,
    onChangeNewColor,
    onReplaceSelected,
    onReplaceAll,
    onUndo,
    onRedo,
}: {
    text: typeof t.svgColorChanger;
    detectedColors: string[];
    selectedColor: string;
    newColor: string;
    historyLength: number;
    redoLength: number;
    onSelectColor: (color: string) => void;
    onChangeSelectedColor: (value: string) => void;
    onChangeNewColor: (value: string) => void;
    onReplaceSelected: () => void;
    onReplaceAll: () => void;
    onUndo: () => void;
    onRedo: () => void;
}) {
    const safeNewColor = normalizeHexColor(newColor) || "#F28C6F";

    return (
        <div className="space-y-5">
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <h4 className="text-sm font-semibold text-gray-900">
                    {text.chooseColorToReplace}
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    {text.transparencyHint}
                </p>

                <div className="mt-4">
                    {detectedColors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {detectedColors.map((color) => {
                                const isActive = selectedColor === color;

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => onSelectColor(color)}
                                        className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${isActive
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
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-4 text-sm text-gray-500">
                            {text.noColors}
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                            {text.originalColor}
                        </label>

                        <input
                            value={selectedColor}
                            onChange={(event) =>
                                onChangeSelectedColor(event.target.value.toUpperCase())
                            }
                            placeholder="#000000"
                            className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                            {text.newColor}
                        </label>

                        <p className="mb-2 text-sm leading-6 text-gray-500">
                            {text.newColorDescription}
                        </p>

                        <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                            <input
                                type="color"
                                value={safeNewColor}
                                onChange={(event) =>
                                    onChangeNewColor(event.target.value.toUpperCase())
                                }
                                className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                            />

                            <input
                                value={newColor}
                                onChange={(event) =>
                                    onChangeNewColor(event.target.value.toUpperCase())
                                }
                                className="h-12 min-w-0 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={onReplaceSelected}
                        disabled={!normalizeHexColor(selectedColor)}
                        className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {text.replaceColor}
                    </button>

                    <button
                        type="button"
                        onClick={onReplaceAll}
                        disabled={detectedColors.length === 0}
                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {text.replaceAllColors}
                    </button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={historyLength === 0}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {text.undo}
                </button>

                <button
                    type="button"
                    onClick={onRedo}
                    disabled={redoLength === 0}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {text.redo}
                </button>
            </div>
        </div>
    );
}

function SvgMiniPreview({
    previewUrl,
    fileName,
    previewHint,
}: {
    previewUrl: string;
    fileName: string;
    previewHint: string;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
                <span className="h-7 w-1.5 rounded-full bg-[#F28C6F]" />
                <h3 className="text-base font-semibold text-gray-900">{fileName}</h3>
            </div>

            <div
                className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#F1E5DF] p-3"
                style={miniCheckerboardStyle}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={fileName}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : null}
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">{previewHint}</p>
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

function MobileActionBar({
    settingsButtonText,
    downloadButtonText,
    onOpenSettings,
    onDownload,
}: {
    settingsButtonText: string;
    downloadButtonText: string;
    onOpenSettings: () => void;
    onDownload: () => void;
}) {
    const actionBarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateSpace = () => {
            const element = actionBarRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();

            document.documentElement.style.setProperty(
                "--mobile-action-bar-space",
                `${Math.ceil(rect.height + 24)}px`,
            );
        };

        const timer = window.setTimeout(updateSpace, 0);
        window.addEventListener("resize", updateSpace);

        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("resize", updateSpace);
            document.documentElement.style.removeProperty(
                "--mobile-action-bar-space",
            );
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[60] px-3 lg:hidden">
            <div
                ref={actionBarRef}
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-2 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF7F3]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {downloadButtonText}
                </button>
            </div>
        </div>
    );
}

function MobileSettingsSheet({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="h-7 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />
                        <h3 className="truncate text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-2xl font-semibold leading-none text-[#2A1F1B] transition hover:bg-[#FFF0EA]"
                    >
                        ×
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}