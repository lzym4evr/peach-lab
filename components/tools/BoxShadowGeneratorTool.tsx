"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type BoxShadowSettings = {
    boxWidth: number;
    boxHeight: number;
    boxColor: string;
    shadowColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadRadius: number;
    shadowOpacity: number;
    borderRadius: number;
};

const defaultSettings: BoxShadowSettings = {
    boxWidth: 260,
    boxHeight: 180,
    boxColor: "#FFFFFF",
    shadowColor: "#F28C6F",
    backgroundColor: "#FFF7F3",
    offsetX: 0,
    offsetY: 18,
    blurRadius: 45,
    spreadRadius: -12,
    shadowOpacity: 35,
    borderRadius: 28,
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

export default function BoxShadowGeneratorTool() {
    const text = t.boxShadowGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] =
        useState<BoxShadowSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const safeBoxColor = getSafeHexColor(settings.boxColor, "#FFFFFF");
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFF7F3",
    );
    const safeShadowColor = getSafeHexColor(settings.shadowColor, "#F28C6F");

    const shadowRgba = useMemo(() => {
        const rgb = hexToRgb(safeShadowColor);
        const opacity = settings.shadowOpacity / 100;

        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    }, [safeShadowColor, settings.shadowOpacity]);

    const boxShadowValue = `${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${settings.spreadRadius}px ${shadowRgba}`;

    const cssOutput = `.peach-box-shadow {
  width: ${settings.boxWidth}px;
  height: ${settings.boxHeight}px;
  background: ${safeBoxColor};
  border-radius: ${settings.borderRadius}px;
  box-shadow: ${boxShadowValue};
}`;

    function updateSetting<K extends keyof BoxShadowSettings>(
        key: K,
        value: BoxShadowSettings[K],
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
            // Keep user colors and output size.
            // Only randomize shadow effect parameters.
            offsetX: getRandomNumber(-30, 30),
            offsetY: getRandomNumber(4, 40),
            blurRadius: getRandomNumber(10, 80),
            spreadRadius: getRandomNumber(-24, 18),
            shadowOpacity: getRandomNumber(15, 70),
            borderRadius: getRandomNumber(0, 50),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        setSettings({
            // Random All:
            // Randomize colors, output size, and shadow effect parameters.
            boxWidth: getRandomNumber(180, 360),
            boxHeight: getRandomNumber(120, 260),
            boxColor: getRandomHexColor(),
            shadowColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            offsetX: getRandomNumber(-30, 30),
            offsetY: getRandomNumber(4, 40),
            blurRadius: getRandomNumber(10, 80),
            spreadRadius: getRandomNumber(-24, 18),
            shadowOpacity: getRandomNumber(15, 70),
            borderRadius: getRandomNumber(0, 50),
        });

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

            setCopiedKey("bottom-copy");
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
                            style={{ backgroundColor: safeBackgroundColor }}
                        >
                            <div
                                className="flex items-center justify-center text-center"
                                style={{
                                    width: `${settings.boxWidth}px`,
                                    height: `${settings.boxHeight}px`,
                                    maxWidth: "100%",
                                    backgroundColor: safeBoxColor,
                                    borderRadius: `${settings.borderRadius}px`,
                                    boxShadow: boxShadowValue,
                                }}
                            >
                                <span className="text-sm font-semibold text-gray-500">
                                    Peach Lab
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-900">
                                {text.outputTitle}
                            </h3>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                            <code>{cssOutput}</code>
                        </pre>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleCopyCss}
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
                        <div className="grid gap-4 sm:grid-cols-2">
                            <NumberInput
                                label={text.boxWidthLabel}
                                value={settings.boxWidth}
                                min={80}
                                max={600}
                                onChange={(value) => updateSetting("boxWidth", value)}
                            />

                            <NumberInput
                                label={text.boxHeightLabel}
                                value={settings.boxHeight}
                                min={80}
                                max={400}
                                onChange={(value) => updateSetting("boxHeight", value)}
                            />
                        </div>

                        <ColorInput
                            label={text.boxColorLabel}
                            value={settings.boxColor}
                            fallback="#FFFFFF"
                            onChange={(value) => updateSetting("boxColor", value)}
                        />

                        <ColorInput
                            label={text.shadowColorLabel}
                            value={settings.shadowColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("shadowColor", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#FFF7F3"
                            onChange={(value) => updateSetting("backgroundColor", value)}
                        />

                        <RangeInput
                            label={text.horizontalOffsetLabel}
                            value={settings.offsetX}
                            min={-80}
                            max={80}
                            suffix="px"
                            onChange={(value) => updateSetting("offsetX", value)}
                        />

                        <RangeInput
                            label={text.verticalOffsetLabel}
                            value={settings.offsetY}
                            min={-80}
                            max={80}
                            suffix="px"
                            onChange={(value) => updateSetting("offsetY", value)}
                        />

                        <RangeInput
                            label={text.blurRadiusLabel}
                            value={settings.blurRadius}
                            min={0}
                            max={120}
                            suffix="px"
                            onChange={(value) => updateSetting("blurRadius", value)}
                        />

                        <RangeInput
                            label={text.spreadRadiusLabel}
                            value={settings.spreadRadius}
                            min={-60}
                            max={60}
                            suffix="px"
                            onChange={(value) => updateSetting("spreadRadius", value)}
                        />

                        <RangeInput
                            label={text.shadowOpacityLabel}
                            value={settings.shadowOpacity}
                            min={0}
                            max={100}
                            suffix="%"
                            onChange={(value) => updateSetting("shadowOpacity", value)}
                        />

                        <RangeInput
                            label={text.borderRadiusLabel}
                            value={settings.borderRadius}
                            min={0}
                            max={100}
                            suffix="px"
                            onChange={(value) => updateSetting("borderRadius", value)}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

function NumberInput({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800">
                {label}
            </span>

            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
            />
        </label>
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