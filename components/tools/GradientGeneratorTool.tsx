"use client";

import { useMemo, useState } from "react";
import { t } from "@/data/messages";

export default function GradientGeneratorTool() {
    const [color1, setColor1] = useState("#F28C6F");
    const [color2, setColor2] = useState("#FFD6C8");
    const [angle, setAngle] = useState(135);
    const [copied, setCopied] = useState(false);

    const cssValue = useMemo(() => {
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }, [angle, color1, color2]);

    async function copyCss() {
        await navigator.clipboard.writeText(`background: ${cssValue};`);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 1500);
    }

    function randomGradient() {
        const colors = [
            "#F28C6F",
            "#FFD6C8",
            "#F59E8B",
            "#FFB38A",
            "#7DD3FC",
            "#A7F3D0",
            "#C4B5FD",
            "#FBCFE8",
            "#FDE68A",
            "#FDBA74",
        ];

        const first = colors[Math.floor(Math.random() * colors.length)];
        const second = colors[Math.floor(Math.random() * colors.length)];
        const randomAngle = Math.floor(Math.random() * 361);

        setColor1(first);
        setColor2(second);
        setAngle(randomAngle);
    }

    return (
        <div className="space-y-6">
            <div
                className="flex min-h-72 items-end justify-between rounded-3xl border border-[#F1E5DF] p-5 shadow-sm"
                style={{ background: cssValue }}
            >
                <div className="rounded-2xl bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {t.gradientGenerator.preview}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                        {angle}° Gradient
                    </p>
                </div>

                <button
                    onClick={randomGradient}
                    className="rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur transition hover:bg-white"
                >
                    {t.gradientGenerator.random}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.gradientGenerator.color1}
                    </label>

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color1}
                            onChange={(event) => setColor1(event.target.value)}
                            className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                        />

                        <input
                            value={color1}
                            onChange={(event) => setColor1(event.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-3 py-3 text-sm outline-none focus:border-[#F28C6F]"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.gradientGenerator.color2}
                    </label>

                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={color2}
                            onChange={(event) => setColor2(event.target.value)}
                            className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                        />

                        <input
                            value={color2}
                            onChange={(event) => setColor2(event.target.value)}
                            className="min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-3 py-3 text-sm outline-none focus:border-[#F28C6F]"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4">
                    <label className="mb-3 block text-sm font-semibold text-gray-800">
                        {t.gradientGenerator.angle}: {angle}°
                    </label>

                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={angle}
                        onChange={(event) => setAngle(Number(event.target.value))}
                        className="w-full accent-[#F28C6F]"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-[#F1E5DF] bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                        {t.gradientGenerator.cssOutput}
                    </h3>

                    <button
                        onClick={copyCss}
                        className="rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {copied ? t.common.copied : t.gradientGenerator.copyCss}
                    </button>
                </div>

                <pre className="overflow-x-auto rounded-xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                    {`background: ${cssValue};`}
                </pre>
            </div>
        </div>
    );
}