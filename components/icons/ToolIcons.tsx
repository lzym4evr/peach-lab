type IconProps = {
    className?: string;
};

// =========================
// Shared Icon Settings
// =========================
const darkFill = "#2A1F1B";

const accentClass =
    "fill-[#FFF0EA] transition-colors duration-200 group-hover:fill-[#F28C6F]";

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
            <path
                d="M571.733333 89.429333a430.08 430.08 0 0 0-381.312 142.122667A428.970667 428.970667 0 0 0 89.429333 571.733333c22.613333 166.144 147.541333 307.498667 310.826667 351.829334a425.898667 425.898667 0 0 0 111.701333 15.104l6.058667-0.042667a128.042667 128.042667 0 0 0 107.349333-60.842667 127.530667 127.530667 0 0 0 6.528-122.837333l-8.490666-17.749333a81.877333 81.877333 0 0 1 4.010666-81.578667 85.504 85.504 0 0 1 109.909334-32.213333l17.578666 8.405333c17.578667 8.448 36.266667 12.757333 55.509334 12.757333A128.938667 128.938667 0 0 0 938.666667 517.973333a423.893333 423.893333 0 0 0-15.061334-117.76c-44.373333-163.242667-185.728-288.170667-351.872-310.784z m220.074667 465.450667l-17.578667-8.405333c-77.994667-37.461333-173.653333-8.448-219.093333 63.744-31.488 50.176-34.688 109.909333-8.704 163.925333l8.490667 17.749333a41.941333 41.941333 0 0 1-2.176 41.002667 42.325333 42.325333 0 0 1-36.010667 20.437333h-4.778667a343.936 343.936 0 0 1-89.386666-12.074666c-130.688-35.456-230.528-148.437333-248.576-281.002667-13.696-100.48 15.018667-197.248 80.768-272.597333a341.418667 341.418667 0 0 1 305.493333-113.664c132.565333 18.048 245.546667 117.930667 281.002667 248.576 8.448 31.146667 12.501333 62.890667 12.032 94.165333-0.512 34.432-36.053333 50.474667-61.482667 38.144z"
                fill={darkFill}
            />

            <path
                d="M320 618.666667m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
                className={accentClass}
            />

            <path
                d="M320 448m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
                className={accentClass}
            />

            <path
                d="M448 320m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
                className={accentClass}
            />

            <path
                d="M618.666667 320m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
                className={accentClass}
            />
        </svg>
    );
}

// 之后这里继续加：
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