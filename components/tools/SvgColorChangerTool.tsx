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

function replaceSvgColor(
    svgContent: string,
    fromColor: string,
    toColor: string,
) {
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
    backgroundImage: `
        linear-gradient(45deg, #F4EEEA 25%, transparent 25%),
        linear-gradient(-45deg, #F4EEEA 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #F4EEEA 75%),
        linear-gradient(-45deg, transparent 75%, #F4EEEA 75%)
    `,
    backgroundSize: "24px 24px",
    backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
} as const;

export default function SvgColorChangerTool() {
    const text = t.svgColorChanger;
    const common = t.common;

    const supportsFormatsText =
        (text as { supportsFormats?: string }).supportsFormats ??
        "Supports SVG files.";

    const dropHintText =
        (text as { dropHint?: string }).dropHint ??
        "Drag and drop an SVG here, or click to choose a file.";

    const noFileSelectedText =
        (text as { noFileSelected?: string }).noFileSelected ??
        "No file selected";

    const previewHintText =
        (text as { previewHint?: string }).previewHint ??
        "Transparent areas are shown with a checkerboard background in preview.";

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const chooseColorToReplaceText =
        (text as { chooseColorToReplace?: string }).chooseColorToReplace ??
        "Choose color to replace";

    const detectedColorsHelpText =
        (text as { detectedColorsHelp?: string }).detectedColorsHelp ??
        "Detected colors are real colors in the SVG code. Transparent areas are not colors.";

    const newColorDescriptionText =
        (text as { newColorDescription?: string }).newColorDescription ??
        "Pick the new color you want to use.";

    const replaceSelectedColorText =
        (text as { replaceSelectedColor?: string }).replaceSelectedColor ??
        text.replaceColor;

    const replaceEveryColorText =
        (text as { replaceEveryColor?: string }).replaceEveryColor ??
        text.replaceAllColors;

    const [svgInfo, setSvgInfo] = useState<SvgInfo | null>(null);
    const [svgContent, setSvgContent] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newColor, setNewColor] = useState("#F28C6F");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copiedKey, setCopiedKey] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [redoHistory, setRedoHistory] = useState<string[]>([]);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function setCopiedState(key: string) {
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

            const nextContent =
                previousRedoHistory[previousRedoHistory.length - 1];
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
                content,
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
        if (!selectedColor) return;

        saveHistory();

        const updatedContent = replaceSvgColor(
            svgContent,
            selectedColor,
            newColor,
        );
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
        try {
            await navigator.clipboard.writeText(svgContent);
            setCopiedState("svg");
        } catch {
            // no-op
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

    const controlsPanel = (
        <SvgColorControls
            text={text}
            common={common}
            detectedColors={detectedColors}
            selectedColor={selectedColor}
            newColor={newColor}
            historyLength={history.length}
            redoHistoryLength={redoHistory.length}
            chooseColorToReplaceText={chooseColorToReplaceText}
            detectedColorsHelpText={detectedColorsHelpText}
            newColorDescriptionText={newColorDescriptionText}
            replaceSelectedColorText={replaceSelectedColorText}
            replaceEveryColorText={replaceEveryColorText}
            onSelectColor={setSelectedColor}
            onChangeSelectedColor={setSelectedColor}
            onChangeNewColor={setNewColor}
            onReplaceSelected={replaceSelectedColor}
            onReplaceAll={replaceAllColors}
            onUndo={undoLastChange}
            onRedo={redoLastChange}
            onDownload={downloadSvg}
            showDownload
        />
    );

    const mobileControlsPanel = (
        <SvgColorControls
            text={text}
            common={common}
            detectedColors={detectedColors}
            selectedColor={selectedColor}
            newColor={newColor}
            historyLength={history.length}
            redoHistoryLength={redoHistory.length}
            chooseColorToReplaceText={chooseColorToReplaceText}
            detectedColorsHelpText={detectedColorsHelpText}
            newColorDescriptionText={newColorDescriptionText}
            replaceSelectedColorText={replaceSelectedColorText}
            replaceEveryColorText={replaceEveryColorText}
            onSelectColor={setSelectedColor}
            onChangeSelectedColor={setSelectedColor}
            onChangeNewColor={setNewColor}
            onReplaceSelected={replaceSelectedColor}
            onReplaceAll={replaceAllColors}
            onUndo={undoLastChange}
            onRedo={redoLastChange}
            onDownload={downloadSvg}
            compact
        />
    );

    return (
        <>
            <div
                className="space-y-6"
                style={{
                    marginBottom:
                        "max(calc(var(--mobile-action-bar-space, 0px) - 0.75rem), 0px)",
                }}
            >
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">
                        {common.localProcessing}
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

                    <p className="mt-2 text-sm font-medium text-[#B57A66] md:mt-3">
                        {supportsFormatsText}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {dropHintText}
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
                        {svgInfo?.name || noFileSelectedText}
                    </p>

                    {error ? (
                        <p className="mt-3 text-sm font-medium text-red-500">
                            {error}
                        </p>
                    ) : null}
                </label>

                {svgInfo ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                        <div className="min-w-0 space-y-6">
                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgPreview} />

                                    <button
                                        type="button"
                                        onClick={clearSvg}
                                        className="shrink-0 rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#F28C6F] hover:text-[#E6765B]"
                                    >
                                        {common.clear}
                                    </button>
                                </div>

                                <SvgPreviewBox
                                    previewUrl={previewUrl}
                                    alt={svgInfo?.name || text.svgPreview}
                                />

                                <div className="mt-4 space-y-1 text-sm text-gray-500">
                                    <p className="break-all">
                                        {svgInfo?.name || ""}
                                    </p>
                                    <p>
                                        {svgInfo
                                            ? formatFileSize(svgInfo.size)
                                            : ""}
                                    </p>
                                    <p>{previewHintText}</p>
                                </div>
                            </section>

                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <SectionHeader title={text.svgCode} />

                                    <button
                                        type="button"
                                        onClick={copySvg}
                                        className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                    >
                                        {copiedKey === "svg"
                                            ? common.copied
                                            : text.copySvg}
                                    </button>
                                </div>

                                <textarea
                                    value={svgContent}
                                    onChange={(event) =>
                                        setSvgContent(event.target.value)
                                    }
                                    className="min-h-[320px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                                />
                            </section>
                        </div>

                        <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                            <SectionHeader title={text.colorControls} />

                            <div className="mt-5">{controlsPanel}</div>
                        </section>
                    </div>
                ) : null}
            </div>

            {svgInfo ? (
                <MobileActionBar
                    settingsButtonText={settingsButtonText}
                    downloadText={text.downloadSvg}
                    onOpenSettings={() => setIsMobileSettingsOpen(true)}
                    onDownload={downloadSvg}
                />
            ) : null}

            {svgInfo && isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.colorControls}
                    preview={
                        <SvgPreviewBox
                            previewUrl={previewUrl}
                            alt={svgInfo?.name || text.svgPreview}
                            compact
                        />
                    }
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    {mobileControlsPanel}
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function SvgColorControls({
    text,
    common,
    detectedColors,
    selectedColor,
    newColor,
    historyLength,
    redoHistoryLength,
    chooseColorToReplaceText,
    detectedColorsHelpText,
    newColorDescriptionText,
    replaceSelectedColorText,
    replaceEveryColorText,
    onSelectColor,
    onChangeSelectedColor,
    onChangeNewColor,
    onReplaceSelected,
    onReplaceAll,
    onUndo,
    onRedo,
    onDownload,
    showDownload = false,
    compact = false,
}: {
    text: typeof t.svgColorChanger;
    common: typeof t.common;
    detectedColors: string[];
    selectedColor: string;
    newColor: string;
    historyLength: number;
    redoHistoryLength: number;
    chooseColorToReplaceText: string;
    detectedColorsHelpText: string;
    newColorDescriptionText: string;
    replaceSelectedColorText: string;
    replaceEveryColorText: string;
    onSelectColor: (color: string) => void;
    onChangeSelectedColor: (color: string) => void;
    onChangeNewColor: (color: string) => void;
    onReplaceSelected: () => void;
    onReplaceAll: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onDownload: () => void;
    showDownload?: boolean;
    compact?: boolean;
}) {
    const safeSelectedColor = normalizeHexColor(selectedColor) || "#666666";
    const safeNewColor = normalizeHexColor(newColor) || "#F28C6F";

    return (
        <div className={compact ? "space-y-4" : "space-y-5"}>
            <div>
                <h4 className="text-sm font-semibold text-gray-900">
                    {chooseColorToReplaceText}
                </h4>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    {detectedColorsHelpText}
                </p>

                {detectedColors.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {detectedColors.map((color) => {
                            const isActive = selectedColor === color;

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => onSelectColor(color)}
                                    className={`flex items-center gap-2 rounded-2xl border transition ${compact
                                            ? "px-2.5 py-2 text-xs"
                                            : "px-3 py-2 text-sm"
                                        } ${isActive
                                            ? "border-[#F28C6F] bg-[#FFF7F3] text-[#E6765B]"
                                            : "border-[#F1E5DF] bg-white text-gray-700 hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                                        }`}
                                >
                                    <span
                                        className={`rounded-xl border border-[#E8DDD6] ${compact ? "h-5 w-5" : "h-6 w-6"
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="font-semibold">{color}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-3 rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-500">
                        {text.noColors}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <label className="block min-w-0">
                    <span className="mb-2 block text-sm font-semibold text-gray-900">
                        {text.originalColor}
                    </span>

                    <div
                        className={
                            compact
                                ? "grid grid-cols-[40px_minmax(0,1fr)] gap-1.5"
                                : "grid grid-cols-[54px_minmax(0,1fr)] gap-2"
                        }
                    >
                        <input
                            type="color"
                            value={safeSelectedColor}
                            onChange={(event) =>
                                onChangeSelectedColor(
                                    event.target.value.toUpperCase(),
                                )
                            }
                            className={`w-full cursor-pointer rounded-2xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-10" : "h-12"
                                }`}
                        />

                        <input
                            value={selectedColor}
                            onChange={(event) =>
                                onChangeSelectedColor(
                                    event.target.value.toUpperCase(),
                                )
                            }
                            placeholder="#000000"
                            className={`min-w-0 rounded-2xl border border-[#F1E5DF] bg-white font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                                    ? "h-10 px-2 text-[11px]"
                                    : "h-12 px-3 text-sm"
                                }`}
                        />
                    </div>
                </label>

                <label className="block min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="block text-sm font-semibold text-gray-900">
                            {text.newColor}
                        </span>

                        {!compact ? (
                            <span className="truncate text-xs text-gray-500">
                                {newColorDescriptionText}
                            </span>
                        ) : null}
                    </div>

                    <div
                        className={
                            compact
                                ? "grid grid-cols-[40px_minmax(0,1fr)] gap-1.5"
                                : "grid grid-cols-[54px_minmax(0,1fr)] gap-2"
                        }
                    >
                        <input
                            type="color"
                            value={safeNewColor}
                            onChange={(event) =>
                                onChangeNewColor(event.target.value.toUpperCase())
                            }
                            className={`w-full cursor-pointer rounded-2xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-10" : "h-12"
                                }`}
                        />

                        <input
                            value={newColor}
                            onChange={(event) =>
                                onChangeNewColor(event.target.value.toUpperCase())
                            }
                            className={`min-w-0 rounded-2xl border border-[#F1E5DF] bg-white font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                                    ? "h-10 px-2 text-[11px]"
                                    : "h-12 px-3 text-sm"
                                }`}
                        />
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onReplaceSelected}
                    disabled={!selectedColor}
                    className={`w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-2 py-2.5 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {replaceSelectedColorText}
                </button>

                <button
                    type="button"
                    onClick={onReplaceAll}
                    disabled={detectedColors.length === 0}
                    className={`w-full rounded-2xl bg-[#F28C6F] font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-2 py-2.5 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {replaceEveryColorText}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={onUndo}
                    disabled={historyLength === 0}
                    className={`rounded-2xl border border-[#F4C8BA] bg-white font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-2 py-2.5 text-xs" : "px-3 py-3 text-sm"
                        }`}
                >
                    {text.undo}
                </button>

                <button
                    type="button"
                    onClick={onRedo}
                    disabled={redoHistoryLength === 0}
                    className={`rounded-2xl border border-[#F4C8BA] bg-white font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-2 py-2.5 text-xs" : "px-3 py-3 text-sm"
                        }`}
                >
                    {text.redo}
                </button>
            </div>

            {showDownload ? (
                <button
                    type="button"
                    onClick={onDownload}
                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {text.downloadSvg}
                </button>
            ) : null}
        </div>
    );
}

function SvgPreviewBox({
    previewUrl,
    alt,
    compact = false,
}: {
    previewUrl: string;
    alt: string;
    compact?: boolean;
}) {
    return (
        <div
            className={`overflow-hidden rounded-3xl border border-[#F1E5DF] ${compact ? "p-3" : "p-6"
                }`}
            style={checkerboardStyle}
        >
            <div
                className={`flex items-center justify-center rounded-2xl bg-white/55 ${compact ? "h-[128px]" : "min-h-[320px]"
                    }`}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={alt}
                        className={`max-w-full object-contain ${compact
                            ? "max-h-[112px]"
                            : "max-h-[240px] md:max-h-[300px]"
                            }`}
                    />
                ) : null}
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

function MobileActionBar({
    settingsButtonText,
    downloadText,
    onOpenSettings,
    onDownload,
}: {
    settingsButtonText: string;
    downloadText: string;
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
                    {downloadText}
                </button>
            </div>
        </div>
    );
}

function MobileSettingsSheet({
    title,
    preview,
    children,
    onClose,
}: {
    title: string;
    preview: ReactNode;
    children: ReactNode;
    onClose: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousTouchAction = document.body.style.touchAction;

        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
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
            className={`fixed inset-0 z-[70] overscroll-none bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
            onTouchMove={(event) => event.preventDefault()}
        >
            <div
                className={`ml-auto flex h-full max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[30px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="shrink-0 bg-white px-4 pb-3 pt-4">
                    <div className="flex items-center justify-between gap-4">
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

                    <div className="mt-3">
                        {preview}
                    </div>
                </div>

                <div
                    className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 pb-4 pt-3"
                    onTouchMove={(event) => event.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}