"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type TextShadowSettings = {
    sampleText: string;
    textColor: string;
    shadowColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    shadowOpacity: number;
    fontSize: number;
};

const defaultSettings: TextShadowSettings = {
    sampleText: "Peach Lab",
    textColor: "#2A1F1B",
    shadowColor: "#F28C6F",
    backgroundColor: "#FFF7F3",
    offsetX: 6,
    offsetY: 8,
    blurRadius: 14,
    shadowOpacity: 45,
    fontSize: 56,
};

function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}

function hexToRgb(hex: string) {
    const cleanHex = hex.replace("#", "");

    if (cleanHex.length !== 6) {
        return { r: 242, g: 140, b: 111 };
    }

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

export default function TextShadowGeneratorTool() {
    const text = t.textShadowGenerator;
    const meta = t.toolMeta.textShadowGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] =
        useState<TextShadowSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const shadowRgba = useMemo(() => {
        const rgb = hexToRgb(settings.shadowColor);
        const opacity = settings.shadowOpacity / 100;

        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }, [settings.shadowColor, settings.shadowOpacity]);

    const cssOutput = useMemo(() => {
        return `.peach-text-shadow {
  color: ${settings.textColor};
  font-size: ${settings.fontSize}px;
  text-shadow: ${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${shadowRgba};
}`;
    }, [
        settings.textColor,
        settings.fontSize,
        settings.offsetX,
        settings.offsetY,
        settings.blurRadius,
        shadowRgba,
    ]);

    const previewStyle = {
        color: settings.textColor,
        fontSize: `${settings.fontSize}px`,
        textShadow: `${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${shadowRgba}`,
    };

    function updateSetting<K extends keyof TextShadowSettings>(
        key: K,
        value: TextShadowSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,

            // Shuffle:
            // Keep user text and colors.
            // Only randomize effect parameters.
            offsetX: randomNumber(-24, 24),
            offsetY: randomNumber(-24, 24),
            blurRadius: randomNumber(0, 40),
            shadowOpacity: randomNumber(20, 80),
            fontSize: randomNumber(36, 72),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        setSettings((current) => ({
            ...current,

            // Random All:
            // Randomize colors and all visual parameters.
            textColor: randomHexColor(),
            shadowColor: randomHexColor(),
            backgroundColor: randomHexColor(),
            offsetX: randomNumber(-24, 24),
            offsetY: randomNumber(-24, 24),
            blurRadius: randomNumber(0, 40),
            shadowOpacity: randomNumber(20, 85),
            fontSize: randomNumber(32, 80),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setCopiedKey("");
        setCopyError("");
    }

    async function handleCopyCss() {
        try {
            await navigator.clipboard.writeText(cssOutput);

            setCopiedKey("copy-css");
            setCopyError("");

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopiedKey("");
            }, 1500);
        } catch {
            setCopyError(text.copyError);
        }
    }

    return (
        <div className="space-y-6">

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                {text.previewTitle}
                            </h2>

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-slate-500">
                                {meta.description}
                            </p>
                        </div>

                        <div
                            className="flex min-h-[260px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-6 text-center"
                            style={{ backgroundColor: settings.backgroundColor }}
                        >
                            {settings.sampleText.trim() ? (
                                <div
                                    className="max-w-full break-words font-bold leading-tight"
                                    style={previewStyle}
                                >
                                    {settings.sampleText}
                                </div>
                            ) : (
                                <p className="text-sm text-[#9C7B70]">
                                    {text.emptyPreview}
                                </p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-[#2A1F1B]">
                                {text.outputTitle}
                            </h2>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-slate-700">
                            <code>{cssOutput}</code>
                        </pre>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleCopyCss}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {copiedKey === "copy-css" ? text.copied : text.copyCss}
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.reset}
                            </button>
                        </div>

                        {copyError ? (
                            <p className="mt-3 text-sm font-medium text-red-500">
                                {copyError}
                            </p>
                        ) : null}
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-[#2A1F1B]">
                            {text.controlsTitle}
                        </h2>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-3">
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

                    <div className="space-y-5">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-[#5F453C]">
                                {text.sampleTextLabel}
                            </span>

                            <input
                                value={settings.sampleText}
                                onChange={(event) =>
                                    updateSetting("sampleText", event.target.value)
                                }
                                placeholder={text.sampleTextPlaceholder}
                                className="w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm text-[#2A1F1B] outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </label>

                        <ColorInput
                            label={text.textColorLabel}
                            value={settings.textColor}
                            onChange={(value) => updateSetting("textColor", value)}
                        />

                        <ColorInput
                            label={text.shadowColorLabel}
                            value={settings.shadowColor}
                            onChange={(value) => updateSetting("shadowColor", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            onChange={(value) => updateSetting("backgroundColor", value)}
                        />

                        <RangeControl
                            label={text.horizontalOffsetLabel}
                            value={settings.offsetX}
                            min={-50}
                            max={50}
                            suffix="px"
                            onChange={(value) => updateSetting("offsetX", value)}
                        />

                        <RangeControl
                            label={text.verticalOffsetLabel}
                            value={settings.offsetY}
                            min={-50}
                            max={50}
                            suffix="px"
                            onChange={(value) => updateSetting("offsetY", value)}
                        />

                        <RangeControl
                            label={text.blurRadiusLabel}
                            value={settings.blurRadius}
                            min={0}
                            max={80}
                            suffix="px"
                            onChange={(value) => updateSetting("blurRadius", value)}
                        />

                        <RangeControl
                            label={text.shadowOpacityLabel}
                            value={settings.shadowOpacity}
                            min={0}
                            max={100}
                            suffix="%"
                            onChange={(value) => updateSetting("shadowOpacity", value)}
                        />

                        <RangeControl
                            label={text.fontSizeLabel}
                            value={settings.fontSize}
                            min={24}
                            max={120}
                            suffix="px"
                            onChange={(value) => updateSetting("fontSize", value)}
                        />
                    </div>
                </section>
            </div>
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
            <span className="mb-2 block text-sm font-medium text-[#5F453C]">
                {label}
            </span>

            <div className="grid grid-cols-[58px_1fr] gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </div>
        </label>
    );
}

function RangeControl({
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
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-[#5F453C]">{label}</span>

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