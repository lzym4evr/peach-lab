"use client";

import {
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { t } from "@/data/messages";

type Point = {
    x: number;
    y: number;
};

type FillType = "solid" | "gradient";

function createRandomPoints(count: number, minRadius: number, maxRadius: number) {
    const points: Point[] = [];
    const centerX = 150;
    const centerY = 150;

    for (let index = 0; index < count; index += 1) {
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
    if (points.length < 3) return "";

    let path = "";

    for (let index = 0; index < points.length; index += 1) {
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

function getSvgPoint(event: ReactPointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 300;
    const y = ((event.clientY - rect.top) / rect.height) * 300;

    return {
        x: Math.min(300, Math.max(0, x)),
        y: Math.min(300, Math.max(0, y)),
    };
}

function getGradientCoordinates(angle: number) {
    const radians = ((angle - 90) * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);

    const x1 = 50 - x * 50;
    const y1 = 50 - y * 50;
    const x2 = 50 + x * 50;
    const y2 = 50 + y * 50;

    return {
        x1: `${x1.toFixed(2)}%`,
        y1: `${y1.toFixed(2)}%`,
        x2: `${x2.toFixed(2)}%`,
        y2: `${y2.toFixed(2)}%`,
    };
}

function getBlobFill({
    fillType,
    solidColor,
}: {
    fillType: FillType;
    solidColor: string;
}) {
    return fillType === "gradient" ? "url(#blobGradient)" : solidColor;
}

export default function BlobGeneratorTool() {
    const text = t.blobGenerator;
    const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragIndexRef = useRef<number | null>(null);
    const didDragRef = useRef(false);
    const dragStartPointsRef = useRef<Point[] | null>(null);
    const customPointsRef = useRef<Point[]>([]);

    const settingsButtonText =
        (text as { settingsButton?: string }).settingsButton ?? "Settings";

    const actionDownloadText =
        (text as { actionDownload?: string }).actionDownload ?? "Download";

    const customPointsText =
        (text as { customPoints?: string }).customPoints ?? "Custom Points";

    const clearPointsText =
        (text as { clearPoints?: string }).clearPoints ?? "Clear Points";

    const undoText = (text as { undo?: string }).undo ?? "Undo";
    const redoText = (text as { redo?: string }).redo ?? "Redo";

    const fillTypeText = (text as { fillType?: string }).fillType ?? "Fill Type";
    const solidText = (text as { solid?: string }).solid ?? "Solid";
    const gradientText = (text as { gradient?: string }).gradient ?? "Gradient";

    const gradientColor1Text =
        (text as { gradientColor1?: string }).gradientColor1 ??
        "Gradient Color 1";

    const gradientColor2Text =
        (text as { gradientColor2?: string }).gradientColor2 ??
        "Gradient Color 2";

    const gradientAngleText =
        (text as { gradientAngle?: string }).gradientAngle ?? "Gradient Angle";

    const clickToAddPointText =
        (text as { clickToAddPoint?: string }).clickToAddPoint ??
        "Click or tap the preview to add points. Drag points to adjust the shape, then click Generate.";

    const copyErrorText =
        (text as { copyError?: string }).copyError ??
        "Copy failed. Please copy the SVG manually.";

    const [pointsCount, setPointsCount] = useState(8);
    const [smoothness, setSmoothness] = useState(28);

    const [fillType, setFillType] = useState<FillType>("solid");
    const [color, setColor] = useState("#F28C6F");
    const [gradientColor1, setGradientColor1] = useState("#F28C6F");
    const [gradientColor2, setGradientColor2] = useState("#FFD6C8");
    const [gradientAngle, setGradientAngle] = useState(135);

    const [points, setPoints] = useState(() => createRandomPoints(8, 80, 125));

    const [customPointsDraft, setCustomPointsDraft] = useState<Point[]>([]);
    const [customHistory, setCustomHistory] = useState<Point[][]>([]);
    const [customFuture, setCustomFuture] = useState<Point[][]>([]);
    const [isCustomPoints, setIsCustomPoints] = useState(false);
    const [isCustomDraftDirty, setIsCustomDraftDirty] = useState(false);

    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState("");
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);

    useEffect(() => {
        customPointsRef.current = customPointsDraft;
    }, [customPointsDraft]);

    useEffect(() => {
        return () => {
            if (copyTimerRef.current) {
                clearTimeout(copyTimerRef.current);
            }
        };
    }, []);

    const generatedPath = useMemo(() => {
        return createSmoothPath(points, smoothness);
    }, [points, smoothness]);

    const visiblePath = isCustomPoints && isCustomDraftDirty ? "" : generatedPath;

    const gradientCoordinates = useMemo(() => {
        return getGradientCoordinates(gradientAngle);
    }, [gradientAngle]);

    const svgCode = useMemo(() => {
        if (fillType === "gradient") {
            return `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blobGradient" x1="${gradientCoordinates.x1}" y1="${gradientCoordinates.y1}" x2="${gradientCoordinates.x2}" y2="${gradientCoordinates.y2}">
      <stop offset="0%" stop-color="${gradientColor1}" />
      <stop offset="100%" stop-color="${gradientColor2}" />
    </linearGradient>
  </defs>
  <path d="${visiblePath}" fill="url(#blobGradient)" />
</svg>`;
        }

        return `<svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
  <path d="${visiblePath}" fill="${color}" />
</svg>`;
    }, [
        visiblePath,
        color,
        fillType,
        gradientColor1,
        gradientColor2,
        gradientCoordinates,
    ]);

    function clearCopyState() {
        setCopied(false);
        setCopyError("");
    }

    function setCustomPointsWithHistory(nextPoints: Point[]) {
        const currentPoints = customPointsRef.current;

        setCustomHistory((current) => [...current, currentPoints]);
        setCustomFuture([]);
        setCustomPointsDraft(nextPoints);
        customPointsRef.current = nextPoints;
        setIsCustomDraftDirty(true);
        clearCopyState();
    }

    function generateBlob() {
        if (isCustomPoints) {
            if (customPointsRef.current.length < 3) {
                setPoints([]);
                setIsCustomDraftDirty(true);
                clearCopyState();
                return;
            }

            setPoints(customPointsRef.current);
            setIsCustomDraftDirty(false);
            clearCopyState();
            return;
        }

        const nextPoints = createRandomPoints(pointsCount, 80, 125);

        setPoints(nextPoints);
        clearCopyState();
    }

    function clearCustomPoints() {
        setCustomPointsWithHistory([]);
        setPoints([]);
    }

    function undoCustomPoints() {
        const previousPoints = customHistory[customHistory.length - 1];

        if (!previousPoints) return;

        const currentPoints = customPointsRef.current;

        setCustomHistory((current) => current.slice(0, -1));
        setCustomFuture((current) => [currentPoints, ...current]);
        setCustomPointsDraft(previousPoints);
        customPointsRef.current = previousPoints;
        setIsCustomDraftDirty(true);
        clearCopyState();
    }

    function redoCustomPoints() {
        const nextPoints = customFuture[0];

        if (!nextPoints) return;

        const currentPoints = customPointsRef.current;

        setCustomFuture((current) => current.slice(1));
        setCustomHistory((current) => [...current, currentPoints]);
        setCustomPointsDraft(nextPoints);
        customPointsRef.current = nextPoints;
        setIsCustomDraftDirty(true);
        clearCopyState();
    }

    function handleCustomModeChange(nextValue: boolean) {
        setIsCustomPoints(nextValue);
        setCustomHistory([]);
        setCustomFuture([]);
        clearCopyState();

        if (nextValue) {
            setCustomPointsDraft([]);
            customPointsRef.current = [];
            setPoints([]);
            setIsCustomDraftDirty(true);
            return;
        }

        setCustomPointsDraft([]);
        customPointsRef.current = [];
        setIsCustomDraftDirty(false);

        if (points.length < 3) {
            setPoints(createRandomPoints(pointsCount, 80, 125));
        }
    }

    function handlePreviewPointerDown(pointIndex?: number) {
        if (!isCustomPoints) return;

        if (typeof pointIndex === "number") {
            dragIndexRef.current = pointIndex;
            didDragRef.current = false;
            dragStartPointsRef.current = customPointsRef.current;
            return;
        }

        dragIndexRef.current = null;
        didDragRef.current = false;
        dragStartPointsRef.current = null;
    }

    function handlePreviewPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
        if (!isCustomPoints) return;
        if (dragIndexRef.current === null) return;

        didDragRef.current = true;

        const nextPoint = getSvgPoint(event);
        const nextPoints = customPointsRef.current.map((point, index) =>
            index === dragIndexRef.current ? nextPoint : point,
        );

        setCustomPointsDraft(nextPoints);
        customPointsRef.current = nextPoints;
        setIsCustomDraftDirty(true);
        clearCopyState();
    }

    function handlePreviewPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
        if (!isCustomPoints) return;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (dragIndexRef.current !== null) {
            if (didDragRef.current && dragStartPointsRef.current) {
                setCustomHistory((current) => [
                    ...current,
                    dragStartPointsRef.current!,
                ]);
                setCustomFuture([]);
            }

            dragIndexRef.current = null;
            didDragRef.current = false;
            dragStartPointsRef.current = null;
            return;
        }

        if (didDragRef.current) {
            didDragRef.current = false;
            return;
        }

        const nextPoint = getSvgPoint(event);
        const nextPoints = [...customPointsRef.current, nextPoint];

        setCustomPointsWithHistory(nextPoints);
    }

    function removePoint(pointIndex: number) {
        if (!isCustomPoints) return;

        const nextPoints = customPointsRef.current.filter(
            (_, index) => index !== pointIndex,
        );

        setCustomPointsWithHistory(nextPoints);
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

    const blobFill = getBlobFill({
        fillType,
        solidColor: color,
    });

    const previewPanel = (
        <BlobPreview
            path={visiblePath}
            fill={blobFill}
            fillType={fillType}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientCoordinates={gradientCoordinates}
            customPointsDraft={customPointsDraft}
            isCustomPoints={isCustomPoints}
            clickToAddPointText={clickToAddPointText}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={handlePreviewPointerUp}
            onRemovePoint={removePoint}
        />
    );

    const mobilePreviewPanel = (
        <BlobMiniPreview
            path={visiblePath}
            fill={blobFill}
            fillType={fillType}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientCoordinates={gradientCoordinates}
            customPointsDraft={customPointsDraft}
            isCustomPoints={isCustomPoints}
            clickToAddPointText={clickToAddPointText}
            onPointerDown={handlePreviewPointerDown}
            onPointerMove={handlePreviewPointerMove}
            onPointerUp={handlePreviewPointerUp}
            onRemovePoint={removePoint}
        />
    );

    const desktopSettingsPanel = (
        <BlobSettingsPanel
            text={text}
            pointsCount={pointsCount}
            smoothness={smoothness}
            fillType={fillType}
            color={color}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientAngle={gradientAngle}
            fillTypeText={fillTypeText}
            solidText={solidText}
            gradientText={gradientText}
            gradientColor1Text={gradientColor1Text}
            gradientColor2Text={gradientColor2Text}
            gradientAngleText={gradientAngleText}
            isCustomPoints={isCustomPoints}
            customPointsText={customPointsText}
            clearPointsText={clearPointsText}
            undoText={undoText}
            redoText={redoText}
            canUndo={customHistory.length > 0}
            canRedo={customFuture.length > 0}
            setPointsCount={setPointsCount}
            setSmoothness={setSmoothness}
            setFillType={setFillType}
            setColor={setColor}
            setGradientColor1={setGradientColor1}
            setGradientColor2={setGradientColor2}
            setGradientAngle={setGradientAngle}
            setPoints={setPoints}
            onCustomModeChange={handleCustomModeChange}
            onGenerateBlob={generateBlob}
            onClearCustomPoints={clearCustomPoints}
            onUndo={undoCustomPoints}
            onRedo={redoCustomPoints}
            clearCopyState={clearCopyState}
            compact={false}
        />
    );

    const mobileSettingsPanel = (
        <BlobSettingsPanel
            text={text}
            pointsCount={pointsCount}
            smoothness={smoothness}
            fillType={fillType}
            color={color}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientAngle={gradientAngle}
            fillTypeText={fillTypeText}
            solidText={solidText}
            gradientText={gradientText}
            gradientColor1Text={gradientColor1Text}
            gradientColor2Text={gradientColor2Text}
            gradientAngleText={gradientAngleText}
            isCustomPoints={isCustomPoints}
            customPointsText={customPointsText}
            clearPointsText={clearPointsText}
            undoText={undoText}
            redoText={redoText}
            canUndo={customHistory.length > 0}
            canRedo={customFuture.length > 0}
            setPointsCount={setPointsCount}
            setSmoothness={setSmoothness}
            setFillType={setFillType}
            setColor={setColor}
            setGradientColor1={setGradientColor1}
            setGradientColor2={setGradientColor2}
            setGradientAngle={setGradientAngle}
            setPoints={setPoints}
            onCustomModeChange={handleCustomModeChange}
            onGenerateBlob={generateBlob}
            onClearCustomPoints={clearCustomPoints}
            onUndo={undoCustomPoints}
            onRedo={redoCustomPoints}
            clearCopyState={clearCopyState}
            compact
        />
    );

    return (
        <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-6">
                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div>
                            <SectionHeader title={text.previewTitle} />

                            <p className="mt-2 max-w-[320px] text-sm leading-6 text-gray-500">
                                {text.previewDescription}
                            </p>
                        </div>

                        <div className="mt-5">{previewPanel}</div>
                    </section>

                    <section className="md:rounded-3xl md:border md:border-[#F1E5DF] md:bg-white md:p-5 md:shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <SectionHeader title={text.svgCode} />

                            <button
                                type="button"
                                onClick={copySvg}
                                className="shrink-0 rounded-xl bg-[#F28C6F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E6765B]"
                            >
                                {copied ? t.common.copied : text.copySvg}
                            </button>
                        </div>

                        <pre className="max-h-80 overflow-auto rounded-2xl bg-[#FFF7F3] p-4 text-sm leading-6 text-gray-700">
                            <code>{svgCode}</code>
                        </pre>

                        {copyError ? (
                            <p className="mt-3 text-sm font-medium text-red-500">
                                {copyError}
                            </p>
                        ) : null}
                    </section>
                </div>

                <section className="hidden min-w-0 rounded-3xl border border-[#F1E5DF] bg-white p-5 shadow-sm lg:block">
                    <SectionHeader title={text.controls} />

                    <div className="mt-5 space-y-5">
                        {desktopSettingsPanel}

                        <button
                            type="button"
                            onClick={downloadSvg}
                            className="w-full rounded-2xl bg-[#F28C6F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E6765B]"
                        >
                            {text.downloadSvg}
                        </button>
                    </div>
                </section>
            </div>

            <MobileActionBar
                settingsButtonText={settingsButtonText}
                downloadText={actionDownloadText}
                onOpenSettings={() => setIsMobileSettingsOpen(true)}
                onDownload={downloadSvg}
            />

            {isMobileSettingsOpen ? (
                <MobileSettingsSheet
                    title={text.controls}
                    onClose={() => setIsMobileSettingsOpen(false)}
                >
                    <div className="flex h-full min-h-0 flex-col">
                        <div className="shrink-0 bg-white pb-3">
                            {mobilePreviewPanel}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto pt-1">
                            {mobileSettingsPanel}
                        </div>
                    </div>
                </MobileSettingsSheet>
            ) : null}
        </>
    );
}

function BlobPreview({
    path,
    fill,
    fillType,
    gradientColor1,
    gradientColor2,
    gradientCoordinates,
    customPointsDraft,
    isCustomPoints,
    clickToAddPointText,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRemovePoint,
}: {
    path: string;
    fill: string;
    fillType: FillType;
    gradientColor1: string;
    gradientColor2: string;
    gradientCoordinates: {
        x1: string;
        y1: string;
        x2: string;
        y2: string;
    };
    customPointsDraft: Point[];
    isCustomPoints: boolean;
    clickToAddPointText: string;
    onPointerDown: (pointIndex?: number) => void;
    onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onRemovePoint: (pointIndex: number) => void;
}) {
    return (
        <div className="relative flex aspect-square w-full items-center justify-center rounded-3xl bg-[#FFF7F3] p-5 md:p-8">
            {isCustomPoints ? (
                <p className="absolute left-4 right-4 top-4 z-10 rounded-2xl bg-white/80 px-3 py-2 text-center text-xs font-medium leading-5 text-[#7A5A4F] backdrop-blur">
                    {clickToAddPointText}
                </p>
            ) : null}

            <BlobSvg
                path={path}
                fill={fill}
                fillType={fillType}
                gradientId="blobPreviewGradient"
                gradientColor1={gradientColor1}
                gradientColor2={gradientColor2}
                gradientCoordinates={gradientCoordinates}
                customPointsDraft={customPointsDraft}
                isCustomPoints={isCustomPoints}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onRemovePoint={onRemovePoint}
                className={`h-full max-h-[320px] w-full max-w-[320px] drop-shadow-sm ${isCustomPoints ? "cursor-crosshair touch-none" : ""
                    }`}
            />
        </div>
    );
}

function BlobMiniPreview({
    path,
    fill,
    fillType,
    gradientColor1,
    gradientColor2,
    gradientCoordinates,
    customPointsDraft,
    isCustomPoints,
    clickToAddPointText,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRemovePoint,
}: {
    path: string;
    fill: string;
    fillType: FillType;
    gradientColor1: string;
    gradientColor2: string;
    gradientCoordinates: {
        x1: string;
        y1: string;
        x2: string;
        y2: string;
    };
    customPointsDraft: Point[];
    isCustomPoints: boolean;
    clickToAddPointText: string;
    onPointerDown: (pointIndex?: number) => void;
    onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onRemovePoint: (pointIndex: number) => void;
}) {
    return (
        <div className="relative flex h-36 w-full items-center justify-center rounded-2xl border border-[#F1E5DF] bg-[#FFF7F3] p-3">
            {isCustomPoints ? (
                <p className="absolute left-3 right-3 top-3 z-10 rounded-2xl bg-white/80 px-3 py-2 text-center text-[11px] font-medium leading-4 text-[#7A5A4F] backdrop-blur">
                    {clickToAddPointText}
                </p>
            ) : null}

            <BlobSvg
                path={path}
                fill={fill}
                fillType={fillType}
                gradientId="blobMiniPreviewGradient"
                gradientColor1={gradientColor1}
                gradientColor2={gradientColor2}
                gradientCoordinates={gradientCoordinates}
                customPointsDraft={customPointsDraft}
                isCustomPoints={isCustomPoints}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onRemovePoint={onRemovePoint}
                className={`h-full max-h-32 w-full max-w-32 drop-shadow-sm ${isCustomPoints ? "cursor-crosshair touch-none" : ""
                    }`}
            />
        </div>
    );
}

function BlobSvg({
    path,
    fill,
    fillType,
    gradientId,
    gradientColor1,
    gradientColor2,
    gradientCoordinates,
    customPointsDraft,
    isCustomPoints,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRemovePoint,
    className,
}: {
    path: string;
    fill: string;
    fillType: FillType;
    gradientId: string;
    gradientColor1: string;
    gradientColor2: string;
    gradientCoordinates: {
        x1: string;
        y1: string;
        x2: string;
        y2: string;
    };
    customPointsDraft: Point[];
    isCustomPoints: boolean;
    onPointerDown: (pointIndex?: number) => void;
    onPointerMove: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onPointerUp: (event: ReactPointerEvent<SVGSVGElement>) => void;
    onRemovePoint: (pointIndex: number) => void;
    className: string;
}) {
    return (
        <svg
            width="300"
            height="300"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            onPointerDown={(event) => {
                if (!isCustomPoints) return;

                event.currentTarget.setPointerCapture(event.pointerId);
                onPointerDown();
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            {fillType === "gradient" ? (
                <defs>
                    <linearGradient
                        id={gradientId}
                        x1={gradientCoordinates.x1}
                        y1={gradientCoordinates.y1}
                        x2={gradientCoordinates.x2}
                        y2={gradientCoordinates.y2}
                    >
                        <stop offset="0%" stopColor={gradientColor1} />
                        <stop offset="100%" stopColor={gradientColor2} />
                    </linearGradient>
                </defs>
            ) : null}

            {path ? (
                <path
                    d={path}
                    fill={fillType === "gradient" ? `url(#${gradientId})` : fill}
                />
            ) : null}

            {isCustomPoints
                ? customPointsDraft.map((point, index) => (
                    <g key={`${point.x}-${point.y}-${index}`}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            fill="#FFFFFF"
                            stroke="#F28C6F"
                            strokeWidth="3"
                            className="cursor-grab"
                            onPointerDown={(event) => {
                                event.stopPropagation();

                                const svg = event.currentTarget.ownerSVGElement;

                                if (svg) {
                                    svg.setPointerCapture(event.pointerId);
                                }

                                onPointerDown(index);
                            }}
                            onDoubleClick={(event) => {
                                event.stopPropagation();
                                onRemovePoint(index);
                            }}
                        />

                        <text
                            x={point.x}
                            y={point.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="select-none text-[10px] font-bold"
                            fill="#E6765B"
                            pointerEvents="none"
                        >
                            {index + 1}
                        </text>
                    </g>
                ))
                : null}
        </svg>
    );
}

function BlobSettingsPanel({
    text,
    pointsCount,
    smoothness,
    fillType,
    color,
    gradientColor1,
    gradientColor2,
    gradientAngle,
    fillTypeText,
    solidText,
    gradientText,
    gradientColor1Text,
    gradientColor2Text,
    gradientAngleText,
    isCustomPoints,
    customPointsText,
    clearPointsText,
    undoText,
    redoText,
    canUndo,
    canRedo,
    setPointsCount,
    setSmoothness,
    setFillType,
    setColor,
    setGradientColor1,
    setGradientColor2,
    setGradientAngle,
    setPoints,
    onCustomModeChange,
    onGenerateBlob,
    onClearCustomPoints,
    onUndo,
    onRedo,
    clearCopyState,
    compact = false,
}: {
    text: typeof t.blobGenerator;
    pointsCount: number;
    smoothness: number;
    fillType: FillType;
    color: string;
    gradientColor1: string;
    gradientColor2: string;
    gradientAngle: number;
    fillTypeText: string;
    solidText: string;
    gradientText: string;
    gradientColor1Text: string;
    gradientColor2Text: string;
    gradientAngleText: string;
    isCustomPoints: boolean;
    customPointsText: string;
    clearPointsText: string;
    undoText: string;
    redoText: string;
    canUndo: boolean;
    canRedo: boolean;
    setPointsCount: (value: number) => void;
    setSmoothness: (value: number) => void;
    setFillType: (value: FillType) => void;
    setColor: (value: string) => void;
    setGradientColor1: (value: string) => void;
    setGradientColor2: (value: string) => void;
    setGradientAngle: (value: number) => void;
    setPoints: (value: Point[]) => void;
    onCustomModeChange: (value: boolean) => void;
    onGenerateBlob: () => void;
    onClearCustomPoints: () => void;
    onUndo: () => void;
    onRedo: () => void;
    clearCopyState: () => void;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "space-y-3" : "space-y-5"}>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={onGenerateBlob}
                    className={`w-full rounded-2xl bg-[#F28C6F] font-semibold text-white transition hover:bg-[#E6765B] ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {text.generate}
                </button>

                <button
                    type="button"
                    onClick={onClearCustomPoints}
                    disabled={!isCustomPoints}
                    className={`w-full rounded-2xl border border-[#F4C8BA] bg-white font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                        }`}
                >
                    {clearPointsText}
                </button>
            </div>

            {isCustomPoints ? (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                            }`}
                    >
                        {undoText}
                    </button>

                    <button
                        type="button"
                        onClick={onRedo}
                        disabled={!canRedo}
                        className={`w-full rounded-2xl border border-[#F4C8BA] bg-[#FFF7F3] font-semibold text-[#E6765B] transition hover:bg-[#FFF0EA] disabled:cursor-not-allowed disabled:opacity-50 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                            }`}
                    >
                        {redoText}
                    </button>
                </div>
            ) : null}

            <label
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#F1E5DF] bg-[#FFFDFC] transition hover:bg-[#FFF7F3] ${compact ? "px-3 py-2.5" : "px-4 py-3"
                    }`}
            >
                <span
                    className={`font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {customPointsText}
                </span>

                <input
                    type="checkbox"
                    checked={isCustomPoints}
                    onChange={(event) => onCustomModeChange(event.target.checked)}
                    className="h-4 w-4 accent-[#F28C6F]"
                />
            </label>

            <div>
                <span
                    className={`mb-2 block font-semibold text-gray-800 ${compact ? "text-xs" : "text-sm"
                        }`}
                >
                    {fillTypeText}
                </span>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setFillType("solid");
                            clearCopyState();
                        }}
                        className={`rounded-2xl border font-semibold transition ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                            } ${fillType === "solid"
                                ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                            }`}
                    >
                        {solidText}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setFillType("gradient");
                            clearCopyState();
                        }}
                        className={`rounded-2xl border font-semibold transition ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
                            } ${fillType === "gradient"
                                ? "border-[#F28C6F] bg-[#F28C6F] text-white shadow-sm"
                                : "border-[#F4C8BA] bg-white text-[#E6765B] hover:bg-[#FFF7F3]"
                            }`}
                    >
                        {gradientText}
                    </button>
                </div>
            </div>

            {fillType === "solid" ? (
                <ColorInput
                    label={text.fillColor}
                    value={color}
                    compact={compact}
                    onChange={(value) => {
                        setColor(value);
                        clearCopyState();
                    }}
                />
            ) : (
                <>
                    <div
                        className={
                            compact
                                ? "grid grid-cols-2 gap-2"
                                : "grid gap-3 sm:grid-cols-2"
                        }
                    >
                        <ColorInput
                            label={gradientColor1Text}
                            value={gradientColor1}
                            compact={compact}
                            onChange={(value) => {
                                setGradientColor1(value);
                                clearCopyState();
                            }}
                        />

                        <ColorInput
                            label={gradientColor2Text}
                            value={gradientColor2}
                            compact={compact}
                            onChange={(value) => {
                                setGradientColor2(value);
                                clearCopyState();
                            }}
                        />
                    </div>

                    <RangeInput
                        label={gradientAngleText}
                        value={gradientAngle}
                        min={0}
                        max={360}
                        suffix="°"
                        compact={compact}
                        onChange={(value) => {
                            setGradientAngle(value);
                            clearCopyState();
                        }}
                    />
                </>
            )}

            <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-5"}>
                {!isCustomPoints ? (
                    <RangeInput
                        label={text.points}
                        value={pointsCount}
                        min={5}
                        max={14}
                        suffix=""
                        compact={compact}
                        onChange={(value) => {
                            setPointsCount(value);
                            setPoints(createRandomPoints(value, 80, 125));
                            clearCopyState();
                        }}
                    />
                ) : null}

                <RangeInput
                    label={text.smoothness}
                    value={smoothness}
                    min={10}
                    max={45}
                    suffix=""
                    compact={compact}
                    onChange={(value) => {
                        setSmoothness(value);
                        clearCopyState();
                    }}
                />
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
    compact = false,
    onChange,
}: {
    label: string;
    value: string;
    compact?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block min-w-0">
            <span
                className={`mb-1.5 block truncate font-semibold text-gray-800 ${compact ? "text-[10px]" : "text-sm"
                    }`}
            >
                {label}
            </span>

            <div
                className={`grid gap-1.5 ${compact ? "grid-cols-[34px_1fr]" : "grid-cols-[58px_1fr]"
                    }`}
            >
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full cursor-pointer rounded-xl border border-[#F1E5DF] bg-white p-1 ${compact ? "h-10" : "h-12"
                        }`}
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value.toUpperCase())}
                    className={`w-full rounded-xl border border-[#F1E5DF] font-semibold uppercase outline-none transition focus:border-[#F28C6F] focus:ring-4 focus:ring-[#FFF0EA] ${compact
                        ? "h-10 px-2 text-[11px]"
                        : "h-12 px-4 text-sm"
                        }`}
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

function MobileActionBar({
    settingsButtonText,
    downloadText,
    onOpenSettings,
    onDownload,
}: {
    settingsButtonText: string;
    downloadText: string;
    onOpenSettings: () => void;
    onDownload: () => void;
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
                className="pointer-events-auto mx-auto grid max-w-md grid-cols-2 gap-2 rounded-[28px] border border-[#F4C8BA] bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(42,31,27,0.12)] backdrop-blur"
            >
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded-2xl border border-[#F1E5DF] bg-white px-3 py-2.5 text-center text-sm font-semibold leading-tight text-[#2A1F1B] transition hover:bg-[#FFF7F3]"
                >
                    {settingsButtonText}
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    className="rounded-2xl bg-[#F28C6F] px-3 py-2.5 text-center text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-[#E6765B]"
                >
                    {downloadText}
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
            className={`fixed inset-0 z-[70] bg-[#2A1F1B]/35 px-3 pb-2 pt-8 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${isVisible ? "opacity-100" : "opacity-0"
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

                <div className="min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2">
                    {children}
                </div>
            </div>
        </div>
    );
}