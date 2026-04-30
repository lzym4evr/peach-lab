"use client";

import { useRef, useState } from "react";
import { t } from "@/data/messages";

type BorderRadiusSettings = {
    boxWidth: number;
    boxHeight: number;
    boxColor: string;
    backgroundColor: string;
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
};

const defaultSettings: BorderRadiusSettings = {
    boxWidth: 280,
    boxHeight: 190,
    boxColor: "#F28C6F",
    backgroundColor: "#FFF7F3",
    topLeft: 36,
    topRight: 36,
    bottomRight: 36,
    bottomLeft: 36,
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

export default function BorderRadiusGeneratorTool() {
    const text = t.borderRadiusGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [settings, setSettings] =
        useState<BorderRadiusSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");

    const safeBoxColor = getSafeHexColor(settings.boxColor, "#F28C6F");
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFF7F3",
    );

    const borderRadiusValue = `${settings.topLeft}px ${settings.topRight}px ${settings.bottomRight}px ${settings.bottomLeft}px`;

    const cssOutput = `.peach-border-radius {
  width: ${settings.boxWidth}px;
  height: ${settings.boxHeight}px;
  background: ${safeBoxColor};
  border-radius: ${borderRadiusValue};
}`;

    function updateSetting<K extends keyof BorderRadiusSettings>(
        key: K,
        value: BorderRadiusSettings[K],
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
            // Only randomize radius values.
            topLeft: getRandomNumber(0, 120),
            topRight: getRandomNumber(0, 120),
            bottomRight: getRandomNumber(0, 120),
            bottomLeft: getRandomNumber(0, 120),
        }));

        setCopiedKey("");
        setCopyError("");
    }

    function handleRandomAll() {
        setSettings({
            // Random All:
            // Randomize colors, output size, and radius values.
            boxWidth: getRandomNumber(180, 380),
            boxHeight: getRandomNumber(120, 280),
            boxColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            topLeft: getRandomNumber(0, 120),
            topRight: getRandomNumber(0, 120),
            bottomRight: getRandomNumber(0, 120),
            bottomLeft: getRandomNumber(0, 120),
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

    function handleAllCorners(value: number) {
        setSettings((current) => ({
            ...current,
            topLeft: value,
            topRight: value,
            bottomRight: value,
            bottomLeft: value,
        }));

        setCopiedKey("");
        setCopyError("");
    }

    const allCornersValue =
        settings.topLeft === settings.topRight &&
            settings.topRight === settings.bottomRight &&
            settings.bottomRight === settings.bottomLeft
            ? settings.topLeft
            : 0;

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
                                className="flex items-center justify-center text-center shadow-sm"
                                style={{
                                    width: `${settings.boxWidth}px`,
                                    height: `${settings.boxHeight}px`,
                                    maxWidth: "100%",
                                    backgroundColor: safeBoxColor,
                                    borderRadius: borderRadiusValue,
                                }}
                            >
                                <span className="text-sm font-semibold text-white">
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
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("boxColor", value)}
                        />

                        <ColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#FFF7F3"
                            onChange={(value) => updateSetting("backgroundColor", value)}
                        />

                        <RangeInput
                            label="All Corners"
                            value={allCornersValue}
                            min={0}
                            max={160}
                            suffix="px"
                            onChange={handleAllCorners}
                        />

                        <RangeInput
                            label={text.topLeftLabel}
                            value={settings.topLeft}
                            min={0}
                            max={160}
                            suffix="px"
                            onChange={(value) => updateSetting("topLeft", value)}
                        />

                        <RangeInput
                            label={text.topRightLabel}
                            value={settings.topRight}
                            min={0}
                            max={160}
                            suffix="px"
                            onChange={(value) => updateSetting("topRight", value)}
                        />

                        <RangeInput
                            label={text.bottomRightLabel}
                            value={settings.bottomRight}
                            min={0}
                            max={160}
                            suffix="px"
                            onChange={(value) => updateSetting("bottomRight", value)}
                        />

                        <RangeInput
                            label={text.bottomLeftLabel}
                            value={settings.bottomLeft}
                            min={0}
                            max={160}
                            suffix="px"
                            onChange={(value) => updateSetting("bottomLeft", value)}
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