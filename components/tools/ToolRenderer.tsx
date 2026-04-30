// =========================
// Color Tools
// =========================
import ColorPickerTool from "@/components/tools/ColorPickerTool";
import HexRgbConverterTool from "@/components/tools/HexRgbConverterTool";
import ColorPaletteGeneratorTool from "@/components/tools/ColorPaletteGeneratorTool";

// =========================
// Gradient Tools
// =========================
import GradientGeneratorTool from "@/components/tools/GradientGeneratorTool";

// =========================
// Image Tools
// =========================
import ImageSizeCheckerTool from "@/components/tools/ImageSizeCheckerTool";
import ImageResizerTool from "@/components/tools/ImageResizerTool";
import ImageCompressorTool from "@/components/tools/ImageCompressorTool";
import QrCodeGeneratorTool from "@/components/tools/QrCodeGeneratorTool";
import FaviconGeneratorTool from "@/components/tools/FaviconGeneratorTool";

// =========================
// Background Tools
// =========================
import BackgroundGeneratorTool from "@/components/tools/BackgroundGeneratorTool";
import GlassmorphismGeneratorTool from "@/components/tools/GlassmorphismGeneratorTool";

// =========================
// Pattern Tools
// =========================
import PatternGeneratorTool from "@/components/tools/PatternGeneratorTool";

// =========================
// Texture Tools
// =========================
import NoiseTextureGeneratorTool from "@/components/tools/NoiseTextureGeneratorTool";

// =========================
// Shape Tools
// =========================
import BlobGeneratorTool from "@/components/tools/BlobGeneratorTool";
import BoxShadowGeneratorTool from "@/components/tools/BoxShadowGeneratorTool";
import BorderRadiusGeneratorTool from "@/components/tools/BorderRadiusGeneratorTool";
import CssButtonGeneratorTool from "@/components/tools/CssButtonGeneratorTool";

// =========================
// SVG Tools
// =========================
import SvgToPngTool from "@/components/tools/SvgToPngTool";
import SvgColorChangerTool from "@/components/tools/SvgColorChangerTool";
import SvgOptimizerTool from "@/components/tools/SvgOptimizerTool";
import SvgTransparentBackgroundTool from "@/components/tools/SvgTransparentBackgroundTool";

// =========================
// Text Tools
// =========================
import TextCaseConverterTool from "@/components/tools/TextCaseConverterTool";
import CharacterCounterTool from "@/components/tools/CharacterCounterTool";
import TextShadowGeneratorTool from "@/components/tools/TextShadowGeneratorTool";
import TextGradientGeneratorTool from "@/components/tools/TextGradientGeneratorTool";
import TextStrokeGeneratorTool from "@/components/tools/TextStrokeGeneratorTool";
import FluidTypographyGeneratorTool from "@/components/tools/FluidTypographyGeneratorTool";

import { t } from "@/data/messages";

type ToolRendererProps = {
    slug: string;
    icon: string;
};

export default function ToolRenderer({ slug, icon }: ToolRendererProps) {
    // =========================
    // Color Tools
    // =========================
    if (slug === "color-picker") {
        return <ColorPickerTool />;
    }

    if (slug === "hex-rgb-converter") {
        return <HexRgbConverterTool />;
    }
    if (slug === "color-palette-generator") {
        return <ColorPaletteGeneratorTool />;
    }

    // =========================
    // Gradient Tools
    // =========================
    if (slug === "gradient-generator") {
        return <GradientGeneratorTool />;
    }

    // =========================
    // Image Tools
    // =========================
    if (slug === "image-size-checker") {
        return <ImageSizeCheckerTool />;
    }
    if (slug === "image-resizer") {
        return <ImageResizerTool />;
    }
    if (slug === "image-compressor") {
        return <ImageCompressorTool />;
    }
    if (slug === "qr-code-generator") {
        return <QrCodeGeneratorTool />;
    }
    if (slug === "favicon-generator") {
        return <FaviconGeneratorTool />;
    }

    // =========================
    // Background Tools
    // =========================
    if (slug === "background-generator") {
        return <BackgroundGeneratorTool />;
    }
    if (slug === "glassmorphism-generator") {
        return <GlassmorphismGeneratorTool />;
    }

    // =========================
    // Pattern Tools
    // =========================
    if (slug === "pattern-generator") {
        return <PatternGeneratorTool />;
    }

    // =========================
    // Texture Tools
    // =========================
    if (slug === "noise-texture-generator") {
        return <NoiseTextureGeneratorTool />;
    }

    // =========================
    // Shape Tools
    // =========================
    if (slug === "blob-generator") {
        return <BlobGeneratorTool />;
    }
    if (slug === "box-shadow-generator") {
        return <BoxShadowGeneratorTool />;
    }
    if (slug === "border-radius-generator") {
        return <BorderRadiusGeneratorTool />;
    }
    if (slug === "css-button-generator") {
        return <CssButtonGeneratorTool />;
    }

    // =========================
    // SVG Tools
    // =========================
    if (slug === "svg-to-png") {
        return <SvgToPngTool />;
    }
    if (slug === "svg-color-changer") {
        return <SvgColorChangerTool />;
    }
    if (slug === "svg-optimizer") {
        return <SvgOptimizerTool />;
    }
    if (slug === "svg-transparent-background") {
        return <SvgTransparentBackgroundTool />;
    }

    // =========================
    // Text Tools
    // =========================
    if (slug === "text-case-converter") {
        return <TextCaseConverterTool />;
    }
    if (slug === "character-counter") {
        return <CharacterCounterTool />;
    }
    if (slug === "text-shadow-generator") {
        return <TextShadowGeneratorTool />;
    }
    if (slug === "text-gradient-generator") {
        return <TextGradientGeneratorTool />;
    }
    if (slug === "text-stroke-generator") {
        return <TextStrokeGeneratorTool />;
    }
    if (slug === "fluid-typography-generator") {
        return <FluidTypographyGeneratorTool />;
    }

    // =========================
    // Placeholder
    // =========================
    return (
        <div className="rounded-3xl border border-dashed border-[#F4C8BA] bg-[#FFF7F3] p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                {icon}
            </div>

            <h2 className="text-xl font-semibold">{t.common.placeholderTitle}</h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
                {t.common.placeholderDescription}
            </p>
        </div>
    );
}