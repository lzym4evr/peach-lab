"use client";

import { useRef, useState } from "react";
import { t } from "@/data/messages";

type PickedColor = {
    hex: string;
    rgb: string;
    hsl: string;
    r: number;
    g: number;
    b: number;
};

function rgbToHex(r: number, g: number, b: number) {
    return (
        "#" +
        [r, g, b]
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()
    );
}

function rgbToHsl(r: number, g: number, b: number) {
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

    return `hsl(${Math.round(hue * 360)}, ${Math.round(
        saturation * 100
    )}%, ${Math.round(lightness * 100)}%)`;
}

export default function ColorPickerTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [imageName, setImageName] = useState("");
    const [pickedColor, setPickedColor] = useState<PickedColor | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState("");

    const [magnifier, setMagnifier] = useState({
        visible: false,
        x: 0,
        y: 0,
        color: "#000000",
        rgb: "rgb(0, 0, 0)",
    });

    function processImageFile(file: File) {
        setError("");
        setPickedColor(null);

        if (!file.type.startsWith("image/")) {
            setError(t.colorPicker.invalidImage);
            return;
        }

        const image = new Image();
        const url = URL.createObjectURL(file);

        image.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const maxWidth = 900;
            const scale =
                image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;

            canvas.width = Math.round(image.naturalWidth * scale);
            canvas.height = Math.round(image.naturalHeight * scale);

            const context = canvas.getContext("2d");
            if (!context) return;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            setImageName(file.name);
            URL.revokeObjectURL(url);
        };

        image.onerror = () => {
            setError(t.colorPicker.readError);
            URL.revokeObjectURL(url);
        };

        image.src = url;
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        processImageFile(file);
    }

    function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        processImageFile(file);
    }

    function pickColor(event: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas || !imageName) return;

        const rect = canvas.getBoundingClientRect();

        const x = Math.floor(
            ((event.clientX - rect.left) / rect.width) * canvas.width
        );
        const y = Math.floor(
            ((event.clientY - rect.top) / rect.height) * canvas.height
        );

        const context = canvas.getContext("2d");
        if (!context) return;

        const pixel = context.getImageData(x, y, 1, 1).data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const hex = rgbToHex(r, g, b);
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hsl = rgbToHsl(r, g, b);

        setPickedColor({
            hex,
            rgb,
            hsl,
            r,
            g,
            b,
        });
    }

    function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        const magnifierCanvas = magnifierCanvasRef.current;

        if (!canvas || !magnifierCanvas || !imageName) return;

        const rect = canvas.getBoundingClientRect();

        const x = Math.floor(
            ((event.clientX - rect.left) / rect.width) * canvas.width
        );
        const y = Math.floor(
            ((event.clientY - rect.top) / rect.height) * canvas.height
        );

        const context = canvas.getContext("2d");
        const magnifierContext = magnifierCanvas.getContext("2d");

        if (!context || !magnifierContext) return;

        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            setMagnifier((prev) => ({ ...prev, visible: false }));
            return;
        }

        const pixel = context.getImageData(x, y, 1, 1).data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const hex = rgbToHex(r, g, b);
        const rgb = `rgb(${r}, ${g}, ${b})`;

        const sampleSize = 15;
        const zoom = 10;
        const half = Math.floor(sampleSize / 2);

        magnifierCanvas.width = sampleSize * zoom;
        magnifierCanvas.height = sampleSize * zoom;

        magnifierContext.imageSmoothingEnabled = false;
        magnifierContext.clearRect(
            0,
            0,
            magnifierCanvas.width,
            magnifierCanvas.height
        );

        const sourceX = Math.max(0, x - half);
        const sourceY = Math.max(0, y - half);
        const sourceWidth = Math.min(sampleSize, canvas.width - sourceX);
        const sourceHeight = Math.min(sampleSize, canvas.height - sourceY);

        magnifierContext.drawImage(
            canvas,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth * zoom,
            sourceHeight * zoom
        );

        magnifierContext.strokeStyle = "rgba(255,255,255,0.35)";
        magnifierContext.lineWidth = 1;

        for (let i = 0; i <= sampleSize; i++) {
            magnifierContext.beginPath();
            magnifierContext.moveTo(i * zoom + 0.5, 0);
            magnifierContext.lineTo(i * zoom + 0.5, sampleSize * zoom);
            magnifierContext.stroke();

            magnifierContext.beginPath();
            magnifierContext.moveTo(0, i * zoom + 0.5);
            magnifierContext.lineTo(sampleSize * zoom, i * zoom + 0.5);
            magnifierContext.stroke();
        }

        const center = half * zoom;

        magnifierContext.strokeStyle = "#F28C6F";
        magnifierContext.lineWidth = 2;
        magnifierContext.strokeRect(center, center, zoom, zoom);

        magnifierContext.strokeStyle = "rgba(0,0,0,0.8)";
        magnifierContext.lineWidth = 1;

        magnifierContext.beginPath();
        magnifierContext.moveTo(center + zoom / 2, 0);
        magnifierContext.lineTo(center + zoom / 2, sampleSize * zoom);
        magnifierContext.stroke();

        magnifierContext.beginPath();
        magnifierContext.moveTo(0, center + zoom / 2);
        magnifierContext.lineTo(sampleSize * zoom, center + zoom / 2);
        magnifierContext.stroke();

        setMagnifier({
            visible: true,
            x,
            y,
            color: hex,
            rgb,
        });
    }

    function handleMouseLeave() {
        setMagnifier((prev) => ({
            ...prev,
            visible: false,
        }));
    }

    async function copyValue(label: string, value: string) {
        await navigator.clipboard.writeText(value);
        setCopied(label);

        setTimeout(() => {
            setCopied("");
        }, 1500);
    }

    function clearImage() {
        const canvas = canvasRef.current;

        if (canvas) {
            const context = canvas.getContext("2d");
            context?.clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = 0;
            canvas.height = 0;
        }

        setImageName("");
        setPickedColor(null);
        setError("");
        setMagnifier({
            visible: false,
            x: 0,
            y: 0,
            color: "#000000",
            rgb: "rgb(0, 0, 0)",
        });
    }

    return (
        <div className="space-y-6">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${isDragging
                        ? "border-[#F28C6F] bg-[#FFF0EA]"
                        : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    🎨
                </div>

                <h2 className="text-xl font-semibold">{t.colorPicker.uploadTitle}</h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                    {t.colorPicker.uploadDescription}
                </p>

                <div className="mt-6 inline-flex rounded-xl bg-[#F28C6F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]">
                    {t.colorPicker.chooseImage}
                </div>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </label>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {t.colorPicker.imagePreview}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {t.colorPicker.previewHint}
                            </p>
                        </div>

                        {imageName && (
                            <button
                                onClick={clearImage}
                                className="rounded-xl border border-[#F1E5DF] px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F]"
                            >
                                {t.common.clear}
                            </button>
                        )}
                    </div>

                    <div className="relative mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-4">
                        <canvas
                            ref={canvasRef}
                            onClick={pickColor}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            className="max-h-[520px] max-w-full cursor-crosshair rounded-xl object-contain"
                        />

                        {!imageName && (
                            <div className="text-center text-sm text-gray-400">
                                {t.colorPicker.emptyPreview}
                            </div>
                        )}
                    </div>

                    {imageName && (
                        <p className="mt-4 break-all text-sm text-gray-500">{imageName}</p>
                    )}
                </div>

                <div className="rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">
                        {t.colorPicker.pickedColor}
                    </h3>

                    <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {t.colorPicker.pixelMagnifier}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {t.colorPicker.magnifierHint}
                                </p>
                            </div>

                            <div
                                className="h-8 w-8 rounded-lg border border-[#F1E5DF]"
                                style={{ backgroundColor: magnifier.color }}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <canvas
                                ref={magnifierCanvasRef}
                                className={`h-[150px] w-[150px] rounded-xl border border-[#F1E5DF] bg-white transition ${magnifier.visible ? "opacity-100" : "opacity-30"
                                    }`}
                            />

                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900">
                                    {magnifier.color}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{magnifier.rgb}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    x {magnifier.x}, y {magnifier.y}
                                </p>
                            </div>
                        </div>
                    </div>

                    {pickedColor ? (
                        <div className="mt-5 space-y-4">
                            <div
                                className="h-32 rounded-2xl border border-[#F1E5DF]"
                                style={{ backgroundColor: pickedColor.hex }}
                            />

                            <div className="grid gap-3">
                                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        HEX
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="break-all text-xl font-bold">
                                            {pickedColor.hex}
                                        </p>
                                        <button
                                            onClick={() => copyValue("HEX", pickedColor.hex)}
                                            className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-sm font-semibold text-[#E6765B]"
                                        >
                                            {copied === "HEX" ? t.common.copied : t.common.copy}
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        RGB
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="break-all text-xl font-bold">
                                            {pickedColor.rgb}
                                        </p>
                                        <button
                                            onClick={() => copyValue("RGB", pickedColor.rgb)}
                                            className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-sm font-semibold text-[#E6765B]"
                                        >
                                            {copied === "RGB" ? t.common.copied : t.common.copy}
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        HSL
                                    </p>
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="break-all text-xl font-bold">
                                            {pickedColor.hsl}
                                        </p>
                                        <button
                                            onClick={() => copyValue("HSL", pickedColor.hsl)}
                                            className="rounded-xl border border-[#F4C8BA] bg-[#FFF7F3] px-3 py-2 text-sm font-semibold text-[#E6765B]"
                                        >
                                            {copied === "HSL" ? t.common.copied : t.common.copy}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-4">
                                <p className="text-sm font-semibold text-gray-800">
                                    {t.common.localProcessing}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {t.colorPicker.localProcessingDescription}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-8 text-center text-sm text-gray-500">
                            {t.colorPicker.emptyPickedColor}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}