"use client";

import {
    type RefObject,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Copy, X } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type HslColor = {
    h: number;
    s: number;
    l: number;
};

const DEFAULT_COLOR = "#F28C6F";

const PRESET_COLORS = [
    "#FF6A5B",
    "#F28C6F",
    "#F7CA91",
    "#98DFA4",
    "#5DD6C8",
    "#8FC7F7",
    "#B88AF2",
    "#F27ACB",
];

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

function normalizeHex(value: string) {
    let hex = value.trim().replace("#", "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((char) => char + char)
            .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
    }

    return `#${hex.toUpperCase()}`;
}

function normalizeHexInput(value: string) {
    const upper = value.trim().toUpperCase();
    return upper.startsWith("#") ? upper : `#${upper}`;
}

function isValidHex(value: string) {
    return normalizeHex(value) !== null;
}

function hexToRgb(hex: string) {
    const cleanHex = hex.replace("#", "");

    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);

    return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (value: number) =>
        clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): HslColor {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;

    let hue = 0;
    let saturation = 0;

    if (max !== min) {
        const difference = max - min;

        saturation =
            lightness > 0.5
                ? difference / (2 - max - min)
                : difference / (max + min);

        switch (max) {
            case red:
                hue = (green - blue) / difference + (green < blue ? 6 : 0);
                break;
            case green:
                hue = (blue - red) / difference + 2;
                break;
            case blue:
                hue = (red - green) / difference + 4;
                break;
        }

        hue = hue / 6;
    }

    return {
        h: Math.round(hue * 360),
        s: Math.round(saturation * 100),
        l: Math.round(lightness * 100),
    };
}

function hslToRgb(h: number, s: number, l: number) {
    h = normalizeHue(h);
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    return {
        r: (r + m) * 255,
        g: (g + m) * 255,
        b: (b + m) * 255,
    };
}

function hslToHex(h: number, s: number, l: number) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

function hexToHsl(hex: string) {
    const rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }
}

export default function HexRgbConverterTool() {
    const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
    const [copied, setCopied] = useState("");

    const [isPickerRendered, setIsPickerRendered] = useState(false);
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const [draftHsl, setDraftHsl] = useState<HslColor>(() =>
        hexToHsl(DEFAULT_COLOR)
    );
    const [draftHex, setDraftHex] = useState(DEFAULT_COLOR);

    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wheelRef = useRef<HTMLDivElement | null>(null);

    const colorData = useMemo(() => {
        const normalizedHex = normalizeHex(hexInput);

        if (!normalizedHex) {
            return null;
        }

        const rgb = hexToRgb(normalizedHex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

        return {
            hex: normalizedHex,
            rgb,
            hsl,
            rgbText: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            hslText: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
            cssText: `color: ${normalizedHex};
background-color: ${normalizedHex};
border-color: ${normalizedHex};`,
        };
    }, [hexInput]);

    const draftColor = useMemo(() => {
        return hslToHex(draftHsl.h, draftHsl.s, draftHsl.l);
    }, [draftHsl]);

    useEffect(() => {
        return () => {
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isPickerRendered) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const raf = requestAnimationFrame(() => {
            setIsPickerVisible(true);
        });

        return () => {
            cancelAnimationFrame(raf);
            document.body.style.overflow = previousOverflow;
        };
    }, [isPickerRendered]);

    async function copyValue(label: string, value: string) {
        await copyToClipboard(value);
        setCopied(label);

        setTimeout(() => {
            setCopied("");
        }, 1500);
    }

    function openPicker() {
        const currentColor = colorData?.hex ?? DEFAULT_COLOR;
        setDraftHsl(hexToHsl(currentColor));
        setDraftHex(currentColor);

        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        setIsPickerRendered(true);
    }

    function closePicker() {
        setIsPickerVisible(false);

        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        closeTimerRef.current = setTimeout(() => {
            const currentColor = colorData?.hex ?? DEFAULT_COLOR;
            setDraftHsl(hexToHsl(currentColor));
            setDraftHex(currentColor);
            setIsPickerRendered(false);
        }, 260);
    }

    function applyPickerColor() {
        const nextColor = isValidHex(draftHex) ? normalizeHex(draftHex) : draftColor;

        setHexInput((nextColor ?? draftColor).toUpperCase());
        setIsPickerVisible(false);

        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
        }

        closeTimerRef.current = setTimeout(() => {
            setIsPickerRendered(false);
        }, 260);
    }

    function updateDraftFromHex(value: string) {
        const normalized = normalizeHexInput(value);

        if (/^#[0-9A-F]{0,6}$/i.test(normalized)) {
            setDraftHex(normalized.toUpperCase());

            const validHex = normalizeHex(normalized);

            if (validHex) {
                setDraftHsl(hexToHsl(validHex));
            }
        }
    }

    function updateDraftHsl(next: Partial<HslColor>) {
        setDraftHsl((current) => {
            const updated = {
                h: normalizeHue(next.h ?? current.h),
                s: clamp(next.s ?? current.s, 0, 100),
                l: clamp(next.l ?? current.l, 10, 90),
            };

            setDraftHex(hslToHex(updated.h, updated.s, updated.l));
            return updated;
        });
    }

    function handleWheelPointer(
        element: HTMLDivElement | null,
        clientX: number,
        clientY: number
    ) {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        const angle = Math.atan2(dy, dx);
        const hue = normalizeHue((angle * 180) / Math.PI + 360);

        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = rect.width / 2;
        const saturation = clamp((distance / radius) * 100, 0, 100);

        updateDraftHsl({
            h: hue,
            s: saturation,
        });
    }

    const renderColorPickerPanel = (
        mode: "mobile" | "desktop",
        currentWheelRef: RefObject<HTMLDivElement | null>
    ) => {
        const isDesktop = mode === "desktop";
        const colorPickerText = t.hexRgbConverter.colorPicker;

        return (
            <div className="min-w-0 overflow-x-hidden">
                <div
                    className={
                        isDesktop
                            ? "mb-5 flex min-w-0 items-center justify-between gap-4"
                            : "mb-4 flex min-w-0 items-center justify-between gap-3"
                    }
                >
                    <div className="min-w-0">
                        <SectionTitle
                            title={colorPickerText.title}
                            titleClassName={
                                isDesktop
                                    ? "text-xl md:text-2xl"
                                    : "text-lg md:text-lg"
                            }
                        />

                        <p className="mt-1 text-sm text-gray-500">
                            {colorPickerText.description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closePicker}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-[#2A1F1B] transition hover:bg-[#FFEDE6]"
                        aria-label={colorPickerText.cancel}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div
                    className={
                        isDesktop
                            ? "grid min-w-0 gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
                            : "space-y-4"
                    }
                >
                    <div className={isDesktop ? "space-y-5" : "space-y-4"}>
                        <div
                            ref={currentWheelRef}
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                handleWheelPointer(
                                    currentWheelRef.current,
                                    event.clientX,
                                    event.clientY
                                );
                            }}
                            onPointerMove={(event) => {
                                if (event.buttons !== 1) return;
                                handleWheelPointer(
                                    currentWheelRef.current,
                                    event.clientX,
                                    event.clientY
                                );
                            }}
                            className={
                                isDesktop
                                    ? "relative mx-auto aspect-square w-full max-w-[320px] rounded-full border-4 border-white shadow-[0_10px_25px_rgba(42,31,27,0.12)]"
                                    : "relative mx-auto aspect-square w-full max-w-[250px] rounded-full border-4 border-white shadow-[0_10px_25px_rgba(42,31,27,0.12)]"
                            }
                            style={{
                                background:
                                    "radial-gradient(circle, white 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0) 62%), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                            }}
                        >
                            <span
                                className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-md"
                                style={{
                                    left: `${50 +
                                        Math.cos((draftHsl.h * Math.PI) / 180) *
                                        (draftHsl.s / 100) *
                                        42
                                        }%`,
                                    top: `${50 +
                                        Math.sin((draftHsl.h * Math.PI) / 180) *
                                        (draftHsl.s / 100) *
                                        42
                                        }%`,
                                }}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.hex}
                            </label>

                            <div className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3">
                                <input
                                    value={draftHex}
                                    onChange={(event) =>
                                        updateDraftFromHex(event.target.value)
                                    }
                                    onBlur={() => {
                                        if (!isValidHex(draftHex)) {
                                            setDraftHex(draftColor);
                                        }
                                    }}
                                    className="h-12 w-full min-w-0 rounded-2xl border border-[#F1E5DF] px-4 text-sm font-medium text-[#2A1F1B] outline-none focus:border-[#F28C6F]"
                                    aria-label={colorPickerText.hexColor}
                                />

                                <button
                                    type="button"
                                    onClick={() => copyValue("PICKER", draftColor)}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                                    aria-label={colorPickerText.copySelectedColor}
                                >
                                    {copied === "PICKER" ? (
                                        <span className="text-sm font-semibold">✓</span>
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={isDesktop ? "space-y-5" : "space-y-4"}>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.hue}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={Math.round(draftHsl.h)}
                                onChange={(event) =>
                                    updateDraftHsl({ h: Number(event.target.value) })
                                }
                                className="block w-full min-w-0 accent-[#F28C6F]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.saturation}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(draftHsl.s)}
                                onChange={(event) =>
                                    updateDraftHsl({ s: Number(event.target.value) })
                                }
                                className="block w-full min-w-0 accent-[#F28C6F]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.lightness}
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                value={Math.round(draftHsl.l)}
                                onChange={(event) =>
                                    updateDraftHsl({ l: Number(event.target.value) })
                                }
                                className="block w-full min-w-0 accent-[#F28C6F]"
                            />
                        </div>

                        <div>
                            <span className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.currentColor}
                            </span>
                            <div className="flex items-center gap-3 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3">
                                <div
                                    className="h-12 w-12 shrink-0 rounded-2xl border border-[#F1E5DF] shadow-sm"
                                    style={{ backgroundColor: draftColor }}
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-[#2A1F1B]">
                                        {draftColor}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {colorPickerText.selectedColor}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="mb-2 block text-sm font-medium text-gray-500">
                                {colorPickerText.presets}
                            </span>

                            <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
                                {PRESET_COLORS.map((color) => {
                                    const active = draftColor.toUpperCase() === color;

                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setDraftHex(color);
                                                setDraftHsl(hexToHsl(color));
                                            }}
                                            className={
                                                active
                                                    ? "h-9 w-9 shrink-0 rounded-2xl border-2 border-[#F28C6F] bg-white p-1"
                                                    : "h-9 w-9 shrink-0 rounded-2xl border border-[#F1E5DF] p-1"
                                            }
                                            aria-label={`${colorPickerText.useColor} ${color}`}
                                        >
                                            <span
                                                className="block h-full w-full rounded-xl"
                                                style={{ backgroundColor: color }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                                type="button"
                                onClick={closePicker}
                                className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                            >
                                {colorPickerText.cancel}
                            </button>

                            <button
                                type="button"
                                onClick={applyPickerColor}
                                className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {colorPickerText.apply}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-4 md:space-y-6">
                <div
                    className="min-h-28 rounded-3xl border border-[#F1E5DF] p-4 shadow-sm md:min-h-36 md:p-5"
                    style={{
                        background: colorData?.hex ?? "#FFF7F3",
                    }}
                >
                    <div className="inline-flex rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                        <div>
                            <SectionTitle
                                title={t.hexRgbConverter.previewColor}
                                titleClassName="text-xs uppercase tracking-wide text-gray-500 md:text-xs"
                            />

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {colorData?.hex ?? t.hexRgbConverter.invalidHex}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-5">
                    <div className="grid grid-cols-[0.95fr_1.05fr] gap-3 md:grid-cols-2 md:gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800 md:mb-3">
                                {t.hexRgbConverter.pickColor}
                            </label>

                            <button
                                type="button"
                                onClick={openPicker}
                                className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#F1E5DF] bg-white px-3 text-left transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3] md:h-14 md:px-4"
                            >
                                <span
                                    className="h-7 w-8 shrink-0 rounded-lg border border-[#F1E5DF] shadow-sm"
                                    style={{
                                        backgroundColor: colorData?.hex ?? DEFAULT_COLOR,
                                    }}
                                />
                                <span className="min-w-0 truncate font-mono text-sm font-medium text-gray-900">
                                    {colorData?.hex ?? DEFAULT_COLOR}
                                </span>
                            </button>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800 md:mb-3">
                                {t.hexRgbConverter.hexValue}
                            </label>

                            <input
                                value={hexInput}
                                onChange={(event) => setHexInput(event.target.value)}
                                placeholder={DEFAULT_COLOR}
                                className="h-12 w-full rounded-xl border border-[#F1E5DF] bg-white px-3 text-sm font-medium uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] md:h-14 md:px-4"
                            />
                        </div>
                    </div>

                    {!colorData && (
                        <p className="mt-3 text-sm text-red-500">
                            {t.hexRgbConverter.invalidHexDescription}
                        </p>
                    )}
                </div>

                {colorData && (
                    <div className="grid gap-4 md:grid-cols-3 md:gap-4">
                        <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.hexRgbConverter.hex}
                                </p>

                                <button
                                    onClick={() => copyValue("HEX", colorData.hex)}
                                    className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                                >
                                    {copied === "HEX"
                                        ? t.common.copied
                                        : t.hexRgbConverter.copyHex}
                                </button>
                            </div>

                            <button
                                onClick={() => copyValue("HEX", colorData.hex)}
                                className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-base font-medium text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-lg"
                            >
                                {colorData.hex}
                            </button>
                        </div>

                        <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.hexRgbConverter.rgb}
                                </p>

                                <button
                                    onClick={() => copyValue("RGB", colorData.rgbText)}
                                    className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                                >
                                    {copied === "RGB"
                                        ? t.common.copied
                                        : t.hexRgbConverter.copyRgb}
                                </button>
                            </div>

                            <button
                                onClick={() => copyValue("RGB", colorData.rgbText)}
                                className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-base font-medium text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-lg"
                            >
                                {colorData.rgbText}
                            </button>
                        </div>

                        <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {t.hexRgbConverter.hsl}
                                </p>

                                <button
                                    onClick={() => copyValue("HSL", colorData.hslText)}
                                    className="shrink-0 rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-xs font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] md:px-4 md:text-sm"
                                >
                                    {copied === "HSL"
                                        ? t.common.copied
                                        : t.hexRgbConverter.copyHsl}
                                </button>
                            </div>

                            <button
                                onClick={() => copyValue("HSL", colorData.hslText)}
                                className="mt-3 w-full rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] px-4 py-3 text-left font-mono text-base font-medium text-gray-900 transition hover:border-[#F4C8BA] hover:bg-[#FFF0EA] md:text-lg"
                            >
                                {colorData.hslText}
                            </button>
                        </div>
                    </div>
                )}

                {colorData && (
                    <div className="md:rounded-2xl md:border md:border-[#F1E5DF] md:bg-white md:p-5">
                        <SectionTitle
                            title={t.hexRgbConverter.cssOutput}
                            right={
                                <button
                                    onClick={() => copyValue("CSS", colorData.cssText)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    <Copy className="h-4 w-4" />
                                    {copied === "CSS"
                                        ? t.common.copied
                                        : t.hexRgbConverter.copyCss}
                                </button>
                            }
                        />

                        <pre className="mt-3 overflow-x-auto rounded-xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                            {colorData.cssText}
                        </pre>
                    </div>
                )}
            </div>

            {isPickerRendered && (
                <div
                    className={`fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${isPickerVisible ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={closePicker}
                >
                    <div className="hidden md:flex md:h-full md:items-center md:justify-center md:p-6">
                        <div
                            onClick={(event) => event.stopPropagation()}
                            className={`w-full max-w-3xl rounded-[2rem] border border-[#F1E5DF] bg-white p-6 shadow-2xl transition-all duration-300 ${isPickerVisible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-6 opacity-0"
                                }`}
                        >
                            {renderColorPickerPanel("desktop", wheelRef)}
                        </div>
                    </div>

                    <div className="md:hidden">
                        <div
                            onClick={(event) => event.stopPropagation()}
                            className={`fixed inset-x-0 bottom-0 h-[66dvh] rounded-t-[2rem] border-t border-[#F1E5DF] bg-white px-4 pb-5 pt-4 shadow-2xl transition-transform duration-300 ease-out ${isPickerVisible ? "translate-y-0" : "translate-y-full"
                                }`}
                        >
                            <div className="h-full overflow-y-auto pb-2">
                                {renderColorPickerPanel("mobile", wheelRef)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}