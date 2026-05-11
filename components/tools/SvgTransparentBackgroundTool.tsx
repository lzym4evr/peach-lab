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

type RemoveOptions = {
    removeWhiteBackgroundRect: boolean;
    removeTargetColorRect: boolean;
    removeFirstBackgroundRect: boolean;
    removeSvgBackgroundStyle: boolean;
};

const defaultOptions: RemoveOptions = {
    removeWhiteBackgroundRect: true,
    removeTargetColorRect: false,
    removeFirstBackgroundRect: true,
    removeSvgBackgroundStyle: true,
};

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / 1024 ** index;

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function getByteSize(text: string) {
    return new Blob([text]).size;
}

function isSvgCode(value: string) {
    return /<svg[\s>]/i.test(value) && /<\/svg>/i.test(value);
}

function createSvgDataUrl(svgCode: string) {
    if (!svgCode) return "";

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`;
}

function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
}

function normalizeColor(value: string) {
    return value.trim().replace(/\s+/g, "").toLowerCase();
}

function expandShortHex(value: string) {
    const color = normalizeColor(value);

    if (!/^#[0-9a-f]{3}$/i.test(color)) return color;

    const r = color[1];
    const g = color[2];
    const b = color[3];

    return `#${r}${r}${g}${g}${b}${b}`;
}

function colorsMatch(first: string, second: string) {
    return expandShortHex(first) === expandShortHex(second);
}

function isWhiteColor(value: string) {
    const color = expandShortHex(value);

    return (
        color === "#ffffff" ||
        color === "white" ||
        color === "rgb(255,255,255)" ||
        color === "rgba(255,255,255,1)"
    );
}

function getStyleFill(element: Element) {
    const style = element.getAttribute("style");

    if (!style) return "";

    const match = style.match(/(?:^|;)\s*fill\s*:\s*([^;]+)/i);

    return match?.[1]?.trim() || "";
}

function getFillColor(element: Element) {
    return element.getAttribute("fill") || getStyleFill(element);
}

function removeFillFromElement(element: Element) {
    element.removeAttribute("fill");

    const style = element.getAttribute("style");

    if (!style) return;

    const cleanedStyle = style
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !item.toLowerCase().startsWith("fill:"))
        .join("; ");

    if (cleanedStyle) {
        element.setAttribute("style", cleanedStyle);
    } else {
        element.removeAttribute("style");
    }
}

function parseLength(value: string | null) {
    if (!value) return null;

    const numeric = parseFloat(value);

    if (Number.isNaN(numeric)) return null;

    return numeric;
}

function getSvgViewBoxSize(svgElement: Element) {
    const viewBox = svgElement.getAttribute("viewBox");

    if (viewBox) {
        const parts = viewBox
            .trim()
            .split(/[\s,]+/)
            .map((part) => Number(part));

        if (parts.length === 4 && parts.every((part) => !Number.isNaN(part))) {
            return {
                width: parts[2],
                height: parts[3],
            };
        }
    }

    const width = parseLength(svgElement.getAttribute("width"));
    const height = parseLength(svgElement.getAttribute("height"));

    if (width && height) {
        return { width, height };
    }

    return null;
}

function rectStartsAtOrigin(rect: Element) {
    const x = rect.getAttribute("x");
    const y = rect.getAttribute("y");

    const startsAtX = !x || x === "0" || x === "0px";
    const startsAtY = !y || y === "0" || y === "0px";

    return startsAtX && startsAtY;
}

function rectCoversCanvas(rect: Element, svgElement: Element) {
    if (!rectStartsAtOrigin(rect)) return false;

    const width = rect.getAttribute("width");
    const height = rect.getAttribute("height");

    if (width === "100%" && height === "100%") return true;

    const svgSize = getSvgViewBoxSize(svgElement);
    const rectWidth = parseLength(width);
    const rectHeight = parseLength(height);

    if (!svgSize || !rectWidth || !rectHeight) {
        return false;
    }

    return rectWidth >= svgSize.width * 0.98 && rectHeight >= svgSize.height * 0.98;
}

function getFirstMeaningfulChild(svgElement: Element) {
    const ignoredTags = new Set(["defs", "style", "metadata", "title", "desc"]);

    return Array.from(svgElement.children).find((child) => {
        return !ignoredTags.has(child.tagName.toLowerCase());
    });
}

function removeSvgBackgroundStyle(svgElement: Element) {
    svgElement.removeAttribute("background");
    svgElement.removeAttribute("background-color");

    const style = svgElement.getAttribute("style");

    if (!style) return;

    const cleanedStyle = style
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => {
            const lowerItem = item.toLowerCase();

            return (
                !lowerItem.startsWith("background:") &&
                !lowerItem.startsWith("background-color:")
            );
        })
        .join("; ");

    if (cleanedStyle) {
        svgElement.setAttribute("style", cleanedStyle);
    } else {
        svgElement.removeAttribute("style");
    }
}

function removeFirstBackgroundRect(svgElement: Element) {
    const firstChild = getFirstMeaningfulChild(svgElement);

    if (!firstChild) return;

    if (firstChild.tagName.toLowerCase() !== "rect") return;

    if (rectCoversCanvas(firstChild, svgElement)) {
        firstChild.remove();
    }
}

function removeMatchingBackgroundRects({
    svgElement,
    targetColor,
    removeWhite,
    removeTarget,
}: {
    svgElement: Element;
    targetColor: string;
    removeWhite: boolean;
    removeTarget: boolean;
}) {
    const rects = Array.from(svgElement.querySelectorAll("rect"));

    rects.forEach((rect) => {
        const fillColor = getFillColor(rect);

        if (!fillColor || fillColor === "none" || fillColor.startsWith("url(")) {
            return;
        }

        const isBackground = rectCoversCanvas(rect, svgElement);

        if (!isBackground) return;

        const shouldRemoveWhite = removeWhite && isWhiteColor(fillColor);
        const shouldRemoveTarget = removeTarget && colorsMatch(fillColor, targetColor);

        if (shouldRemoveWhite || shouldRemoveTarget) {
            rect.remove();
        }
    });
}

function removeMatchingRootFill({
    svgElement,
    targetColor,
    removeWhite,
    removeTarget,
}: {
    svgElement: Element;
    targetColor: string;
    removeWhite: boolean;
    removeTarget: boolean;
}) {
    const fillColor = getFillColor(svgElement);

    if (!fillColor || fillColor === "none" || fillColor.startsWith("url(")) {
        return;
    }

    const shouldRemoveWhite = removeWhite && isWhiteColor(fillColor);
    const shouldRemoveTarget = removeTarget && colorsMatch(fillColor, targetColor);

    if (shouldRemoveWhite || shouldRemoveTarget) {
        removeFillFromElement(svgElement);
    }
}

function cleanEmptyGroups(svgElement: Element) {
    Array.from(svgElement.querySelectorAll("g")).forEach((group) => {
        if (!group.textContent?.trim() && group.children.length === 0) {
            group.remove();
        }
    });
}

function makeSvgTransparent(
    svgCode: string,
    options: RemoveOptions,
    targetColor: string,
) {
    const parser = new DOMParser();
    const documentResult = parser.parseFromString(svgCode, "image/svg+xml");
    const parserError = documentResult.querySelector("parsererror");

    if (parserError) {
        throw new Error("Invalid SVG");
    }

    const svgElement = documentResult.querySelector("svg");

    if (!svgElement) {
        throw new Error("Invalid SVG");
    }

    if (options.removeSvgBackgroundStyle) {
        removeSvgBackgroundStyle(svgElement);
    }

    if (options.removeFirstBackgroundRect) {
        removeFirstBackgroundRect(svgElement);
    }

    removeMatchingBackgroundRects({
        svgElement,
        targetColor,
        removeWhite: options.removeWhiteBackgroundRect,
        removeTarget: options.removeTargetColorRect,
    });

    removeMatchingRootFill({
        svgElement,
        targetColor,
        removeWhite: options.removeWhiteBackgroundRect,
        removeTarget: options.removeTargetColorRect,
    });

    cleanEmptyGroups(svgElement);

    return new XMLSerializer()
        .serializeToString(svgElement)
        .replace(/>\s+</g, "><")
        .trim();
}

export default function SvgTransparentBackgroundTool() {
    const text = t.svgTransparentBackground;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const [fileName, setFileName] = useState("peach-lab-transparent.svg");
    const [originalSvg, setOriginalSvg] = useState("");
    const [transparentSvg, setTransparentSvg] = useState("");
    const [targetColor, setTargetColor] = useState("#FFFFFF");
    const [options, setOptions] = useState<RemoveOptions>(defaultOptions);

    const [isDragging, setIsDragging] = useState(false);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const originalPreviewUrl = useMemo(
        () => createSvgDataUrl(originalSvg),
        [originalSvg],
    );

    const transparentPreviewUrl = useMemo(
        () => createSvgDataUrl(transparentSvg),
        [transparentSvg],
    );

    const originalSize = useMemo(() => getByteSize(originalSvg), [originalSvg]);

    const transparentSize = useMemo(
        () => getByteSize(transparentSvg),
        [transparentSvg],
    );

    const savedPercent = useMemo(() => {
        if (!originalSvg || !transparentSvg || originalSize === 0) return 0;

        const saved = originalSize - transparentSize;
        const percent = Math.round((saved / originalSize) * 100);

        return Math.max(percent, 0);
    }, [originalSvg, transparentSvg, originalSize, transparentSize]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function loadSvgText(svgText: string, name?: string) {
        if (!isSvgCode(svgText)) {
            setError(text.invalidSvgError);
            return;
        }

        setOriginalSvg(svgText);
        setTransparentSvg("");
        setFileName(name || "peach-lab-transparent.svg");
        setError("");
        setStatus("");
        setCopied(false);
    }

    function readSvgFile(file: File) {
        const isSvgFile =
            file.type === "image/svg+xml" ||
            file.name.toLowerCase().endsWith(".svg");

        if (!isSvgFile) {
            setError(text.loadError);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            loadSvgText(result, file.name);
        };

        reader.onerror = () => {
            setError(text.loadError);
        };

        reader.readAsText(file);
    }

    function handleChooseFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        readSvgFile(file);
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

        readSvgFile(file);
    }

    function updateOption(key: keyof RemoveOptions, value: boolean) {
        setOptions((current) => ({
            ...current,
            [key]: value,
        }));

        setStatus("");
        setError("");
        setCopied(false);
    }

    function handleMakeTransparent() {
        if (!originalSvg) {
            setError(text.noFileError);
            return;
        }

        try {
            const nextSvg = makeSvgTransparent(originalSvg, options, targetColor);

            setTransparentSvg(nextSvg);
            setStatus(text.ready);
            setError("");
            setCopied(false);
        } catch {
            setError(text.invalidSvgError);
        }
    }

    async function handleCopy() {
        if (!transparentSvg) {
            setError(text.noFileError);
            return;
        }

        try {
            await navigator.clipboard.writeText(transparentSvg);

            setCopied(true);
            setStatus("");
            setError("");

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setError(text.copyError);
        }
    }

    function handleDownload() {
        if (!transparentSvg) {
            setError(text.noFileError);
            return;
        }

        const cleanName = fileName.replace(/\.svg$/i, "");
        downloadTextFile(transparentSvg, `${cleanName}-transparent.svg`);
    }

    function handleReset() {
        setTransparentSvg("");
        setTargetColor("#FFFFFF");
        setOptions(defaultOptions);
        setStatus("");
        setError("");
        setCopied(false);
    }

    const settingsPanel = (
        <TransparentSettingsPanel
            text={text}
            targetColor={targetColor}
            options={options}
            originalSvg={originalSvg}
            transparentSvg={transparentSvg}
            originalSize={originalSize}
            transparentSize={transparentSize}
            savedPercent={savedPercent}
            status={status}
            error={error}
            setTargetColor={setTargetColor}
            updateOption={updateOption}
            handleMakeTransparent={handleMakeTransparent}
            handleReset={handleReset}
        />
    );

    const mobileSettingsPanel = (
        <div className="space-y-3">
            <MobileTransparentPreview
                text={text}
                originalPreviewUrl={originalPreviewUrl}
                transparentPreviewUrl={transparentPreviewUrl}
                originalSize={originalSvg ? formatBytes(originalSize) : "-"}
                transparentSize={transparentSvg ? formatBytes(transparentSize) : "-"}
                hasOriginal={!!originalSvg}
                hasTransparent={!!transparentSvg}
            />

            <TransparentSettingsPanel
                text={text}
                targetColor={targetColor}
                options={options}
                originalSvg={originalSvg}
                transparentSvg={transparentSvg}
                originalSize={originalSize}
                transparentSize={transparentSize}
                savedPercent={savedPercent}
                status={status}
                error={error}
                setTargetColor={setTargetColor}
                updateOption={updateOption}
                handleMakeTransparent={handleMakeTransparent}
                handleReset={handleReset}
                compact
            />
        </div>
    );

    return (
        <>
            <div className="space-y-6 pb-2 lg:pb-0">
                <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#7A5A4F]">
                    {text.localProcessing}
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

                    <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:mt-3 md:text-sm">
                        {text.dropHint}
                    </p>

                    <div className="mx-auto mt-4 inline-flex rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] md:mt-5">
                        {originalSvg ? text.changeSvg : text.uploadButton}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".svg,image/svg+xml"
                        onChange={handleChooseFile}
                        className="hidden"
                    />

                    <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                        {originalSvg ? fileName : text.noFileSelected}
                    </p>

                    {error && !originalSvg ? (
                        <p className="mt-4 text-sm font-medium text-red-500">
                            {error}
                        </p>
                    ) : null}
                </label>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                    <div className="min-w-0 space-y-6">
                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.previewTitle} />

                                {originalSvg ? (
                                    <span className="hidden max-w-[220px] truncate rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F] md:block">
                                        {fileName}
                                    </span>
                                ) : null}
                            </div>

                            {originalSvg ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <SvgPreviewCard
                                        title={text.originalSvg}
                                        previewUrl={originalPreviewUrl}
                                        size={formatBytes(originalSize)}
                                        fileName={fileName}
                                    />

                                    <SvgPreviewCard
                                        title={text.transparentSvg}
                                        previewUrl={transparentPreviewUrl}
                                        size={transparentSvg ? formatBytes(transparentSize) : "-"}
                                        fileName={
                                            transparentSvg
                                                ? `${fileName} transparent`
                                                : "-"
                                        }
                                        emptyText={text.emptyDescription}
                                    />
                                </div>
                            ) : (
                                <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center md:min-h-[320px]">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {text.emptyTitle}
                                        </h4>

                                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                            {text.emptyDescription}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} />

                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    disabled={!transparentSvg}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {copied ? text.copied : text.copySvg}
                                </button>
                            </div>

                            <textarea
                                value={transparentSvg}
                                onChange={(event) => {
                                    setTransparentSvg(event.target.value);
                                    setStatus("");
                                    setCopied(false);
                                }}
                                placeholder={text.emptyDescription}
                                className="h-[180px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-[260px] md:leading-7"
                            />

                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={!transparentSvg}
                                className="mt-4 hidden w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50 lg:block"
                            >
                                {text.downloadSvg}
                            </button>

                            {error && originalSvg ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {error}
                                </p>
                            ) : null}
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        {settingsPanel}
                    </section>
                </div>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                downloadText={actionDownloadText}
                canDownload={!!transparentSvg}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onDownload={handleDownload}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controlsTitle}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    {mobileSettingsPanel}
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function TransparentSettingsPanel({
    text,
    targetColor,
    options,
    originalSvg,
    transparentSvg,
    originalSize,
    transparentSize,
    savedPercent,
    status,
    error,
    setTargetColor,
    updateOption,
    handleMakeTransparent,
    handleReset,
    compact = false,
}: {
    text: typeof t.svgTransparentBackground;
    targetColor: string;
    options: RemoveOptions;
    originalSvg: string;
    transparentSvg: string;
    originalSize: number;
    transparentSize: number;
    savedPercent: number;
    status: string;
    error: string;
    setTargetColor: (value: string) => void;
    updateOption: (key: keyof RemoveOptions, value: boolean) => void;
    handleMakeTransparent: () => void;
    handleReset: () => void;
    compact?: boolean;
}) {
    return (
        <div>
            {!compact ? <SectionHeader title={text.controlsTitle} /> : null}

            <div className={compact ? "space-y-3" : "mt-5 space-y-5"}>
                <ColorInput
                    label={text.targetColorLabel}
                    value={targetColor}
                    compact={compact}
                    onChange={(value) => {
                        setTargetColor(value);
                    }}
                />

                <div className={compact ? "space-y-2.5" : "space-y-3"}>
                    <CheckOption
                        label={text.removeWhiteBackgroundRect}
                        checked={options.removeWhiteBackgroundRect}
                        compact={compact}
                        onChange={(value) =>
                            updateOption("removeWhiteBackgroundRect", value)
                        }
                    />

                    <CheckOption
                        label={text.removeTargetColorRect}
                        checked={options.removeTargetColorRect}
                        compact={compact}
                        onChange={(value) =>
                            updateOption("removeTargetColorRect", value)
                        }
                    />

                    <CheckOption
                        label={text.removeFirstBackgroundRect}
                        checked={options.removeFirstBackgroundRect}
                        compact={compact}
                        onChange={(value) =>
                            updateOption("removeFirstBackgroundRect", value)
                        }
                    />

                    <CheckOption
                        label={text.removeSvgBackgroundStyle}
                        checked={options.removeSvgBackgroundStyle}
                        compact={compact}
                        onChange={(value) =>
                            updateOption("removeSvgBackgroundStyle", value)
                        }
                    />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleMakeTransparent}
                    className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {text.makeTransparent}
                </button>

                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                >
                    {text.reset}
                </button>
            </div>

            <div className="mt-6">
                <h3 className="font-semibold text-gray-900">
                    {text.statsTitle}
                </h3>

                <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
                    <InfoBox
                        label={text.originalSize}
                        value={originalSvg ? formatBytes(originalSize) : "-"}
                    />

                    <InfoBox
                        label={text.transparentSize}
                        value={transparentSvg ? formatBytes(transparentSize) : "-"}
                    />

                    <InfoBox
                        label={text.saved}
                        value={transparentSvg ? `${savedPercent}%` : "-"}
                    />
                </div>

                {status ? (
                    <p className="mt-3 text-sm text-[#7A5A4F]">{status}</p>
                ) : null}

                {error && !originalSvg ? (
                    <p className="mt-3 text-sm font-medium text-red-500">
                        {error}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

function MobileTransparentPreview({
    text,
    originalPreviewUrl,
    transparentPreviewUrl,
    originalSize,
    transparentSize,
    hasOriginal,
    hasTransparent,
}: {
    text: typeof t.svgTransparentBackground;
    originalPreviewUrl: string;
    transparentPreviewUrl: string;
    originalSize: string;
    transparentSize: string;
    hasOriginal: boolean;
    hasTransparent: boolean;
}) {
    const originalTitle =
        (text as { originalShort?: string }).originalShort ?? "Original";
    const newTitle = (text as { newShort?: string }).newShort ?? "New";

    return (
        <div className="grid grid-cols-2 gap-2">
            <MobilePreviewBox
                title={originalTitle}
                previewUrl={originalPreviewUrl}
                size={originalSize}
                isReady={hasOriginal}
                emptyText={text.emptyTitle}
            />

            <MobilePreviewBox
                title={newTitle}
                previewUrl={transparentPreviewUrl}
                size={transparentSize}
                isReady={hasTransparent}
                emptyText={text.emptyDescription}
            />
        </div>
    );
}

function MobilePreviewBox({
    title,
    previewUrl,
    size,
    isReady,
    emptyText,
}: {
    title: string;
    previewUrl: string;
    size: string;
    isReady: boolean;
    emptyText: string;
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-[#F1E5DF] bg-white p-2">
            <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-gray-900">
                    {title}
                </span>

                <span className="shrink-0 rounded-full bg-[#FFF7F3] px-2 py-0.5 text-[10px] font-semibold text-[#7A5A4F]">
                    {size}
                </span>
            </div>

            {isReady && previewUrl ? (
                <div
                    className="flex h-24 items-center justify-center overflow-hidden rounded-xl p-1.5"
                    style={{
                        backgroundColor: "#ffffff",
                        backgroundImage:
                            "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                        backgroundSize: "14px 14px",
                        backgroundPosition:
                            "0 0, 0 7px, 7px -7px, -7px 0",
                    }}
                >
                    <img
                        src={previewUrl}
                        alt={title}
                        className="max-h-20 w-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-2 text-center">
                    <p className="line-clamp-3 text-[10px] leading-4 text-gray-500">
                        {emptyText}
                    </p>
                </div>
            )}
        </div>
    );
}

function SvgPreviewCard({
    title,
    previewUrl,
    size,
    fileName,
    emptyText,
}: {
    title: string;
    previewUrl: string;
    size: string;
    fileName: string;
    emptyText?: string;
}) {
    return (
        <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-3 md:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>

                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {size}
                </span>
            </div>

            {previewUrl ? (
                <div
                    className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl p-4 md:min-h-[220px] md:p-6"
                    style={{
                        backgroundColor: "#ffffff",
                        backgroundImage:
                            "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition:
                            "0 0, 0 10px, 10px -10px, -10px 0",
                    }}
                >
                    <img
                        src={previewUrl}
                        alt={title}
                        className="max-h-[180px] w-full object-contain md:max-h-[240px]"
                    />
                </div>
            ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-4 text-center md:min-h-[220px] md:p-6">
                    <p className="text-sm leading-6 text-gray-500">{emptyText}</p>
                </div>
            )}

            <p className="mt-3 truncate text-xs font-semibold text-gray-500">
                {fileName}
            </p>
        </div>
    );
}

function MobileActionBar({
    settingsButtonText,
    downloadText,
    canDownload,
    onOpenSettings,
    onDownload,
}: {
    settingsButtonText: string;
    downloadText: string;
    canDownload: boolean;
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
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    disabled={!canDownload}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B] disabled:bg-[#F8D9CF] disabled:opacity-75"
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
            className={`fixed inset-0 z-[70] overscroll-none bg-[#2A1F1B]/35 px-3 pb-3 pt-24 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
            onTouchMove={(event) => event.preventDefault()}
        >
            <div
                className={`ml-auto flex h-full max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-center justify-between gap-4 px-4 pb-2 pt-4">
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

                <div
                    className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 pb-4 pt-2"
                    onTouchMove={(event) => event.stopPropagation()}
                >
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

function ColorInput({
    label,
    value,
    compact = false,
    onChange,
}: {
    label: string;
    value: string;
    compact?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block min-w-0">
            <span
                className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={
                    compact
                        ? "grid grid-cols-[42px_1fr] gap-2"
                        : "grid grid-cols-[58px_1fr] gap-3"
                }
            >
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-11" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`min-w-0 rounded-xl border border-[#F1E5DF] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-11 px-2 text-xs" : "h-12 px-4 text-sm"
                        }`}
                />
            </div>
        </label>
    );
}

function CheckOption({
    label,
    checked,
    compact = false,
    onChange,
}: {
    label: string;
    checked: boolean;
    compact?: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label
            className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] transition hover:bg-[#FFF7F3] ${compact ? "px-3 py-2.5" : "px-4 py-3"
                }`}
        >
            <span
                className={`font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="h-4 w-4 accent-[#F28C6F]"
            />
        </label>
    );
}

function InfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5 lg:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C7B70] lg:text-xs">
                {label}
            </p>

            <p className="mt-1 text-base font-bold text-gray-900 lg:mt-2 lg:text-lg">
                {value}
            </p>
        </div>
    );
}