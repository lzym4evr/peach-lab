import type { ReactNode } from "react";
import { ColorPickerIcon } from "@/components/icons/ToolIcons";

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

    // if (type === "tool" && name === "hex-rgb-converter") {
    //   return <HexRgbConverterIcon className={className} />;
    // }

    // =========================
    // Gradient Tools
    // =========================
    // if (type === "tool" && name === "gradient-generator") {
    //   return <GradientGeneratorIcon className={className} />;
    // }

    // =========================
    // Image Tools
    // =========================
    // if (type === "tool" && name === "image-converter") {
    //   return <ImageConverterIcon className={className} />;
    // }

    // =========================
    // SVG Tools
    // =========================
    // if (type === "tool" && name === "svg-optimizer") {
    //   return <SvgOptimizerIcon className={className} />;
    // }

    // =========================
    // Text Tools
    // =========================
    // if (type === "tool" && name === "text-shadow-generator") {
    //   return <TextShadowGeneratorIcon className={className} />;
    // }

    // =========================
    // Category Icons
    // =========================
    if (type === "category" && name === "Color Tools") {
        return <ColorPickerIcon className={className} />;
    }

    return <>{fallback}</>;
}