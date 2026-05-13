"use client";

import {
    type CSSProperties,
    type ReactNode,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type FontWeight = "400" | "500" | "700" | "800";
type TypographyPreset = "hero" | "heading" | "subheading" | "body" | "caption" | "display";
type TextAlign = "left" | "center" | "right";
type BackgroundMode = "light" | "dark" | "transparent" | "custom";

type FluidTypographySettings = {
    typographyPreset: TypographyPreset;
    sampleText: string;
    minFontSize: number;
    maxFontSize: number;
    minViewport: number;
    maxViewport: number;
    previewWidth: number;
    fontWeight: FontWeight;
    letterSpacing: number;
    lineHeight: number;
    textAlign: TextAlign;
    textColor: string;
    backgroundMode: BackgroundMode;
    backgroundColor: string;
};

const defaultSettings: FluidTypographySettings = {
    typographyPreset: "hero",
    sampleText: "Responsive Typography",
    minFontSize: 18,
    maxFontSize: 64,
    minViewport: 320,
    maxViewport: 1440,
    previewWidth: 900,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 1.1,
    textAlign: "center",
    textColor: "#2A1F1B",
    backgroundMode: "light",
    backgroundColor: "#FFF7F3",
};

const fontWeights: FontWeight[] = ["400", "500", "700", "800"];
const typographyPresets: TypographyPreset[] = [
    "hero",
    "heading",
    "subheading",
    "body",
    "caption",
    "display",
];
const textAlignOptions: TextAlign[] = ["left", "center", "right"];
const backgroundModes: BackgroundMode[] = [
    "light",
    "dark",
    "transparent",
    "custom",
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

function getRandomLineHeight() {
    const values = [1, 1.05, 1.1, 1.2, 1.35, 1.5];

    return values[Math.floor(Math.random() * values.length)];
}

function getFluidClamp({
    minFontSize,
    maxFontSize,
    minViewport,
    maxViewport,
}: {
    minFontSize: number;
    maxFontSize: number;
    minViewport: number;
    maxViewport: number;
}) {
    const safeMinFontSize = Math.min(minFontSize, maxFontSize);
    const safeMaxFontSize = Math.max(minFontSize, maxFontSize);
    const safeMinViewport = Math.min(minViewport, maxViewport - 1);
    const safeMaxViewport = Math.max(maxViewport, minViewport + 1);

    const slope =
        (safeMaxFontSize - safeMinFontSize) /
        (safeMaxViewport - safeMinViewport);

    const viewportValue = slope * 100;
    const remIntercept = safeMinFontSize - slope * safeMinViewport;

    return `clamp(${safeMinFontSize}px, ${remIntercept.toFixed(
        3,
    )}px + ${viewportValue.toFixed(3)}vw, ${safeMaxFontSize}px)`;
}

function getPreviewFontSize({
    minFontSize,
    maxFontSize,
    minViewport,
    maxViewport,
    previewWidth,
}: {
    minFontSize: number;
    maxFontSize: number;
    minViewport: number;
    maxViewport: number;
    previewWidth: number;
}) {
    const safeMinFontSize = Math.min(minFontSize, maxFontSize);
    const safeMaxFontSize = Math.max(minFontSize, maxFontSize);
    const safeMinViewport = Math.min(minViewport, maxViewport - 1);
    const safeMaxViewport = Math.max(maxViewport, minViewport + 1);

    if (previewWidth <= safeMinViewport) return safeMinFontSize;
    if (previewWidth >= safeMaxViewport) return safeMaxFontSize;

    const progress =
        (previewWidth - safeMinViewport) / (safeMaxViewport - safeMinViewport);

    return Math.round(
        safeMinFontSize + (safeMaxFontSize - safeMinFontSize) * progress,
    );
}

function getPreviewBackgroundColor(settings: FluidTypographySettings) {
    if (settings.backgroundMode === "dark") return "#2A1F1B";
    if (settings.backgroundMode === "transparent") return "transparent";
    if (settings.backgroundMode === "custom") {
        return getSafeHexColor(settings.backgroundColor, "#FFF7F3");
    }

    return "#FFF7F3";
}

function getCheckerboardStyle(): CSSProperties {
    return {
        backgroundColor: "#ffffff",
        backgroundImage:
            "linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
    };
}

function getFontWeightLabel(
    text: typeof t.fluidTypographyGenerator,
    weight: FontWeight,
) {
    if (weight === "400") return text.normal;
    if (weight === "500") return text.medium;
    if (weight === "700") return text.bold;

    return text.extraBold;
}

function getTypographyPresetLabel(
    text: typeof t.fluidTypographyGenerator,
    preset: TypographyPreset,
) {
    if (preset === "heading") return text.presetHeading;
    if (preset === "subheading") return text.presetSubheading;
    if (preset === "body") return text.presetBody;
    if (preset === "caption") return text.presetCaption;
    if (preset === "display") return text.presetDisplay;

    return text.presetHero;
}

function getTextAlignLabel(
    text: typeof t.fluidTypographyGenerator,
    align: TextAlign,
) {
    if (align === "left") return text.alignLeft;
    if (align === "right") return text.alignRight;

    return text.alignCenter;
}

function getBackgroundModeLabel(
    text: typeof t.fluidTypographyGenerator,
    mode: BackgroundMode,
) {
    if (mode === "dark") return text.backgroundDark;
    if (mode === "transparent") return text.backgroundTransparent;
    if (mode === "custom") return text.backgroundCustom;

    return text.backgroundLight;
}

export default function FluidTypographyGeneratorTool() {
    const text = t.fluidTypographyGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const [settings, setSettings] =
        useState<FluidTypographySettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const safeTextColor = getSafeHexColor(settings.textColor, "#2A1F1B");
    const safeBackgroundColor = getPreviewBackgroundColor(settings);

    const clampValue = useMemo(() => {
        return getFluidClamp({
            minFontSize: settings.minFontSize,
            maxFontSize: settings.maxFontSize,
            minViewport: settings.minViewport,
            maxViewport: settings.maxViewport,
        });
    }, [
        settings.minFontSize,
        settings.maxFontSize,
        settings.minViewport,
        settings.maxViewport,
    ]);

    const previewFontSize = useMemo(() => {
        return getPreviewFontSize({
            minFontSize: settings.minFontSize,
            maxFontSize: settings.maxFontSize,
            minViewport: settings.minViewport,
            maxViewport: settings.maxViewport,
            previewWidth: settings.previewWidth,
        });
    }, [
        settings.minFontSize,
        settings.maxFontSize,
        settings.minViewport,
        settings.maxViewport,
        settings.previewWidth,
    ]);

    const cssOutput = useMemo(() => {
        return `.fluid-text {
  font-size: ${clampValue};
  font-weight: ${settings.fontWeight};
  letter-spacing: ${settings.letterSpacing}px;
  text-align: ${settings.textAlign};
  line-height: ${settings.lineHeight};
}`;
    }, [
        clampValue,
        settings.fontWeight,
        settings.letterSpacing,
        settings.textAlign,
        settings.lineHeight,
    ]);

    const previewStyle: CSSProperties = {
        width: `${Math.min(settings.previewWidth, 760)}px`,
        color: safeTextColor,
        fontSize: `${previewFontSize}px`,
        fontWeight: settings.fontWeight,
        letterSpacing: `${settings.letterSpacing}px`,
        textAlign: settings.textAlign,
        lineHeight: settings.lineHeight,
    };

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

    function updateSetting<K extends keyof FluidTypographySettings>(
        key: K,
        value: FluidTypographySettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function applyTypographyPreset(nextPreset: TypographyPreset) {
        setSettings((current) => {
            const sampleText = current.sampleText;

            if (nextPreset === "heading") {
                return {
                    ...current,
                    typographyPreset: "heading",
                    sampleText,
                    minFontSize: 24,
                    maxFontSize: 56,
                    minViewport: 320,
                    maxViewport: 1280,
                    previewWidth: 820,
                    fontWeight: "800",
                    letterSpacing: -1,
                    lineHeight: 1.1,
                    textAlign: "center",
                    textColor: "#2A1F1B",
                    backgroundMode: "light",
                };
            }

            if (nextPreset === "subheading") {
                return {
                    ...current,
                    typographyPreset: "subheading",
                    sampleText,
                    minFontSize: 18,
                    maxFontSize: 36,
                    minViewport: 320,
                    maxViewport: 1200,
                    previewWidth: 760,
                    fontWeight: "700",
                    letterSpacing: 0,
                    lineHeight: 1.2,
                    textAlign: "center",
                    textColor: "#5F453C",
                    backgroundMode: "light",
                };
            }

            if (nextPreset === "body") {
                return {
                    ...current,
                    typographyPreset: "body",
                    sampleText,
                    minFontSize: 16,
                    maxFontSize: 22,
                    minViewport: 320,
                    maxViewport: 1200,
                    previewWidth: 680,
                    fontWeight: "400",
                    letterSpacing: 0,
                    lineHeight: 1.5,
                    textAlign: "left",
                    textColor: "#2A1F1B",
                    backgroundMode: "light",
                };
            }

            if (nextPreset === "caption") {
                return {
                    ...current,
                    typographyPreset: "caption",
                    sampleText,
                    minFontSize: 12,
                    maxFontSize: 16,
                    minViewport: 320,
                    maxViewport: 900,
                    previewWidth: 520,
                    fontWeight: "500",
                    letterSpacing: 1,
                    lineHeight: 1.35,
                    textAlign: "center",
                    textColor: "#7A5A4F",
                    backgroundMode: "light",
                };
            }

            if (nextPreset === "display") {
                return {
                    ...current,
                    typographyPreset: "display",
                    sampleText,
                    minFontSize: 36,
                    maxFontSize: 112,
                    minViewport: 320,
                    maxViewport: 1800,
                    previewWidth: 1040,
                    fontWeight: "800",
                    letterSpacing: -2,
                    lineHeight: 1,
                    textAlign: "center",
                    textColor: "#FFFFFF",
                    backgroundMode: "dark",
                };
            }

            return {
                ...current,
                typographyPreset: "hero",
                sampleText,
                minFontSize: 18,
                maxFontSize: 64,
                minViewport: 320,
                maxViewport: 1440,
                previewWidth: 900,
                fontWeight: "800",
                letterSpacing: 0,
                lineHeight: 1.1,
                textAlign: "center",
                textColor: "#2A1F1B",
                backgroundMode: "light",
            };
        });

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            minFontSize: getRandomNumber(14, 28),
            maxFontSize: getRandomNumber(42, 96),
            minViewport: getRandomNumber(300, 480),
            maxViewport: getRandomNumber(1100, 1800),
            previewWidth: getRandomNumber(420, 1200),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            letterSpacing: getRandomNumber(-2, 8),
            lineHeight: getRandomLineHeight(),
            textAlign:
                textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)],
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        setSettings((current) => ({
            ...current,
            typographyPreset:
                typographyPresets[Math.floor(Math.random() * typographyPresets.length)],
            sampleText: current.sampleText,
            minFontSize: getRandomNumber(14, 28),
            maxFontSize: getRandomNumber(42, 96),
            minViewport: getRandomNumber(300, 480),
            maxViewport: getRandomNumber(1100, 1800),
            previewWidth: getRandomNumber(420, 1200),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            letterSpacing: getRandomNumber(-2, 8),
            lineHeight: getRandomLineHeight(),
            textAlign:
                textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)],
            textColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            backgroundMode:
                backgroundModes[Math.floor(Math.random() * backgroundModes.length)],
        }));

        clearCopyState();
    }

    function handleReset() {
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

    const previewPanel = (
        <FluidTypographyPreview
            text={text}
            settings={settings}
            previewFontSize={previewFontSize}
            previewStyle={previewStyle}
            safeBackgroundColor={safeBackgroundColor}
        />
    );

    const desktopSettingsPanel = (
        <FluidTypographySettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onApplyTypographyPreset={applyTypographyPreset}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
        />
    );

    const mobileSettingsPanel = (
        <FluidTypographySettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onApplyTypographyPreset={applyTypographyPreset}
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
                        <div className="lg:sticky lg:top-24">
                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-5">
                                    <SectionHeader title={text.previewTitle} />

                                    <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                        {text.previewDescription}
                                    </p>
                                </div>

                                {previewPanel}
                            </section>
                        </div>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} />

                                <button
                                    type="button"
                                    onClick={handleCopyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copiedKey === "copy-css" ? text.copied : text.copyCss}
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
                    preview={
                        <FluidTypographyMiniPreview
                            text={text}
                            settings={settings}
                            previewFontSize={previewFontSize}
                            previewStyle={previewStyle}
                            safeBackgroundColor={safeBackgroundColor}
                        />
                    }
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    {mobileSettingsPanel}
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function FluidTypographyPreview({
    text,
    settings,
    previewFontSize,
    previewStyle,
    safeBackgroundColor,
}: {
    text: typeof t.fluidTypographyGenerator;
    settings: FluidTypographySettings;
    previewFontSize: number;
    previewStyle: CSSProperties;
    safeBackgroundColor: string;
}) {
    const backgroundStyle =
        settings.backgroundMode === "transparent"
            ? getCheckerboardStyle()
            : { backgroundColor: safeBackgroundColor };

    return (
        <div
            className="flex h-[260px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-6 text-center md:min-h-[380px]"
            style={backgroundStyle}
        >
            <div className="w-full">
                <div className="mx-auto mb-5 max-w-md rounded-2xl border border-[#F1E5DF] bg-white/70 px-4 py-3 text-sm font-semibold text-[#7A5A4F]">
                    {settings.previewWidth}px {text.previewWidthValue} ·{" "}
                    {previewFontSize}px {text.previewFontValue}
                </div>

                <div className="mx-auto max-w-full break-words" style={previewStyle}>
                    {settings.sampleText.trim() || "Responsive Typography"}
                </div>
            </div>
        </div>
    );
}

function FluidTypographyMiniPreview({
    text,
    settings,
    previewFontSize,
    previewStyle,
    safeBackgroundColor,
}: {
    text: typeof t.fluidTypographyGenerator;
    settings: FluidTypographySettings;
    previewFontSize: number;
    previewStyle: CSSProperties;
    safeBackgroundColor: string;
}) {
    const backgroundStyle =
        settings.backgroundMode === "transparent"
            ? getCheckerboardStyle()
            : { backgroundColor: safeBackgroundColor };

    return (
        <div
            className="flex h-32 items-center justify-center rounded-2xl border border-[#F1E5DF] p-4 text-center"
            style={backgroundStyle}
        >
            <div className="w-full">
                <div className="mx-auto mb-2 w-fit rounded-xl border border-[#F1E5DF] bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-[#7A5A4F]">
                    {settings.previewWidth}px · {previewFontSize}px
                </div>

                <div
                    className="mx-auto max-w-full break-words"
                    style={{
                        ...previewStyle,
                        width: "100%",
                        fontSize: `${Math.min(previewFontSize, 32)}px`,
                    }}
                >
                    {settings.sampleText.trim() || "Responsive Typography"}
                </div>
            </div>
        </div>
    );
}

function FluidTypographySettingsPanel({
    text,
    settings,
    updateSetting,
    onApplyTypographyPreset,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.fluidTypographyGenerator;
    settings: FluidTypographySettings;
    updateSetting: <K extends keyof FluidTypographySettings>(
        key: K,
        value: FluidTypographySettings[K],
    ) => void;
    onApplyTypographyPreset: (preset: TypographyPreset) => void;
    onShuffle: () => void;
    onRandom: () => void;
    onReset: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-4" : "space-y-6"}>
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={onShuffle}
                    className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:py-3 md:text-sm"
                >
                    {text.shuffle}
                </button>

                <button
                    type="button"
                    onClick={onRandom}
                    className="w-full rounded-2xl bg-[#F28C6F] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#E6765B] md:px-4 md:py-3 md:text-sm"
                >
                    {text.randomAll}
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:py-3 md:text-sm"
                >
                    {text.reset}
                </button>
            </div>

            <SettingGroup title={text.textGroupTitle}>
                <input
                    value={settings.sampleText}
                    onChange={(event) =>
                        updateSetting("sampleText", event.target.value)
                    }
                    placeholder={text.sampleTextPlaceholder}
                    className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-4 text-sm text-[#2A1F1B] outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                />
            </SettingGroup>

            <SettingGroup title={text.presetGroupTitle}>
                <div className="grid grid-cols-3 gap-2">
                    {typographyPresets.map((preset) => {
                        const isActive = settings.typographyPreset === preset;

                        return (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => onApplyTypographyPreset(preset)}
                                className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getTypographyPresetLabel(text, preset)}
                            </button>
                        );
                    })}
                </div>
            </SettingGroup>

            <SettingGroup title={text.colorsGroupTitle}>
                <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-3"}>
                    <ColorInput
                        label={text.textColorLabel}
                        value={settings.textColor}
                        fallback="#2A1F1B"
                        compact={compact}
                        onChange={(value) => updateSetting("textColor", value)}
                    />

                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        fallback="#FFF7F3"
                        compact={compact}
                        onChange={(value) => updateSetting("backgroundColor", value)}
                    />
                </div>
            </SettingGroup>

            <SettingGroup title={text.sizeGroupTitle}>
                <div className="grid grid-cols-2 gap-4">
                    <RangeInput
                        label={text.minFontSizeLabel}
                        value={settings.minFontSize}
                        min={10}
                        max={48}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("minFontSize", value)}
                    />

                    <RangeInput
                        label={text.maxFontSizeLabel}
                        value={settings.maxFontSize}
                        min={24}
                        max={140}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("maxFontSize", value)}
                    />

                    <RangeInput
                        label={text.minViewportLabel}
                        value={settings.minViewport}
                        min={240}
                        max={768}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("minViewport", value)}
                    />

                    <RangeInput
                        label={text.maxViewportLabel}
                        value={settings.maxViewport}
                        min={900}
                        max={2200}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("maxViewport", value)}
                    />

                    <RangeInput
                        label={text.previewWidthLabel}
                        value={settings.previewWidth}
                        min={280}
                        max={1600}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("previewWidth", value)}
                    />

                    <RangeInput
                        label={text.letterSpacingLabel}
                        value={settings.letterSpacing}
                        min={-5}
                        max={20}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("letterSpacing", value)}
                    />
                </div>

                <div className="mt-4">
                    <RangeInput
                        label={text.lineHeightLabel}
                        value={settings.lineHeight}
                        min={0.8}
                        max={2}
                        step={0.05}
                        suffix=""
                        compact={compact}
                        onChange={(value) => updateSetting("lineHeight", value)}
                    />
                </div>

                <div className="mt-4">
                    <span className="mb-2 block text-sm font-semibold text-gray-800">
                        {text.fontWeightLabel}
                    </span>

                    <div className="grid grid-cols-4 gap-2">
                        {fontWeights.map((weight) => {
                            const isActive = settings.fontWeight === weight;

                            return (
                                <button
                                    key={weight}
                                    type="button"
                                    onClick={() => updateSetting("fontWeight", weight)}
                                    className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                        } ${isActive
                                            ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                            : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                        }`}
                                >
                                    {getFontWeightLabel(text, weight)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4">
                    <span className="mb-2 block text-sm font-semibold text-gray-800">
                        {text.textAlignLabel}
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                        {textAlignOptions.map((align) => {
                            const isActive = settings.textAlign === align;

                            return (
                                <button
                                    key={align}
                                    type="button"
                                    onClick={() => updateSetting("textAlign", align)}
                                    className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                        } ${isActive
                                            ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                            : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                        }`}
                                >
                                    {getTextAlignLabel(text, align)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SettingGroup>

            <SettingGroup title={text.backgroundGroupTitle}>
                <div className="grid grid-cols-2 gap-2">
                    {backgroundModes.map((mode) => {
                        const isActive = settings.backgroundMode === mode;

                        return (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => updateSetting("backgroundMode", mode)}
                                className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getBackgroundModeLabel(text, mode)}
                            </button>
                        );
                    })}
                </div>
            </SettingGroup>
        </div>
    );
}

function SettingGroup({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">{title}</h4>
            {children}
        </div>
    );
}

function ColorInput({
    label,
    value,
    fallback,
    compact = false,
    onChange,
}: {
    label: string;
    value: string;
    fallback: string;
    compact?: boolean;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = isValidHexColor(value) ? value : fallback;

    return (
        <label className="block min-w-0">
            <span
                className={`mb-2 block break-words font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={`grid items-center rounded-2xl border border-[#F1E5DF] bg-white transition focus-within:border-[#F28C6F] focus-within:ring-4 focus-within:ring-[#FFF0EA] ${compact
                    ? "grid-cols-[30px_1fr] gap-1.5 p-1.5"
                    : "grid-cols-[34px_1fr] gap-1.5 p-2"
                    }`}
            >
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer appearance-none rounded-md border-0 bg-transparent p-0 ${compact ? "h-8" : "h-9"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`min-w-0 border-none bg-transparent font-semibold uppercase text-gray-800 outline-none ${compact ? "text-[10px]" : "text-xs"
                        }`}
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
    step = 1,
    compact = false,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    suffix: string;
    step?: number;
    compact?: boolean;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block min-w-0">
            <div
                className={
                    compact
                        ? "mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5"
                        : "mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"
                }
            >
                <span
                    className={
                        compact
                            ? "min-w-0 break-words text-[11px] font-semibold leading-4 text-gray-800"
                            : "min-w-0 break-words text-sm font-semibold leading-5 text-gray-800"
                    }
                >
                    {label}
                </span>

                <span
                    className={
                        compact
                            ? "min-w-[40px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-0.5 text-center text-[11px] font-semibold leading-5 text-[#7A5A4F]"
                            : "min-w-[44px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-1 text-center text-xs font-semibold text-[#7A5A4F]"
                    }
                >
                    {value}
                    {suffix}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
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
    preview,
    children,
    onClose,
}: {
    title: string;
    preview?: ReactNode;
    children: ReactNode;
    onClose: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useLayoutEffect(() => {
        const scrollY = window.scrollY;
        const originalBodyPosition = document.body.style.position;
        const originalBodyTop = document.body.style.top;
        const originalBodyWidth = document.body.style.width;
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlScrollBehavior =
            document.documentElement.style.scrollBehavior;

        document.documentElement.style.scrollBehavior = "auto";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);

            document.body.style.position = originalBodyPosition;
            document.body.style.top = originalBodyTop;
            document.body.style.width = originalBodyWidth;
            document.body.style.overflow = originalBodyOverflow;

            window.scrollTo({
                top: scrollY,
                left: 0,
                behavior: "auto",
            });

            document.documentElement.style.scrollBehavior =
                originalHtmlScrollBehavior;
        };
    }, []);

    function handleClose() {
        setIsVisible(false);

        window.setTimeout(() => {
            onClose();
        }, 180);
    }

    return (
        <div
            className={`fixed inset-0 z-[70] overscroll-contain bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[92dvh] w-full max-w-md flex-col overflow-hidden overscroll-contain rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
                    }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="shrink-0 bg-white px-4 pb-3 pt-4">
                    <div className="flex items-center justify-between gap-4">
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

                    {preview ? <div className="mt-3">{preview}</div> : null}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-2">
                    {children}
                </div>
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