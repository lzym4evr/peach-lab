"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Dices, Pencil, Shuffle, X } from "lucide-react";

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

const PALETTE_TYPES: { label: string; value: PaletteType }[] = [
    { label: "Analogous", value: "analogous" },
    { label: "Monochromatic", value: "monochromatic" },
    { label: "Complementary", value: "complementary" },
    { label: "Triadic", value: "triadic" },
    { label: "Warm", value: "warm" },
    { label: "Cool", value: "cool" },
];

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

const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

const normalizeHue = (hue: number) => {
    return ((hue % 360) + 360) % 360;
};

const isValidHex = (value: string) => {
    return /^#[0-9A-F]{6}$/i.test(value);
};

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
    count: number
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

const getRandomPaletteType = (): PaletteType => {
    const randomIndex = Math.floor(Math.random() * PALETTE_TYPES.length);
    return PALETTE_TYPES[randomIndex].value;
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
    stroke?: string
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
    y: number
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
    centerY: number
) => {
    const gradient = ctx.createLinearGradient(
        centerX - 45,
        centerY - 45,
        centerX + 45,
        centerY + 55
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
        centerY - 44
    );
    ctx.bezierCurveTo(
        centerX + 28,
        centerY - 68,
        centerX + 80,
        centerY - 28,
        centerX + 62,
        centerY + 25
    );
    ctx.bezierCurveTo(
        centerX + 48,
        centerY + 62,
        centerX + 12,
        centerY + 72,
        centerX,
        centerY + 55
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
        centerY + 60
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
    const [baseColor, setBaseColor] = useState(DEFAULT_BASE_COLOR);
    const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
    const [colorCount, setColorCount] = useState(5);
    const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [draftHsl, setDraftHsl] = useState<HslColor>(() =>
        hexToHsl(DEFAULT_BASE_COLOR)
    );
    const [draftHex, setDraftHex] = useState(DEFAULT_BASE_COLOR);

    const mobileActionBarRef = useRef<HTMLDivElement | null>(null);
    const mobileWheelRef = useRef<HTMLDivElement | null>(null);
    const desktopWheelRef = useRef<HTMLDivElement | null>(null);

    const draftColor = useMemo(() => {
        return hslToHex(draftHsl.h, draftHsl.s, draftHsl.l);
    }, [draftHsl]);

    useEffect(() => {
        const updateActionBarSpace = () => {
            const element = mobileActionBarRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const space = Math.ceil(rect.height + 28);

            document.documentElement.style.setProperty(
                "--mobile-action-bar-space",
                `${space}px`
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
        if (isPickerOpen) return;

        const currentHsl = hexToHsl(baseColor);
        setDraftHsl(currentHsl);
        setDraftHex(baseColor);
    }, [baseColor, isPickerOpen]);

    const palette = useMemo(() => {
        return generatePalette(baseColor, paletteType, colorCount);
    }, [baseColor, paletteType, colorCount]);

    const cssOutput = useMemo(() => {
        const lines = palette.map(
            (color, index) => `  --color-${index + 1}: ${color};`
        );

        return `.palette {\n${lines.join("\n")}\n}`;
    }, [palette]);

    const setCopied = (target: string) => {
        setCopiedTarget(target);

        window.setTimeout(() => {
            setCopiedTarget((current) => (current === target ? null : current));
        }, 1500);
    };

    const copyWithStatus = async (text: string, target: string) => {
        await copyToClipboard(text);
        setCopied(target);
    };

    const openPicker = () => {
        const currentHsl = hexToHsl(baseColor);
        setDraftHsl(currentHsl);
        setDraftHex(baseColor);
        setIsPickerOpen(true);
    };

    const closePicker = () => {
        const currentHsl = hexToHsl(baseColor);
        setDraftHsl(currentHsl);
        setDraftHex(baseColor);
        setIsPickerOpen(false);
    };

    const applyPickerColor = () => {
        const nextColor = isValidHex(draftHex) ? draftHex : draftColor;
        setBaseColor(nextColor.toUpperCase());
        setIsPickerOpen(false);
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
        clientY: number
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

    const renderColorPickerPanel = (
        mode: "desktop" | "mobile",
        wheelRef: React.RefObject<HTMLDivElement | null>
    ) => {
        const isDesktop = mode === "desktop";

        return (
            <div className="min-w-0">
                <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-[#2A1F1B] md:text-2xl">
                            Choose base color
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Pick a color, adjust it, then apply it to your palette.
                        </p>
                    </div>

                    {!isDesktop ? (
                        <button
                            type="button"
                            onClick={closePicker}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF7F3] text-[#2A1F1B] transition hover:bg-[#FFEDE6]"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    ) : null}
                </div>

                <div className="grid min-w-0 gap-5 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-8">
                    <div className="min-w-0 space-y-5">
                        <div
                            ref={wheelRef}
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                handleWheelPointer(
                                    wheelRef.current,
                                    event.clientX,
                                    event.clientY
                                );
                            }}
                            onPointerMove={(event) => {
                                if (event.buttons !== 1) return;
                                handleWheelPointer(
                                    wheelRef.current,
                                    event.clientX,
                                    event.clientY
                                );
                            }}
                            className="relative mx-auto aspect-square w-full max-w-[280px] rounded-full border-4 border-white shadow-[0_10px_25px_rgba(42,31,27,0.12)] md:max-w-[360px]"
                            style={{
                                background:
                                    "radial-gradient(circle, white 0%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0) 62%), conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                            }}
                        >
                            <span
                                className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-md md:h-8 md:w-8"
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

                        <div className="min-w-0">
                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                HEX
                            </label>

                            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_48px] items-center gap-2">
                                <input
                                    value={draftHex}
                                    onChange={(event) => updateDraftFromHex(event.target.value)}
                                    onBlur={() => {
                                        if (!isValidHex(draftHex)) {
                                            const fixed = draftColor;
                                            setDraftHex(fixed);
                                        }
                                    }}
                                    className="w-full min-w-0 rounded-2xl border border-[#F1E5DF] px-4 py-3 text-sm font-semibold text-[#2A1F1B] outline-none focus:border-[#F28C6F]"
                                    aria-label="HEX color"
                                />

                                <button
                                    type="button"
                                    onClick={() => copyWithStatus(draftColor, "picker")}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                                    aria-label="Copy selected color"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="min-w-0 space-y-5">
                        <div className="min-w-0">
                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                Hue
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={Math.round(draftHsl.h)}
                                onChange={(event) =>
                                    updateDraftHsl({ h: Number(event.target.value) })
                                }
                                className="w-full accent-[#F28C6F]"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                Saturation
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={Math.round(draftHsl.s)}
                                onChange={(event) =>
                                    updateDraftHsl({ s: Number(event.target.value) })
                                }
                                className="w-full accent-[#F28C6F]"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="mb-2 block text-xs font-medium text-gray-500">
                                Lightness
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                value={Math.round(draftHsl.l)}
                                onChange={(event) =>
                                    updateDraftHsl({ l: Number(event.target.value) })
                                }
                                className="w-full accent-[#F28C6F]"
                            />
                        </div>

                        <div className="min-w-0">
                            <span className="mb-2 block text-xs font-medium text-gray-500">
                                Current color
                            </span>
                            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-3">
                                <div
                                    className="h-14 w-14 shrink-0 rounded-2xl border border-[#F1E5DF] shadow-sm"
                                    style={{ backgroundColor: draftColor }}
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#2A1F1B]">
                                        {draftColor}
                                    </p>
                                    <p className="text-xs text-gray-500">Selected base color</p>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <span className="mb-3 block text-xs font-medium text-gray-500">
                                Presets
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
                                                    ? "h-10 w-10 shrink-0 rounded-2xl border-2 border-[#F28C6F] bg-white p-1"
                                                    : "h-10 w-10 shrink-0 rounded-2xl border border-[#F1E5DF] p-1"
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

                        <div className="grid min-w-0 grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={isDesktop ? resetDesktopColor : closePicker}
                                className="rounded-2xl border border-[#F4C8BA] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                            >
                                {isDesktop ? "Reset" : "Cancel"}
                            </button>

                            <button
                                type="button"
                                onClick={isDesktop ? applyDesktopColor : applyPickerColor}
                                className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-5">
            <section className="rounded-[28px] border border-[#F1E5DF] bg-white p-5 shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold text-[#2A1F1B]">Controls</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        Adjust the base color, palette style, and color count.
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                            Base Color
                        </label>

                        <button
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={openPicker}
                            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#F1E5DF] bg-white px-3 py-3 text-left transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3] md:hidden"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <span
                                    className="h-10 w-12 shrink-0 rounded-xl shadow-sm"
                                    style={{ backgroundColor: baseColor }}
                                />
                                <span className="truncate text-sm font-semibold text-[#2A1F1B]">
                                    {baseColor}
                                </span>
                            </div>

                            <Pencil className="h-4 w-4 shrink-0 text-gray-400" />
                        </button>

                        <div className="hidden rounded-[28px] border border-[#F1E5DF] bg-[#FFFDFC] p-6 md:block">
                            {renderColorPickerPanel("desktop", desktopWheelRef)}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                            Palette Type
                        </label>

                        <select
                            value={paletteType}
                            onChange={(event) =>
                                setPaletteType(event.target.value as PaletteType)
                            }
                            className="w-full rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm font-medium text-[#2A1F1B] outline-none focus:border-[#F28C6F]"
                            aria-label="Palette type"
                        >
                            {PALETTE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#2A1F1B]">
                            Color Count
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
                                                ? "rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 py-3 text-sm font-semibold text-[#E6765B]"
                                                : "rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                                        }
                                    >
                                        {count}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-[#F1E5DF] pt-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-[#2A1F1B]">
                                Palette Preview
                            </h3>

                            <span className="text-xs text-gray-400">
                                Swipe or tap a color
                            </span>
                        </div>

                        <div className="-mx-1 overflow-x-auto px-1 pb-1">
                            <div className="flex min-w-max snap-x snap-mandatory gap-1.5 pr-8">
                                {palette.map((color, index) => (
                                    <button
                                        key={`${color}-${index}`}
                                        type="button"
                                        onClick={() => copyWithStatus(color, `color-${index}`)}
                                        className="relative flex h-40 w-[36px] flex-none snap-start items-center justify-center rounded-[17px] shadow-sm transition active:scale-[0.98] md:h-44 md:w-[54px]"
                                        style={{ backgroundColor: color }}
                                        aria-label={`Copy ${color}`}
                                    >
                                        <span className="-rotate-90 whitespace-nowrap text-[10px] font-bold tracking-wide text-white md:text-sm">
                                            {copiedTarget === `color-${index}`
                                                ? "COPIED"
                                                : color.toUpperCase()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[28px] border border-[#F1E5DF] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-[#2A1F1B]">CSS Output</h2>

                <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] p-4 text-sm leading-6 text-[#2A1F1B]">
                    <code>{cssOutput}</code>
                </pre>

                <button
                    type="button"
                    onClick={handleCopyCss}
                    className="mt-4 inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    <Copy className="h-4 w-4" />
                    {copiedTarget === "css" ? "Copied" : "Copy CSS"}
                </button>
            </section>

            <div className="hidden grid-cols-4 gap-3 md:grid">
                <button
                    type="button"
                    onClick={handleShuffle}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm font-semibold text-[#E6765B] transition hover:bg-[#FFEDE6]"
                >
                    <Shuffle className="h-4 w-4" />
                    Shuffle
                </button>

                <button
                    type="button"
                    onClick={handleRandomAll}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    <Dices className="h-4 w-4" />
                    Random
                </button>

                <button
                    type="button"
                    onClick={handleCopyPalette}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#F1E5DF] bg-white px-4 py-3 text-sm font-semibold text-[#2A1F1B] transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3]"
                >
                    <Copy className="h-4 w-4" />
                    {copiedTarget === "palette" ? "Copied" : "Copy Palette"}
                </button>

                <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    <Download className="h-4 w-4" />
                    Download PNG
                </button>
            </div>

            <div
                className={[
                    "pointer-events-none fixed inset-x-0 bottom-3 px-3 md:hidden",
                    isPickerOpen ? "z-[60]" : "z-40",
                ].join(" ")}
            >
                <div
                    ref={mobileActionBarRef}
                    className="pointer-events-auto mx-auto max-w-md rounded-[30px] border border-[#F1E5DF] bg-white/95 p-3 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
                >
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={handleShuffle}
                            className="flex flex-col items-center justify-center rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] px-2 py-3 text-center"
                        >
                            <Shuffle className="mb-1 h-5 w-5 text-[#E6765B]" />
                            <span className="text-xs font-semibold text-[#E6765B]">
                                Shuffle
                            </span>
                            <span className="mt-0.5 text-[10px] text-[#9C6B5B]">
                                Keep color
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleRandomAll}
                            className="flex flex-col items-center justify-center rounded-2xl bg-[#F28C6F] px-2 py-3 text-center shadow-sm"
                        >
                            <Dices className="mb-1 h-5 w-5 text-white" />
                            <span className="whitespace-nowrap text-xs font-semibold text-white">
                                Random
                            </span>
                            <span className="mt-0.5 text-[10px] text-white/85">
                                New palette
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopyPalette}
                            className="flex flex-col items-center justify-center rounded-2xl border border-[#F1E5DF] bg-white px-2 py-3 text-center"
                        >
                            <Copy className="mb-1 h-5 w-5 text-[#2A1F1B]" />
                            <span className="text-xs font-semibold text-[#2A1F1B]">
                                {copiedTarget === "palette" ? "Copied" : "Copy"}
                            </span>
                            <span className="mt-0.5 text-[10px] text-gray-500">
                                Palette
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPng}
                            className="flex flex-col items-center justify-center rounded-2xl bg-[#F28C6F] px-2 py-3 text-center shadow-sm"
                        >
                            <Download className="mb-1 h-5 w-5 text-white" />
                            <span className="text-xs font-semibold text-white">
                                Download
                            </span>
                            <span className="mt-0.5 text-[10px] text-white/85">PNG</span>
                        </button>
                    </div>
                </div>
            </div>

            {isPickerOpen ? (
                <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden md:hidden">
                    <button
                        type="button"
                        aria-label="Close color picker"
                        onClick={closePicker}
                        className="pointer-events-auto absolute inset-0 bg-[#2A1F1B]/35 backdrop-blur-[2px]"
                    />

                    <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(var(--mobile-action-bar-space,0px)+8px)] max-h-[72vh] overflow-y-auto overflow-x-hidden rounded-[32px] border border-[#F1E5DF] bg-white px-5 pb-5 pt-4 shadow-[0_-16px_45px_rgba(42,31,27,0.18)]">
                        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
                        {renderColorPickerPanel("mobile", mobileWheelRef)}
                    </div>
                </div>
            ) : null}
        </div>
    );
}