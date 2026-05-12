"use client";

import {
    type CSSProperties,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type TextShadowStyle = "soft" | "glow" | "neon" | "retro" | "hard" | "deep";
type TextAlign = "left" | "center" | "right";

type TextShadowSettings = {
    shadowStyle: TextShadowStyle;
    sampleText: string;
    textColor: string;
    shadowColor: string;
    backgroundColor: string;
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    shadowOpacity: number;
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    textAlign: TextAlign;
    useSecondShadow: boolean;
    secondOffsetX: number;
    secondOffsetY: number;
    secondBlurRadius: number;
    secondShadowOpacity: number;
};

const defaultSettings: TextShadowSettings = {
    shadowStyle: "soft",
    sampleText: "Peach Lab",
    textColor: "#2A1F1B",
    shadowColor: "#F28C6F",
    backgroundColor: "#FFF7F3",
    offsetX: 6,
    offsetY: 8,
    blurRadius: 14,
    shadowOpacity: 45,
    fontSize: 56,
    fontWeight: 800,
    letterSpacing: 0,
    textAlign: "center",
    useSecondShadow: false,
    secondOffsetX: 12,
    secondOffsetY: 16,
    secondBlurRadius: 26,
    secondShadowOpacity: 24,
};

const shadowStyles: TextShadowStyle[] = [
    "soft",
    "glow",
    "neon",
    "retro",
    "hard",
    "deep",
];

const textAlignOptions: TextAlign[] = ["left", "center", "right"];

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

function getRgba(hex: string, opacity: number) {
    const rgb = hexToRgb(hex);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;
}

function getShadowStyleLabel(
    text: typeof t.textShadowGenerator,
    style: TextShadowStyle,
) {
    const labels = text as {
        styleSoft?: string;
        styleGlow?: string;
        styleNeon?: string;
        styleRetro?: string;
        styleHard?: string;
        styleDeep?: string;
    };

    if (style === "glow") return labels.styleGlow ?? "Glow";
    if (style === "neon") return labels.styleNeon ?? "Neon";
    if (style === "retro") return labels.styleRetro ?? "Retro";
    if (style === "hard") return labels.styleHard ?? "Hard";
    if (style === "deep") return labels.styleDeep ?? "Deep";

    return labels.styleSoft ?? "Soft";
}

function getTextAlignLabel(
    text: typeof t.textShadowGenerator,
    align: TextAlign,
) {
    const labels = text as {
        alignLeft?: string;
        alignCenter?: string;
        alignRight?: string;
    };

    if (align === "left") return labels.alignLeft ?? "Left";
    if (align === "right") return labels.alignRight ?? "Right";

    return labels.alignCenter ?? "Center";
}

export default function TextShadowGeneratorTool() {
    const text = t.textShadowGenerator;
    const meta = t.toolMeta.textShadowGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const [settings, setSettings] =
        useState<TextShadowSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const safeTextColor = getSafeHexColor(settings.textColor, "#2A1F1B");
    const safeShadowColor = getSafeHexColor(settings.shadowColor, "#F28C6F");
    const safeBackgroundColor = getSafeHexColor(
        settings.backgroundColor,
        "#FFF7F3",
    );

    const primaryShadow = useMemo(() => {
        return `${settings.offsetX}px ${settings.offsetY}px ${settings.blurRadius}px ${getRgba(
            safeShadowColor,
            settings.shadowOpacity,
        )}`;
    }, [
        settings.offsetX,
        settings.offsetY,
        settings.blurRadius,
        settings.shadowOpacity,
        safeShadowColor,
    ]);

    const secondShadow = useMemo(() => {
        return `${settings.secondOffsetX}px ${settings.secondOffsetY}px ${settings.secondBlurRadius}px ${getRgba(
            safeShadowColor,
            settings.secondShadowOpacity,
        )}`;
    }, [
        settings.secondOffsetX,
        settings.secondOffsetY,
        settings.secondBlurRadius,
        settings.secondShadowOpacity,
        safeShadowColor,
    ]);

    const textShadowValue = settings.useSecondShadow
        ? `${primaryShadow}, ${secondShadow}`
        : primaryShadow;

    const cssOutput = useMemo(() => {
        const shadowCss = settings.useSecondShadow
            ? `text-shadow:
    ${primaryShadow},
    ${secondShadow};`
            : `text-shadow: ${primaryShadow};`;

        return `.peach-text-shadow {
  color: ${safeTextColor};
  font-size: ${settings.fontSize}px;
  font-weight: ${settings.fontWeight};
  letter-spacing: ${settings.letterSpacing}px;
  text-align: ${settings.textAlign};
  ${shadowCss}
}`;
    }, [
        safeTextColor,
        settings.fontSize,
        settings.fontWeight,
        settings.letterSpacing,
        settings.textAlign,
        settings.useSecondShadow,
        primaryShadow,
        secondShadow,
    ]);

    const previewStyle: CSSProperties = {
        color: safeTextColor,
        fontSize: `${settings.fontSize}px`,
        fontWeight: settings.fontWeight,
        letterSpacing: `${settings.letterSpacing}px`,
        textAlign: settings.textAlign,
        textShadow: textShadowValue,
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

    function updateSetting<K extends keyof TextShadowSettings>(
        key: K,
        value: TextShadowSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function applyShadowStyle(nextStyle: TextShadowStyle) {
        setSettings((current) => {
            const sampleText = current.sampleText;

            if (nextStyle === "glow") {
                return {
                    ...current,
                    shadowStyle: "glow",
                    sampleText,
                    textColor: "#2A1F1B",
                    shadowColor: "#F28C6F",
                    backgroundColor: "#FFF7F3",
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 24,
                    shadowOpacity: 75,
                    fontSize: 58,
                    fontWeight: 800,
                    letterSpacing: 0,
                    textAlign: "center",
                    useSecondShadow: true,
                    secondOffsetX: 0,
                    secondOffsetY: 0,
                    secondBlurRadius: 44,
                    secondShadowOpacity: 35,
                };
            }

            if (nextStyle === "neon") {
                return {
                    ...current,
                    shadowStyle: "neon",
                    sampleText,
                    textColor: "#FFFFFF",
                    shadowColor: "#F28C6F",
                    backgroundColor: "#2A1F1B",
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: 10,
                    shadowOpacity: 95,
                    fontSize: 58,
                    fontWeight: 800,
                    letterSpacing: 1,
                    textAlign: "center",
                    useSecondShadow: true,
                    secondOffsetX: 0,
                    secondOffsetY: 0,
                    secondBlurRadius: 32,
                    secondShadowOpacity: 80,
                };
            }

            if (nextStyle === "retro") {
                return {
                    ...current,
                    shadowStyle: "retro",
                    sampleText,
                    textColor: "#2A1F1B",
                    shadowColor: "#F28C6F",
                    backgroundColor: "#FFF7F3",
                    offsetX: 5,
                    offsetY: 5,
                    blurRadius: 0,
                    shadowOpacity: 80,
                    fontSize: 58,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textAlign: "center",
                    useSecondShadow: true,
                    secondOffsetX: 10,
                    secondOffsetY: 10,
                    secondBlurRadius: 0,
                    secondShadowOpacity: 35,
                };
            }

            if (nextStyle === "hard") {
                return {
                    ...current,
                    shadowStyle: "hard",
                    sampleText,
                    textColor: "#2A1F1B",
                    shadowColor: "#F28C6F",
                    backgroundColor: "#FFF7F3",
                    offsetX: 8,
                    offsetY: 8,
                    blurRadius: 0,
                    shadowOpacity: 85,
                    fontSize: 56,
                    fontWeight: 800,
                    letterSpacing: 0,
                    textAlign: "center",
                    useSecondShadow: false,
                    secondOffsetX: 12,
                    secondOffsetY: 16,
                    secondBlurRadius: 26,
                    secondShadowOpacity: 24,
                };
            }

            if (nextStyle === "deep") {
                return {
                    ...current,
                    shadowStyle: "deep",
                    sampleText,
                    textColor: "#2A1F1B",
                    shadowColor: "#7A5A4F",
                    backgroundColor: "#FFF7F3",
                    offsetX: 8,
                    offsetY: 12,
                    blurRadius: 18,
                    shadowOpacity: 52,
                    fontSize: 58,
                    fontWeight: 800,
                    letterSpacing: 0,
                    textAlign: "center",
                    useSecondShadow: true,
                    secondOffsetX: 16,
                    secondOffsetY: 24,
                    secondBlurRadius: 34,
                    secondShadowOpacity: 24,
                };
            }

            return {
                ...current,
                shadowStyle: "soft",
                sampleText,
                textColor: "#2A1F1B",
                shadowColor: "#F28C6F",
                backgroundColor: "#FFF7F3",
                offsetX: 6,
                offsetY: 8,
                blurRadius: 14,
                shadowOpacity: 45,
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: 0,
                textAlign: "center",
                useSecondShadow: false,
                secondOffsetX: 12,
                secondOffsetY: 16,
                secondBlurRadius: 26,
                secondShadowOpacity: 24,
            };
        });

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            offsetX: randomNumber(-24, 24),
            offsetY: randomNumber(-24, 24),
            blurRadius: randomNumber(0, 40),
            shadowOpacity: randomNumber(20, 80),
            fontSize: randomNumber(36, 72),
            fontWeight: randomNumber(4, 9) * 100,
            letterSpacing: randomNumber(-2, 8),
            useSecondShadow: Math.random() > 0.55,
            secondOffsetX: randomNumber(-18, 28),
            secondOffsetY: randomNumber(-18, 32),
            secondBlurRadius: randomNumber(0, 50),
            secondShadowOpacity: randomNumber(12, 55),
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        setSettings((current) => ({
            ...current,
            shadowStyle: shadowStyles[Math.floor(Math.random() * shadowStyles.length)],
            textColor: randomHexColor(),
            shadowColor: randomHexColor(),
            backgroundColor: randomHexColor(),
            offsetX: randomNumber(-24, 24),
            offsetY: randomNumber(-24, 24),
            blurRadius: randomNumber(0, 40),
            shadowOpacity: randomNumber(20, 85),
            fontSize: randomNumber(32, 80),
            fontWeight: randomNumber(4, 9) * 100,
            letterSpacing: randomNumber(-2, 10),
            textAlign:
                textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)],
            useSecondShadow: Math.random() > 0.45,
            secondOffsetX: randomNumber(-24, 32),
            secondOffsetY: randomNumber(-24, 36),
            secondBlurRadius: randomNumber(0, 56),
            secondShadowOpacity: randomNumber(12, 60),
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
        <TextShadowPreview
            text={text}
            settings={settings}
            previewStyle={previewStyle}
            safeBackgroundColor={safeBackgroundColor}
        />
    );

    const desktopSettingsPanel = (
        <TextShadowSettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onApplyShadowStyle={applyShadowStyle}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
        />
    );

    const mobileSettingsPanel = (
        <TextShadowSettingsPanel
            text={text}
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
                        <div className="lg:sticky lg:top-6">
                            <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                                <div className="mb-5">
                                    <SectionHeader title={text.previewTitle} />

                                    <p className="mt-2 max-w-[320px] text-sm leading-6 text-slate-500">
                                        {meta.description}
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

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-slate-700">
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
                        <TextShadowMiniPreview
                            text={text}
                            settings={settings}
                            previewStyle={previewStyle}
                            safeBackgroundColor={safeBackgroundColor}
                        />

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function TextShadowPreview({
    text,
    settings,
    previewStyle,
    safeBackgroundColor,
}: {
    text: typeof t.textShadowGenerator;
    settings: TextShadowSettings;
    previewStyle: CSSProperties;
    safeBackgroundColor: string;
}) {
    return (
        <div
            className="flex h-[260px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-6 text-center md:min-h-[320px]"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            {settings.sampleText.trim() ? (
                <div
                    className="w-full max-w-full break-words leading-tight"
                    style={previewStyle}
                >
                    {settings.sampleText}
                </div>
            ) : (
                <p className="text-sm text-[#9C7B70]">{text.emptyPreview}</p>
            )}
        </div>
    );
}

function TextShadowMiniPreview({
    text,
    settings,
    previewStyle,
    safeBackgroundColor,
}: {
    text: typeof t.textShadowGenerator;
    settings: TextShadowSettings;
    previewStyle: CSSProperties;
    safeBackgroundColor: string;
}) {
    return (
        <div
            className="sticky top-0 z-10 flex h-32 items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white p-4 text-center"
            style={{ backgroundColor: safeBackgroundColor }}
        >
            {settings.sampleText.trim() ? (
                <div
                    className="w-full max-w-full break-words leading-tight"
                    style={{
                        ...previewStyle,
                        fontSize: `${Math.min(settings.fontSize, 34)}px`,
                    }}
                >
                    {settings.sampleText}
                </div>
            ) : (
                <p className="text-sm text-[#9C7B70]">{text.emptyPreview}</p>
            )}
        </div>
    );
}

function TextShadowSettingsPanel({
    text,
    settings,
    updateSetting,
    onApplyShadowStyle,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.textShadowGenerator;
    settings: TextShadowSettings;
    updateSetting: <K extends keyof TextShadowSettings>(
        key: K,
        value: TextShadowSettings[K],
    ) => void;
    onApplyShadowStyle: (style: TextShadowStyle) => void;
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

            <SettingGroup title={text.styleGroupTitle}>
                <div className="grid grid-cols-3 gap-2">
                    {shadowStyles.map((style) => {
                        const isActive = settings.shadowStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => onApplyShadowStyle(style)}
                                className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
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
            </SettingGroup>

            <SettingGroup title={text.colorsGroupTitle}>
                <div className={compact ? "grid grid-cols-3 gap-2" : "grid gap-4"}>
                    <ColorInput
                        label={text.textColorLabel}
                        value={settings.textColor}
                        compact={compact}
                        onChange={(value) => updateSetting("textColor", value)}
                    />

                    <ColorInput
                        label={text.shadowColorLabel}
                        value={settings.shadowColor}
                        compact={compact}
                        onChange={(value) => updateSetting("shadowColor", value)}
                    />

                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        compact={compact}
                        onChange={(value) => updateSetting("backgroundColor", value)}
                    />
                </div>
            </SettingGroup>

            <SettingGroup title={text.shadowGroupTitle}>
                <div className="grid grid-cols-2 gap-4">
                    <RangeControl
                        label={text.horizontalOffsetLabel}
                        value={settings.offsetX}
                        min={-50}
                        max={50}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("offsetX", value)}
                    />

                    <RangeControl
                        label={text.verticalOffsetLabel}
                        value={settings.offsetY}
                        min={-50}
                        max={50}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("offsetY", value)}
                    />

                    <RangeControl
                        label={text.blurRadiusLabel}
                        value={settings.blurRadius}
                        min={0}
                        max={80}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("blurRadius", value)}
                    />

                    <RangeControl
                        label={text.shadowOpacityLabel}
                        value={settings.shadowOpacity}
                        min={0}
                        max={100}
                        suffix="%"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowOpacity", value)}
                    />
                </div>
            </SettingGroup>

            <SettingGroup title={text.multipleShadowGroupTitle}>
                <button
                    type="button"
                    onClick={() =>
                        updateSetting("useSecondShadow", !settings.useSecondShadow)
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${settings.useSecondShadow
                            ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                            : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                        }`}
                >
                    {settings.useSecondShadow
                        ? text.secondShadowOn
                        : text.secondShadowOff}
                </button>

                {settings.useSecondShadow ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <RangeControl
                            label={text.secondHorizontalOffsetLabel}
                            value={settings.secondOffsetX}
                            min={-60}
                            max={60}
                            suffix="px"
                            compact={compact}
                            onChange={(value) => updateSetting("secondOffsetX", value)}
                        />

                        <RangeControl
                            label={text.secondVerticalOffsetLabel}
                            value={settings.secondOffsetY}
                            min={-60}
                            max={60}
                            suffix="px"
                            compact={compact}
                            onChange={(value) => updateSetting("secondOffsetY", value)}
                        />

                        <RangeControl
                            label={text.secondBlurRadiusLabel}
                            value={settings.secondBlurRadius}
                            min={0}
                            max={100}
                            suffix="px"
                            compact={compact}
                            onChange={(value) => updateSetting("secondBlurRadius", value)}
                        />

                        <RangeControl
                            label={text.secondShadowOpacityLabel}
                            value={settings.secondShadowOpacity}
                            min={0}
                            max={100}
                            suffix="%"
                            compact={compact}
                            onChange={(value) => updateSetting("secondShadowOpacity", value)}
                        />
                    </div>
                ) : null}
            </SettingGroup>

            <SettingGroup title={text.sizeGroupTitle}>
                <div className="grid grid-cols-2 gap-4">
                    <RangeControl
                        label={text.fontSizeLabel}
                        value={settings.fontSize}
                        min={24}
                        max={120}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("fontSize", value)}
                    />

                    <RangeControl
                        label={text.fontWeightLabel}
                        value={settings.fontWeight}
                        min={100}
                        max={900}
                        step={100}
                        suffix=""
                        compact={compact}
                        onChange={(value) => updateSetting("fontWeight", value)}
                    />

                    <RangeControl
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
                                    className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
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
    compact = false,
    onChange,
}: {
    label: string;
    value: string;
    compact?: boolean;
    onChange: (value: string) => void;
}) {
    const colorPickerValue = getSafeHexColor(value, "#F28C6F");

    return (
        <label className="block min-w-0">
            <span
                className={`mb-2 block break-words font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={
                    compact
                        ? "grid grid-cols-[34px_1fr] gap-1.5"
                        : "grid grid-cols-[54px_1fr] gap-3"
                }
            >
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-9" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full min-w-0 rounded-xl border border-[#F1E5DF] bg-white font-semibold uppercase text-slate-700 outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-9 px-1.5 text-[9px]" : "h-12 px-4 text-sm"
                        }`}
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
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const scrollY = window.scrollY;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;
        const originalWidth = document.body.style.width;
        const originalOverflow = document.body.style.overflow;

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);

            document.body.style.position = originalPosition;
            document.body.style.top = originalTop;
            document.body.style.width = originalWidth;
            document.body.style.overflow = originalOverflow;

            window.scrollTo(0, scrollY);
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