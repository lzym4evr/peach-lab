"use client";

import { useMemo, useState } from "react";
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

            setTimeout(() => {
                setCopied(false);
            }, 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h3 className="font-semibold text-gray-900">
                                {text.previewTitle}
                            </h3>

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div
                            className="flex min-h-[420px] items-center justify-center rounded-3xl p-8"
                            style={{
                                background: `linear-gradient(${gradientAngle}deg, ${safeBackgroundColor1}, ${safeBackgroundColor2})`,
                            }}
                        >
                            <div
                                className="w-full max-w-sm p-8 text-center"
                                style={{
                                    background: `rgba(${glassRgb.r}, ${glassRgb.g}, ${glassRgb.b
                                        }, ${opacity / 100})`,
                                    backdropFilter: `blur(${blur}px)`,
                                    WebkitBackdropFilter: `blur(${blur}px)`,
                                    borderRadius: `${borderRadius}px`,
                                    border: `1px solid rgba(255, 255, 255, ${borderOpacity / 100
                                        })`,
                                    boxShadow: `0 18px 60px rgba(17, 24, 39, ${shadowIntensity / 100
                                        })`,
                                }}
                            >
                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/50 text-3xl">
                                    ◫
                                </div>

                                <h4 className="text-2xl font-bold text-gray-900">
                                    {text.cardText}
                                </h4>

                                <p className="mt-3 text-sm leading-6 text-gray-700">
                                    {text.cardDescription}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h3 className="font-semibold text-gray-900">{text.cssTitle}</h3>

                            <button
                                type="button"
                                onClick={copyCss}
                                className="rounded-xl border border-[#F1E5DF] bg-white px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:bg-[#FFF7F3]"
                            >
                                {copied ? t.common.copied : t.common.copy}
                            </button>
                        </div>

                        <pre className="overflow-x-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-7 text-gray-700">
                            <code>{cssOutput}</code>
                        </pre>
                    </section>
                </div>

                <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">{text.controls}</h3>

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

                    <div className="mt-5 space-y-5">
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

                        <button
                            type="button"
                            onClick={copyCss}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {copied ? t.common.copied : text.copyCss}
                        </button>
                    </div>
                </section>
            </div>
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