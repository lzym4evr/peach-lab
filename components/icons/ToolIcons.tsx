type IconProps = {
    className?: string;
};

// =========================
// Shared Icon Settings
// =========================
const iconDarkFill = "#000000";

const hoverAccentClass =
    "fill-[#000000] transition-colors duration-200 group-hover:fill-[#F28C6F] group-active:fill-[#F28C6F]";

// =========================
// Color Tools
// =========================
export function ColorPickerIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            {/* svg paths */}
        </svg>
    );
}

// export function HexRgbConverterIcon() {}
// export function ColorPaletteGeneratorIcon() {}


// =========================
// Gradient Tools
// =========================
// export function GradientGeneratorIcon() {}


// =========================
// Image Tools
// =========================
// export function ImageSizeCheckerIcon() {}
// export function ImageResizerIcon() {}
// export function ImageCompressorIcon() {}
// export function ImageConverterIcon() {}
// export function QrCodeGeneratorIcon() {}
// export function FaviconGeneratorIcon() {}


// =========================
// Background Tools
// =========================
// export function BackgroundGeneratorIcon() {}
// export function GlassmorphismGeneratorIcon() {}


// =========================
// Pattern Tools
// =========================
// export function PatternGeneratorIcon() {}


// =========================
// Texture Tools
// =========================
// export function NoiseTextureGeneratorIcon() {}


// =========================
// Shape Tools
// =========================
// export function BlobGeneratorIcon() {}
// export function BoxShadowGeneratorIcon() {}
// export function BorderRadiusGeneratorIcon() {}
// export function CssButtonGeneratorIcon() {}


// =========================
// SVG Tools
// =========================
// export function SvgToPngIcon() {}
// export function SvgColorChangerIcon() {}
// export function SvgOptimizerIcon() {}


// =========================
// Text Tools
// =========================
// export function TextCaseConverterIcon() {}
// export function CharacterCounterIcon() {}
// export function TextShadowGeneratorIcon() {}
// export function TextGradientGeneratorIcon() {}
// export function TextStrokeGeneratorIcon() {}
// export function FluidTypographyGeneratorIcon() {}


// =========================
// Category Icons
// =========================
// export function ColorToolsCategoryIcon() {}
// export function GradientToolsCategoryIcon() {}
// export function ImageToolsCategoryIcon() {}
// export function BackgroundToolsCategoryIcon() {}
// export function PatternToolsCategoryIcon() {}
// export function TextureToolsCategoryIcon() {}
// export function ShapeToolsCategoryIcon() {}
// export function SvgToolsCategoryIcon() {}
// export function TextToolsCategoryIcon() {}