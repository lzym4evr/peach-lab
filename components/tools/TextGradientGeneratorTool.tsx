"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type FontWeight = "400" | "500" | "700" | "800";

type TextGradientSettings = {
    sampleText: string;
    fontSize: number;
    fontWeight: FontWeight;
    gradientAngle: number;
    colorOne: string;
    colorTwo: string;
    colorThree: string;
    backgroundColor: string;
};

const defaultSettings: TextGradientSettings = {
    sampleText: "Peach Lab",
    fontSize: 64,
    fontWeight: "800",
    gradientAngle: 90,
    colorOne: "#F28C6F",
    colorTwo: "#FFD6C8",
    colorThree: "#E6765B",
    backgroundColor: "#FFF7F3",
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

export default function TextGradientGeneratorTool() {
    const text = t.textGradientGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] =
        useState<TextGradientSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const safeColorOne = getSafeHexColor(settings.colorOne, "#F28C6F");
    const safeColorTwo = getSafeHexColor(settings.colorTwo, "#FFD6C8");
    const safeColorThree = getSafeHexColor(settings.colorThree, "#E6765B");
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFF7F3",
    );

    const gradientValue = `linear-gradient(${settings.gradientAngle}deg, ${safeColorOne}, ${safeColorTwo}, ${safeColorThree})`;

    const cssOutput = useMemo(() => {
        return `.gradient-text {
  display: inline-block;
  background-image: ${gradientValue};
  background-size: 100%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: ${settings.fontSize}px;
  font-weight: ${settings.fontWeight};
  line-height: 1.1;
}`;
    }, [gradientValue, settings.fontSize, settings.fontWeight]);

    function updateSetting<K extends keyof TextGradientSettings>(
        key: K,
        value: TextGradientSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleShuffle() {
        const fontWeights: FontWeight[] = ["400", "500", "700", "800"];

        setSettings((current) => ({
            ...current,

            // Shuffle:
            // Keep user text and colors.
            // Only randomize style parameters.
            fontSize: getRandomNumber(42, 88),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            gradientAngle: getRandomNumber(0, 360),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        const fontWeights: FontWeight[] = ["400", "500", "700", "800"];

        setSettings((current) => ({
            ...current,

            // Random All:
            // Keep user text, randomize colors and style parameters.
            // Text is kept because it is the user's content.
            fontSize: getRandomNumber(42, 88),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            gradientAngle: getRandomNumber(0, 360),
            colorOne: getRandomHexColor(),
            colorTwo: getRandomHexColor(),
            colorThree: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
        }));

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

                            <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div
                            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-8 text-center"
                            style={{ backgroundColor: safeBackgroundColor }}
                        >
                            <span
                                className="inline-block max-w-full break-words"
                                style={{
                                    backgroundImage: gradientValue,
                                    backgroundSize: "100%",
                                    backgroundRepeat: "no-repeat",
                                    WebkitBackgroundClip: "text",
                                    backgroundClip: "text",
                                    color: "transparent",
                                    WebkitTextFillColor: "transparent",
                                    fontSize: `${settings.fontSize}px`,
                                    fontWeight: settings.fontWeight,
                                    lineHeight: 1.1,
                                }}
                            >
                                {settings.sampleText.trim() || "Peach Lab"}
                            </span>
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
                                {text.sampleTextLabel}
                            </span>

                            <input
                                value={settings.sampleText}
                                onChange={(event) =>
                                    updateSetting("sampleText", event.target.value)
                                }
                                placeholder={text.sampleTextPlaceholder}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <RangeInput
                                label={text.fontSizeLabel}
                                value={settings.fontSize}
                                min={24}
                                max={120}
                                suffix="px"
                                onChange={(value) => updateSetting("fontSize", value)}
                            />

                            <RangeInput
                                label={text.gradientAngleLabel}
                                value={settings.gradientAngle}
                                min={0}
                                max={360}
                                suffix="deg"
                                onChange={(value) => updateSetting("gradientAngle", value)}
                            />
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-gray-800">
                                {text.fontWeightLabel}
                            </span>

                            <select
                                value={settings.fontWeight}
                                onChange={(event) =>
                                    updateSetting("fontWeight", event.target.value as FontWeight)
                                }
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            >
                                <option value="400">{text.normal}</option>
                                <option value="500">{text.medium}</option>
                                <option value="700">{text.bold}</option>
                                <option value="800">{text.extraBold}</option>
                            </select>
                        </label>

                        <ColorInput
                            label={text.colorOneLabel}
                            value={settings.colorOne}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("colorOne", value)}
                        />

                        <ColorInput
                            label={text.colorTwoLabel}
                            value={settings.colorTwo}
                            fallback="#FFD6C8"
                            onChange={(value) => updateSetting("colorTwo", value)}
                        />

                        <ColorInput
                            label={text.colorThreeLabel}
                            value={settings.colorThree}
                            fallback="#E6765B"
                            onChange={(value) => updateSetting("colorThree", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#FFF7F3"
                            onChange={(value) => updateSetting("backgroundColor", value)}
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