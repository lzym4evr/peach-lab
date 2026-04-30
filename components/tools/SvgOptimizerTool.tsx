"use client";

import {
    ChangeEvent,
    DragEvent,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type OptimizeOptions = {
    removeComments: boolean;
    removeMetadata: boolean;
    removeTitleDesc: boolean;
    removeEmptyGroups: boolean;
    collapseWhitespace: boolean;
    removeDimensions: boolean;
};

const defaultOptions: OptimizeOptions = {
    removeComments: true,
    removeMetadata: true,
    removeTitleDesc: false,
    removeEmptyGroups: true,
    collapseWhitespace: true,
    removeDimensions: false,
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

function optimizeSvgCode(svgCode: string, options: OptimizeOptions) {
    let output = svgCode;

    if (options.removeComments) {
        output = output.replace(/<!--[\s\S]*?-->/g, "");
    }

    if (options.removeMetadata) {
        output = output.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
    }

    if (options.removeTitleDesc) {
        output = output
            .replace(/<title[\s\S]*?<\/title>/gi, "")
            .replace(/<desc[\s\S]*?<\/desc>/gi, "");
    }

    if (options.removeEmptyGroups) {
        output = output.replace(/<g[^>]*>\s*<\/g>/gi, "");
    }

    if (options.removeDimensions) {
        output = output
            .replace(/\swidth="[^"]*"/gi, "")
            .replace(/\sheight="[^"]*"/gi, "");
    }

    if (options.collapseWhitespace) {
        output = output
            .replace(/>\s+</g, "><")
            .replace(/\s{2,}/g, " ")
            .replace(/\n+/g, "")
            .trim();
    } else {
        output = output.trim();
    }

    return output;
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

export default function SvgOptimizerTool() {
    const text = t.svgOptimizer;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [fileName, setFileName] = useState("peach-lab-optimized.svg");
    const [originalSvg, setOriginalSvg] = useState("");
    const [optimizedSvg, setOptimizedSvg] = useState("");
    const [options, setOptions] = useState<OptimizeOptions>(defaultOptions);

    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const originalSize = useMemo(() => getByteSize(originalSvg), [originalSvg]);
    const optimizedSize = useMemo(
        () => getByteSize(optimizedSvg),
        [optimizedSvg],
    );

    const savedPercent = useMemo(() => {
        if (!originalSvg || !optimizedSvg || originalSize === 0) return 0;

        const saved = originalSize - optimizedSize;
        const percent = Math.round((saved / originalSize) * 100);

        return Math.max(percent, 0);
    }, [originalSvg, optimizedSvg, originalSize, optimizedSize]);

    function loadSvgText(svgText: string, name?: string) {
        if (!isSvgCode(svgText)) {
            setError(text.invalidSvgError);
            return;
        }

        setOriginalSvg(svgText);
        setOptimizedSvg("");
        setFileName(name || "peach-lab-optimized.svg");
        setError("");
        setStatus("");
    }

    function handleChooseFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        readSvgFile(file);
        event.target.value = "";
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

    function updateOption(key: keyof OptimizeOptions, value: boolean) {
        setOptions((current) => ({
            ...current,
            [key]: value,
        }));
        setStatus("");
    }

    function handleOptimize() {
        if (!originalSvg) {
            setError(text.noFileError);
            return;
        }

        if (!isSvgCode(originalSvg)) {
            setError(text.invalidSvgError);
            return;
        }

        const nextOptimizedSvg = optimizeSvgCode(originalSvg, options);

        setOptimizedSvg(nextOptimizedSvg);
        setStatus(text.ready);
        setError("");
    }

    async function handleCopy() {
        if (!optimizedSvg) {
            setError(text.noFileError);
            return;
        }

        try {
            await navigator.clipboard.writeText(optimizedSvg);
            setStatus(text.copied);
            setError("");
        } catch {
            setError(text.copyError);
        }
    }

    function handleDownload() {
        if (!optimizedSvg) {
            setError(text.noFileError);
            return;
        }

        const cleanName = fileName.replace(/\.svg$/i, "");
        downloadTextFile(optimizedSvg, `${cleanName}-optimized.svg`);
    }

    function handleReset() {
        setOptimizedSvg("");
        setOptions(defaultOptions);
        setStatus("");
        setError("");
    }

    const previewSvg = optimizedSvg || originalSvg;

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

                        {previewSvg ? (
                            <div className="rounded-3xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        {text.previewTitle}
                                    </h4>

                                    <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                                        {fileName}
                                    </span>
                                </div>

                                <div
                                    className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-[#FFF7F3] p-6"
                                    dangerouslySetInnerHTML={{ __html: previewSvg }}
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
                            value={optimizedSvg}
                            onChange={(event) => {
                                setOptimizedSvg(event.target.value);
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

                    <div className="mt-5 space-y-3">
                        <CheckOption
                            label={text.removeComments}
                            checked={options.removeComments}
                            onChange={(value) => updateOption("removeComments", value)}
                        />

                        <CheckOption
                            label={text.removeMetadata}
                            checked={options.removeMetadata}
                            onChange={(value) => updateOption("removeMetadata", value)}
                        />

                        <CheckOption
                            label={text.removeTitleDesc}
                            checked={options.removeTitleDesc}
                            onChange={(value) => updateOption("removeTitleDesc", value)}
                        />

                        <CheckOption
                            label={text.removeEmptyGroups}
                            checked={options.removeEmptyGroups}
                            onChange={(value) => updateOption("removeEmptyGroups", value)}
                        />

                        <CheckOption
                            label={text.collapseWhitespace}
                            checked={options.collapseWhitespace}
                            onChange={(value) => updateOption("collapseWhitespace", value)}
                        />

                        <CheckOption
                            label={text.removeDimensions}
                            checked={options.removeDimensions}
                            onChange={(value) => updateOption("removeDimensions", value)}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleOptimize}
                        className="mt-5 w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {text.optimizeSvg}
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
                                label={text.optimizedSize}
                                value={optimizedSvg ? formatBytes(optimizedSize) : "-"}
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