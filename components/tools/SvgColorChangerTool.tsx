"use client";

import {
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

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [svgContent, setSvgContent] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newColor, setNewColor] = useState("#F28C6F");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const localProcessingTitle =
        (t.common as { localProcessing?: string }).localProcessing ??
        "Local processing";

    const dropHint =
        (text as { dropHint?: string }).dropHint ??
        "Drag and drop an SVG here, or click to choose a file.";

    const supportedFormats =
        (text as { supportedFormats?: string }).supportedFormats ??
        "Supports SVG files.";

    const noFileSelected =
        (text as { noFileSelected?: string }).noFileSelected ??
        "No file selected";

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionCopyText =
        (text as { actionCopy?: string }).actionCopy ?? "Copy";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const chooseColorToReplace =
        (text as { chooseColorToReplace?: string }).chooseColorToReplace ??
        "Choose color to replace";

    const newColorHint =
        (text as { newColorHint?: string }).newColorHint ??
        "Pick the new color you want to use.";

    const replaceSelectedColorText =
        (text as { replaceSelectedColor?: string }).replaceSelectedColor ??
        "Replace Selected Color";

    const detectedColors = useMemo(() => {
        return extractHexColors(svgContent);
    }, [svgContent]);

    const previewUrl = useMemo(() => {
        if (!svgContent) return "";

        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        return URL.createObjectURL(blob);
    }, [svgContent]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

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
            setError("");
            setCopied(false);
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
    }

    async function copySvg() {
        if (!svgContent) return;

        await navigator.clipboard.writeText(svgContent);
        setCopied(true);

        if (copyTimerRef.current) {
            clearTimeout(copyTimerRef.current);
        }

        copyTimerRef.current = setTimeout(() => {
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
        setIsMobileSettingsOpen(false);
    }

    const desktopColorControlsPanel = (
        <ColorControlsPanel
            text={text}
            chooseColorToReplace={chooseColorToReplace}
            newColorHint={newColorHint}
            replaceSelectedColorText={replaceSelectedColorText}
            detectedColors={detectedColors}
            selectedColor={selectedColor}
            newColor={newColor}
            copied={copied}
            canUndo={history.length > 0}
            canRedo={redoHistory.length > 0}
            onSelectColor={setSelectedColor}
            onChangeNewColor={setNewColor}
            onReplaceSelected={replaceSelectedColor}
            onReplaceAll={replaceAllColors}
            onUndo={undoLastChange}
            onRedo={redoLastChange}
            onDownload={downloadSvg}
            onCopy={copySvg}
        />
    );

    const mobileColorControlsPanel = (
        <ColorControlsPanel
            text={text}
            chooseColorToReplace={chooseColorToReplace}
            newColorHint={newColorHint}
            replaceSelectedColorText={replaceSelectedColorText}
            detectedColors={detectedColors}
            selectedColor={selectedColor}
            newColor={newColor}
            copied={copied}
            canUndo={history.length > 0}
            canRedo={redoHistory.length > 0}
            onSelectColor={setSelectedColor}
            onChangeNewColor={setNewColor}
            onReplaceSelected={replaceSelectedColor}
            onReplaceAll={replaceAllColors}
            onUndo={undoLastChange}
            onRedo={redoLastChange}
            onDownload={downloadSvg}
            onCopy={copySvg}
            compact
            hideHeader
        />
    );

    return (
        <>
            <div className="space-y-6">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                    <p className="font-semibold text-[#2A1F1B]">
                        {localProcessingTitle}
                    </p>
                    <p className="mt-2 leading-6">
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
                        {svgInfo ? text.chooseSvg : text.chooseSvg}
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
                        <div className="min-w-0 space-y-6">
                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgPreview} />

                                    <button
                                        type="button"
                                        onClick={clearSvg}
                                        className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
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

                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgCode} />

                                    <button
                                        type="button"
                                        onClick={copySvg}
                                        className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                    >
                                        {copied ? t.common.copied : t.common.copy}
                                    </button>
                                </div>

                                <textarea
                                    value={svgContent}
                                    onChange={(event) => setSvgContent(event.target.value)}
                                    className="min-h-72 w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:min-h-80"
                                />
                            </section>
                        </div>

                        <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                            {desktopColorControlsPanel}
                        </section>
                    </div>
                ) : null}
            </div>

            {svgInfo ? (
                <MobileActionBar
                    settingsText={settingsButtonText}
                    copyText={copied ? t.common.copied : actionCopyText}
                    downloadText={actionDownloadText}
                    onOpenSettings={() => setIsMobileSettingsOpen(true)}
                    onCopy={copySvg}
                    onDownload={downloadSvg}
                />
            ) : null}

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.colorControls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <div className="sticky top-0 z-10 bg-white pb-3">
                            <SvgMiniPreview
                                previewUrl={previewUrl}
                                fileName={svgInfo?.name || ""}
                                fileSize={svgInfo ? formatFileSize(svgInfo.size) : ""}
                            />
                        </div>

                        {mobileColorControlsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function ColorControlsPanel({
    text,
    chooseColorToReplace,
    newColorHint,
    replaceSelectedColorText,
    detectedColors,
    selectedColor,
    newColor,
    copied,
    canUndo,
    canRedo,
    onSelectColor,
    onChangeNewColor,
    onReplaceSelected,
    onReplaceAll,
    onUndo,
    onRedo,
    onDownload,
    onCopy,
    compact = false,
    hideHeader = false,
}: {
    text: typeof t.svgColorChanger;
    chooseColorToReplace: string;
    newColorHint: string;
    replaceSelectedColorText: string;
    detectedColors: string[];
    selectedColor: string;
    newColor: string;
    copied: boolean;
    canUndo: boolean;
    canRedo: boolean;
    onSelectColor: (value: string) => void;
    onChangeNewColor: (value: string) => void;
    onReplaceSelected: () => void;
    onReplaceAll: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onDownload: () => void;
    onCopy: () => void;
    compact?: boolean;
    hideHeader?: boolean;
}) {
    const normalizedNewColor = normalizeHexColor(newColor) || "#F28C6F";

    return (
        <div>
            {!hideHeader ? <SectionHeader title={text.colorControls} /> : null}

            <div className={compact ? "mt-0 space-y-3" : "mt-5 space-y-5"}>
                <div>
                    <p className="mb-2 text-sm font-semibold text-gray-800">
                        {chooseColorToReplace}
                    </p>

                    {detectedColors.length > 0 ? (
                        <div className={compact ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2"}>
                            {detectedColors.map((color) => {
                                const active = selectedColor === color;

                                return (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => onSelectColor(color)}
                                        className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${active
                                            ? "border-[#F28C6F] bg-[#FFF0EA] text-[#E6765B] shadow-sm"
                                            : "border-[#F1E5DF] bg-white text-gray-700 hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                                            }`}
                                    >
                                        <span
                                            className="h-5 w-5 shrink-0 rounded-md border border-[#F1E5DF]"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="min-w-0 truncate">{color}</span>
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

                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-3">
                    <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                                {text.newColor}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                {newColorHint}
                            </p>
                        </div>

                        <div
                            className="h-10 w-10 shrink-0 rounded-2xl border border-[#F1E5DF] shadow-sm"
                            style={{ backgroundColor: normalizedNewColor }}
                        />
                    </div>

                    <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
                        <input
                            type="color"
                            value={normalizedNewColor}
                            onChange={(event) =>
                                onChangeNewColor(event.target.value.toUpperCase())
                            }
                            className="h-11 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                        />

                        <input
                            value={newColor}
                            onChange={(event) =>
                                onChangeNewColor(event.target.value.toUpperCase())
                            }
                            className="h-11 min-w-0 rounded-xl border border-[#F1E5DF] px-3 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onReplaceSelected}
                        disabled={!selectedColor}
                        className="rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2.5 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {replaceSelectedColorText}
                    </button>

                    <button
                        type="button"
                        onClick={onReplaceAll}
                        disabled={detectedColors.length === 0}
                        className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {text.replaceAllColors}
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {text.undo}
                    </button>

                    <button
                        type="button"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {text.redo}
                    </button>
                </div>

                <div className="hidden gap-3 sm:grid-cols-2 lg:grid">
                    <button
                        type="button"
                        onClick={onCopy}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3]"
                    >
                        {copied ? t.common.copied : text.copySvg}
                    </button>

                    <button
                        type="button"
                        onClick={onDownload}
                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {text.downloadSvg}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SvgMiniPreview({
    previewUrl,
    fileName,
    fileSize,
}: {
    previewUrl: string;
    fileName: string;
    fileSize: string;
}) {
    return (
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
                <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl border border-[#F1E5DF] bg-white p-2 shadow-sm">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={fileName}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : null}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2A1F1B]">
                        {fileName}
                    </p>

                    <p className="mt-1 text-xs font-medium text-gray-500">
                        {fileSize}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#7A5A4F]">
                        Pick a color below, choose a new color, then replace it.
                    </p>
                </div>
            </div>
        </div>
    );
}

function MobileActionBar({
    settingsText,
    copyText,
    downloadText,
    onOpenSettings,
    onCopy,
    onDownload,
}: {
    settingsText: string;
    copyText: string;
    downloadText: string;
    onOpenSettings: () => void;
    onCopy: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {settingsText}
                </button>

                <button
                    type="button"
                    onClick={onCopy}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-2.5 text-center text-sm font-semibold leading-tight text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                >
                    {copyText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {downloadText}
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
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
        };
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

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-[#F28C6F]" />
            <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
    );
}