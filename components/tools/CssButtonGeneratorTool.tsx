"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type ButtonSettings = {
    buttonText: string;
    fontSize: number;
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    borderWidth: number;
    shadowBlur: number;
    shadowOffsetY: number;
    shadowOpacity: number;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
    previewBackground: string;
};

const defaultSettings: ButtonSettings = {
    buttonText: "Peach Button",
    fontSize: 16,
    paddingX: 28,
    paddingY: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowBlur: 24,
    shadowOffsetY: 10,
    shadowOpacity: 28,
    backgroundColor: "#F28C6F",
    textColor: "#FFFFFF",
    borderColor: "#F28C6F",
    shadowColor: "#F28C6F",
    previewBackground: "#FFF7F3",
};

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function hexToRgb(hex: string) {
    const safeHex = getSafeHexColor(hex, "#F28C6F");
    const cleanHex = safeHex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
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

export default function CssButtonGeneratorTool() {
    const text = t.cssButtonGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] = useState<ButtonSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#F28C6F",
    );
    const safeTextColor = getSafeHexColor(settings.textColor, "#FFFFFF");
    const safeBorderColor = getSafeHexColor(settings.borderColor, "#F28C6F");
    const safeShadowColor = getSafeHexColor(settings.shadowColor, "#F28C6F");
    const safePreviewBackground = getSafeHexColor(
        settings.previewBackground,
        "#FFF7F3",
    );

    const shadowRgba = useMemo(() => {
        const rgb = hexToRgb(safeShadowColor);
        const opacity = settings.shadowOpacity / 100;

        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }, [safeShadowColor, settings.shadowOpacity]);

    const boxShadowValue = `0 ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${shadowRgba}`;

    const cssOutput = `.peach-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${settings.paddingY}px ${settings.paddingX}px;
  border: ${settings.borderWidth}px solid ${safeBorderColor};
  border-radius: ${settings.borderRadius}px;
  background: ${safeBackgroundColor};
  color: ${safeTextColor};
  font-size: ${settings.fontSize}px;
  font-weight: 700;
  line-height: 1;
  box-shadow: ${boxShadowValue};
  cursor: pointer;
  transition: all 0.2s ease;
}

.peach-button:hover {
  transform: translateY(-1px);
  filter: brightness(0.98);
}`;

    function updateSetting<K extends keyof ButtonSettings>(
        key: K,
        value: ButtonSettings[K],
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
            // Keep user text, colors, and button size.
            // Only randomize effect / style parameters.
            borderRadius: getRandomNumber(4, 40),
            borderWidth: getRandomNumber(0, 4),
            shadowBlur: getRandomNumber(0, 45),
            shadowOffsetY: getRandomNumber(0, 24),
            shadowOpacity: getRandomNumber(10, 60),
            fontSize: getRandomNumber(14, 22),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        setSettings({
            // Random All:
            // Randomize colors, size, and style parameters.
            buttonText: "Peach Button",
            fontSize: getRandomNumber(14, 22),
            paddingX: getRandomNumber(18, 42),
            paddingY: getRandomNumber(10, 20),
            borderRadius: getRandomNumber(4, 40),
            borderWidth: getRandomNumber(0, 4),
            shadowBlur: getRandomNumber(0, 45),
            shadowOffsetY: getRandomNumber(0, 24),
            shadowOpacity: getRandomNumber(10, 60),
            backgroundColor: getRandomHexColor(),
            textColor: getRandomHexColor(),
            borderColor: getRandomHexColor(),
            shadowColor: getRandomHexColor(),
            previewBackground: getRandomHexColor(),
        });

        setCopiedKey("");
        setCopyError("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setCopiedKey("");
        setCopyError("");
    }

    async function handleCopyCss(key: string) {
        try {
            await navigator.clipboard.writeText(cssOutput);

            setCopiedKey(key);
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
                            <h3 className="font-semibold text-gray-900">
                                {text.previewTitle}
                            </h3>

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div
                            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-8"
                            style={{ backgroundColor: safePreviewBackground }}
                        >
                            <button
                                type="button"
                                style={{
                                    padding: `${settings.paddingY}px ${settings.paddingX}px`,
                                    border: `${settings.borderWidth}px solid ${safeBorderColor}`,
                                    borderRadius: `${settings.borderRadius}px`,
                                    backgroundColor: safeBackgroundColor,
                                    color: safeTextColor,
                                    fontSize: `${settings.fontSize}px`,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    boxShadow: boxShadowValue,
                                }}
                            >
                                {settings.buttonText.trim() || "Peach Button"}
                            </button>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>

                            <button
                                type="button"
                                onClick={() => handleCopyCss("top-copy")}
                                className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                            >
                                {copiedKey === "top-copy" ? text.copied : text.copyCss}
                            </button>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                            <code>{cssOutput}</code>
                        </pre>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleCopyCss("bottom-copy")}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {copiedKey === "bottom-copy" ? text.copied : text.copyCss}
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
                                {text.buttonTextLabel}
                            </span>

                            <input
                                value={settings.buttonText}
                                onChange={(event) =>
                                    updateSetting("buttonText", event.target.value)
                                }
                                placeholder={text.buttonTextPlaceholder}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <RangeInput
                                label={text.fontSizeLabel}
                                value={settings.fontSize}
                                min={10}
                                max={32}
                                suffix="px"
                                onChange={(value) => updateSetting("fontSize", value)}
                            />

                            <RangeInput
                                label={text.borderWidthLabel}
                                value={settings.borderWidth}
                                min={0}
                                max={8}
                                suffix="px"
                                onChange={(value) => updateSetting("borderWidth", value)}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <RangeInput
                                label={text.paddingXLabel}
                                value={settings.paddingX}
                                min={8}
                                max={80}
                                suffix="px"
                                onChange={(value) => updateSetting("paddingX", value)}
                            />

                            <RangeInput
                                label={text.paddingYLabel}
                                value={settings.paddingY}
                                min={6}
                                max={40}
                                suffix="px"
                                onChange={(value) => updateSetting("paddingY", value)}
                            />
                        </div>

                        <RangeInput
                            label={text.borderRadiusLabel}
                            value={settings.borderRadius}
                            min={0}
                            max={80}
                            suffix="px"
                            onChange={(value) => updateSetting("borderRadius", value)}
                        />

                        <RangeInput
                            label={text.shadowOffsetYLabel}
                            value={settings.shadowOffsetY}
                            min={0}
                            max={60}
                            suffix="px"
                            onChange={(value) => updateSetting("shadowOffsetY", value)}
                        />

                        <RangeInput
                            label={text.shadowBlurLabel}
                            value={settings.shadowBlur}
                            min={0}
                            max={100}
                            suffix="px"
                            onChange={(value) => updateSetting("shadowBlur", value)}
                        />

                        <RangeInput
                            label={text.shadowOpacityLabel}
                            value={settings.shadowOpacity}
                            min={0}
                            max={100}
                            suffix="%"
                            onChange={(value) => updateSetting("shadowOpacity", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("backgroundColor", value)}
                        />

                        <ColorInput
                            label={text.textColorLabel}
                            value={settings.textColor}
                            fallback="#FFFFFF"
                            onChange={(value) => updateSetting("textColor", value)}
                        />

                        <ColorInput
                            label={text.borderColorLabel}
                            value={settings.borderColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("borderColor", value)}
                        />

                        <ColorInput
                            label={text.shadowColorLabel}
                            value={settings.shadowColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("shadowColor", value)}
                        />

                        <ColorInput
                            label={text.previewBackgroundLabel}
                            value={settings.previewBackground}
                            fallback="#FFF7F3"
                            onChange={(value) => updateSetting("previewBackground", value)}
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