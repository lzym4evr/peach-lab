"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type ShadowStyle =
    | "soft-card"
    | "floating"
    | "glow"
    | "inset"
    | "neumorphism"
    | "hard-shadow";

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

const shadowStyles: ShadowStyle[] = [
    "soft-card",
    "floating",
    "glow",
    "inset",
    "neumorphism",
    "hard-shadow",
];

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

function getShadowStyleLabel(
    text: typeof t.boxShadowGenerator,
    style: ShadowStyle,
) {
    const labels = text as {
        styleSoftCard?: string;
        styleFloating?: string;
        styleGlow?: string;
        styleInset?: string;
        styleNeumorphism?: string;
        styleHardShadow?: string;
    };

    if (style === "floating") return labels.styleFloating ?? "Floating";
    if (style === "glow") return labels.styleGlow ?? "Glow";
    if (style === "inset") return labels.styleInset ?? "Inset";
    if (style === "neumorphism") return labels.styleNeumorphism ?? "Neumorphism";
    if (style === "hard-shadow") return labels.styleHardShadow ?? "Hard Shadow";

    return labels.styleSoftCard ?? "Soft Card";
}

function getShadowRgba(color: string, opacity: number) {
    const rgb = hexToRgb(color);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;
}

function getBoxShadowValue({
    settings,
    safeShadowColor,
    shadowStyle,
}: {
    settings: BoxShadowSettings;
    safeShadowColor: string;
    shadowStyle: ShadowStyle;
}) {
    const shadowRgba = getShadowRgba(safeShadowColor, settings.shadowOpacity);

    if (shadowStyle === "inset") {
        return `inset ${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${settings.spreadRadius}px ${shadowRgba}`;
    }

    if (shadowStyle === "neumorphism") {
        return `${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${settings.spreadRadius}px ${shadowRgba},
  ${-settings.offsetX}px ${-settings.offsetY}px ${settings.blurRadius}px ${settings.spreadRadius}px rgba(255, 255, 255, 0.72)`;
    }

    return `${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${settings.spreadRadius}px ${shadowRgba}`;
}

export default function BoxShadowGeneratorTool() {
    const text = t.boxShadowGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const shadowStyleText =
        (text as { shadowStyle?: string }).shadowStyle ?? "Shadow Style";

    const [shadowStyle, setShadowStyle] = useState<ShadowStyle>("soft-card");
    const [settings, setSettings] =
        useState<BoxShadowSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const safeBoxColor = getSafeHexColor(settings.boxColor, "#FFFFFF");
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFF7F3",
    );
    const safeShadowColor = getSafeHexColor(settings.shadowColor, "#F28C6F");

    const boxShadowValue = useMemo(() => {
        return getBoxShadowValue({
            settings,
            safeShadowColor,
            shadowStyle,
        });
    }, [settings, safeShadowColor, shadowStyle]);

    const cssOutput = `.peach-box-shadow {
  width: ${settings.boxWidth}px;
  height: ${settings.boxHeight}px;
  background: ${safeBoxColor};
  border-radius: ${settings.borderRadius}px;
  box-shadow: ${boxShadowValue};
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

    function updateSetting<K extends keyof BoxShadowSettings>(
        key: K,
        value: BoxShadowSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function applyShadowStyle(nextStyle: ShadowStyle) {
        setShadowStyle(nextStyle);

        if (nextStyle === "soft-card") {
            setSettings({
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
            });
        }

        if (nextStyle === "floating") {
            setSettings({
                boxWidth: 260,
                boxHeight: 180,
                boxColor: "#FFFFFF",
                shadowColor: "#7A5A4F",
                backgroundColor: "#FFF7F3",
                offsetX: 0,
                offsetY: 28,
                blurRadius: 70,
                spreadRadius: -18,
                shadowOpacity: 28,
                borderRadius: 30,
            });
        }

        if (nextStyle === "glow") {
            setSettings({
                boxWidth: 250,
                boxHeight: 170,
                boxColor: "#FFFFFF",
                shadowColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                offsetX: 0,
                offsetY: 0,
                blurRadius: 70,
                spreadRadius: 2,
                shadowOpacity: 55,
                borderRadius: 32,
            });
        }

        if (nextStyle === "inset") {
            setSettings({
                boxWidth: 260,
                boxHeight: 180,
                boxColor: "#FFF7F3",
                shadowColor: "#A17F74",
                backgroundColor: "#FFF7F3",
                offsetX: 0,
                offsetY: 10,
                blurRadius: 30,
                spreadRadius: -8,
                shadowOpacity: 35,
                borderRadius: 28,
            });
        }

        if (nextStyle === "neumorphism") {
            setSettings({
                boxWidth: 260,
                boxHeight: 180,
                boxColor: "#FFF7F3",
                shadowColor: "#D8B6AA",
                backgroundColor: "#FFF7F3",
                offsetX: 16,
                offsetY: 16,
                blurRadius: 34,
                spreadRadius: -10,
                shadowOpacity: 45,
                borderRadius: 32,
            });
        }

        if (nextStyle === "hard-shadow") {
            setSettings({
                boxWidth: 250,
                boxHeight: 170,
                boxColor: "#FFFFFF",
                shadowColor: "#2A1F1B",
                backgroundColor: "#FFF7F3",
                offsetX: 14,
                offsetY: 14,
                blurRadius: 0,
                spreadRadius: 0,
                shadowOpacity: 90,
                borderRadius: 22,
            });
        }

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            offsetX: getRandomNumber(-30, 30),
            offsetY: getRandomNumber(4, 40),
            blurRadius: shadowStyle === "hard-shadow" ? 0 : getRandomNumber(10, 80),
            spreadRadius: getRandomNumber(-24, 18),
            shadowOpacity: getRandomNumber(15, 70),
            borderRadius: getRandomNumber(0, 50),
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        const nextStyle = shadowStyles[Math.floor(Math.random() * shadowStyles.length)];

        setShadowStyle(nextStyle);

        setSettings({
            boxWidth: getRandomNumber(180, 360),
            boxHeight: getRandomNumber(120, 260),
            boxColor: getRandomHexColor(),
            shadowColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            offsetX: getRandomNumber(-30, 30),
            offsetY: getRandomNumber(4, 40),
            blurRadius: nextStyle === "hard-shadow" ? 0 : getRandomNumber(10, 80),
            spreadRadius: getRandomNumber(-24, 18),
            shadowOpacity: getRandomNumber(15, 70),
            borderRadius: getRandomNumber(0, 50),
        });

        clearCopyState();
    }

    function handleReset() {
        setShadowStyle("soft-card");
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

    const desktopSettingsPanel = (
        <BoxShadowSettingsPanel
            text={text}
            shadowStyleText={shadowStyleText}
            shadowStyle={shadowStyle}
            settings={settings}
            updateSetting={updateSetting}
            onApplyShadowStyle={applyShadowStyle}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <BoxShadowSettingsPanel
            text={text}
            shadowStyleText={shadowStyleText}
            shadowStyle={shadowStyle}
            settings={settings}
            updateSetting={updateSetting}
            onApplyShadowStyle={applyShadowStyle}
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

                            <BoxShadowPreview
                                settings={settings}
                                safeBoxColor={safeBoxColor}
                                safeBackgroundColor={safeBackgroundColor}
                                boxShadowValue={boxShadowValue}
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
                        <BoxShadowMiniPreview
                            settings={settings}
                            safeBoxColor={safeBoxColor}
                            safeBackgroundColor={safeBackgroundColor}
                            boxShadowValue={boxShadowValue}
                        />

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function BoxShadowPreview({
    settings,
    safeBoxColor,
    safeBackgroundColor,
    boxShadowValue,
}: {
    settings: BoxShadowSettings;
    safeBoxColor: string;
    safeBackgroundColor: string;
    boxShadowValue: string;
}) {
    return (
        <div
            className="flex aspect-square w-full items-center justify-center rounded-3xl border border-[#F1E5DF] p-8"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            <div
                className="flex items-center justify-center text-center"
                style={{
                    width: `${settings.boxWidth}px`,
                    height: `${settings.boxHeight}px`,
                    maxWidth: "78%",
                    maxHeight: "68%",
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
    );
}

function BoxShadowMiniPreview({
    settings,
    safeBoxColor,
    safeBackgroundColor,
    boxShadowValue,
}: {
    settings: BoxShadowSettings;
    safeBoxColor: string;
    safeBackgroundColor: string;
    boxShadowValue: string;
}) {
    return (
        <div
            className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[#F1E5DF] p-6"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            <div
                className="flex items-center justify-center text-center"
                style={{
                    width: `${settings.boxWidth}px`,
                    height: `${settings.boxHeight}px`,
                    maxWidth: "76%",
                    maxHeight: "64%",
                    backgroundColor: safeBoxColor,
                    borderRadius: `${settings.borderRadius}px`,
                    boxShadow: boxShadowValue,
                }}
            >
                <span className="text-xs font-semibold text-gray-500">
                    Peach Lab
                </span>
            </div>
        </div>
    );
}

function BoxShadowSettingsPanel({
    text,
    shadowStyleText,
    shadowStyle,
    settings,
    updateSetting,
    onApplyShadowStyle,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.boxShadowGenerator;
    shadowStyleText: string;
    shadowStyle: ShadowStyle;
    settings: BoxShadowSettings;
    updateSetting: <K extends keyof BoxShadowSettings>(
        key: K,
        value: BoxShadowSettings[K],
    ) => void;
    onApplyShadowStyle: (style: ShadowStyle) => void;
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
                    {shadowStyleText}
                </span>

                <div className="grid grid-cols-2 gap-2">
                    {shadowStyles.map((style) => {
                        const isActive = shadowStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => onApplyShadowStyle(style)}
                                className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getShadowStyleLabel(text, style)}
                            </button>
                        );
                    })}
                </div>
            </div>

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

            {compact ? (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <CompactColorInput
                            label={text.boxColorLabel}
                            value={settings.boxColor}
                            fallback="#FFFFFF"
                            onChange={(value) => updateSetting("boxColor", value)}
                        />

                        <CompactColorInput
                            label={text.shadowColorLabel}
                            value={settings.shadowColor}
                            fallback="#F28C6F"
                            onChange={(value) =>
                                updateSetting("shadowColor", value)
                            }
                        />
                    </div>

                    <CompactColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        fallback="#FFF7F3"
                        onChange={(value) =>
                            updateSetting("backgroundColor", value)
                        }
                    />

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
                        onChange={(value) =>
                            updateSetting("backgroundColor", value)
                        }
                    />
                </>
            )}

            <RangeInput
                label={text.horizontalOffsetLabel}
                value={settings.offsetX}
                min={-80}
                max={80}
                suffix="px"
                compact={compact}
                onChange={(value) => updateSetting("offsetX", value)}
            />

            <RangeInput
                label={text.verticalOffsetLabel}
                value={settings.offsetY}
                min={-80}
                max={80}
                suffix="px"
                compact={compact}
                onChange={(value) => updateSetting("offsetY", value)}
            />

            <RangeInput
                label={text.blurRadiusLabel}
                value={settings.blurRadius}
                min={0}
                max={120}
                suffix="px"
                compact={compact}
                onChange={(value) => updateSetting("blurRadius", value)}
            />

            <RangeInput
                label={text.spreadRadiusLabel}
                value={settings.spreadRadius}
                min={-60}
                max={60}
                suffix="px"
                compact={compact}
                onChange={(value) => updateSetting("spreadRadius", value)}
            />

            <RangeInput
                label={text.shadowOpacityLabel}
                value={settings.shadowOpacity}
                min={0}
                max={100}
                suffix="%"
                compact={compact}
                onChange={(value) => updateSetting("shadowOpacity", value)}
            />

            <RangeInput
                label={text.borderRadiusLabel}
                value={settings.borderRadius}
                min={0}
                max={100}
                suffix="px"
                compact={compact}
                onChange={(value) => updateSetting("borderRadius", value)}
            />
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
        <label className="block">
            <div
                className={`flex items-center justify-between gap-4 ${compact ? "mb-1.5" : "mb-2"
                    }`}
            >
                <span
                    className={`font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {label}
                </span>

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