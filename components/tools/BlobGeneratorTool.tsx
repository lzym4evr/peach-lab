"use client";

import { useMemo, useRef, useState } from "react";
import { t } from "@/data/messages";

type Point = {
    x: number;
    y: number;
};

function createRandomPoints(count: number, minRadius: number, maxRadius: number) {
    const points: Point[] = [];
    const centerX = 150;
    const centerY = 150;

    for (let index = 0; index < count; index++) {
        const angle = (Math.PI * 2 * index) / count;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);

        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
        });
    }

    return points;
}

function createSmoothPath(points: Point[], smoothness: number) {
    if (points.length < 2) return "";

    let path = "";

    for (let index = 0; index < points.length; index++) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const previous = points[(index - 1 + points.length) % points.length];

        const controlDistance = smoothness / 100;

        const controlPoint1 = {
            x: current.x + (next.x - previous.x) * controlDistance,
            y: current.y + (next.y - previous.y) * controlDistance,
        };

        const nextNext = points[(index + 2) % points.length];

        const controlPoint2 = {
            x: next.x - (nextNext.x - current.x) * controlDistance,
            y: next.y - (nextNext.y - current.y) * controlDistance,
        };

        if (index === 0) {
            path += `M ${current.x.toFixed(2)} ${current.y.toFixed(2)} `;
        }

        path += `C ${controlPoint1.x.toFixed(2)} ${controlPoint1.y.toFixed(
            2,
        )}, ${controlPoint2.x.toFixed(2)} ${controlPoint2.y.toFixed(
            2,
        )}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
    }

    path += "Z";

    return path;
}

export default function BlobGeneratorTool() {
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [pointsCount, setPointsCount] = useState(8);
    const [smoothness, setSmoothness] = useState(28);
    const [color, setColor] = useState("#F28C6F");
    const [points, setPoints] = useState(() => createRandomPoints(8, 80, 125));
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");

    const copyErrorText =
        (t.blobGenerator as { copyError?: string }).copyError ??
        "Copy failed. Please copy the SVG manually.";

    const path = useMemo(() => {
        return createSmoothPath(points, smoothness);
    }, [points, smoothness]);

    const svgCode = useMemo(() => {
        return `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" fill="${color}" />
</svg>`;
    }, [path, color]);

    function generateBlob() {
        setPoints(createRandomPoints(pointsCount, 80, 125));
        setCopied(false);
        setCopyError("");
    }

    async function copySvg() {
        try {
            await navigator.clipboard.writeText(svgCode);

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
            setCopyError(copyErrorText);
        }
    }

    function downloadSvg() {
        const blob = new Blob([svgCode], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "peach-lab-blob.svg";
        link.click();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0 space-y-6">
                <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t.blobGenerator.previewTitle}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {t.blobGenerator.previewDescription}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={generateBlob}
                            className="rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {t.blobGenerator.generate}
                        </button>
                    </div>

                    <div className="mt-5 flex min-h-96 items-center justify-center rounded-3xl bg-[#FFF7F3] p-8">
                        <svg
                            width="300"
                            height="300"
                            viewBox="0 0 300 300"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-72 w-72 drop-shadow-sm"
                        >
                            <path d={path} fill={color} />
                        </svg>
                    </div>
                </section>

                <section className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="mb-3">
                        <h3 className="font-semibold text-gray-900">
                            {t.blobGenerator.svgCode}
                        </h3>
                    </div>

                    <pre className="max-h-80 overflow-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                        {svgCode}
                    </pre>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={copySvg}
                            className="rounded-2xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {copied ? t.common.copied : t.blobGenerator.copySvg}
                        </button>
                    </div>

                    {copyError ? (
                        <p className="mt-3 text-sm font-medium text-red-500">
                            {copyError}
                        </p>
                    ) : null}
                </section>
            </div>

            <section className="min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900">
                    {t.blobGenerator.controls}
                </h3>

                <div className="mt-5 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                            {t.blobGenerator.fillColor}
                        </label>

                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(event) => {
                                    setColor(event.target.value);
                                    setCopied(false);
                                    setCopyError("");
                                }}
                                className="h-12 w-16 cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1"
                            />

                            <input
                                value={color}
                                onChange={(event) => {
                                    setColor(event.target.value);
                                    setCopied(false);
                                    setCopyError("");
                                }}
                                className="h-12 min-w-0 flex-1 rounded-xl border border-[#F1E5DF] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA]"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                {t.blobGenerator.points}
                            </label>

                            <span className="text-sm text-gray-500">
                                {pointsCount}
                            </span>
                        </div>

                        <input
                            type="range"
                            min="5"
                            max="14"
                            value={pointsCount}
                            onChange={(event) => {
                                const value = Number(event.target.value);
                                setPointsCount(value);
                                setPoints(createRandomPoints(value, 80, 125));
                                setCopied(false);
                                setCopyError("");
                            }}
                            className="w-full accent-[#F28C6F]"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-gray-800">
                                {t.blobGenerator.smoothness}
                            </label>

                            <span className="text-sm text-gray-500">
                                {smoothness}
                            </span>
                        </div>

                        <input
                            type="range"
                            min="10"
                            max="45"
                            value={smoothness}
                            onChange={(event) => {
                                setSmoothness(Number(event.target.value));
                                setCopied(false);
                                setCopyError("");
                            }}
                            className="w-full accent-[#F28C6F]"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={downloadSvg}
                        className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                    >
                        {t.blobGenerator.downloadSvg}
                    </button>
                </div>
            </section>
        </div>
    );
}