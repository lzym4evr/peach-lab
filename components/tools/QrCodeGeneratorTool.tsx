"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { t } from "@/data/messages";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

type QrSettings = {
    content: string;
    size: number;
    margin: number;
    foregroundColor: string;
    backgroundColor: string;
    errorCorrectionLevel: ErrorCorrectionLevel;
};

const defaultSettings: QrSettings = {
    content: "https://peachlab.tools",
    size: 320,
    margin: 2,
    foregroundColor: "#2A1F1B",
    backgroundColor: "#FFFFFF",
    errorCorrectionLevel: "M",
};

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function getRandomHexColor() {
    const value = Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();

    return `#${value}`;
}

function getRandomNumber(min: number, max: number) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
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

export default function QrCodeGeneratorTool() {
    const text = t.qrCodeGenerator;

    const [settings, setSettings] = useState<QrSettings>(defaultSettings);
    const [pngUrl, setPngUrl] = useState("");
    const [svgOutput, setSvgOutput] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const safeForegroundColor = getSafeHexColor(
        settings.foregroundColor,
        "#2A1F1B",
    );
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFFFFF",
    );

    const qrOptions = useMemo(() => {
        return {
            width: settings.size,
            margin: settings.margin,
            errorCorrectionLevel: settings.errorCorrectionLevel,
            color: {
                dark: safeForegroundColor,
                light: safeBackgroundColor,
            },
        };
    }, [
        settings.size,
        settings.margin,
        settings.errorCorrectionLevel,
        safeForegroundColor,
        safeBackgroundColor,
    ]);

    useEffect(() => {
        async function generateQrCode() {
            if (!settings.content.trim()) {
                setPngUrl("");
                setSvgOutput("");
                setError("");
                return;
            }

            try {
                const nextPngUrl = await QRCode.toDataURL(settings.content, qrOptions);
                const nextSvg = await QRCode.toString(settings.content, {
                    ...qrOptions,
                    type: "svg",
                });

                setPngUrl(nextPngUrl);
                setSvgOutput(nextSvg);
                setError("");
            } catch {
                setPngUrl("");
                setSvgOutput("");
                setError(text.generateError);
            }
        }

        generateQrCode();
    }, [settings, qrOptions, text.generateError]);

    function updateSetting<K extends keyof QrSettings>(
        key: K,
        value: QrSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setStatus("");
    }

    function handleShuffle() {
        const levels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

        setSettings((current) => ({
            ...current,

            // Shuffle:
            // Keep user content and colors.
            // Randomize size, margin, and error correction.
            size: getRandomNumber(220, 520),
            margin: getRandomNumber(1, 5),
            errorCorrectionLevel: levels[Math.floor(Math.random() * levels.length)],
        }));

        setStatus("");
    }

    function handleRandomAll() {
        const levels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

        setSettings((current) => ({
            ...current,

            // Random All:
            // Keep user content, randomize colors and visual settings.
            // Content is kept to avoid replacing the user's QR data.
            size: getRandomNumber(220, 520),
            margin: getRandomNumber(1, 5),
            foregroundColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            errorCorrectionLevel: levels[Math.floor(Math.random() * levels.length)],
        }));

        setStatus("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setStatus("");
        setError("");
    }

    async function handleCopySvg() {
        if (!svgOutput) return;

        try {
            await navigator.clipboard.writeText(svgOutput);
            setStatus(text.copied);
            setError("");
        } catch {
            setError(text.copyError);
        }
    }

    function handleDownloadPng() {
        if (!pngUrl) return;

        downloadDataUrl(pngUrl, "peach-lab-qr-code.png");
    }

    function handleDownloadSvg() {
        if (!svgOutput) return;

        downloadTextFile(svgOutput, "peach-lab-qr-code.svg");
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section>
                        <div className="mb-5">
                            <h3 className="font-semibold text-gray-900">
                                {text.previewTitle}
                            </h3>

                            <p className="mt-2 max-w-[420px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div className="mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center rounded-3xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 md:p-5">
                            {pngUrl ? (
                                <div className="rounded-[28px] border border-[#F1E5DF] bg-white p-3 shadow-sm md:p-4">
                                    <img
                                        src={pngUrl}
                                        alt="Generated QR code"
                                        className="block h-auto w-full max-w-[260px] object-contain md:max-w-[320px]"
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {text.emptyTitle}
                                    </h4>
                                </div>
                            )}
                        </div>
                    </section>

                    <section>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>

                            <button
                                type="button"
                                onClick={handleCopySvg}
                                className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                            >
                                {text.copySvg}
                            </button>
                        </div>

                        <textarea
                            value={svgOutput}
                            readOnly
                            placeholder={text.emptyTitle}
                            className="min-h-[240px] w-full resize-y rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4 font-mono text-sm leading-7 text-gray-700 outline-none"
                        />

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleDownloadPng}
                                disabled={!pngUrl}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {text.downloadPng}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadSvg}
                                disabled={!svgOutput}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {text.downloadSvg}
                            </button>
                        </div>

                        {status ? (
                            <p className="mt-3 text-sm text-[#7A5A4F]">{status}</p>
                        ) : null}

                        {error ? (
                            <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
                        ) : null}
                    </section>
                </div>

                <section className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                        {text.controlsTitle}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shuffle}
                        </button>

                        <button
                            type="button"
                            onClick={handleRandomAll}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.randomAll}
                        </button>
                    </div>

                    <div className="mt-5 space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-800">
                                {text.contentLabel}
                            </span>

                            <textarea
                                value={settings.content}
                                onChange={(event) =>
                                    updateSetting("content", event.target.value)
                                }
                                placeholder={text.contentPlaceholder}
                                className="min-h-[120px] w-full resize-y rounded-2xl border border-[#F1E5DF] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </label>

                        <RangeInput
                            label={text.sizeLabel}
                            value={settings.size}
                            min={160}
                            max={800}
                            suffix="px"
                            onChange={(value) => updateSetting("size", value)}
                        />

                        <RangeInput
                            label={text.marginLabel}
                            value={settings.margin}
                            min={0}
                            max={10}
                            suffix=""
                            onChange={(value) => updateSetting("margin", value)}
                        />

                        <ColorInput
                            label={text.foregroundColorLabel}
                            value={settings.foregroundColor}
                            fallback="#2A1F1B"
                            onChange={(value) => updateSetting("foregroundColor", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#FFFFFF"
                            onChange={(value) => updateSetting("backgroundColor", value)}
                        />

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-800">
                                {text.errorCorrectionLabel}
                            </span>

                            <select
                                value={settings.errorCorrectionLevel}
                                onChange={(event) =>
                                    updateSetting(
                                        "errorCorrectionLevel",
                                        event.target.value as ErrorCorrectionLevel,
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            >
                                <option value="L">{text.low}</option>
                                <option value="M">{text.medium}</option>
                                <option value="Q">{text.quartile}</option>
                                <option value="H">{text.high}</option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.reset}
                        </button>
                    </div>
                </section>
            </div>
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
    const colorPickerValue = isValidHexColor(value) ? value : fallback;

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
                    className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}

function RangeInput({
    label,
    value,
    min,
    max,
    suffix,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-800">{label}</span>

                <span className="rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
                    {value}
                    {suffix}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full accent-[#F28C6F]"
            />
        </label>
    );
}