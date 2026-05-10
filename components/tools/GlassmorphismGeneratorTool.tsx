"use client";

import {
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type GlassStyle = "frosted" | "clear" | "tinted" | "dark" | "neon" | "crystal";

const glassStyles: GlassStyle[] = [
    "frosted",
    "clear",
    "tinted",
    "dark",
    "neon",
    "crystal",
];

function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function getSafeHexColor(value: string, fallback: string) {
    return isValidHexColor(value) ? value : fallback;
}

function hexToRgb(hex: string) {
    const safeHex = getSafeHexColor(hex, "#FFFFFF");
    const cleanHex = safeHex.replace("#", "");

    return {
        r: parseInt(cleanHex.slice(0, 2), 16),
        g: parseInt(cleanHex.slice(2, 4), 16),
        b: parseInt(cleanHex.slice(4, 6), 16),
    };
}

function hexToRgba(hex: string, alpha: number) {
    const rgb = hexToRgb(hex);

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
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

function getGlassStyleLabel(
    text: typeof t.glassmorphismGenerator,
    style: GlassStyle,
) {
    const labels = text as {
        styleFrosted?: string;
        styleClear?: string;
        styleTinted?: string;
        styleDark?: string;
        styleNeon?: string;
        styleCrystal?: string;
    };

    if (style === "clear") return labels.styleClear ?? "Clear";
    if (style === "tinted") return labels.styleTinted ?? "Tinted";
    if (style === "dark") return labels.styleDark ?? "Dark";
    if (style === "neon") return labels.styleNeon ?? "Neon";
    if (style === "crystal") return labels.styleCrystal ?? "Crystal";

    return labels.styleFrosted ?? "Frosted";
}

export default function GlassmorphismGeneratorTool() {
    const text = t.glassmorphismGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const glassStyleLabel =
        (text as { glassStyle?: string }).glassStyle ?? "Glass Style";

    const saturationLabel =
        (text as { saturation?: string }).saturation ?? "Saturation";

    const highlightLabel =
        (text as { highlight?: string }).highlight ?? "Highlight";

    const [backgroundColor1, setBackgroundColor1] = useState("#F28C6F");
    const [backgroundColor2, setBackgroundColor2] = useState("#FFD6C8");
    const [glassColor, setGlassColor] = useState("#FFFFFF");
    const [glassStyle, setGlassStyle] = useState<GlassStyle>("frosted");
    const [opacity, setOpacity] = useState(28);
    const [blur, setBlur] = useState(18);
    const [saturation, setSaturation] = useState(140);
    const [highlight, setHighlight] = useState(35);
    const [borderRadius, setBorderRadius] = useState(28);
    const [borderOpacity, setBorderOpacity] = useState(35);
    const [shadowIntensity, setShadowIntensity] = useState(20);
    const [gradientAngle, setGradientAngle] = useState(135);
    const [copied, setCopied] = useState(false);
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    const safeBackgroundColor1 = getSafeHexColor(backgroundColor1, "#F28C6F");
    const safeBackgroundColor2 = getSafeHexColor(backgroundColor2, "#FFD6C8");
    const safeGlassColor = getSafeHexColor(glassColor, "#FFFFFF");

    const glassRgb = useMemo(() => {
        return hexToRgb(safeGlassColor);
    }, [safeGlassColor]);

    const isDarkGlass = glassStyle === "dark";
    const isNeonGlass = glassStyle === "neon";
    const isCrystalGlass = glassStyle === "crystal";

    const borderColor = isNeonGlass
        ? hexToRgba(safeBackgroundColor2, 0.85)
        : isCrystalGlass
            ? "rgba(255, 255, 255, 0.72)"
            : `rgba(255, 255, 255, ${borderOpacity / 100})`;

    const shadowValue = isNeonGlass
        ? `0 0 40px ${hexToRgba(
            safeBackgroundColor2,
            shadowIntensity / 100,
        )}, 0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 180})`
        : isCrystalGlass
            ? `0 24px 70px rgba(255, 255, 255, ${shadowIntensity / 160
            }), 0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 130})`
            : `0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 100})`;

    const highlightGradient = isCrystalGlass
        ? `linear-gradient(135deg, rgba(255, 255, 255, ${highlight / 85
        }) 0%, rgba(255, 255, 255, ${highlight / 260
        }) 34%, transparent 68%)`
        : `linear-gradient(135deg, rgba(255, 255, 255, ${highlight / 100
        }) 0%, rgba(255, 255, 255, ${highlight / 300
        }) 38%, transparent 72%)`;

    const cssOutput = useMemo(() => {
        return `.glass-background {
  background: linear-gradient(${gradientAngle}deg, ${safeBackgroundColor1}, ${safeBackgroundColor2});
}

.glass-card {
  position: relative;
  overflow: hidden;
  background: rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity / 100});
  backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
  border-radius: ${borderRadius}px;
  border: 1px solid ${borderColor};
  box-shadow: ${shadowValue};
}

.glass-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: ${highlightGradient};
}`;
    }, [
        gradientAngle,
        safeBackgroundColor1,
        safeBackgroundColor2,
        glassRgb,
        opacity,
        blur,
        saturation,
        borderRadius,
        borderColor,
        shadowValue,
        highlightGradient,
    ]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function applyGlassStyle(nextStyle: GlassStyle) {
        setGlassStyle(nextStyle);

        if (nextStyle === "clear") {
            setOpacity(16);
            setBlur(14);
            setSaturation(125);
            setHighlight(28);
            setBorderRadius(24);
            setBorderOpacity(28);
            setShadowIntensity(12);
            setGlassColor("#FFFFFF");
            setGradientAngle(135);
        }

        if (nextStyle === "frosted") {
            setOpacity(28);
            setBlur(18);
            setSaturation(140);
            setHighlight(35);
            setBorderRadius(28);
            setBorderOpacity(35);
            setShadowIntensity(20);
            setGlassColor("#FFFFFF");
            setGradientAngle(135);
        }

        if (nextStyle === "tinted") {
            setOpacity(34);
            setBlur(24);
            setSaturation(160);
            setHighlight(42);
            setBorderRadius(30);
            setBorderOpacity(45);
            setShadowIntensity(24);
            setGlassColor("#FFF7F3");
            setGradientAngle(145);
        }

        if (nextStyle === "dark") {
            setOpacity(32);
            setBlur(22);
            setSaturation(130);
            setHighlight(16);
            setBorderRadius(26);
            setBorderOpacity(20);
            setShadowIntensity(36);
            setGlassColor("#111827");
            setGradientAngle(135);
        }

        if (nextStyle === "neon") {
            setOpacity(22);
            setBlur(28);
            setSaturation(185);
            setHighlight(50);
            setBorderRadius(30);
            setBorderOpacity(70);
            setShadowIntensity(48);
            setGlassColor("#FFFFFF");
            setGradientAngle(160);
        }

        if (nextStyle === "crystal") {
            setOpacity(20);
            setBlur(32);
            setSaturation(170);
            setHighlight(68);
            setBorderRadius(30);
            setBorderOpacity(55);
            setShadowIntensity(26);
            setGlassColor("#FFFFFF");
            setGradientAngle(145);
        }
    }

    function shuffleGlass() {
        const nextStyle =
            glassStyles[Math.floor(Math.random() * glassStyles.length)];

        setGlassStyle(nextStyle);
        setOpacity(getRandomNumber(18, 52));
        setBlur(getRandomNumber(8, 35));
        setSaturation(getRandomNumber(115, 210));
        setHighlight(getRandomNumber(12, 70));
        setBorderRadius(getRandomNumber(16, 50));
        setBorderOpacity(getRandomNumber(15, 60));
        setShadowIntensity(getRandomNumber(8, 38));
        setGradientAngle(getRandomNumber(0, 360));
    }

    function randomAll() {
        const nextStyle =
            glassStyles[Math.floor(Math.random() * glassStyles.length)];

        setGlassStyle(nextStyle);
        setBackgroundColor1(getRandomHexColor());
        setBackgroundColor2(getRandomHexColor());
        setGlassColor(getRandomHexColor());
        setOpacity(getRandomNumber(18, 52));
        setBlur(getRandomNumber(8, 35));
        setSaturation(getRandomNumber(115, 210));
        setHighlight(getRandomNumber(12, 70));
        setBorderRadius(getRandomNumber(16, 50));
        setBorderOpacity(getRandomNumber(15, 60));
        setShadowIntensity(getRandomNumber(8, 38));
        setGradientAngle(getRandomNumber(0, 360));
    }

    async function copyCss() {
        try {
            await navigator.clipboard.writeText(cssOutput);
            setCopied(true);

            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }

            copyTimerRef.current = setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
        }
    }

    const previewPanel = (
        <GlassPreview
            text={text}
            safeBackgroundColor1={safeBackgroundColor1}
            safeBackgroundColor2={safeBackgroundColor2}
            glassRgb={glassRgb}
            opacity={opacity}
            blur={blur}
            saturation={saturation}
            borderRadius={borderRadius}
            borderColor={borderColor}
            shadowValue={shadowValue}
            highlightGradient={highlightGradient}
            gradientAngle={gradientAngle}
            isDarkGlass={isDarkGlass}
        />
    );

    const desktopSettingsPanel = (
        <GlassSettingsPanel
            text={text}
            glassStyleLabel={glassStyleLabel}
            saturationLabel={saturationLabel}
            highlightLabel={highlightLabel}
            backgroundColor1={backgroundColor1}
            backgroundColor2={backgroundColor2}
            glassColor={glassColor}
            glassStyle={glassStyle}
            opacity={opacity}
            blur={blur}
            saturation={saturation}
            highlight={highlight}
            borderRadius={borderRadius}
            borderOpacity={borderOpacity}
            shadowIntensity={shadowIntensity}
            setBackgroundColor1={setBackgroundColor1}
            setBackgroundColor2={setBackgroundColor2}
            setGlassColor={setGlassColor}
            applyGlassStyle={applyGlassStyle}
            setOpacity={setOpacity}
            setBlur={setBlur}
            setSaturation={setSaturation}
            setHighlight={setHighlight}
            setBorderRadius={setBorderRadius}
            setBorderOpacity={setBorderOpacity}
            setShadowIntensity={setShadowIntensity}
            onShuffle={shuffleGlass}
            onRandom={randomAll}
        />
    );

    const mobileSettingsPanel = (
        <GlassSettingsPanel
            text={text}
            glassStyleLabel={glassStyleLabel}
            saturationLabel={saturationLabel}
            highlightLabel={highlightLabel}
            backgroundColor1={backgroundColor1}
            backgroundColor2={backgroundColor2}
            glassColor={glassColor}
            glassStyle={glassStyle}
            opacity={opacity}
            blur={blur}
            saturation={saturation}
            highlight={highlight}
            borderRadius={borderRadius}
            borderOpacity={borderOpacity}
            shadowIntensity={shadowIntensity}
            setBackgroundColor1={setBackgroundColor1}
            setBackgroundColor2={setBackgroundColor2}
            setGlassColor={setGlassColor}
            applyGlassStyle={applyGlassStyle}
            setOpacity={setOpacity}
            setBlur={setBlur}
            setSaturation={setSaturation}
            setHighlight={setHighlight}
            setBorderRadius={setBorderRadius}
            setBorderOpacity={setBorderOpacity}
            setShadowIntensity={setShadowIntensity}
            compact
            onShuffle={shuffleGlass}
            onRandom={randomAll}
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

                            {previewPanel}
                        </section>

                        <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <SectionHeader title={text.cssTitle} />

                                <button
                                    type="button"
                                    onClick={copyCss}
                                    className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {copied ? t.common.copied : text.copyCss}
                                </button>
                            </div>

                            <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                                <code>{cssOutput}</code>
                            </pre>
                        </section>
                    </div>

                    <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                        <SectionHeader title={text.controls} />

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
                    title={text.controls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="space-y-3">
                        <div className="sticky top-0 z-10 bg-white pb-3">
                            {previewPanel}
                        </div>

                        {mobileSettingsPanel}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function GlassPreview({
    text,
    safeBackgroundColor1,
    safeBackgroundColor2,
    glassRgb,
    opacity,
    blur,
    saturation,
    borderRadius,
    borderColor,
    shadowValue,
    highlightGradient,
    gradientAngle,
    isDarkGlass,
}: {
    text: typeof t.glassmorphismGenerator;
    safeBackgroundColor1: string;
    safeBackgroundColor2: string;
    glassRgb: { r: number; g: number; b: number };
    opacity: number;
    blur: number;
    saturation: number;
    borderRadius: number;
    borderColor: string;
    shadowValue: string;
    highlightGradient: string;
    gradientAngle: number;
    isDarkGlass: boolean;
}) {
    return (
        <div
            className="flex h-56 w-full items-center justify-center rounded-3xl p-5 md:aspect-square md:h-auto md:p-8"
            style={{
                background: `linear-gradient(${gradientAngle}deg, ${safeBackgroundColor1}, ${safeBackgroundColor2})`,
            }}
        >
            <div
                className="relative w-full max-w-[260px] overflow-hidden p-5 text-center md:max-w-sm md:p-8"
                style={{
                    background: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity / 100})`,
                    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                    borderRadius: `${borderRadius}px`,
                    border: `1px solid ${borderColor}`,
                    boxShadow: shadowValue,
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: highlightGradient,
                    }}
                />

                <div className="relative z-10">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50 text-2xl md:mb-5 md:h-16 md:w-16 md:text-3xl">
                        ◫
                    </div>

                    <h4
                        className={`text-lg font-bold md:text-2xl ${isDarkGlass ? "text-white" : "text-gray-900"
                            }`}
                    >
                        {text.cardText}
                    </h4>

                    <p
                        className={`mt-2 text-xs leading-5 md:mt-3 md:text-sm md:leading-6 ${isDarkGlass ? "text-white/80" : "text-gray-700"
                            }`}
                    >
                        {text.cardDescription}
                    </p>
                </div>
            </div>
        </div>
    );
}

function GlassSettingsPanel({
    text,
    glassStyleLabel,
    saturationLabel,
    highlightLabel,
    backgroundColor1,
    backgroundColor2,
    glassColor,
    glassStyle,
    opacity,
    blur,
    saturation,
    highlight,
    borderRadius,
    borderOpacity,
    shadowIntensity,
    setBackgroundColor1,
    setBackgroundColor2,
    setGlassColor,
    applyGlassStyle,
    setOpacity,
    setBlur,
    setSaturation,
    setHighlight,
    setBorderRadius,
    setBorderOpacity,
    setShadowIntensity,
    compact = false,
    onShuffle,
    onRandom,
}: {
    text: typeof t.glassmorphismGenerator;
    glassStyleLabel: string;
    saturationLabel: string;
    highlightLabel: string;
    backgroundColor1: string;
    backgroundColor2: string;
    glassColor: string;
    glassStyle: GlassStyle;
    opacity: number;
    blur: number;
    saturation: number;
    highlight: number;
    borderRadius: number;
    borderOpacity: number;
    shadowIntensity: number;
    setBackgroundColor1: (value: string) => void;
    setBackgroundColor2: (value: string) => void;
    setGlassColor: (value: string) => void;
    applyGlassStyle: (value: GlassStyle) => void;
    setOpacity: (value: number) => void;
    setBlur: (value: number) => void;
    setSaturation: (value: number) => void;
    setHighlight: (value: number) => void;
    setBorderRadius: (value: number) => void;
    setBorderOpacity: (value: number) => void;
    setShadowIntensity: (value: number) => void;
    compact?: boolean;
    onShuffle?: () => void;
    onRandom?: () => void;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div>
                {compact ? (
                    <div className="mb-2 flex flex-nowrap items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-xs font-semibold text-gray-800">
                            {glassStyleLabel}
                        </span>

                        <div className="grid shrink-0 grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={onShuffle}
                                className="h-8 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 text-[11px] font-semibold leading-none text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.shuffle}
                            </button>

                            <button
                                type="button"
                                onClick={onRandom}
                                className="h-8 rounded-xl bg-[#F28C6F] px-2 text-[11px] font-semibold leading-none text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {text.randomAll}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 grid grid-cols-2 gap-3">
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

                        <span className="mb-2 block text-sm font-semibold text-gray-800">
                            {glassStyleLabel}
                        </span>
                    </>
                )}

                <div
                    className={
                        compact
                            ? "grid grid-cols-2 gap-2"
                            : "grid grid-cols-2 gap-3"
                    }
                >
                    {glassStyles.map((style) => {
                        const isActive = glassStyle === style;

                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => applyGlassStyle(style)}
                                className={`rounded-2xl border px-3 font-semibold transition ${compact ? "py-2 text-xs" : "py-3 text-sm"
                                    } ${isActive
                                        ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                        : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                                    }`}
                            >
                                {getGlassStyleLabel(text, style)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {compact ? (
                <div className="grid grid-cols-3 gap-2">
                    <CompactColorInput
                        label={text.backgroundColor1}
                        value={backgroundColor1}
                        fallback="#F28C6F"
                        onChange={setBackgroundColor1}
                    />

                    <CompactColorInput
                        label={text.backgroundColor2}
                        value={backgroundColor2}
                        fallback="#FFD6C8"
                        onChange={setBackgroundColor2}
                    />

                    <CompactColorInput
                        label={text.glassColor}
                        value={glassColor}
                        fallback="#FFFFFF"
                        onChange={setGlassColor}
                    />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ColorInput
                            label={text.backgroundColor1}
                            value={backgroundColor1}
                            fallback="#F28C6F"
                            onChange={setBackgroundColor1}
                        />

                        <ColorInput
                            label={text.backgroundColor2}
                            value={backgroundColor2}
                            fallback="#FFD6C8"
                            onChange={setBackgroundColor2}
                        />
                    </div>

                    <ColorInput
                        label={text.glassColor}
                        value={glassColor}
                        fallback="#FFFFFF"
                        onChange={setGlassColor}
                    />
                </>
            )}

            <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-5"}>
                <RangeInput
                    label={text.opacity}
                    value={opacity}
                    min={5}
                    max={80}
                    suffix="%"
                    compact={compact}
                    onChange={setOpacity}
                />

                <RangeInput
                    label={text.blur}
                    value={blur}
                    min={0}
                    max={60}
                    suffix="px"
                    compact={compact}
                    onChange={setBlur}
                />

                <RangeInput
                    label={saturationLabel}
                    value={saturation}
                    min={100}
                    max={220}
                    suffix="%"
                    compact={compact}
                    onChange={setSaturation}
                />

                <RangeInput
                    label={highlightLabel}
                    value={highlight}
                    min={0}
                    max={100}
                    suffix="%"
                    compact={compact}
                    onChange={setHighlight}
                />

                <RangeInput
                    label={text.borderRadius}
                    value={borderRadius}
                    min={0}
                    max={80}
                    suffix="px"
                    compact={compact}
                    onChange={setBorderRadius}
                />

                <RangeInput
                    label={text.borderOpacity}
                    value={borderOpacity}
                    min={0}
                    max={100}
                    suffix="%"
                    compact={compact}
                    onChange={setBorderOpacity}
                />

                <RangeInput
                    label={text.shadowIntensity}
                    value={shadowIntensity}
                    min={0}
                    max={80}
                    suffix="%"
                    compact={compact}
                    onChange={setShadowIntensity}
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
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => {
            cancelAnimationFrame(frame);
            document.body.style.overflow = previousOverflow;
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
            className={`fixed inset-0 z-[80] bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
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