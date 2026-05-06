"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import { t } from "@/data/messages";

type PickedColor = {
    hex: string;
    rgb: string;
    hsl: string;
    r: number;
    g: number;
    b: number;
};

type MagnifierState = {
    visible: boolean;
    x: number;
    y: number;
    color: string;
    rgb: string;
};

const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

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

function getDefaultMagnifier(): MagnifierState {
    return {
        visible: false,
        x: 0,
        y: 0,
        color: "#000000",
        rgb: "rgb(0, 0, 0)",
    };
}

function isImageFile(file: File) {
    const lowerName = file.name.toLowerCase();
    const hasImageType = file.type.startsWith("image/");
    const hasSupportedExtension = SUPPORTED_IMAGE_EXTENSIONS.some((extension) =>
        lowerName.endsWith(extension)
    );

    return hasImageType || hasSupportedExtension;
}

export default function ColorPickerTool() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const lastFileKeyRef = useRef("");

    const [imageName, setImageName] = useState("");
    const [pickedColor, setPickedColor] = useState<PickedColor | null>(null);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setDebugMessage] = useState("No file selected yet.");
    const [magnifier, setMagnifier] = useState<MagnifierState>(
        getDefaultMagnifier()
    );

    const colorItems = pickedColor
        ? [
            { label: "HEX", value: pickedColor.hex },
            { label: "RGB", value: pickedColor.rgb },
            { label: "HSL", value: pickedColor.hsl },
        ]
        : [];

    function resetMagnifier() {
        setMagnifier(getDefaultMagnifier());
    }

    function resetCanvas() {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
    }

    function processImageFile(file: File) {
        setError("");
        setPickedColor(null);
        setImageName(file.name || "Selected image");
        setIsLoading(true);
        resetMagnifier();
        resetCanvas();

        if (!isImageFile(file)) {
            setIsLoading(false);
            setError(t.colorPicker.invalidFileType);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result !== "string") {
                setIsLoading(false);
                setError(t.colorPicker.readError);
                return;
            }

            const image = new Image();

            image.onload = () => {
                const canvas = canvasRef.current;

                if (!canvas) {
                    setIsLoading(false);
                    setError(t.colorPicker.readError);
                    return;
                }

                const naturalWidth = image.naturalWidth || image.width;
                const naturalHeight = image.naturalHeight || image.height;

                if (!naturalWidth || !naturalHeight) {
                    setIsLoading(false);
                    setError(t.colorPicker.readError);
                    return;
                }

                const maxWidth = 900;
                const maxHeight = 900;

                const scale = Math.min(
                    1,
                    maxWidth / naturalWidth,
                    maxHeight / naturalHeight
                );

                const width = Math.max(1, Math.round(naturalWidth * scale));
                const height = Math.max(1, Math.round(naturalHeight * scale));

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d", {
                    willReadFrequently: true,
                });

                if (!context) {
                    setIsLoading(false);
                    setError(t.colorPicker.readError);
                    return;
                }

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                setImageName(file.name || "Uploaded image");
                setError("");
                setIsLoading(false);

                setDebugMessage(
                    `Loaded: ${file.name || "Unnamed file"
                    } | Canvas: ${width} x ${height}`
                );
            };

            image.onerror = () => {
                setIsLoading(false);
                setError(t.colorPicker.unsupportedFormat);
            };

            image.src = result;
        };

        reader.onerror = () => {
            setIsLoading(false);
            setError(t.colorPicker.readError);
        };

        reader.readAsDataURL(file);
    }

    function handleSelectedFile(input: HTMLInputElement | null) {
        const file = input?.files?.[0];

        if (!file) {
            setDebugMessage("Upload event fired, but no file was returned.");
            setError(t.colorPicker.noFileSelectedError);
            return;
        }

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

        if (lastFileKeyRef.current === fileKey) {
            return;
        }

        lastFileKeyRef.current = fileKey;

        setDebugMessage(
            `Selected: ${file.name || "Unnamed file"} | Type: ${file.type || "unknown"
            } | Size: ${Math.round(file.size / 1024)} KB`
        );

        setImageName(file.name || "Selected image");
        setError("");

        processImageFile(file);
    }

    useEffect(() => {
        const input = fileInputRef.current;

        const handleNativeFileEvent = () => {
            setDebugMessage("Native file event fired.");
            handleSelectedFile(input);
        };

        input?.addEventListener("change", handleNativeFileEvent);
        input?.addEventListener("input", handleNativeFileEvent);

        const timer = window.setInterval(() => {
            const currentInput = fileInputRef.current;
            const file = currentInput?.files?.[0];

            if (!file) return;

            const fileKey = `${file.name}-${file.size}-${file.lastModified}`;

            if (lastFileKeyRef.current === fileKey) return;

            setDebugMessage("Polling detected selected file.");
            handleSelectedFile(currentInput);
        }, 500);

        return () => {
            input?.removeEventListener("change", handleNativeFileEvent);
            input?.removeEventListener("input", handleNativeFileEvent);
            window.clearInterval(timer);
        };
    }, []);

    function handleFileInputClick(event: React.MouseEvent<HTMLInputElement>) {
        event.currentTarget.value = "";
        lastFileKeyRef.current = "";
        setDebugMessage("Waiting for selected file...");
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDebugMessage("React onChange fired.");
        handleSelectedFile(event.currentTarget);
    }

    function handleFileInput(event: React.FormEvent<HTMLInputElement>) {
        setDebugMessage("React onInput fired.");
        handleSelectedFile(event.currentTarget);
    }

    function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (!file) return;

        const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
        lastFileKeyRef.current = fileKey;

        setDebugMessage(
            `Dropped: ${file.name || "Unnamed file"} | Type: ${file.type || "unknown"
            } | Size: ${Math.round(file.size / 1024)} KB`
        );

        processImageFile(file);
    }

    function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;

        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if (!rect.width || !rect.height) return null;

        const x = Math.floor(
            ((event.clientX - rect.left) / rect.width) * canvas.width
        );

        const y = Math.floor(
            ((event.clientY - rect.top) / rect.height) * canvas.height
        );

        if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
            return null;
        }

        return { x, y };
    }

    function getPixelColor(x: number, y: number) {
        const canvas = canvasRef.current;

        if (!canvas) return null;

        const context = canvas.getContext("2d", {
            willReadFrequently: true,
        });

        if (!context) return null;

        const pixel = context.getImageData(x, y, 1, 1).data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const hex = rgbToHex(r, g, b);
        const rgb = `rgb(${r}, ${g}, ${b})`;
        const hsl = rgbToHsl(r, g, b);

        return {
            hex,
            rgb,
            hsl,
            r,
            g,
            b,
        };
    }

    function drawMagnifier(x: number, y: number) {
        const canvas = canvasRef.current;
        const magnifierCanvas = magnifierCanvasRef.current;

        if (!canvas || !magnifierCanvas) return;

        const magnifierContext = magnifierCanvas.getContext("2d");

        if (!magnifierContext) return;

        const color = getPixelColor(x, y);

        if (!color) return;

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
            color: color.hex,
            rgb: color.rgb,
        });
    }

    function handleCanvasPointerDown(
        event: React.PointerEvent<HTMLCanvasElement>
    ) {
        if (!imageName) return;

        const point = getCanvasPoint(event);

        if (!point) return;

        const color = getPixelColor(point.x, point.y);

        if (!color) return;

        setPickedColor(color);
        drawMagnifier(point.x, point.y);
    }

    function handleCanvasPointerMove(
        event: React.PointerEvent<HTMLCanvasElement>
    ) {
        if (!imageName) return;

        const point = getCanvasPoint(event);

        if (!point) {
            setMagnifier((prev) => ({
                ...prev,
                visible: false,
            }));
            return;
        }

        drawMagnifier(point.x, point.y);
    }

    function handleCanvasPointerLeave() {
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
        resetCanvas();

        setImageName("");
        setPickedColor(null);
        setError("");
        setIsLoading(false);
        setDebugMessage("No file selected yet.");
        lastFileKeyRef.current = "";
        resetMagnifier();

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-5 pb-1 md:space-y-6 lg:pb-0">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-3xl border-2 border-dashed p-4 text-center transition md:p-8 ${isDragging
                    ? "border-[#F28C6F] bg-[#FFF0EA]"
                    : "border-[#F4C8BA] bg-[#FFF7F3]"
                    }`}
            >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm md:mb-4 md:h-16 md:w-16 md:text-3xl">
                    🎨
                </div>

                <h2 className="text-xl font-semibold leading-tight text-[#111827] md:text-3xl">
                    {t.colorPicker.uploadTitle}
                </h2>

                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:mt-3 md:text-base md:leading-7">
                    {t.colorPicker.uploadDescription}
                </p>

                <p className="mx-auto mt-2 max-w-xl text-xs font-medium text-[#A17F74] md:mt-3 md:text-sm">
                    {t.colorPicker.supportedFormats}
                </p>

                <div className="relative mx-auto mt-4 inline-flex md:mt-5">
                    <button
                        type="button"
                        className="pointer-events-none rounded-2xl bg-[#F28C6F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                    >
                        {isLoading ? t.colorPicker.loadingImage : t.colorPicker.chooseImage}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onClick={handleFileInputClick}
                        onChange={handleFileChange}
                        onInput={handleFileInput}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        aria-label="Upload image"
                    />
                </div>

                <p className="mx-auto mt-3 max-w-xl break-all text-sm font-medium text-gray-500">
                    {imageName || t.colorPicker.noFileSelected}
                </p>

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-6">
                <div className="p-0 md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-6 md:shadow-sm">
                    <SectionTitle
                        title={t.colorPicker.imagePreview}
                        right={
                            imageName ? (
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="shrink-0 rounded-2xl border border-[#F1E5DF] px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#F28C6F] hover:text-[#F28C6F]"
                                >
                                    {t.common.clear}
                                </button>
                            ) : null
                        }
                    />

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        {t.colorPicker.previewHint}
                    </p>

                    <div
                        className={
                            imageName
                                ? "relative mt-3 flex items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-0 md:mt-4 md:min-h-[460px] md:p-4"
                                : "relative mt-3 flex min-h-[180px] items-center justify-center overflow-hidden rounded-2xl bg-[#FFFDFC] p-3 md:mt-4 md:min-h-[460px] md:p-4"
                        }
                    >
                        <canvas
                            ref={canvasRef}
                            onPointerDown={handleCanvasPointerDown}
                            onPointerMove={handleCanvasPointerMove}
                            onPointerLeave={handleCanvasPointerLeave}
                            className={`h-auto max-h-[520px] max-w-full cursor-crosshair rounded-xl object-contain ${imageName ? "block" : "hidden"
                                }`}
                            style={{
                                touchAction: "none",
                            }}
                        />

                        {!imageName && !isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                                <div className="max-w-[220px] rounded-2xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] px-4 py-3 text-sm leading-6 text-gray-500 md:max-w-[240px] md:px-5 md:py-4">
                                    {t.colorPicker.previewEmpty}
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                                <div className="rounded-2xl border border-[#F1E5DF] bg-white px-5 py-4 text-sm font-medium text-gray-500 shadow-sm">
                                    {t.colorPicker.loadingImage}
                                </div>
                            </div>
                        )}
                    </div>

                    {imageName && (
                        <p className="mt-2 break-all text-sm text-gray-500 md:mt-4">
                            {imageName}
                        </p>
                    )}
                </div>

                <div className="hidden lg:block lg:rounded-3xl lg:border lg:border-[#F1E5DF] lg:bg-white lg:p-6 lg:shadow-sm">
                    <SectionTitle title={t.colorPicker.pickedColor} />

                    <div className="mt-5 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <SectionTitle
                                    title={t.colorPicker.pixelMagnifier}
                                    titleClassName="text-sm md:text-sm"
                                />

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    {t.colorPicker.magnifierHint}
                                </p>
                            </div>

                            <div
                                className="h-9 w-9 shrink-0 rounded-xl border border-[#F1E5DF]"
                                style={{ backgroundColor: magnifier.color }}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[150px_minmax(0,1fr)] lg:items-center">
                            <canvas
                                ref={magnifierCanvasRef}
                                className={`mx-auto h-[140px] w-[140px] rounded-xl border border-[#F1E5DF] bg-white transition lg:mx-0 lg:h-[150px] lg:w-[150px] ${magnifier.visible ? "opacity-100" : "opacity-30"
                                    }`}
                            />

                            <div className="min-w-0 text-center lg:text-left">
                                <p className="text-base font-bold text-gray-900">
                                    {magnifier.color}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">{magnifier.rgb}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    x {magnifier.x}, y {magnifier.y}
                                </p>
                            </div>
                        </div>
                    </div>

                    {pickedColor ? (
                        <div className="mt-5 space-y-4">
                            <div
                                className="h-28 rounded-2xl border border-[#F1E5DF] md:h-32"
                                style={{ backgroundColor: pickedColor.hex }}
                            />

                            <div className="grid gap-3">
                                {colorItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] p-4"
                                    >
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            {item.label}
                                        </p>

                                        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="break-all text-xl font-bold text-gray-900">
                                                {item.value}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => copyValue(item.label, item.value)}
                                                className="w-fit rounded-2xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                                            >
                                                {copied === item.label
                                                    ? t.common.copied
                                                    : t.common.copy}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="mt-5 text-center text-sm leading-6 text-gray-500 lg:rounded-2xl lg:border lg:border-dashed lg:border-[#F4C8BA] lg:bg-[#FFF7F3] lg:p-6">
                            {t.colorPicker.emptyPickedColor}
                        </p>
                    )}
                </div>
            </div>

            <div className="peachlab-mobile-action-bar fixed inset-x-3 bottom-3 z-50 lg:hidden">
                <div className="rounded-[30px] border border-[#F1E5DF] bg-white/95 p-3 shadow-[0_12px_40px_rgba(42,31,27,0.16)] backdrop-blur">
                    {pickedColor ? (
                        <div className="flex items-center gap-3">
                            <div
                                className="h-16 w-16 shrink-0 rounded-2xl border border-[#F1E5DF] shadow-sm"
                                style={{ backgroundColor: pickedColor.hex }}
                            />

                            <div className="min-w-0 flex-1">
                                <p className="mb-2 px-1 text-[11px] font-medium text-gray-400">
                                    {copied
                                        ? t.colorPicker.valueCopied.replace("{label}", copied)
                                        : t.colorPicker.tapValueToCopy}
                                </p>

                                <div className="space-y-2">
                                    {colorItems.map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => copyValue(item.label, item.value)}
                                            className="flex w-full min-w-0 items-center justify-between rounded-2xl border border-[#F1E5DF] bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#F4C8BA] hover:bg-[#FFF7F3] active:scale-[0.99]"
                                        >
                                            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                {item.label}
                                            </span>

                                            <span className="ml-3 truncate text-sm font-medium text-[#2A1F1B]">
                                                {copied === item.label ? t.common.copied : item.value}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF7F3] text-xl shadow-sm">
                                🎨
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#2A1F1B]">
                                    {t.colorPicker.mobileActionTitle}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {t.colorPicker.mobileActionDescription}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 1023px) {
                    footer {
                        padding-bottom: calc(86px + env(safe-area-inset-bottom, 0px));
                    }
                }
            `}</style>
        </div>
    );
}