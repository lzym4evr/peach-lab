"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type ButtonSettings = {
    buttonText: string;
    fontSize: number;
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    borderWidth: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
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
    shadowOffsetX: 0,
    shadowOffsetY: 10,
    shadowBlur: 24,
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

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const settingsTitle =
        (text as { settingsTitle?: string }).settingsTitle ??
        text.controlsTitle ??
        "Button Settings";

    const [settings, setSettings] = useState<ButtonSettings>(defaultSettings);
    const [copiedKey, setCopiedKey] = useState("");
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

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

    const boxShadowValue = `${settings.shadowOffsetX}px ${settings.shadowOffsetY}px ${settings.shadowBlur}px ${shadowRgba}`;

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

    function updateSetting<K extends keyof ButtonSettings>(
        key: K,
        value: ButtonSettings[K],
    ) {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));

        clearCopyState();
    }

    function handleShuffle() {
        setSettings((current) => ({
            ...current,
            fontSize: getRandomNumber(14, 22),
            borderRadius: getRandomNumber(4, 40),
            borderWidth: getRandomNumber(0, 4),
            shadowOffsetX: getRandomNumber(-16, 16),
            shadowOffsetY: getRandomNumber(0, 24),
            shadowBlur: getRandomNumber(0, 45),
            shadowOpacity: getRandomNumber(10, 60),
        }));

        clearCopyState();
    }

    function handleRandomAll() {
        setSettings({
            buttonText: "Peach Button",
            fontSize: getRandomNumber(14, 22),
            paddingX: getRandomNumber(18, 42),
            paddingY: getRandomNumber(10, 20),
            borderRadius: getRandomNumber(4, 40),
            borderWidth: getRandomNumber(0, 4),
            shadowOffsetX: getRandomNumber(-20, 20),
            shadowOffsetY: getRandomNumber(0, 24),
            shadowBlur: getRandomNumber(0, 45),
            shadowOpacity: getRandomNumber(10, 60),
            backgroundColor: getRandomHexColor(),
            textColor: getRandomHexColor(),
            borderColor: getRandomHexColor(),
            shadowColor: getRandomHexColor(),
            previewBackground: getRandomHexColor(),
        });

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

    const previewProps = {
        settings,
        safeBackgroundColor,
        safeTextColor,
        safeBorderColor,
        safePreviewBackground,
        boxShadowValue,
    };

    const settingsPanel = (
        <CssButtonSettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
        />
    );

    const mobileSettingsPanel = (
        <CssButtonSettingsPanel
            text={text}
            settings={settings}
            updateSetting={updateSetting}
            onShuffle={handleShuffle}
            onRandom={handleRandomAll}
            onReset={handleReset}
            compact
        />
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="mb-5">
                            <SectionHeader title={text.previewTitle} />

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <ButtonPreview {...previewProps} />
                    </section>

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
                    <SectionHeader title={settingsTitle} />

                    <div className="mt-5">{settingsPanel}</div>
                </section>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={settingsTitle}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <div className="sticky top-0 z-10 bg-white pb-3">
                            <ButtonMiniPreview {...previewProps} />
                        </div>

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function ButtonPreview({
    settings,
    safeBackgroundColor,
    safeTextColor,
    safeBorderColor,
    safePreviewBackground,
    boxShadowValue,
}: {
    settings: ButtonSettings;
    safeBackgroundColor: string;
    safeTextColor: string;
    safeBorderColor: string;
    safePreviewBackground: string;
    boxShadowValue: string;
}) {
    return (
        <div
            className="flex min-h-[320px] items-center justify-center rounded-3xl border border-[#F1E5DF] p-8 md:min-h-[360px]"
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
    );
}

function ButtonMiniPreview({
    settings,
    safeBackgroundColor,
    safeTextColor,
    safeBorderColor,
    safePreviewBackground,
    boxShadowValue,
}: {
    settings: ButtonSettings;
    safeBackgroundColor: string;
    safeTextColor: string;
    safeBorderColor: string;
    safePreviewBackground: string;
    boxShadowValue: string;
}) {
    return (
        <div
            className="flex h-36 items-center justify-center rounded-2xl border border-[#F1E5DF] p-4"
            style={{ backgroundColor: safePreviewBackground }}
        >
            <button
                type="button"
                style={{
                    padding: `${Math.max(8, settings.paddingY * 0.75)}px ${Math.max(
                        16,
                        settings.paddingX * 0.75,
                    )}px`,
                    border: `${settings.borderWidth}px solid ${safeBorderColor}`,
                    borderRadius: `${settings.borderRadius}px`,
                    backgroundColor: safeBackgroundColor,
                    color: safeTextColor,
                    fontSize: `${Math.max(12, settings.fontSize * 0.85)}px`,
                    fontWeight: 700,
                    lineHeight: 1,
                    boxShadow: boxShadowValue,
                }}
            >
                {settings.buttonText.trim() || "Peach Button"}
            </button>
        </div>
    );
}

function CssButtonSettingsPanel({
    text,
    settings,
    updateSetting,
    onShuffle,
    onRandom,
    onReset,
    compact = false,
}: {
    text: typeof t.cssButtonGenerator;
    settings: ButtonSettings;
    updateSetting: <K extends keyof ButtonSettings>(
        key: K,
        value: ButtonSettings[K],
    ) => void;
    onShuffle: () => void;
    onRandom: () => void;
    onReset: () => void;
    compact?: boolean;
}) {
    const colorGroupTitle =
        (text as { colorGroupTitle?: string }).colorGroupTitle ?? "Colors";

    const sizeGroupTitle =
        (text as { sizeGroupTitle?: string }).sizeGroupTitle ?? "Size";

    const shapeGroupTitle =
        (text as { shapeGroupTitle?: string }).shapeGroupTitle ?? "Shape";

    const shadowGroupTitle =
        (text as { shadowGroupTitle?: string }).shadowGroupTitle ?? "Shadow";

    const shadowOffsetXShortLabel =
        (text as { shadowOffsetXShortLabel?: string }).shadowOffsetXShortLabel ??
        "Offset X";

    const shadowOffsetYShortLabel =
        (text as { shadowOffsetYShortLabel?: string }).shadowOffsetYShortLabel ??
        "Offset Y";

    const shadowBlurShortLabel =
        (text as { shadowBlurShortLabel?: string }).shadowBlurShortLabel ?? "Blur";

    const shadowOpacityShortLabel =
        (text as { shadowOpacityShortLabel?: string }).shadowOpacityShortLabel ??
        "Opacity";

    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div className="grid grid-cols-2 gap-3">
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

            <label className="block">
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {text.buttonTextLabel}
                </span>

                <input
                    value={settings.buttonText}
                    onChange={(event) =>
                        updateSetting("buttonText", event.target.value)
                    }
                    placeholder={text.buttonTextPlaceholder}
                    className={`w-full rounded-xl border border-[#F1E5DF] px-4 text-sm outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact ? "h-11" : "h-12"
                        }`}
                />
            </label>

            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    {colorGroupTitle}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <ColorInput
                        label={text.backgroundColorLabel}
                        value={settings.backgroundColor}
                        fallback="#F28C6F"
                        compact={compact}
                        onChange={(value) => updateSetting("backgroundColor", value)}
                    />

                    <ColorInput
                        label={text.textColorLabel}
                        value={settings.textColor}
                        fallback="#FFFFFF"
                        compact={compact}
                        onChange={(value) => updateSetting("textColor", value)}
                    />

                    <ColorInput
                        label={text.borderColorLabel}
                        value={settings.borderColor}
                        fallback="#F28C6F"
                        compact={compact}
                        onChange={(value) => updateSetting("borderColor", value)}
                    />

                    <ColorInput
                        label={text.shadowColorLabel}
                        value={settings.shadowColor}
                        fallback="#F28C6F"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowColor", value)}
                    />

                    <div className={compact ? "col-span-2" : ""}>
                        <ColorInput
                            label={text.previewBackgroundLabel}
                            value={settings.previewBackground}
                            fallback="#FFF7F3"
                            compact={compact}
                            onChange={(value) =>
                                updateSetting("previewBackground", value)
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    {sizeGroupTitle}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <RangeInput
                        label={text.fontSizeLabel}
                        value={settings.fontSize}
                        min={10}
                        max={32}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("fontSize", value)}
                    />

                    <RangeInput
                        label={text.borderWidthLabel}
                        value={settings.borderWidth}
                        min={0}
                        max={8}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("borderWidth", value)}
                    />

                    <RangeInput
                        label={text.paddingXLabel}
                        value={settings.paddingX}
                        min={8}
                        max={80}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("paddingX", value)}
                    />

                    <RangeInput
                        label={text.paddingYLabel}
                        value={settings.paddingY}
                        min={6}
                        max={40}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("paddingY", value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    {shapeGroupTitle}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <RangeInput
                        label={text.borderRadiusLabel}
                        value={settings.borderRadius}
                        min={0}
                        max={80}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("borderRadius", value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                    {shadowGroupTitle}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <RangeInput
                        label={shadowOffsetXShortLabel}
                        value={settings.shadowOffsetX}
                        min={-60}
                        max={60}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowOffsetX", value)}
                    />

                    <RangeInput
                        label={shadowOffsetYShortLabel}
                        value={settings.shadowOffsetY}
                        min={-60}
                        max={60}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowOffsetY", value)}
                    />

                    <RangeInput
                        label={shadowBlurShortLabel}
                        value={settings.shadowBlur}
                        min={0}
                        max={100}
                        suffix="px"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowBlur", value)}
                    />

                    <RangeInput
                        label={shadowOpacityShortLabel}
                        value={settings.shadowOpacity}
                        min={0}
                        max={100}
                        suffix="%"
                        compact={compact}
                        onChange={(value) => updateSetting("shadowOpacity", value)}
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={onReset}
                className={`w-full rounded-2xl border border-[#F4C8BA] bg-white text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] ${compact ? "px-4 py-2.5" : "px-4 py-3"
                    }`}
            >
                {text.reset}
            </button>
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
                className={`mb-2 block truncate font-semibold text-gray-800 ${compact ? "text-[11px]" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={
                    compact
                        ? "grid grid-cols-[34px_1fr] gap-1.5"
                        : "grid grid-cols-[58px_1fr] gap-3"
                }
            >
                <input
                    type="color"
                    value={colorPickerValue}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-10" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full min-w-0 rounded-xl border border-[#F1E5DF] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                        ? "h-10 px-2 text-[10px]"
                        : "h-12 px-4 text-sm"
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
                        ? "mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5"
                        : "mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
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
                            : "min-w-[48px] shrink-0 rounded-full bg-[#FFF7F3] px-3 py-1 text-center text-xs font-semibold text-[#7A5A4F]"
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
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
                }`}
            onClick={handleClose}
        >
            <div
                className={`ml-auto flex h-full max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-[#F4C8BA] bg-white shadow-[0_18px_50px_rgba(42,31,27,0.2)] transition-transform duration-200 ease-out ${isVisible ? "translate-y-0" : "translate-y-full"
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

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}