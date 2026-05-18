import type { ReactNode } from "react";
import {
    ColorPickerIcon,
    HexRgbConverterIcon,
    ColorPaletteGeneratorIcon,
    GradientGeneratorIcon,
    ImageSizeCheckerIcon,
    NoiseTextureGeneratorIcon,
    BlobGeneratorIcon,
    TextCaseConverterIcon,
    SvgToPngIcon,
    CharacterCounterIcon,
    ImageResizerIcon,
    ImageCompressorIcon,
    ImageConverterIcon,
    QrCodeGeneratorIcon,
    FaviconGeneratorIcon,
    BackgroundGeneratorIcon,
    GlassmorphismGeneratorIcon,
    PatternGeneratorIcon,
    BoxShadowGeneratorIcon,
    BorderRadiusGeneratorIcon,
    CssButtonGeneratorIcon,
    SvgColorChangerIcon,
    SvgOptimizerIcon,
} from "@/components/icons/ToolIcons";


type IconRendererProps = {
    type: "tool" | "category";
    name: string;
    fallback?: ReactNode;
    className?: string;
};

export default function IconRenderer({
    type,
    name,
    fallback,
    className = "h-8 w-8",
}: IconRendererProps) {
    // =========================
    // Color Tools
    // =========================
    if (type === "tool" && name === "color-picker") {
        return <ColorPickerIcon className={className} />;
    }

    if (type === "tool" && name === "hex-rgb-converter") {
        return <HexRgbConverterIcon className={className} />;
    }

    if (type === "tool" && name === "color-palette-generator") {
        return <ColorPaletteGeneratorIcon className={className} />;
    }
    // =========================
    // Gradient Tools
    // =========================
    if (type === "tool" && name === "gradient-generator") {
        return <GradientGeneratorIcon className={className} />;
    }

    if (type === "category" && name === "Gradient Tools") {
        return <GradientGeneratorIcon className={className} />;
    }
    // =========================
    // Image Tools
    // =========================
    if (type === "tool" && name === "image-size-checker") {
        return <ImageSizeCheckerIcon className={className} />;
    }
    if (type === "tool" && name === "image-resizer") {
        return <ImageResizerIcon className={className} />;
    }
    if (type === "tool" && name === "image-compressor") {
        return <ImageCompressorIcon className={className} />;
    }
    if (type === "tool" && name === "image-converter") {
        return <ImageConverterIcon className={className} />;
    }
    if (type === "tool" && name === "qr-code-generator") {
        return <QrCodeGeneratorIcon className={className} />;
    }
    if (type === "tool" && name === "favicon-generator") {
        return <FaviconGeneratorIcon className={className} />;
    }
    // =========================
    // Background Tools
    // =========================
    if (type === "tool" && name === "background-generator") {
        return <BackgroundGeneratorIcon className={className} />;
    }
    if (type === "tool" && name === "glassmorphism-generator") {
        return <GlassmorphismGeneratorIcon className={className} />;
    }
    // =========================
    // Pattern Tools
    // =========================
    if (type === "tool" && name === "pattern-generator") {
        return <PatternGeneratorIcon className={className} />;
    }
    // =========================
    // Texture Tools
    // =========================
    if (type === "tool" && name === "noise-texture-generator") {
        return <NoiseTextureGeneratorIcon className={className} />;
    }
    // =========================
    // Shape Tools
    // =========================
    if (type === "tool" && name === "blob-generator") {
        return <BlobGeneratorIcon className={className} />;
    }
    if (type === "tool" && name === "box-shadow-generator") {
        return <BoxShadowGeneratorIcon className={className} />;
    }
    if (type === "tool" && name === "border-radius-generator") {
        return <BorderRadiusGeneratorIcon className={className} />;
    }
    if (type === "tool" && name === "css-button-generator") {
        return <CssButtonGeneratorIcon className={className} />;
    }
    // =========================
    // SVG Tools
    // =========================
    if (type === "tool" && name === "svg-to-png") {
        return <SvgToPngIcon className={className} />;
    }
    if (type === "tool" && name === "svg-color-changer") {
        return <SvgColorChangerIcon className={className} />;
    }
    if (type === "tool" && name === "svg-optimizer") {
        return <SvgOptimizerIcon className={className} />;
    }
    // =========================
    // Text Tools
    // =========================
    if (type === "tool" && name === "text-case-converter") {
        return <TextCaseConverterIcon className={className} />;
    }
    if (type === "tool" && name === "character-counter") {
        return <CharacterCounterIcon className={className} />;
    }
    // =========================
    // Category Icons
    // =========================
    if (type === "category" && name === "Color Tools") {
        return <ColorPickerIcon className={className} />;
    }

    return <>{fallback}</>;
}