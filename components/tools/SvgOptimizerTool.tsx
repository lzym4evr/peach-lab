"use client";

import {
    type ChangeEvent,
    type DragEvent,
    useEffect,
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
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [fileName, setFileName] = useState("peach-lab-optimized.svg");
    const [originalSvg, setOriginalSvg] = useState("");
    const [optimizedSvg, setOptimizedSvg] = useState("");
    const [options, setOptions] = useState<OptimizeOptions>(defaultOptions);

    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

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

    const previewSvg = optimizedSvg || originalSvg;

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
        setOptimizedSvg("");
        setFileName(name || "peach-lab-optimized.svg");
        setError("");
        setStatus("");
        setCopied(false);
    }

    function handleChooseFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        readSvgFile(file);
        event.target.value = "";
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

    function updateOption(key: keyof OptimizeOptions, value: boolean) {
        setOptions((current) => ({
            ...current,
            [key]: value,
        }));

        setStatus("");
        setError("");
        setCopied(false);
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
        setCopied(false);
    }

    async function handleCopy() {
        if (!optimizedSvg) {
            setError(text.noFileError);
            return;
        }

        try {
            await navigator.clipboard.writeText(optimizedSvg);

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
        setCopied(false);
    }

    return (
        <div className="space-y-6">
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

                        {previewSvg ? (
                            <div className="overflow-hidden rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-3 md:p-4">
                                <div
                                    className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-white/70 p-4 md:min-h-[320px]"
                                    dangerouslySetInnerHTML={{ __html: previewSvg }}
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
                                disabled={!optimizedSvg}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {copied ? text.copied : text.copySvg}
                            </button>
                        </div>

                        <textarea
                            value={optimizedSvg}
                            onChange={(event) => {
                                setOptimizedSvg(event.target.value);
                                setStatus("");
                                setCopied(false);
                            }}
                            placeholder={text.emptyDescription}
                            className="h-[180px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-6 text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-[260px] md:leading-7"
                        />

                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!optimizedSvg}
                            className="mt-4 w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
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

                <section className="min-w-0 md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                    <SectionHeader title={text.controlsTitle} />

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
                            onChange={(value) =>
                                updateOption("removeEmptyGroups", value)
                            }
                        />

                        <CheckOption
                            label={text.collapseWhitespace}
                            checked={options.collapseWhitespace}
                            onChange={(value) =>
                                updateOption("collapseWhitespace", value)
                            }
                        />

                        <CheckOption
                            label={text.removeDimensions}
                            checked={options.removeDimensions}
                            onChange={(value) => updateOption("removeDimensions", value)}
                        />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleOptimize}
                            className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                        >
                            {text.optimizeSvg}
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

                        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-1 md:gap-3">
                            <InfoBox
                                label={text.originalSize}
                                value={originalSvg ? formatBytes(originalSize) : "-"}
                            />

                            <InfoBox
                                label={text.optimizedSize}
                                value={optimizedSvg ? formatBytes(optimizedSize) : "-"}
                            />

                            <InfoBox
                                label={text.saved}
                                value={optimizedSvg ? `${savedPercent}%` : "-"}
                            />
                        </div>

                        {status ? (
                            <p className="mt-3 text-sm text-[#7A5A4F]">
                                {status}
                            </p>
                        ) : null}

                        {error && !originalSvg ? (
                            <p className="mt-3 text-sm font-medium text-red-500">
                                {error}
                            </p>
                        ) : null}
                    </div>
                </section>
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
            <span className="text-sm font-semibold text-gray-800">
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
        <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-2.5 md:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9C7B70] md:text-xs">
                {label}
            </p>

            <p className="mt-1 text-base font-bold text-gray-900 md:mt-2 md:text-lg">
                {value}
            </p>
        </div>
    );
}