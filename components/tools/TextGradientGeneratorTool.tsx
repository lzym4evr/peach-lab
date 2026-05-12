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

type FontWeight = "400" | "500" | "700" | "800";
type GradientStyle = "peach" | "sunset" | "ocean" | "candy" | "neon" | "gold";
type GradientType = "linear" | "radial" | "conic";
type TextAlign = "left" | "center" | "right";
type BackgroundMode = "light" | "dark" | "transparent" | "custom";

type TextGradientSettings = {
    gradientStyle: GradientStyle;
    gradientType: GradientType;
    sampleText: string;
    fontSize: number;
    fontWeight: FontWeight;
    letterSpacing: number;
    textAlign: TextAlign;
    gradientAngle: number;
    colorOne: string;
    colorTwo: string;
    colorThree: string;
    backgroundMode: BackgroundMode;
    backgroundColor: string;
};

const defaultSettings: TextGradientSettings = {
    gradientStyle: "peach",
    gradientType: "linear",
    sampleText: "Peach Lab",
    fontSize: 64,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
    gradientAngle: 90,
    colorOne: "#F28C6F",
    colorTwo: "#FFD6C8",
    colorThree: "#E6765B",
    backgroundMode: "light",
    backgroundColor: "#FFF7F3",
};

const fontWeights: FontWeight[] = ["400", "500", "700", "800"];
const gradientStyles: GradientStyle[] = [
    "peach",
    "sunset",
    "ocean",
    "candy",
    "neon",
    "gold",
];
const gradientTypes: GradientType[] = ["linear", "radial", "conic"];
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

function getFontWeightLabel(
    text: typeof t.textGradientGenerator,
    weight: FontWeight,
) {
    if (weight === "400") return text.normal;
    if (weight === "500") return text.medium;
    if (weight === "700") return text.bold;

    return text.extraBold;
}

function getGradientStyleLabel(
    text: typeof t.textGradientGenerator,
    style: GradientStyle,
) {
    if (style === "sunset") return text.styleSunset;
    if (style === "ocean") return text.styleOcean;
    if (style === "candy") return text.styleCandy;
    if (style === "neon") return text.styleNeon;
    if (style === "gold") return text.styleGold;

    return text.stylePeach;
}

function getGradientTypeLabel(
    text: typeof t.textGradientGenerator,
    type: GradientType,
) {
    if (type === "radial") return text.typeRadial;
    if (type === "conic") return text.typeConic;

    return text.typeLinear;
}

function getTextAlignLabel(
    text: typeof t.textGradientGenerator,
    align: TextAlign,
) {
    if (align === "left") return text.alignLeft;
    if (align === "right") return text.alignRight;

    return text.alignCenter;
}

function getBackgroundModeLabel(
    text: typeof t.textGradientGenerator,
    mode: BackgroundMode,
) {
    if (mode === "dark") return text.backgroundDark;
    if (mode === "transparent") return text.backgroundTransparent;
    if (mode === "custom") return text.backgroundCustom;

    return text.backgroundLight;
}

function getPreviewBackgroundColor(settings: TextGradientSettings) {
    if (settings.backgroundMode === "dark") return "#2A1F1B";
    if (settings.backgroundMode === "transparent") return "transparent";
    if (settings.backgroundMode === "custom") {
        return getSafeHexColor(settings.backgroundColor, "#FFF7F3");
    }

    return "#FFF7F3";
}

function getGradientValue(
    settings: TextGradientSettings,
    safeColorOne: string,
    safeColorTwo: string,
    safeColorThree: string,
) {
    if (settings.gradientType === "radial") {
        return `radial-gradient(circle, ${safeColorOne}, ${safeColorTwo}, ${safeColorThree})`;
    }

    if (settings.gradientType === "conic") {
        return `conic-gradient(from ${settings.gradientAngle}deg, ${safeColorOne}, ${safeColorTwo}, ${safeColorThree}, ${safeColorOne})`;
    }

    return `linear-gradient(${settings.gradientAngle}deg, ${safeColorOne}, ${safeColorTwo}, ${safeColorThree})`;
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

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export default function TextGradientGeneratorTool() {
    const text = t.textGradientGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const [settings, setSettings] =
        useState<TextGradientSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [downloadError, setDownloadError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const safeColorOne = getSafeHexColor(settings.colorOne, "#F28C6F");
    const safeColorTwo = getSafeHexColor(settings.colorTwo, "#FFD6C8");
    const safeColorThree = getSafeHexColor(settings.colorThree, "#E6765B");
    const safeBackgroundColor = getPreviewBackgroundColor(settings);

    const gradientValue = getGradientValue(
        settings,
        safeColorOne,
        safeColorTwo,
        safeColorThree,
    );

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
  letter-spacing: ${settings.letterSpacing}px;
  text-align: ${settings.textAlign};
  line-height: 1.1;
}`;
    }, [
        gradientValue,
        settings.fontSize,
        settings.fontWeight,
        settings.letterSpacing,
        settings.textAlign,
    ]);

    const previewStyle: CSSProperties = {
        backgroundImage: gradientValue,
        backgroundSize: "100%",
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        fontSize: `${settings.fontSize}px`,
        fontWeight: settings.fontWeight,
        letterSpacing: `${settings.letterSpacing}px`,
        textAlign: settings.textAlign,
        lineHeight: 1.1,
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
        setDownloadError("");
    }

    function updateSetting<K extends keyof TextGradientSettings>(
        key: K,
        value: TextGradientSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function applyGradientStyle(nextStyle: GradientStyle) {
        setSettings((current) => {
            const sampleText = current.sampleText;

            if (nextStyle === "sunset") {
                return {
                    ...current,
                    gradientStyle: "sunset",
                    sampleText,
                    gradientType: "linear",
                    gradientAngle: 45,
                    colorOne: "#FF7A59",
                    colorTwo: "#FFD166",
                    colorThree: "#EF476F",
                    backgroundMode: "light",
                };
            }

            if (nextStyle === "ocean") {
                return {
                    ...current,
                    gradientStyle: "ocean",
                    sampleText,
                    gradientType: "linear",
                    gradientAngle: 120,
                    colorOne: "#00B4D8",
                    colorTwo: "#90E0EF",
                    colorThree: "#0077B6",
                    backgroundMode: "light",
                };
            }

            if (nextStyle === "candy") {
                return {
                    ...current,
                    gradientStyle: "candy",
                    sampleText,
                    gradientType: "radial",
                    gradientAngle: 90,
                    colorOne: "#FF8FAB",
                    colorTwo: "#FFC2D1",
                    colorThree: "#B8C0FF",
                    backgroundMode: "light",
                };
            }

            if (nextStyle === "neon") {
                return {
                    ...current,
                    gradientStyle: "neon",
                    sampleText,
                    gradientType: "linear",
                    gradientAngle: 90,
                    colorOne: "#00F5D4",
                    colorTwo: "#F15BB5",
                    colorThree: "#FEE440",
                    backgroundMode: "dark",
                };
            }

            if (nextStyle === "gold") {
                return {
                    ...current,
                    gradientStyle: "gold",
                    sampleText,
                    gradientType: "linear",
                    gradientAngle: 110,
                    colorOne: "#8A5A00",
                    colorTwo: "#FFD166",
                    colorThree: "#FFF3B0",
                    backgroundMode: "dark",
                };
            }

            return {
                ...current,
                gradientStyle: "peach",
                sampleText,
                gradientType: "linear",
                gradientAngle: 90,
                colorOne: "#F28C6F",
                colorTwo: "#FFD6C8",
                colorThree: "#E6765B",
                backgroundMode: "light",
            };
        });

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            fontSize: getRandomNumber(42, 88),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            letterSpacing: getRandomNumber(-2, 10),
            gradientAngle: getRandomNumber(0, 360),
            gradientType:
                gradientTypes[Math.floor(Math.random() * gradientTypes.length)],
            textAlign:
                textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)],
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        setSettings((current) => ({
            ...current,
            gradientStyle:
                gradientStyles[Math.floor(Math.random() * gradientStyles.length)],
            fontSize: getRandomNumber(42, 88),
            fontWeight: fontWeights[Math.floor(Math.random() * fontWeights.length)],
            letterSpacing: getRandomNumber(-2, 10),
            gradientAngle: getRandomNumber(0, 360),
            gradientType:
                gradientTypes[Math.floor(Math.random() * gradientTypes.length)],
            textAlign:
                textAlignOptions[Math.floor(Math.random() * textAlignOptions.length)],
            colorOne: getRandomHexColor(),
            colorTwo: getRandomHexColor(),
            colorThree: getRandomHexColor(),
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

    function createSvgMarkup() {
        const width = 1200;
        const height = 720;
        const centerX = width / 2;
        const centerY = height / 2;
        const displayText = settings.sampleText.trim() || "Peach Lab";
        const escapedText = escapeXml(displayText);
        const dominantBaseline = "middle";

        const gradientId = "peachTextGradient";
        const backgroundFill =
            settings.backgroundMode === "transparent"
                ? "none"
                : safeBackgroundColor;

        const gradientDef =
            settings.gradientType === "radial"
                ? `<radialGradient id="${gradientId}" cx="50%" cy="50%" r="65%">
  <stop offset="0%" stop-color="${safeColorOne}" />
  <stop offset="50%" stop-color="${safeColorTwo}" />
  <stop offset="100%" stop-color="${safeColorThree}" />
</radialGradient>`
                : `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform="rotate(${settings.gradientAngle} 0.5 0.5)">
  <stop offset="0%" stop-color="${safeColorOne}" />
  <stop offset="50%" stop-color="${safeColorTwo}" />
  <stop offset="100%" stop-color="${safeColorThree}" />
</linearGradient>`;

        return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
${gradientDef}
</defs>
<rect width="100%" height="100%" fill="${backgroundFill}" />
<text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="${dominantBaseline}" fill="url(#${gradientId})" font-family="Arial, Helvetica, sans-serif" font-size="${settings.fontSize * 2.6}" font-weight="${settings.fontWeight}" letter-spacing="${settings.letterSpacing * 2.6}">${escapedText}</text>
</svg>`;
    }

    function downloadTextFile(content: string, filename: string, type: string) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
    }

    function handleDownloadSvg() {
        const svgMarkup = createSvgMarkup();

        downloadTextFile(
            svgMarkup,
            "peach-lab-gradient-text.svg",
            "image/svg+xml;charset=utf-8",
        );
    }

    function handleDownloadPng() {
        const svgMarkup = createSvgMarkup();
        const svgBlob = new Blob([svgMarkup], {
            type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 1200;
            canvas.height = 720;

            const context = canvas.getContext("2d");

            if (!context) {
                setDownloadError(text.downloadError);
                URL.revokeObjectURL(svgUrl);
                return;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            const pngUrl = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = "peach-lab-gradient-text.png";
            link.click();

            URL.revokeObjectURL(svgUrl);
        };

        image.onerror = () => {
            setDownloadError(text.downloadError);
            URL.revokeObjectURL(svgUrl);
        };

        image.src = svgUrl;
    }

    const previewPanel = (
        <TextGradientPreview
            settings={settings}
            previewStyle={previewStyle}
            safeBackgroundColor={safeBackgroundColor}
        />
    );

    const desktopSettingsPanel = (
        <TextGradientSettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onApplyGradientStyle={applyGradientStyle}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
        />
    );

    const mobileSettingsPanel = (
        <TextGradientSettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onApplyGradientStyle={applyGradientStyle}
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

                            <div className="mt-4 hidden grid-cols-2 gap-3 lg:grid">
                                <button
                                    type="button"
                                    onClick={handleDownloadPng}
                                    className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                                >
                                    {text.downloadPng}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadSvg}
                                    className="w-full rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                                >
                                    {text.downloadSvg}
                                </button>
                            </div>

                            {copyError ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {copyError}
                                </p>
                            ) : null}

                            {downloadError ? (
                                <p className="mt-3 text-sm font-medium text-red-500">
                                    {downloadError}
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
                downloadPngText={text.downloadPngShort}
                downloadSvgText={text.downloadSvgShort}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onDownloadPng={handleDownloadPng}
                onDownloadSvg={handleDownloadSvg}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controlsTitle}
                    preview={
                        <TextGradientMiniPreview
                            settings={settings}
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

function TextGradientPreview({
    settings,
    previewStyle,
    safeBackgroundColor,
}: {
    settings: TextGradientSettings;
    previewStyle: CSSProperties;
    safeBackgroundColor: string;
}) {
    const backgroundStyle =
        settings.backgroundMode === "transparent"
            ? getCheckerboardStyle()
            : { backgroundColor: safeBackgroundColor };

    return (
        <div
            className="flex h-[260px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-6 text-center md:min-h-[360px]"
            style={backgroundStyle}
        >
            <span
                className="inline-block max-w-full break-words"
                style={previewStyle}
            >
                {settings.sampleText.trim() || "Peach Lab"}
            </span>
        </div>
    );
}

function TextGradientMiniPreview({
    settings,
    previewStyle,
    safeBackgroundColor,
}: {
    settings: TextGradientSettings;
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
            <span
                className="inline-block max-w-full break-words"
                style={{
                    ...previewStyle,
                    fontSize: `${Math.min(settings.fontSize, 34)}px`,
                }}
            >
                {settings.sampleText.trim() || "Peach Lab"}
            </span>
        </div>
    );
}

function TextGradientSettingsPanel({
    text,
    settings,
    updateSetting,
    onApplyGradientStyle,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.textGradientGenerator;
    settings: TextGradientSettings;
    updateSetting: <K extends keyof TextGradientSettings>(
        key: K,
        value: TextGradientSettings[K],
    ) => void;
    onApplyGradientStyle: (style: GradientStyle) => void;
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
                    {gradientStyles.map((style) => {
                        const isActive = settings.gradientStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => onApplyGradientStyle(style)}
                                className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getGradientStyleLabel(text, style)}
                            </button>
                        );
                    })}
                </div>
            </SettingGroup>

            <SettingGroup title={text.typographyGroupTitle}>
                <div className="grid grid-cols-2 gap-4">
                    <RangeInput
                        label={text.fontSizeLabel}
                        value={settings.fontSize}
                        min={24}
                        max={120}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("fontSize", value)}
                    />

                    <RangeInput
                        label={text.gradientAngleLabel}
                        value={settings.gradientAngle}
                        min={0}
                        max={360}
                        suffix="deg"
                        compact={compact}
                        onChange={(value) => updateSetting("gradientAngle", value)}
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
                    <span className="mb-2 block text-sm font-semibold text-gray-800">
                        {text.gradientTypeLabel}
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                        {gradientTypes.map((type) => {
                            const isActive = settings.gradientType === type;

                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => updateSetting("gradientType", type)}
                                    className={`rounded-2xl border px-2 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                        } ${isActive
                                            ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                            : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                        }`}
                                >
                                    {getGradientTypeLabel(text, type)}
                                </button>
                            );
                        })}
                    </div>
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

            <SettingGroup title={text.colorsGroupTitle}>
                <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-4"}>
                    <div className={compact ? "contents" : "grid grid-cols-3 gap-3"}>
                        <ColorInput
                            label={text.colorOneLabel}
                            value={settings.colorOne}
                            fallback="#F28C6F"
                            compact={compact}
                            onChange={(value) => updateSetting("colorOne", value)}
                        />

                        <ColorInput
                            label={text.colorTwoLabel}
                            value={settings.colorTwo}
                            fallback="#FFD6C8"
                            compact={compact}
                            onChange={(value) => updateSetting("colorTwo", value)}
                        />

                        <ColorInput
                            label={text.colorThreeLabel}
                            value={settings.colorThree}
                            fallback="#E6765B"
                            compact={compact}
                            onChange={(value) => updateSetting("colorThree", value)}
                        />
                    </div>

                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        fallback="#FFF7F3"
                        compact={compact}
                        onChange={(value) => updateSetting("backgroundColor", value)}
                    />
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
                    className={`w-full min-w-0 rounded-xl border border-[#F1E5DF] bg-white font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-9 px-1.5 text-[9px]" : "h-12 px-4 text-sm"
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
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full accent-[#F28C6F]"
            />
        </label>
    );
}

function MobileActionBar({
    settingsButtonText,
    downloadPngText,
    downloadSvgText,
    onOpenSettings,
    onDownloadPng,
    onDownloadSvg,
}: {
    settingsButtonText: string;
    downloadPngText: string;
    downloadSvgText: string;
    onOpenSettings: () => void;
    onDownloadPng: () => void;
    onDownloadSvg: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF0EA]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownloadPng}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {downloadPngText}
                </button>

                <button
                    type="button"
                    onClick={onDownloadSvg}
                    className="rounded-2xl border border-[#F4C8BA] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#E6765B] transition hover:bg-[#FFF0EA]"
                >
                    {downloadSvgText}
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