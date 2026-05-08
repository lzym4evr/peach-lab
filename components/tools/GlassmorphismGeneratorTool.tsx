"use client";

import {
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

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

export default function GlassmorphismGeneratorTool() {
    const text = t.glassmorphismGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const [backgroundColor1, setBackgroundColor1] = useState("#F28C6F");
    const [backgroundColor2, setBackgroundColor2] = useState("#FFD6C8");
    const [glassColor, setGlassColor] = useState("#FFFFFF");
    const [opacity, setOpacity] = useState(28);
    const [blur, setBlur] = useState(18);
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

    const cssOutput = useMemo(() => {
        return `.glass-background {
  background: linear-gradient(${gradientAngle}deg, ${safeBackgroundColor1}, ${safeBackgroundColor2});
}

.glass-card {
  background: rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity / 100
            });
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border-radius: ${borderRadius}px;
  border: 1px solid rgba(255, 255, 255, ${borderOpacity / 100});
  box-shadow: 0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 100});
}`;
    }, [
        safeBackgroundColor1,
        safeBackgroundColor2,
        gradientAngle,
        glassRgb,
        opacity,
        blur,
        borderRadius,
        borderOpacity,
        shadowIntensity,
    ]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    function shuffleGlass() {
        setOpacity(getRandomNumber(18, 52));
        setBlur(getRandomNumber(8, 35));
        setBorderRadius(getRandomNumber(16, 50));
        setBorderOpacity(getRandomNumber(15, 60));
        setShadowIntensity(getRandomNumber(8, 38));
        setGradientAngle(getRandomNumber(0, 360));
    }

    function randomAll() {
        setBackgroundColor1(getRandomHexColor());
        setBackgroundColor2(getRandomHexColor());
        setGlassColor(getRandomHexColor());
        setOpacity(getRandomNumber(18, 52));
        setBlur(getRandomNumber(8, 35));
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
            borderRadius={borderRadius}
            borderOpacity={borderOpacity}
            shadowIntensity={shadowIntensity}
            gradientAngle={gradientAngle}
        />
    );

    const settingsPanel = (
        <GlassSettingsPanel
            text={text}
            backgroundColor1={backgroundColor1}
            backgroundColor2={backgroundColor2}
            glassColor={glassColor}
            opacity={opacity}
            blur={blur}
            borderRadius={borderRadius}
            borderOpacity={borderOpacity}
            shadowIntensity={shadowIntensity}
            setBackgroundColor1={setBackgroundColor1}
            setBackgroundColor2={setBackgroundColor2}
            setGlassColor={setGlassColor}
            setOpacity={setOpacity}
            setBlur={setBlur}
            setBorderRadius={setBorderRadius}
            setBorderOpacity={setBorderOpacity}
            setShadowIntensity={setShadowIntensity}
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

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={shuffleGlass}
                                className="w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.shuffle}
                            </button>

                            <button
                                type="button"
                                onClick={randomAll}
                                className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                            >
                                {text.randomAll}
                            </button>
                        </div>

                        <div className="mt-5">{settingsPanel}</div>
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
                    headerActions={
                        <div className="grid shrink-0 grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={shuffleGlass}
                                className="h-8 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 text-[11px] font-semibold leading-none text-[#E6765B] transition hover:bg-[#FFF0EA]"
                            >
                                {text.shuffle}
                            </button>

                            <button
                                type="button"
                                onClick={randomAll}
                                className="h-8 rounded-xl bg-[#F28C6F] px-2 text-[11px] font-semibold leading-none text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {text.randomAll}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {previewPanel}
                        {settingsPanel}
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
    borderRadius,
    borderOpacity,
    shadowIntensity,
    gradientAngle,
}: {
    text: typeof t.glassmorphismGenerator;
    safeBackgroundColor1: string;
    safeBackgroundColor2: string;
    glassRgb: { r: number; g: number; b: number };
    opacity: number;
    blur: number;
    borderRadius: number;
    borderOpacity: number;
    shadowIntensity: number;
    gradientAngle: number;
}) {
    return (
        <div
            className="flex aspect-square w-full items-center justify-center rounded-3xl p-5 md:p-8"
            style={{
                background: `linear-gradient(${gradientAngle}deg, ${safeBackgroundColor1}, ${safeBackgroundColor2})`,
            }}
        >
            <div
                className="w-full max-w-sm p-6 text-center md:p-8"
                style={{
                    background: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b}, ${opacity / 100
                        })`,
                    backdropFilter: `blur(${blur}px)`,
                    WebkitBackdropFilter: `blur(${blur}px)`,
                    borderRadius: `${borderRadius}px`,
                    border: `1px solid rgba(255, 255, 255, ${borderOpacity / 100
                        })`,
                    boxShadow: `0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 100
                        })`,
                }}
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/50 text-3xl md:mb-5 md:h-16 md:w-16">
                    ◫
                </div>

                <h4 className="text-xl font-bold text-gray-900 md:text-2xl">
                    {text.cardText}
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-700">
                    {text.cardDescription}
                </p>
            </div>
        </div>
    );
}

function GlassSettingsPanel({
    text,
    backgroundColor1,
    backgroundColor2,
    glassColor,
    opacity,
    blur,
    borderRadius,
    borderOpacity,
    shadowIntensity,
    setBackgroundColor1,
    setBackgroundColor2,
    setGlassColor,
    setOpacity,
    setBlur,
    setBorderRadius,
    setBorderOpacity,
    setShadowIntensity,
}: {
    text: typeof t.glassmorphismGenerator;
    backgroundColor1: string;
    backgroundColor2: string;
    glassColor: string;
    opacity: number;
    blur: number;
    borderRadius: number;
    borderOpacity: number;
    shadowIntensity: number;
    setBackgroundColor1: (value: string) => void;
    setBackgroundColor2: (value: string) => void;
    setGlassColor: (value: string) => void;
    setOpacity: (value: number) => void;
    setBlur: (value: number) => void;
    setBorderRadius: (value: number) => void;
    setBorderOpacity: (value: number) => void;
    setShadowIntensity: (value: number) => void;
}) {
    return (
        <div className="space-y-5">
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

            <RangeInput
                label={text.opacity}
                value={opacity}
                min={5}
                max={80}
                suffix="%"
                onChange={setOpacity}
            />

            <RangeInput
                label={text.blur}
                value={blur}
                min={0}
                max={60}
                suffix="px"
                onChange={setBlur}
            />

            <RangeInput
                label={text.borderRadius}
                value={borderRadius}
                min={0}
                max={80}
                suffix="px"
                onChange={setBorderRadius}
            />

            <RangeInput
                label={text.borderOpacity}
                value={borderOpacity}
                min={0}
                max={100}
                suffix="%"
                onChange={setBorderOpacity}
            />

            <RangeInput
                label={text.shadowIntensity}
                value={shadowIntensity}
                min={0}
                max={80}
                suffix="%"
                onChange={setShadowIntensity}
            />
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
    headerActions,
    children,
    onClose,
}: {
    title: string;
    headerActions?: ReactNode;
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
                <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="h-7 w-1.5 shrink-0 rounded-full bg-[#F28C6F]" />
                        <h3 className="truncate text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {headerActions}

                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-2xl font-semibold leading-none text-[#2A1F1B] transition hover:bg-[#FFF0EA]"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto px-4 pb-4 pt-2">{children}</div>
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