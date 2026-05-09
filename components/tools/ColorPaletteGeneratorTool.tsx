"use client";

import { type RefObject, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type PaletteType =
    | "analogous"
    | "monochromatic"
    | "complementary"
    | "triadic"
    | "warm"
    | "cool";

type HslColor = {
    h: number;
    s: number;
    l: number;
};

const COLOR_COUNTS = [3, 4, 5, 6, 7, 8];
const DEFAULT_BASE_COLOR = "#FF6A5B";

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

const isValidHex = (value: string) => /^#[0-9A-F]{6}$/i.test(value);

const normalizeHexInput = (value: string) => {
    const upper = value.trim().toUpperCase();
    return upper.startsWith("#") ? upper : `#${upper}`;
};

const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const value = parseInt(normalized, 16);

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
};

const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (value: number) =>
        clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbToHsl = (r: number, g: number, b: number): HslColor => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100,
    };
};

const hslToRgb = (h: number, s: number, l: number) => {
    h = normalizeHue(h);
    s /= 100;
    l /= 100;

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
};

const hslToHex = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

const generatePalette = (
    baseColor: string,
    type: PaletteType,
    count: number,
) => {
    const hsl = hexToHsl(baseColor);
    const colors: string[] = [];

    for (let index = 0; index < count; index += 1) {
        const position = count === 1 ? 0 : index / (count - 1);

        let h = hsl.h;
        let s = hsl.s;
        let l = hsl.l;

        if (type === "analogous") {
            h = hsl.h - 38 + position * 76;
            s = clamp(hsl.s + 4, 48, 92);
            l = clamp(50 + position * 22, 44, 78);
        }

        if (type === "monochromatic") {
            h = hsl.h;
            s = clamp(hsl.s - 8 + position * 14, 35, 88);
            l = clamp(30 + position * 50, 24, 86);
        }

        if (type === "complementary") {
            h = index < Math.ceil(count / 2) ? hsl.h : hsl.h + 180;
            s = clamp(hsl.s - 5 + position * 10, 40, 90);
            l = clamp(42 + position * 28, 36, 78);
        }

        if (type === "triadic") {
            h = hsl.h + (index % 3) * 120;
            s = clamp(hsl.s - 5 + position * 8, 42, 88);
            l = clamp(44 + position * 24, 38, 78);
        }

        if (type === "warm") {
            h = 340 + position * 80;
            s = clamp(74 - position * 10, 50, 88);
            l = clamp(50 + position * 24, 44, 80);
        }

        if (type === "cool") {
            h = 170 + position * 95;
            s = clamp(70 - position * 8, 45, 86);
            l = clamp(42 + position * 28, 36, 78);
        }

        colors.push(hslToHex(h, s, l));
    }

    return colors;
};

const getRandomHex = () => {
    const value = Math.floor(Math.random() * 0xffffff);
    return `#${value.toString(16).padStart(6, "0")}`.toUpperCase();
};

const getRandomColorCount = () => {
    const randomIndex = Math.floor(Math.random() * COLOR_COUNTS.length);
    return COLOR_COUNTS[randomIndex];
};

const copyToClipboard = async (text: string) => {
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
};

const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: string,
    stroke?: string,
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = fill;
    ctx.fill();

    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
};

const drawFooterText = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    y: number,
) => {
    const theme = "#F28C6F";
    const dark = "#2A1F1B";

    const parts = [
        { text: "Generated by ", color: dark },
        { text: "Peach", color: theme },
        { text: "Lab.tools", color: dark },
    ];

    ctx.font = "34px Georgia, serif";
    ctx.textBaseline = "middle";

    const widths = parts.map((part) => ctx.measureText(part.text).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);

    let x = centerX - totalWidth / 2;

    parts.forEach((part, index) => {
        ctx.fillStyle = part.color;
        ctx.fillText(part.text, x, y);
        x += widths[index];
    });
};

const drawSimplePeachLogo = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
) => {
    const gradient = ctx.createLinearGradient(
        centerX - 45,
        centerY - 45,
        centerX + 45,
        centerY + 55,
    );

    gradient.addColorStop(0, "#FFB35F");
    gradient.addColorStop(1, "#FF5F45");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 55);
    ctx.bezierCurveTo(
        centerX - 70,
        centerY + 25,
        centerX - 68,
        centerY - 48,
        centerX - 12,
        centerY - 44,
    );
    ctx.bezierCurveTo(
        centerX + 28,
        centerY - 68,
        centerX + 80,
        centerY - 28,
        centerX + 62,
        centerY + 25,
    );
    ctx.bezierCurveTo(
        centerX + 48,
        centerY + 62,
        centerX + 12,
        centerY + 72,
        centerX,
        centerY + 55,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.48)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(centerX - 2, centerY - 42);
    ctx.bezierCurveTo(
        centerX - 38,
        centerY - 4,
        centerX - 42,
        centerY + 28,
        centerX - 14,
        centerY + 60,
    );
    ctx.stroke();

    ctx.fillStyle = "#7BC95A";
    ctx.beginPath();
    ctx.ellipse(centerX + 38, centerY - 55, 38, 17, -0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8A4A1D";
    ctx.beginPath();
    ctx.ellipse(centerX - 12, centerY - 58, 8, 24, -0.45, 0, Math.PI * 2);
    ctx.fill();
};

export default function ColorPaletteGenerator() {
    const text = t.colorPaletteGenerator;

    const PALETTE_TYPES: { label: string; value: PaletteType }[] = [
        { label: text.analogous, value: "analogous" },
        { label: text.monochromatic, value: "monochromatic" },
        { label: text.complementary, value: "complementary" },
        { label: text.triadic, value: "triadic" },
        { label: text.warm, value: "warm" },
        { label: text.cool, value: "cool" },
    ];

    const settingsTitle =
        (text as { settingsTitle?: string }).settingsTitle ?? "Palette Settings";

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const paletteShortLabel =
        (text as { paletteShortLabel?: string }).paletteShortLabel ?? "Palette";

    const [baseColor, setBaseColor] = useState(DEFAULT_BASE_COLOR);
    const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
    const [colorCount, setColorCount] = useState(5);
    const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [draftHsl, setDraftHsl] = useState<HslColor>(() =>
        hexToHsl(DEFAULT_BASE_COLOR),
    );
    const [draftHex, setDraftHex] = useState(DEFAULT_BASE_COLOR);

    const mobileActionBarRef = useRef<HTMLDivElement | null>(null);
    const mobileWheelRef = useRef<HTMLDivElement | null>(null);
    const desktopWheelRef = useRef<HTMLDivElement | null>(null);

    const draftColor = useMemo(() => {
        return hslToHex(draftHsl.h, draftHsl.s, draftHsl.l);
    }, [draftHsl]);

    const palette = useMemo(() => {
        return generatePalette(baseColor, paletteType, colorCount);
    }, [baseColor, paletteType, colorCount]);

    const cssOutput = useMemo(() => {
        const lines = palette.map(
            (color, index) => `  --color-${index + 1}: ${color};`,
        );

        return `.palette {\n${lines.join("\n")}\n}`;
    }, [palette]);

    const getRandomPaletteType = (): PaletteType => {
        const randomIndex = Math.floor(Math.random() * PALETTE_TYPES.length);
        return PALETTE_TYPES[randomIndex].value;
    };

    useEffect(() => {
        const updateActionBarSpace = () => {
            const element = mobileActionBarRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();

            document.documentElement.style.setProperty(
                "--mobile-action-bar-space",
                `${Math.ceil(rect.height + 24)}px`,
            );
        };

        const raf = window.requestAnimationFrame(updateActionBarSpace);
        const element = mobileActionBarRef.current;
        const observer = new ResizeObserver(updateActionBarSpace);

        if (element) {
            observer.observe(element);
        }

        window.addEventListener("resize", updateActionBarSpace);

        return () => {
            window.cancelAnimationFrame(raf);
            observer.disconnect();
            window.removeEventListener("resize", updateActionBarSpace);
            document.documentElement.style.removeProperty("--mobile-action-bar-space");
        };
    }, []);

    useEffect(() => {
        if (isSettingsOpen) {
            const currentHsl = hexToHsl(baseColor);
            setDraftHsl(currentHsl);
            setDraftHex(baseColor);
        }
    }, [isSettingsOpen, baseColor]);

    const setCopied = (target: string) => {
        setCopiedTarget(target);

        window.setTimeout(() => {
            setCopiedTarget((current) => (current === target ? null : current));
        }, 1500);
    };

    const copyWithStatus = async (copyText: string, target: string) => {
        await copyToClipboard(copyText);
        setCopied(target);
    };

    const openSettings = () => {
        setIsSettingsOpen(true);
    };

    const closeSettings = () => {
        const currentHsl = hexToHsl(baseColor);
        setDraftHsl(currentHsl);
        setDraftHex(baseColor);
        setIsSettingsOpen(false);
    };

    const applyPickerColor = () => {
        const nextColor = isValidHex(draftHex) ? draftHex : draftColor;
        setBaseColor(nextColor.toUpperCase());
    };

    const applyDesktopColor = () => {
        const nextColor = isValidHex(draftHex) ? draftHex : draftColor;
        setBaseColor(nextColor.toUpperCase());
    };

    const resetDesktopColor = () => {
        const currentHsl = hexToHsl(baseColor);
        setDraftHsl(currentHsl);
        setDraftHex(baseColor);
    };

    const updateDraftFromHex = (value: string) => {
        const normalized = normalizeHexInput(value);

        if (/^#[0-9A-F]{0,6}$/i.test(normalized)) {
            setDraftHex(normalized.toUpperCase());

            if (isValidHex(normalized)) {
                setDraftHsl(hexToHsl(normalized));
            }
        }
    };

    const updateDraftHsl = (next: Partial<HslColor>) => {
        setDraftHsl((current) => {
            const updated = {
                h: normalizeHue(next.h ?? current.h),
                s: clamp(next.s ?? current.s, 0, 100),
                l: clamp(next.l ?? current.l, 0, 100),
            };

            setDraftHex(hslToHex(updated.h, updated.s, updated.l));
            return updated;
        });
    };

    const handleWheelPointer = (
        element: HTMLDivElement | null,
        clientX: number,
        clientY: number,
    ) => {
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
    };

    const handleCopyPalette = async () => {
        await copyWithStatus(palette.join(", "), "palette");
    };

    const handleCopyCss = async () => {
        await copyWithStatus(cssOutput, "css");
    };

    const handleShuffle = () => {
        setPaletteType(getRandomPaletteType());
    };

    const handleRandomAll = () => {
        const nextColor = getRandomHex();
        setBaseColor(nextColor);
        setPaletteType(getRandomPaletteType());
        setColorCount(getRandomColorCount());

        const nextHsl = hexToHsl(nextColor);
        setDraftHsl(nextHsl);
        setDraftHex(nextColor);
    };

    const handleDownloadPng = () => {
        const size = 1080;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const theme = "#F28C6F";
        const dark = "#2A1F1B";
        const cardBg = "#FFFDFC";
        const pageBg = "#FFF7F3";
        const border = "#F4C8BA";

        ctx.fillStyle = pageBg;
        ctx.fillRect(0, 0, size, size);

        ctx.shadowColor = "rgba(42, 31, 27, 0.14)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 16;
        drawRoundedRect(ctx, 56, 56, 968, 968, 46, cardBg, border);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = "rgba(242, 140, 111, 0.13)";
        ctx.beginPath();
        ctx.moveTo(770, 56);
        ctx.quadraticCurveTo(960, 90, 1024, 250);
        ctx.lineTo(1024, 56);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(56, 830);
        ctx.quadraticCurveTo(92, 960, 245, 1024);
        ctx.lineTo(56, 1024);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(242, 140, 111, 0.35)";

        for (let row = 0; row < 4; row += 1) {
            for (let col = 0; col < 4; col += 1) {
                ctx.beginPath();
                ctx.arc(100 + col * 28, 105 + row * 28, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let row = 0; row < 4; row += 1) {
            for (let col = 0; col < 4; col += 1) {
                ctx.beginPath();
                ctx.arc(885 + col * 28, 850 + row * 28, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        drawSimplePeachLogo(ctx, size / 2, 135);

        ctx.fillStyle = theme;
        ctx.font = "34px Arial";
        ctx.textAlign = "center";
        ctx.fillText("✦", 415, 160);
        ctx.fillText("✦", 665, 160);

        ctx.fillStyle = dark;
        ctx.font = "700 68px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Color Palette", size / 2, 270);

        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(230, 345);
        ctx.lineTo(500, 345);
        ctx.moveTo(580, 345);
        ctx.lineTo(850, 345);
        ctx.stroke();

        ctx.fillStyle = theme;
        ctx.font = "28px Arial";
        ctx.fillText("♥", size / 2, 346);

        const count = palette.length;
        const swatchAreaW = 890;
        const gap = count >= 8 ? 18 : count >= 6 ? 22 : 28;
        const totalGap = gap * (count - 1);
        const swatchW = (swatchAreaW - totalGap) / count;
        const swatchH = 430;
        const startX = (size - swatchAreaW) / 2;
        const swatchY = 405;

        palette.forEach((color, index) => {
            const x = startX + index * (swatchW + gap);

            drawRoundedRect(ctx, x, swatchY, swatchW, swatchH, 26, color);

            ctx.save();
            ctx.translate(x + swatchW / 2, swatchY + swatchH / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = count >= 8 ? "700 32px Arial" : "700 38px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(color.toUpperCase(), 0, 0);
            ctx.restore();
        });

        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(250, 900);
        ctx.lineTo(830, 900);
        ctx.stroke();

        ctx.fillStyle = "rgba(242, 140, 111, 0.5)";
        ctx.font = "28px Arial";
        ctx.fillText("⌁", size / 2, 902);

        drawFooterText(ctx, size / 2, 955);

        const link = document.createElement("a");
        link.download = "peachlab-color-palette.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const renderMobilePalettePreview = () => {
        return (
            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-[#2A1F1B]">
                        {text.palettePreview}
                    </span>

                    <span className="truncate text-[10px] text-gray-500">
                        {text.palettePreviewHint}
                    </span>
                </div>

                <div className="flex h-20 overflow-hidden rounded-2xl border border-white shadow-sm">
                    {palette.map((color, index) => (
                        <button
                            key={`${color}-mini-${index}`}
                            type="button"
                            onClick={() => copyWithStatus(color, `mini-color-${index}`)}
                            className="min-w-0 flex-1 transition active:scale-[0.98]"
                            style={{ backgroundColor: color }}
                            aria-label={`${t.common.copy} ${color}`}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const renderRandomButtons = (compact = false) => {
        return (
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={handleShuffle}
                    className={`rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] transition hover:bg-[#FFEDE6] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.shuffle}
                </button>

                <button
                    type="button"
                    onClick={handleRandomAll}
                    className={`rounded-2xl bg-[#F28C6F] font-semibold text-white shadow-sm transition hover:bg-[#E6765B] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.random}
                </button>
            </div>
        );
    };

    const renderPaletteControls = (compact = false) => {
        return (
            <div className={compact ? "space-y-3" : "space-y-5"}>
                <div>
                    <label
                        className={`mb-2 block font-medium text-[#2A1F1B] ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {text.paletteTypeLabel}
                    </label>

                    <select
                        value={paletteType}
                        onChange={(event) =>
                            setPaletteType(event.target.value as PaletteType)
                        }
                        className={`w-full rounded-2xl border border-[#F1E5DF] bg-white text-sm font-medium text-[#2A1F1B] outline-none focus:border-[#F28C6F] ${compact ? "h-10 px-3" : "px-4 py-3"
                            }`}
                        aria-label={text.paletteTypeLabel}
                    >
                        {PALETTE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        className={`mb-2 block font-medium text-[#2A1F1B] ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {text.colorCountLabel}
                    </label>

                    <div className="grid grid-cols-6 gap-2">
                        {COLOR_COUNTS.map((count) => {
                            const active = colorCount === count;

                            return (
                                <button
                                    key={count}
                                    type="button"
                                    onClick={() => setColorCount(count)}
                                    className={
                                        active
                                            ? `rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] ${compact
                                                ? "px-1 py-2 text-xs"
                                                : "px-2 py-3 text-sm"
                                            }`
                                            : `rounded-2xl border border-[#F1E5DF] bg-white font-semibold text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3] ${compact
                                                ? "px-1 py-2 text-xs"
                                                : "px-2 py-3 text-sm"
                                            }`
                                    }
                                >
                                    {count}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderColorPickerPanel = (
        mode: "desktop" | "mobile",
        wheelRef: RefObject<HTMLDivElement | null>,
    ) => {
        const isDesktop = mode === "desktop";

        return (
            <div className="min-w-0 overflow-x-hidden">
                <div className={isDesktop ? "mb-5" : "mb-2"}>
                    <h2
                        className={
                            isDesktop
                                ? "text-xl font-semibold text-[#2A1F1B] md:text-2xl"
                                : "text-base font-semibold text-[#2A1F1B]"
                        }
                    >
                        {text.chooseBaseColor}
                    </h2>
                    <p
                        className={
                            isDesktop
                                ? "mt-1 text-sm text-gray-500"
                                : "mt-0.5 text-xs text-gray-500"
                        }
                    >
                        {text.chooseBaseColorDescription}
                    </p>
                </div>

                {isDesktop ? (
                    <div className="grid min-w-0 gap-5 overflow-x-hidden md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-start md:gap-8">
                        <div className="min-w-0 space-y-5 overflow-x-hidden">
                            {renderColorWheel(wheelRef, true)}

                            <HexInput
                                value={draftHex}
                                copyLabel={
                                    copiedTarget === "picker"
                                        ? t.common.copied
                                        : t.common.copy
                                }
                                onChange={updateDraftFromHex}
                                onBlur={() => {
                                    if (!isValidHex(draftHex)) {
                                        const fixed = draftColor;
                                        setDraftHex(fixed);
                                    }
                                }}
                                onCopy={() => copyWithStatus(draftColor, "picker")}
                                text={text}
                            />
                        </div>

                        <div className="min-w-0 space-y-5 overflow-x-hidden">
                            <SliderInput
                                label={text.hue}
                                value={Math.round(draftHsl.h)}
                                min={0}
                                max={360}
                                suffix=""
                                onChange={(value) => updateDraftHsl({ h: value })}
                            />

                            <SliderInput
                                label={text.saturation}
                                value={Math.round(draftHsl.s)}
                                min={0}
                                max={100}
                                suffix="%"
                                onChange={(value) => updateDraftHsl({ s: value })}
                            />

                            <SliderInput
                                label={text.lightness}
                                value={Math.round(draftHsl.l)}
                                min={10}
                                max={90}
                                suffix="%"
                                onChange={(value) => updateDraftHsl({ l: value })}
                            />

                            {renderCurrentColor()}
                            {renderPresets()}

                            <div className="grid min-w-0 grid-cols-2 gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={resetDesktopColor}
                                    className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                                >
                                    {text.reset}
                                </button>

                                <button
                                    type="button"
                                    onClick={applyDesktopColor}
                                    className="rounded-2xl bg-[#F28C6F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                >
                                    {text.apply}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="grid grid-cols-[minmax(0,1fr)_70px] gap-3">
                            {renderColorWheel(wheelRef, false)}

                            <div className="grid grid-cols-3 gap-1.5">
                                <VerticalSlider
                                    label="H"
                                    value={Math.round(draftHsl.h)}
                                    min={0}
                                    max={360}
                                    gradient="linear-gradient(to top, red, yellow, lime, cyan, blue, magenta, red)"
                                    onChange={(value) => updateDraftHsl({ h: value })}
                                />

                                <VerticalSlider
                                    label="S"
                                    value={Math.round(draftHsl.s)}
                                    min={0}
                                    max={100}
                                    gradient={`linear-gradient(to top, hsl(${draftHsl.h}, 0%, ${draftHsl.l}%), hsl(${draftHsl.h}, 100%, ${draftHsl.l}%))`}
                                    onChange={(value) => updateDraftHsl({ s: value })}
                                />

                                <VerticalSlider
                                    label="L"
                                    value={Math.round(draftHsl.l)}
                                    min={10}
                                    max={90}
                                    gradient={`linear-gradient(to top, #111827, hsl(${draftHsl.h}, ${draftHsl.s}%, 50%), #ffffff)`}
                                    onChange={(value) => updateDraftHsl({ l: value })}
                                />
                            </div>
                        </div>

                        <HexInput
                            value={draftHex}
                            copyLabel={
                                copiedTarget === "picker" ? t.common.copied : t.common.copy
                            }
                            onChange={updateDraftFromHex}
                            onBlur={() => {
                                if (!isValidHex(draftHex)) {
                                    const fixed = draftColor;
                                    setDraftHex(fixed);
                                }
                            }}
                            onCopy={() => copyWithStatus(draftColor, "picker")}
                            text={text}
                        />

                        {renderCurrentColor()}
                        {renderPresets()}

                        <div className="grid min-w-0 grid-cols-2 gap-3 pt-1">
                            <button
                                type="button"
                                onClick={closeSettings}
                                className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                            >
                                {text.cancel}
                            </button>

                            <button
                                type="button"
                                onClick={applyPickerColor}
                                className="rounded-2xl bg-[#F28C6F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {text.apply}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderColorWheel = (
        wheelRef: RefObject<HTMLDivElement | null>,
        isDesktop: boolean,
    ) => {
        return (
            <div
                ref={wheelRef}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    handleWheelPointer(wheelRef.current, event.clientX, event.clientY);
                }}
                onPointerMove={(event) => {
                    if (event.buttons !== 1) return;
                    handleWheelPointer(wheelRef.current, event.clientX, event.clientY);
                }}
                className={
                    isDesktop
                        ? "relative mx-auto aspect-square w-full max-w-[280px] rounded-full border-4 border-white shadow-[0_10px_25px_rgba(42,31,27,0.12)] md:max-w-[360px]"
                        : "relative mx-auto aspect-square w-full max-w-[214px] rounded-full border-4 border-white shadow-[0_10px_25px_rgba(42,31,27,0.12)]"
                }
                style={{
                    background:
                        "radial-gradient(circle, white 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0) 62%), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                }}
            >
                <span
                    className={
                        isDesktop
                            ? "absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-md md:h-8 md:w-8"
                            : "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-md"
                    }
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
                        backgroundColor: draftColor,
                    }}
                />
            </div>
        );
    };

    const renderCurrentColor = () => {
        return (
            <div className="min-w-0">
                <span className="mb-1.5 block text-xs font-medium text-gray-500">
                    {text.currentColor}
                </span>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-2.5">
                    <div
                        className="h-11 w-11 shrink-0 rounded-2xl border border-[#F1E5DF] shadow-sm md:h-14 md:w-14"
                        style={{ backgroundColor: draftColor }}
                    />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2A1F1B]">
                            {draftColor}
                        </p>
                        <p className="text-xs text-gray-500">
                            {text.selectedBaseColor}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderPresets = () => {
        return (
            <div className="min-w-0">
                <span className="mb-2 block text-xs font-medium text-gray-500">
                    {text.presets}
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
                                        ? "h-9 w-9 shrink-0 rounded-2xl border-2 border-[#F28C6F] bg-white p-1 md:h-10 md:w-10"
                                        : "h-9 w-9 shrink-0 rounded-2xl border border-[#F1E5DF] p-1 md:h-10 md:w-10"
                                }
                                aria-label={`Use ${color}`}
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
        );
    };

    return (
        <>
            <div className="space-y-6 pb-1 md:pb-0">
                <div className="pb-2">
                    <SectionTitle
                        title={text.palettePreview}
                        right={
                            <span className="text-xs text-gray-400">
                                {text.palettePreviewHint}
                            </span>
                        }
                    />

                    <div className="-mx-1 mt-3 overflow-x-auto px-1 pb-1">
                        <div className="flex min-w-max snap-x snap-mandatory gap-1.5 pr-8">
                            {palette.map((color, index) => (
                                <button
                                    key={`${color}-${index}`}
                                    type="button"
                                    onClick={() => copyWithStatus(color, `color-${index}`)}
                                    className="relative flex h-40 w-[36px] flex-none snap-start items-center justify-center rounded-[17px] shadow-sm transition active:scale-[0.98] md:h-44 md:w-[54px]"
                                    style={{ backgroundColor: color }}
                                    aria-label={`${t.common.copy} ${color}`}
                                >
                                    <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold tracking-wide text-white md:text-sm">
                                        {copiedTarget === `color-${index}`
                                            ? t.common.copied.toUpperCase()
                                            : color.toUpperCase()}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hidden space-y-5 md:block">
                    {renderColorPickerPanel("desktop", desktopWheelRef)}
                    {renderPaletteControls(false)}
                    {renderRandomButtons(false)}
                </div>

                <div className="hidden grid-cols-2 gap-3 md:grid">
                    <button
                        type="button"
                        onClick={handleCopyPalette}
                        className="rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                    >
                        {copiedTarget === "palette" ? t.common.copied : text.copyPalette}
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadPng}
                        className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {text.downloadPng}
                    </button>
                </div>

                <div className="border-t border-[#F1E5DF] pt-5">
                    <SectionTitle
                        title={text.cssOutput}
                        right={
                            <button
                                type="button"
                                onClick={handleCopyCss}
                                className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copiedTarget === "css" ? t.common.copied : text.copyCss}
                            </button>
                        }
                    />

                    <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#2A1F1B]">
                        <code>{cssOutput}</code>
                    </pre>
                </div>
            </div>

            <MobileActionBar
                refElement={mobileActionBarRef}
                settingsText={settingsButtonText}
                copyText={copiedTarget === "palette" ? t.common.copied : t.common.copy}
                copySubText={paletteShortLabel}
                downloadText={text.download}
                downloadSubText={text.png}
                onOpenSettings={openSettings}
                onCopy={handleCopyPalette}
                onDownload={handleDownloadPng}
            />

            {isSettingsOpen ? (
                <MobileSettingsSheet title={settingsTitle} onClose={closeSettings}>
                    <div className="space-y-3">
                        {renderMobilePalettePreview()}
                        {renderRandomButtons(true)}
                        {renderPaletteControls(true)}
                        {renderColorPickerPanel("mobile", mobileWheelRef)}
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function MobileActionBar({
    refElement,
    settingsText,
    copyText,
    copySubText,
    downloadText,
    downloadSubText,
    onOpenSettings,
    onCopy,
    onDownload,
}: {
    refElement: RefObject<HTMLDivElement | null>;
    settingsText: string;
    copyText: string;
    copySubText: string;
    downloadText: string;
    downloadSubText: string;
    onOpenSettings: () => void;
    onCopy: () => void;
    onDownload: () => void;
}) {
    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[60] px-3 md:hidden">
            <div
                ref={refElement}
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-3 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-2.5 text-center shadow-sm"
                >
                    <span className="block text-xs font-semibold leading-tight text-white">
                        {settingsText}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-white/85">
                        Base Color
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onCopy}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-2 py-2.5 text-center transition hover:bg-[#FFF7F3]"
                >
                    <span className="block text-xs font-semibold leading-tight text-[#2A1F1B]">
                        {copyText}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-gray-500">
                        {copySubText}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-2 py-2.5 text-center shadow-sm"
                >
                    <span className="block text-xs font-semibold leading-tight text-white">
                        {downloadText}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-tight text-white/85">
                        {downloadSubText}
                    </span>
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
            className={`fixed inset-0 z-[80] bg-[#2A1F1B]/35 px-3 pb-3 pt-8 backdrop-blur-sm transition-opacity duration-200 md:hidden ${isVisible ? "opacity-100" : "opacity-0"
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

function HexInput({
    value,
    copyLabel,
    onChange,
    onBlur,
    onCopy,
    text,
}: {
    value: string;
    copyLabel: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    onCopy: () => void;
    text: typeof t.colorPaletteGenerator;
}) {
    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
                {text.hex}
            </label>

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_64px] items-center gap-2">
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    className="w-full min-w-0 rounded-2xl border border-[#F1E5DF] px-3 py-2.5 text-sm font-semibold text-[#2A1F1B] outline-none focus:border-[#F28C6F]"
                    aria-label={text.hexColor}
                />

                <button
                    type="button"
                    onClick={onCopy}
                    className="flex h-11 items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white px-2 text-xs font-semibold text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                    aria-label={text.copySelectedColor}
                >
                    {copyLabel}
                </button>
            </div>
        </div>
    );
}

function SliderInput({
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
        <label className="block min-w-0">
            <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5">
                <span className="min-w-0 truncate whitespace-nowrap text-xs font-medium leading-5 text-gray-500">
                    {label}
                </span>

                <span className="min-w-[40px] shrink-0 rounded-full bg-[#FFF7F3] px-2 py-0.5 text-center text-[11px] font-semibold leading-5 text-[#7A5A4F]">
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
                className="block w-full min-w-0 accent-[#F28C6F]"
            />
        </label>
    );
}

function VerticalSlider({
    label,
    value,
    min,
    max,
    gradient,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    gradient: string;
    onChange: (value: number) => void;
}) {
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <label className="flex min-w-0 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-500">{label}</span>

            <div
                className="relative h-full min-h-[214px] w-5 rounded-full border border-white shadow-sm"
                style={{ background: gradient }}
            >
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    style={{
                        writingMode: "vertical-lr",
                        direction: "rtl",
                    }}
                />

                <span
                    className="pointer-events-none absolute left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-[#F28C6F] shadow-md"
                    style={{
                        bottom: `calc(${percent}% - 10px)`,
                    }}
                />
            </div>
        </label>
    );
}