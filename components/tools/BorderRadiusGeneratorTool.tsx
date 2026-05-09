"use client";

import {
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
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

type RadiusStyle =
    | "softCard"
    | "pill"
    | "ticket"
    | "blob"
    | "leaf"
    | "arch";

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
    "softCard",
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

function getRadiusStyleValues(style: RadiusStyle) {
    if (style === "pill") {
        return {
            topLeft: 120,
            topRight: 120,
            bottomRight: 120,
            bottomLeft: 120,
        };
    }

    if (style === "ticket") {
        return {
            topLeft: 28,
            topRight: 10,
            bottomRight: 28,
            bottomLeft: 10,
        };
    }

    if (style === "blob") {
        return {
            topLeft: 64,
            topRight: 28,
            bottomRight: 56,
            bottomLeft: 22,
        };
    }

    if (style === "leaf") {
        return {
            topLeft: 72,
            topRight: 18,
            bottomRight: 72,
            bottomLeft: 18,
        };
    }

    if (style === "arch") {
        return {
            topLeft: 90,
            topRight: 90,
            bottomRight: 24,
            bottomLeft: 24,
        };
    }

    return {
        topLeft: 36,
        topRight: 36,
        bottomRight: 36,
        bottomLeft: 36,
    };
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

function getMatchedRadiusStyle(
    settings: Pick<
        BorderRadiusSettings,
        "topLeft" | "topRight" | "bottomRight" | "bottomLeft"
    >,
) {
    for (const style of radiusStyles) {
        const preset = getRadiusStyleValues(style);

        if (
            preset.topLeft === settings.topLeft &&
            preset.topRight === settings.topRight &&
            preset.bottomRight === settings.bottomRight &&
            preset.bottomLeft === settings.bottomLeft
        ) {
            return style;
        }
    }

    return null;
}

export default function BorderRadiusGeneratorTool() {
    const text = t.borderRadiusGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const allCornersLabel =
        (text as { allCornersLabel?: string }).allCornersLabel ?? "All Corners";

    const radiusStyleLabel =
        (text as { radiusStyle?: string }).radiusStyle ?? "Radius Style";

    const [settings, setSettings] =
        useState<BorderRadiusSettings>(defaultSettings);
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");
    const [activeStyle, setActiveStyle] = useState<RadiusStyle | null>(
        "softCard",
    );
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

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
        setSettings((current) => {
            const next = {
                ...current,
                [key]: value,
            };

            setActiveStyle(getMatchedRadiusStyle(next));
            return next;
        });

        setCopied(false);
        setCopyError("");
    }

    function applyRadiusStyle(style: RadiusStyle) {
        const preset = getRadiusStyleValues(style);

        setSettings((current) => ({
            ...current,
            ...preset,
        }));

        setActiveStyle(style);
        setCopied(false);
        setCopyError("");
    }

    function handleShuffle() {
        setSettings((current) => {
            const next = {
                ...current,
                topLeft: getRandomNumber(0, 160),
                topRight: getRandomNumber(0, 160),
                bottomRight: getRandomNumber(0, 160),
                bottomLeft: getRandomNumber(0, 160),
            };

            setActiveStyle(getMatchedRadiusStyle(next));
            return next;
        });

        setCopied(false);
        setCopyError("");
    }

    function handleRandom() {
        const next: BorderRadiusSettings = {
            boxWidth: getRandomNumber(180, 380),
            boxHeight: getRandomNumber(120, 280),
            boxColor: getRandomHexColor(),
            backgroundColor: getRandomHexColor(),
            topLeft: getRandomNumber(0, 160),
            topRight: getRandomNumber(0, 160),
            bottomRight: getRandomNumber(0, 160),
            bottomLeft: getRandomNumber(0, 160),
        };

        setSettings(next);
        setActiveStyle(getMatchedRadiusStyle(next));
        setCopied(false);
        setCopyError("");
    }

    function handleReset() {
        setSettings(defaultSettings);
        setActiveStyle("softCard");
        setCopied(false);
        setCopyError("");
    }

    async function handleCopyCss() {
        try {
            await navigator.clipboard.writeText(cssOutput);

            setCopied(true);
            setCopyError("");

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
            setCopyError(text.copyError);
        }
    }

    function handleAllCorners(value: number) {
        const next = {
            ...settings,
            topLeft: value,
            topRight: value,
            bottomRight: value,
            bottomLeft: value,
        };

        setSettings(next);
        setActiveStyle(getMatchedRadiusStyle(next));
        setCopied(false);
        setCopyError("");
    }

    const allCornersValue =
        settings.topLeft === settings.topRight &&
            settings.topRight === settings.bottomRight &&
            settings.bottomRight === settings.bottomLeft
            ? settings.topLeft
            : 0;

    const previewPanel = (
        <RadiusPreview
            safeBackgroundColor={safeBackgroundColor}
            safeBoxColor={safeBoxColor}
            settings={settings}
            borderRadiusValue={borderRadiusValue}
        />
    );

    const desktopSettingsPanel = (
        <RadiusSettingsPanel
            text={text}
            settings={settings}
            activeStyle={activeStyle}
            allCornersValue={allCornersValue}
            allCornersLabel={allCornersLabel}
            radiusStyleLabel={radiusStyleLabel}
            onApplyStyle={applyRadiusStyle}
            onShuffle={handleShuffle}
            onRandom={handleRandom}
            onReset={handleReset}
            onUpdateSetting={updateSetting}
            onAllCornersChange={handleAllCorners}
        />
    );

    const mobileSettingsPanel = (
        <RadiusSettingsPanel
            text={text}
            settings={settings}
            activeStyle={activeStyle}
            allCornersValue={allCornersValue}
            allCornersLabel={allCornersLabel}
            radiusStyleLabel={radiusStyleLabel}
            onApplyStyle={applyRadiusStyle}
            onShuffle={handleShuffle}
            onRandom={handleRandom}
            onReset={handleReset}
            onUpdateSetting={updateSetting}
            onAllCornersChange={handleAllCorners}
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

                                <p className="mt-2 max-w-[360px] text-sm leading-6 text-gray-500">
                                    {text.previewDescription}
                                </p>
                            </div>

                            {previewPanel}
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.outputTitle} />

                                <button
                                    type="button"
                                    onClick={handleCopyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copied ? t.common.copied : text.copyCss}
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
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="shrink-0 bg-white pb-3">
                            <RadiusPreview
                                safeBackgroundColor={safeBackgroundColor}
                                safeBoxColor={safeBoxColor}
                                settings={settings}
                                borderRadiusValue={borderRadiusValue}
                                compact
                            />
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto pt-1">
                            {mobileSettingsPanel}
                        </div>
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function getPreviewBoxSize({
    boxWidth,
    boxHeight,
    compact = false,
}: {
    boxWidth: number;
    boxHeight: number;
    compact?: boolean;
}) {
    const safeWidth = Math.max(boxWidth, 1);
    const safeHeight = Math.max(boxHeight, 1);

    const maxWidth = compact ? 300 : 520;
    const maxHeight = compact ? 108 : 260;

    const scale = Math.min(maxWidth / safeWidth, maxHeight / safeHeight, 1);

    return {
        width: Math.max(32, Math.round(safeWidth * scale)),
        height: Math.max(32, Math.round(safeHeight * scale)),
    };
}

function RadiusPreview({
    safeBackgroundColor,
    safeBoxColor,
    settings,
    borderRadiusValue,
    compact = false,
}: {
    safeBackgroundColor: string;
    safeBoxColor: string;
    settings: BorderRadiusSettings;
    borderRadiusValue: string;
    compact?: boolean;
}) {
    const previewSize = getPreviewBoxSize({
        boxWidth: settings.boxWidth,
        boxHeight: settings.boxHeight,
        compact,
    });

    return (
        <div
            className={
                compact
                    ? "flex h-36 w-full items-center justify-center rounded-2xl border border-[#F1E5DF] p-3"
                    : "flex aspect-square w-full items-center justify-center rounded-3xl border border-[#F1E5DF] p-5 md:aspect-auto md:min-h-[360px] md:p-8"
            }
            style={{ backgroundColor: safeBackgroundColor }}
        >
            <div
                className="flex items-center justify-center text-center shadow-sm"
                style={{
                    width: `${previewSize.width}px`,
                    height: `${previewSize.height}px`,
                    backgroundColor: safeBoxColor,
                    borderRadius: borderRadiusValue,
                }}
            >
                <span
                    className={
                        compact
                            ? "text-xs font-semibold text-white"
                            : "text-sm font-semibold text-white"
                    }
                >
                    Peach Lab
                </span>
            </div>
        </div>
    );
}

function RadiusSettingsPanel({
    text,
    settings,
    activeStyle,
    allCornersValue,
    allCornersLabel,
    radiusStyleLabel,
    onApplyStyle,
    onShuffle,
    onRandom,
    onReset,
    onUpdateSetting,
    onAllCornersChange,
    compact = false,
}: {
    text: typeof t.borderRadiusGenerator;
    settings: BorderRadiusSettings;
    activeStyle: RadiusStyle | null;
    allCornersValue: number;
    allCornersLabel: string;
    radiusStyleLabel: string;
    onApplyStyle: (style: RadiusStyle) => void;
    onShuffle: () => void;
    onRandom: () => void;
    onReset: () => void;
    onUpdateSetting: <K extends keyof BorderRadiusSettings>(
        key: K,
        value: BorderRadiusSettings[K],
    ) => void;
    onAllCornersChange: (value: number) => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div>
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {radiusStyleLabel}
                </span>

                <div
                    className={
                        compact
                            ? "grid grid-cols-2 gap-2"
                            : "grid grid-cols-2 gap-3"
                    }
                >
                    {radiusStyles.map((style) => {
                        const isActive = activeStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => onApplyStyle(style)}
                                className={`rounded-2xl border font-semibold transition ${compact
                                    ? "px-3 py-2 text-xs"
                                    : "px-4 py-3 text-sm"
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

            <div
                className={
                    compact
                        ? "grid grid-cols-3 gap-2"
                        : "grid grid-cols-3 gap-3"
                }
            >
                <button
                    type="button"
                    onClick={onShuffle}
                    className={`rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.shuffle}
                </button>

                <button
                    type="button"
                    onClick={onRandom}
                    className={`rounded-2xl bg-[#F28C6F] font-semibold text-white transition hover:bg-[#E6765B] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.randomAll}
                </button>

                <button
                    type="button"
                    onClick={onReset}
                    className={`rounded-2xl border border-[#F4C8BA] bg-white font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.reset}
                </button>
            </div>

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-2"
                        : "grid gap-3 sm:grid-cols-2"
                }
            >
                <ColorInput
                    label={text.boxColorLabel}
                    value={settings.boxColor}
                    fallback="#F28C6F"
                    compact={compact}
                    onChange={(value) => onUpdateSetting("boxColor", value)}
                />

                <ColorInput
                    label={text.backgroundColorLabel}
                    value={settings.backgroundColor}
                    fallback="#FFF7F3"
                    compact={compact}
                    onChange={(value) =>
                        onUpdateSetting("backgroundColor", value)
                    }
                />
            </div>

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-3"
                        : "grid gap-3 sm:grid-cols-2"
                }
            >
                <NumberInput
                    label={text.boxWidthLabel}
                    value={settings.boxWidth}
                    min={80}
                    max={600}
                    compact={compact}
                    onChange={(value) => onUpdateSetting("boxWidth", value)}
                />

                <NumberInput
                    label={text.boxHeightLabel}
                    value={settings.boxHeight}
                    min={80}
                    max={400}
                    compact={compact}
                    onChange={(value) => onUpdateSetting("boxHeight", value)}
                />
            </div>

            <div
                className={
                    compact
                        ? "grid grid-cols-2 gap-3"
                        : "space-y-5"
                }
            >
                <RangeInput
                    label={allCornersLabel}
                    value={allCornersValue}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={onAllCornersChange}
                />

                <RangeInput
                    label={text.topLeftLabel}
                    value={settings.topLeft}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => onUpdateSetting("topLeft", value)}
                />

                <RangeInput
                    label={text.topRightLabel}
                    value={settings.topRight}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => onUpdateSetting("topRight", value)}
                />

                <RangeInput
                    label={text.bottomRightLabel}
                    value={settings.bottomRight}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => onUpdateSetting("bottomRight", value)}
                />

                <RangeInput
                    label={text.bottomLeftLabel}
                    value={settings.bottomLeft}
                    min={0}
                    max={160}
                    suffix="px"
                    compact={compact}
                    onChange={(value) => onUpdateSetting("bottomLeft", value)}
                />
            </div>
        </div>
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-1 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
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
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-2 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
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

                <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2">
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

function NumberInput({
    label,
    value,
    min,
    max,
    onChange,
    compact = false,
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
    compact = false,
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
                className={`mb-1.5 block truncate font-semibold text-gray-800 ${compact ? "text-[10px]" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={`grid gap-1.5 ${compact ? "grid-cols-[34px_1fr]" : "grid-cols-[58px_1fr]"
                    }`}
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
                    className={`w-full rounded-xl border border-[#F1E5DF] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                        ? "h-10 px-2 text-[11px]"
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
    onChange,
    compact = false,
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
                        : "mb-2 flex items-center justify-between gap-4"
                }
            >
                <span
                    className={
                        compact
                            ? "min-w-0 truncate whitespace-nowrap text-[11px] font-semibold leading-5 text-gray-800"
                            : "text-sm font-semibold text-gray-800"
                    }
                >
                    {label}
                </span>

                <span
                    className={
                        compact
                            ? "min-w-[40px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-0.5 text-center text-[11px] font-semibold leading-5 text-[#7A5A4F]"
                            : "rounded-full bg-[#FFF7F3] px-3 py-1 text-xs font-semibold text-[#7A5A4F]"
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