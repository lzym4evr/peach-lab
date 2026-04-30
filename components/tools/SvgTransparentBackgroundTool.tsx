"use client";

import {
    ChangeEvent,
    DragEvent,
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

    const [fileName, setFileName] = useState("peach-lab-transparent.svg");
    const [originalSvg, setOriginalSvg] = useState("");
    const [transparentSvg, setTransparentSvg] = useState("");
    const [targetColor, setTargetColor] = useState("#FFFFFF");
    const [options, setOptions] = useState<RemoveOptions>(defaultOptions);

    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

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
    }

    function readSvgFile(file: File) {
        const isSvgFile =
            file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");

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

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
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
            setStatus(text.copied);
            setError("");
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
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 text-sm text-[#7A5A4F]">
                {text.localProcessing}
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {text.uploadTitle}
                                </h3>

                                <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                    {text.uploadDescription}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="shrink-0 rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {originalSvg ? text.changeSvg : text.uploadButton}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".svg,image/svg+xml"
                                onChange={handleChooseFile}
                                className="hidden"
                            />
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    fileInputRef.current?.click();
                                }
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`mb-5 cursor-pointer rounded-3xl border border-dashed p-6 text-center transition ${isDragging
                                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                                    : "border-[#F4C8BA] bg-[#FFF7F3] hover:bg-[#FFF0EA]"
                                }`}
                        >
                            <p className="text-sm font-semibold text-[#E6765B]">
                                {originalSvg ? text.changeSvg : text.uploadButton}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {text.dropHint}
                            </p>
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
                                    fileName={transparentSvg ? `${fileName} transparent` : "-"}
                                    emptyText={text.emptyDescription}
                                />
                            </div>
                        ) : (
                            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center">
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

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>

                            <button
                                type="button"
                                onClick={handleCopy}
                                className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                            >
                                {text.copySvg}
                            </button>
                        </div>

                        <textarea
                            value={transparentSvg}
                            onChange={(event) => {
                                setTransparentSvg(event.target.value);
                                setStatus("");
                            }}
                            placeholder={text.emptyDescription}
                            className="min-h-[260px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-7 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                        />

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {text.copySvg}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownload}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.downloadSvg}
                            </button>
                        </div>
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">
                        {text.controlsTitle}
                    </h3>

                    <div className="mt-5 space-y-5">
                        <ColorInput
                            label={text.targetColorLabel}
                            value={targetColor}
                            onChange={(value) => {
                                setTargetColor(value);
                                setStatus("");
                            }}
                        />

                        <CheckOption
                            label={text.removeWhiteBackgroundRect}
                            checked={options.removeWhiteBackgroundRect}
                            onChange={(value) =>
                                updateOption("removeWhiteBackgroundRect", value)
                            }
                        />

                        <CheckOption
                            label={text.removeTargetColorRect}
                            checked={options.removeTargetColorRect}
                            onChange={(value) =>
                                updateOption("removeTargetColorRect", value)
                            }
                        />

                        <CheckOption
                            label={text.removeFirstBackgroundRect}
                            checked={options.removeFirstBackgroundRect}
                            onChange={(value) =>
                                updateOption("removeFirstBackgroundRect", value)
                            }
                        />

                        <CheckOption
                            label={text.removeSvgBackgroundStyle}
                            checked={options.removeSvgBackgroundStyle}
                            onChange={(value) =>
                                updateOption("removeSvgBackgroundStyle", value)
                            }
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleMakeTransparent}
                        className="mt-5 w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {text.makeTransparent}
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-3 w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    >
                        {text.reset}
                    </button>

                    <div className="mt-8 border-t border-[#F1E5DF] pt-6">
                        <h3 className="font-semibold text-gray-900">
                            {text.outputTitle}
                        </h3>

                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <InfoBox
                                label={text.originalSize}
                                value={originalSvg ? formatBytes(originalSize) : "-"}
                            />

                            <InfoBox
                                label={text.transparentSize}
                                value={transparentSvg ? formatBytes(transparentSize) : "-"}
                            />

                            <InfoBox label={text.saved} value={`${savedPercent}%`} />
                        </div>

                        {status ? (
                            <p className="mt-3 text-sm text-[#7A5A4F]">{status}</p>
                        ) : null}

                        {error ? (
                            <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                        ) : null}
                    </div>
                </section>
            </div>
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
        <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-900">{title}</h4>

                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {size}
                </span>
            </div>

            {previewUrl ? (
                <div
                    className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl p-6"
                    style={{
                        backgroundColor: "#ffffff",
                        backgroundImage:
                            "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
                    }}
                >
                    <img
                        src={previewUrl}
                        alt={title}
                        className="max-h-[260px] w-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-6 text-center">
                    <p className="text-sm leading-6 text-gray-500">{emptyText}</p>
                </div>
            )}

            <p className="mt-3 truncate text-xs font-semibold text-gray-500">
                {fileName}
            </p>
        </div>
    );
}

function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[58px_1fr] gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}

function CheckOption({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] px-4 py-3 transition hover:bg-[#FFF7F3]">
            <span className="text-sm font-semibold text-gray-800">{label}</span>

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
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9C7B70]">
                {label}
            </p>

            <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
        </div>
    );
}