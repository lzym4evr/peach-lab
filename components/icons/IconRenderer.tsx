import type { ReactNode } from "react";
import {
    ColorPickerIcon,
    HexRgbConverterIcon,
    ColorPaletteGeneratorIcon,
    GradientGeneratorIcon
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

    // =========================
    // Background Tools
    // =========================

    // =========================
    // Pattern Tools
    // =========================

    // =========================
    // Texture Tools
    // =========================

    // =========================
    // Shape Tools
    // =========================

    // =========================
    // SVG Tools
    // =========================

    // =========================
    // Text Tools
    // =========================

    // =========================
    // Category Icons
    // =========================
    if (type === "category" && name === "Color Tools") {
        return <ColorPickerIcon className={className} />;
    }

    return <>{fallback}</>;
}