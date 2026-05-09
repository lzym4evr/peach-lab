"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { t } from "@/data/messages";

type RadiusStyle = "soft-card" | "pill" | "ticket" | "blob" | "leaf" | "arch";

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

const radiusStyles: RadiusStyle[] = [
    "soft-card",
    "pill",
    "ticket",
    "blob",
    "leaf",
    "arch",
];

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

function getRadiusStyleLabel(
    text: typeof t.borderRadiusGenerator,
    style: RadiusStyle,
) {
    const labels = text as {
        styleSoftCard?: string;
        stylePill?: string;
        styleTicket?: string;
        styleBlob?: string;
        styleLeaf?: string;
        styleArch?: string;
    };

    if (style === "pill") return labels.stylePill ?? "Pill";
    if (style === "ticket") return labels.styleTicket ?? "Ticket";
    if (style === "blob") return labels.styleBlob ?? "Blob";
    if (style === "leaf") return labels.styleLeaf ?? "Leaf";
    if (style === "arch") return labels.styleArch ?? "Arch";

    return labels.styleSoftCard ?? "Soft Card";
}

export default function BorderRadiusGeneratorTool() {
    const text = t.borderRadiusGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const radiusStyleText =
        (text as { radiusStyle?: string }).radiusStyle ?? "Radius Style";

    const allCornersLabel =
        (text as { allCornersLabel?: string }).allCornersLabel ?? "All Corners";

    const [radiusStyle, setRadiusStyle] = useState<RadiusStyle>("soft-card");
    const [settings, setSettings] =
        useState<BorderRadiusSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

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

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function clearCopyState() {
        setCopiedKey("");
        setCopyError("");
    }

    function updateSetting<K extends keyof BorderRadiusSettings>(
        key: K,
        value: BorderRadiusSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function applyRadiusStyle(nextStyle: RadiusStyle) {
        setRadiusStyle(nextStyle);

        if (nextStyle === "soft-card") {
            setSettings({
                boxWidth: 280,
                boxHeight: 190,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 36,
                topRight: 36,
                bottomRight: 36,
                bottomLeft: 36,
            });
        }

        if (nextStyle === "pill") {
            setSettings({
                boxWidth: 320,
                boxHeight: 150,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 120,
                topRight: 120,
                bottomRight: 120,
                bottomLeft: 120,
            });
        }

        if (nextStyle === "ticket") {
            setSettings({
                boxWidth: 300,
                boxHeight: 185,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 46,
                topRight: 12,
                bottomRight: 46,
                bottomLeft: 12,
            });
        }

        if (nextStyle === "blob") {
            setSettings({
                boxWidth: 280,
                boxHeight: 210,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 72,
                topRight: 28,
                bottomRight: 88,
                bottomLeft: 36,
            });
        }

        if (nextStyle === "leaf") {
            setSettings({
                boxWidth: 290,
                boxHeight: 190,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 100,
                topRight: 16,
                bottomRight: 100,
                bottomLeft: 16,
            });
        }

        if (nextStyle === "arch") {
            setSettings({
                boxWidth: 260,
                boxHeight: 220,
                boxColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                topLeft: 110,
                topRight: 110,
                bottomRight: 18,
                bottomLeft: 18,
            });
        }

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            topLeft: getRandomNumber(0, 120),
            topRight: getRandomNumber(0, 120),
            bottomRight: getRandomNumber(0, 120),
            bottomLeft: getRandomNumber(0, 120),
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        const nextStyle =
            radiusStyles[Math.floor(Math.random() * radiusStyles.length)];

        setRadiusStyle(nextStyle);

        setSettings({
            boxWidth: getRandomNumber(180, 380),
            boxHeight: getRandomNumber(120, 280),
            boxColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            topLeft: getRandomNumber(0, 120),
            topRight: getRandomNumber(0, 120),
            bottomRight: getRandomNumber(0, 120),
            bottomLeft: getRandomNumber(0, 120),
        });

        clearCopyState();
    }

    function handleReset() {
        setRadiusStyle("soft-card");
        setSettings(defaultSettings);
        clearCopyState();
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

    function handleAllCorners(value: number) {
        setSettings((current) => ({
            ...current,
            topLeft: value,
            topRight: value,
            bottomRight: value,
            bottomLeft: value,
        }));

        clearCopyState();
    }

    const allCornersValue =
        settings.topLeft === settings.topRight &&
            settings.topRight === settings.bottomRight &&
            settings.bottomRight === settings.bottomLeft
            ? settings.topLeft
            : 0;

    const desktopSettingsPanel = (
        <BorderRadiusSettingsPanel
            text={text}
            radiusStyleText={radiusStyleText}
            radiusStyle={radiusStyle}
            allCornersLabel={allCornersLabel}
            settings={settings}
            allCornersValue={allCornersValue}
            updateSetting={updateSetting}
            onApplyRadiusStyle={applyRadiusStyle}
            onAllCornersChange={handleAllCorners}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <BorderRadiusSettingsPanel
            text={text}
            radiusStyleText={radiusStyleText}
            radiusStyle={radiusStyle}
            allCornersLabel={allCornersLabel}
            settings={settings}
            allCornersValue={allCornersValue}
            updateSetting={updateSetting}
            onApplyRadiusStyle={applyRadiusStyle}
            onAllCornersChange={handleAllCorners}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
            compact
        />
    );

    return (
        <>
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                    <div className="min-w-0 space-y-6">
                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-5">
                                <SectionHeader title={text.previewTitle} />

                                <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                    {text.previewDescription}
                                </p>
                            </div>

                            <BorderRadiusPreview
                                settings={settings}
                                safeBoxColor={safeBoxColor}
                                safeBackgroundColor={safeBackgroundColor}
                                borderRadiusValue={borderRadiusValue}
                            />
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} />

                                <button
                                    type="button"
                                    onClick={handleCopyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copiedKey === "copy-css"
                                        ? text.copied
                                        : text.copyCss}
                                </button>
                            </div>

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                                <code>{cssOutput}</code>
                            </pre>

                            {copyError ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {copyError}
                                </p>
                            ) : null}
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        <SectionHeader title={text.controlsTitle} />

                        <div className="mt-5">{desktopSettingsPanel}</div>
                    </section>
                </div>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controlsTitle}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <BorderRadiusMiniPreview
                            settings={settings}
                            safeBoxColor={safeBoxColor}
                            safeBackgroundColor={safeBackgroundColor}
                            borderRadiusValue={borderRadiusValue}
                        />

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function BorderRadiusPreview({
    settings,
    safeBoxColor,
    safeBackgroundColor,
    borderRadiusValue,
}: {
    settings: BorderRadiusSettings;
    safeBoxColor: string;
    safeBackgroundColor: string;
    borderRadiusValue: string;
}) {
    return (
        <div
            className="flex aspect-square w-full items-center justify-center rounded-3xl border border-[#F1E5DF] p-8"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            <div
                className="flex items-center justify-center text-center shadow-sm"
                style={{
                    width: `${settings.boxWidth}px`,
                    height: `${settings.boxHeight}px`,
                    maxWidth: "78%",
                    maxHeight: "68%",
                    backgroundColor: safeBoxColor,
                    borderRadius: borderRadiusValue,
                }}
            >
                <span className="text-sm font-semibold text-white">
                    Peach Lab
                </span>
            </div>
        </div>
    );
}

function BorderRadiusMiniPreview({
    settings,
    safeBoxColor,
    safeBackgroundColor,
    borderRadiusValue,
}: {
    settings: BorderRadiusSettings;
    safeBoxColor: string;
    safeBackgroundColor: string;
    borderRadiusValue: string;
}) {
    return (
        <div
            className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[#F1E5DF] p-6"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            <div
                className="flex items-center justify-center text-center shadow-sm"
                style={{
                    width: `${settings.boxWidth}px`,
                    height: `${settings.boxHeight}px`,
                    maxWidth: "76%",
                    maxHeight: "64%",
                    backgroundColor: safeBoxColor,
                    borderRadius: borderRadiusValue,
                }}
            >
                <span className="text-xs font-semibold text-white">
                    Peach Lab
                </span>
            </div>
        </div>
    );
}

function BorderRadiusSettingsPanel({
    text,
    radiusStyleText,
    radiusStyle,
    allCornersLabel,
    settings,
    allCornersValue,
    updateSetting,
    onApplyRadiusStyle,
    onAllCornersChange,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.borderRadiusGenerator;
    radiusStyleText: string;
    radiusStyle: RadiusStyle;
    allCornersLabel: string;
    settings: BorderRadiusSettings;
    allCornersValue: number;
    updateSetting: <K extends keyof BorderRadiusSettings>(
        key: K,
        value: BorderRadiusSettings[K],
    ) => void;
    onApplyRadiusStyle: (style: RadiusStyle) => void;
    onAllCornersChange: (value: number) => void;
    onShuffle: () => void;
    onRandom: () => void;
    onReset: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div>
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {radiusStyleText}
                </span>

                <div className="grid grid-cols-2 gap-2">
                    {radiusStyles.map((style) => {
                        const isActive = radiusStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => onApplyRadiusStyle(style)}
                                className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getRadiusStyleLabel(text, style)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {compact ? (
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={onShuffle}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3]"
                    >
                        {text.shuffle}
                    </button>

                    <button
                        type="button"
                        onClick={onRandom}
                        className="rounded-2xl border border-[#F28C6F] bg-[#F28C6F] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {text.randomAll}
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF7F3]"
                    >
                        {text.reset}
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onShuffle}
                            className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                        >
                            {text.shuffle}
                        </button>

                        <button
                            type="button"
                            onClick={onRandom}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.randomAll}
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onReset}
                        className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                    >
                        {text.reset}
                    </button>
                </>
            )}

            {compact ? (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <CompactColorInput
                            label={text.boxColorLabel}
                            value={settings.boxColor}
                            fallback="#F28C6F"
                            onChange={(value) => updateSetting("boxColor", value)}
                        />

                        <CompactColorInput
                            label={text.backgroundColorLabel}
                            value={settings.backgroundColor}
                            fallback="#FFF7F3"
                            onChange={(value) =>
                                updateSetting("backgroundColor", value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <NumberInput
                            label={text.boxWidthLabel}
                            value={settings.boxWidth}
                            min={80}
                            max={600}
                            compact={compact}
                            onChange={(value) => updateSetting("boxWidth", value)}
                        />

                        <NumberInput
                            label={text.boxHeightLabel}
                            value={settings.boxHeight}
                            min={80}
                            max={400}
                            compact={compact}
                            onChange={(value) => updateSetting("boxHeight", value)}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <NumberInput
                            label={text.boxWidthLabel}
                            value={settings.boxWidth}
                            min={80}
                            max={600}
                            compact={compact}
                            onChange={(value) => updateSetting("boxWidth", value)}
                        />

                        <NumberInput
                            label={text.boxHeightLabel}
                            value={settings.boxHeight}
                            min={80}
                            max={400}
                            compact={compact}
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
                        onChange={(value) =>
                            updateSetting("backgroundColor", value)
                        }
                    />
                </>
            )}

            <RangeInput
                label={allCornersLabel}
                value={allCornersValue}
                min={0}
                max={160}
                suffix="px"
                compact={compact}
                onChange={onAllCornersChange}
            />

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-3"
                        : "grid gap-5 sm:grid-cols-2"
                }
            >
                <RangeInput
                    label={text.topLeftLabel}
                    value={settings.topLeft}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => updateSetting("topLeft", value)}
                />

                <RangeInput
                    label={text.topRightLabel}
                    value={settings.topRight}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => updateSetting("topRight", value)}
                />

                <RangeInput
                    label={text.bottomRightLabel}
                    value={settings.bottomRight}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => updateSetting("bottomRight", value)}
                />

                <RangeInput
                    label={text.bottomLeftLabel}
                    value={settings.bottomLeft}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => updateSetting("bottomLeft", value)}
                />
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

function NumberInput({
    label,
    value,
    min,
    max,
    compact = false,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    compact?: boolean;
    onChange: (value: number) => void;
}) {
    const [inputValue, setInputValue] = useState(String(value));

    useEffect(() => {
        setInputValue(String(value));
    }, [value]);

    function handleChange(nextValue: string) {
        setInputValue(nextValue);

        if (nextValue.trim() === "") {
            return;
        }

        const parsedValue = Number(nextValue);

        if (!Number.isNaN(parsedValue)) {
            onChange(parsedValue);
        }
    }

    return (
        <label className="block min-w-0">
            <span
                className={`mb-2 block truncate font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <input
                type="number"
                min={min}
                max={max}
                value={inputValue}
                onChange={(event) => handleChange(event.target.value)}
                onBlur={() => {
                    if (inputValue.trim() === "") {
                        setInputValue(String(value));
                    }
                }}
                className={`w-full rounded-xl border border-[#F1E5DF] px-3 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-10" : "h-12"
                    }`}
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

function CompactColorInput({
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
        <label className="block min-w-0">
            <span className="mb-1.5 block truncate text-[10px] font-semibold text-gray-800">
                {label}
            </span>

            <div className="grid grid-cols-[34px_1fr] gap-1.5">
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className="h-10 min-w-0 rounded-xl border border-[#F1E5DF] px-2 text-[10px] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
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
    compact = false,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    compact?: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block min-w-0">
            <div
                className={`flex items-center justify-between gap-3 ${compact ? "mb-1.5" : "mb-2"
                    }`}
            >
                <span
                    className={`truncate font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {label}
                </span>

                <span className="shrink-0 rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]">
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

function MobileActionBar({
    settingsButtonText,
    onOpenSettings,
}: {
    settingsButtonText: string;
    onOpenSettings: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-1 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {settingsButtonText}
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
        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-24 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[78vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-4">
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

                <div className="overflow-y-auto px-4 pb-4 pt-2">{children}</div>
            </div>
        </div>
    );
}