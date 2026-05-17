type IconProps = {
    className?: string;
};

// =========================
// Shared Icon Settings
// =========================
const hoverAccentClass =
    "fill-[#333333] transition-colors duration-200 group-hover:fill-[#F28C6F] group-active:fill-[#F28C6F]";

const wholeIconHoverClass =
    "text-[#333333] transition-colors duration-200 group-hover:text-[#F28C6F] group-active:text-[#F28C6F]";

const staticStrokeClass = "stroke-[#333333]";

const hoverAccentStrokeClass =
    "stroke-[#333333] transition-colors duration-200 group-hover:stroke-[#F28C6F] group-active:stroke-[#F28C6F]";

const staticFillClass = "fill-[#333333]";

const hoverAccentFillTopClass =
    "fill-[#333333] transition-colors duration-200 delay-150 group-hover:fill-[#F28C6F] group-active:fill-[#F28C6F]";

const hoverAccentFillMiddleClass =
    "fill-[#333333] transition-colors duration-200 delay-75 group-hover:fill-[#F28C6F] group-active:fill-[#F28C6F]";

const hoverAccentFillBottomClass =
    "fill-[#333333] transition-colors duration-200 delay-0 group-hover:fill-[#F28C6F] group-active:fill-[#F28C6F]";

const wholeIconHoverDelayClass =
    "text-[#333333] transition-colors duration-300 delay-75 group-hover:text-[#F28C6F] group-active:text-[#F28C6F]";

// =========================
// Color Tools
// =========================
export function ColorPickerIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M15.0279 7.22682C15.516 6.73867 16.3075 6.73867 16.7956 7.22682C17.2838 7.71498 17.2839 8.50651 16.7957 8.99466C16.3075 9.48282 15.5161 9.48282 15.0279 8.99466C14.5398 8.50651 14.5397 7.71498 15.0279 7.22682Z"
                className={hoverAccentClass}
            />

            <path
                d="M9.01828 15.0053C8.53013 14.5171 7.73867 14.5171 7.25052 15.0053C6.76236 15.4934 6.76236 16.2849 7.25052 16.773C7.73867 17.2612 8.5302 17.2613 9.01836 16.7731C9.50651 16.2849 9.50644 15.4934 9.01828 15.0053Z"
                className={hoverAccentClass}
            />

            <path
                d="M7.0341 9.369C7.70093 9.54768 8.09666 10.2331 7.91798 10.8999C7.7393 11.5668 7.05386 11.9626 6.38702 11.7839C5.72019 11.6052 5.32446 10.9198 5.50314 10.253C5.68182 9.58615 6.36726 9.19032 7.0341 9.369Z"
                className={hoverAccentClass}
            />

            <path
                d="M10.9228 7.89465C11.5896 7.71598 11.9853 7.03056 11.8067 6.36372C11.628 5.69689 10.9426 5.30116 10.2757 5.47984C9.60889 5.65852 9.21306 6.34396 9.39174 7.0108C9.57042 7.67763 10.2559 8.07333 10.9228 7.89465Z"
                className={hoverAccentClass}
            />

            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.02344 12C2.02344 6.47715 6.50059 2 12.0234 2C17.5463 2 22.0234 6.47715 22.0234 12C22.0234 12.7351 21.4156 13.2734 20.7352 13.2734H17.0372C15.3782 13.2734 14.0332 14.6184 14.0332 16.2775C14.0332 17.0726 14.3484 17.8353 14.9098 18.3984C15.4491 18.9393 15.6486 19.6836 15.5 20.3542C15.3477 21.042 14.8269 21.6373 14.0164 21.8012C13.3717 21.9317 12.7052 22 12.0234 22C6.50059 22 2.02344 17.5228 2.02344 12ZM12.0234 3.5C7.32902 3.5 3.52344 7.30558 3.52344 12C3.52344 16.6944 7.32902 20.5 12.0234 20.5C12.6047 20.5 13.1717 20.4418 13.7189 20.331C13.9076 20.2929 14.0023 20.18 14.0355 20.0297C14.0727 19.8622 14.028 19.6385 13.8476 19.4575C13.0059 18.6132 12.5332 17.4696 12.5332 16.2775C12.5332 13.79 14.5497 11.7734 17.0372 11.7734H20.5205C20.4004 7.18374 16.6421 3.5 12.0234 3.5Z"
                fill="#333333"
            />
        </svg>
    );
}

export function HexRgbConverterIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            aria-hidden="true"
        >
            {/* vertical bars - stay dark */}
            <rect
                x="7.2"
                y="1.4"
                width="1.5"
                height="21.2"
                rx="0.75"
                transform="rotate(11 7.95 12)"
                className={staticFillClass}
            />

            <rect
                x="14.4"
                y="1.4"
                width="1.5"
                height="21.2"
                rx="0.75"
                transform="rotate(11 15.15 12)"
                className={staticFillClass}
            />

            {/* horizontal bars - hover accent */}
            <rect
                x="4.1"
                y="7.55"
                width="15.8"
                height="1.5"
                rx="0.75"
                className={hoverAccentClass}
            />

            <rect
                x="3.35"
                y="14.95"
                width="15.8"
                height="1.5"
                rx="0.75"
                className={hoverAccentClass}
            />
        </svg>
    );
}

export function ColorPaletteGeneratorIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z"
                className={staticStrokeClass}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7"
                className={staticStrokeClass}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M7 17h.01"
                className={hoverAccentStrokeClass}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8"
                className={staticStrokeClass}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}


// =========================
// Gradient Tools
// =========================

export function GradientGeneratorIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 1024 1024"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* 外框保持不变 */}
            <path
                d="M864 192a32 32 0 0 0-32-32H192a32 32 0 0 0-32 32v640a32 32 0 0 0 32 32h640a32 32 0 0 0 32-32V192z m64 640a96 96 0 0 1-96 96H192A96 96 0 0 1 96 832V192A96 96 0 0 1 192 96h640A96 96 0 0 1 928 192v640z"
                className={staticFillClass}
            />

            {/* 上 */}
            <path
                d="M256 256m64 0l384 0q64 0 64 64l0 0q0 64-64 64l-384 0q-64 0-64-64l0 0q0-64 64-64Z"
                className={hoverAccentFillTopClass}
            />

            {/* 中 */}
            <path
                d="M256 448m64 0l384 0q64 0 64 64l0 0q0 64-64 64l-384 0q-64 0-64-64l0 0q0-64 64-64Z"
                className={hoverAccentFillMiddleClass}
                opacity="0.6"
            />

            {/* 下 */}
            <path
                d="M256 640m64 0l384 0q64 0 64 64l0 0q0 64-64 64l-384 0q-64 0-64-64l0 0q0-64 64-64Z"
                className={hoverAccentFillBottomClass}
                opacity="0.3"
            />
        </svg>
    );
}


// =========================
// Image Tools
// =========================
export function ImageSizeCheckerIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* size ruler lines - hover accent */}
            <path
                d="M934.03979492 186.44763183V152.25268555c0-5.10864258-4.20227051-9.31091309-9.31091309-9.31091309H785.14758301c-5.10864258 0-9.31091309 4.20227051-9.31091309 9.31091309v34.11254882c0 5.10864258 4.20227051 9.31091309 9.31091308 9.3109131H828.40625V670.203125h-41.69311523c-5.10864258 0-9.31091309 4.20227051-9.3109131 9.31091309v34.11254882c0 5.10864258 4.20227051 9.31091309 9.3109131 9.31091309h137.85095215c5.10864258 0 9.31091309-4.20227051 9.31091308-9.31091309v-34.11254883c0-5.10864258-4.20227051-9.31091309-9.31091309-9.31091308H881.140625V195.75854492h43.58825684c5.10864258 0 9.31091309-4.20227051 9.31091308-9.31091309zM671.35668945 828.57104492H142.94177246v-43.58825684c0-5.10864258-4.20227051-9.31091309-9.31091308-9.31091308H99.51831055C94.40966797 775.671875 90.20739746 779.87414551 90.20739746 784.98278809v139.58129882c0 5.10864258 4.20227051 9.31091309 9.31091309 9.31091309h34.11254883c5.10864258 0 9.31091309-4.20227051 9.31091309-9.31091308v-43.258667h528.41491698v41.69311524c0 5.10864258 4.20227051 9.31091309 9.31091309 9.31091309h34.11254882c5.10864258 0 9.31091309-4.20227051 9.31091309-9.31091309V785.14758301c0-5.10864258-4.20227051-9.31091309-9.31091309-9.31091309h-34.11254883c-5.10864258 0-9.31091309 4.20227051-9.31091308 9.31091308v43.42346192z"
                className={hoverAccentClass}
            />

            {/* image frame and mountains */}
            <path
                d="M696.89990234 142.36499023H117.31616211c-14.58435059 0-26.3671875 11.78283692-26.3671875 26.3671875v527.67333985c0 14.58435059 11.78283692 26.3671875 26.3671875 26.3671875h579.58374023c14.58435059 0 26.3671875-11.78283692 26.3671875-26.3671875V168.73217773c0-14.50195313-11.78283692-26.3671875-26.3671875-26.3671875z m-26.3671875 52.734375v253.94897461L582.28503418 364.7557373c-12.35961914-11.86523438-28.75671387-18.37463379-46.14257813-18.37463378s-33.78295898 6.50939942-46.14257812 18.37463379L338.71813964 509.28088378l-39.88037108-38.06762695c-10.21728516-9.80529786-23.73046875-15.16113281-38.06762695-15.16113281s-27.8503418 5.35583497-38.06762696 15.16113281L143.68334961 546.68933106V195.09936523h526.84936523zM143.68334961 670.03833008v-50.4272461l115.35644531-110.16540527c0.82397461-0.74157715 2.55432129-0.74157715 3.29589844 1e-8l58.09020997 55.4534912c10.21728516 9.72290039 26.20239258 9.72290039 36.41967773 0l169.49157714-161.91101075c5.2734375-5.02624512 14.17236328-5.02624512 19.44580078 1e-8l124.66735841 119.06433105v147.98583985H143.68334961z"
                className={staticFillClass}
            />

            {/* sun */}
            <path
                d="M363.19018555 328.9128418c0-48.03771973-39.05639648-87.17651367-87.17651367-87.17651367s-87.17651367 39.05639648-87.17651368 87.17651367c0 48.03771973 39.05639648 87.17651367 87.17651368 87.17651367s87.17651367-39.13879395 87.17651367-87.17651367z m-87.09411622 34.35974121c-18.95141602 0-34.44213867-15.4083252-34.44213866-34.44213867 0-18.95141602 15.4083252-34.44213867 34.44213867-34.44213867s34.44213867 15.4083252 34.44213867 34.44213867c-0.08239747 19.03381348-15.49072266 34.44213867-34.44213867 34.44213867z"
                className={staticFillClass}
            />
        </svg>
    );
}
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
export function NoiseTextureGeneratorIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* outer frame - stay dark */}
            <path
                d="M853.33333333 102.4a68.26666667 68.26666667 0 0 1 68.26666667 68.26666667v682.66666666a68.26666667 68.26666667 0 0 1-68.26666667 68.26666667H170.66666667a68.26666667 68.26666667 0 0 1-68.26666667-68.26666667V170.66666667a68.26666667 68.26666667 0 0 1 68.26666667-68.26666667h682.66666666z m-17.06666666 68.26666667h-648.53333334a17.06666667 17.06666667 0 0 0-17.06666666 17.06666666v648.53333334c0 9.4208 7.64586667 17.06666667 17.06666666 17.06666666h648.53333334a17.06666667 17.06666667 0 0 0 17.06666666-17.06666666v-648.53333334a17.06666667 17.06666667 0 0 0-17.06666666-17.06666666z"
                className={staticFillClass}
            />

            {/* texture dots - hover accent */}
            <path
                d="M222.34453333 754.75626667l48.26453334 48.3328-48.26453334 48.26453333-48.26453333-48.26453333 48.26453333-48.3328z m193.1264 0l48.26453334 48.3328-48.26453334 48.26453333-48.26453333-48.26453333 48.26453333-48.3328z m193.05813334 0l48.26453333 48.3328-48.26453333 48.26453333-48.26453334-48.26453333 48.26453334-48.3328z m193.1264 0l48.26453333 48.3328-48.26453333 48.26453333-48.26453334-48.26453333 48.26453334-48.3328z m-482.7136-96.52906667l48.26453333 48.26453333-48.26453333 48.26453334-48.3328-48.26453334 48.3328-48.26453333z m193.05813333 0l48.26453333 48.26453333-48.26453333 48.26453334-48.26453333-48.26453334 48.26453333-48.26453333z m193.05813333 0l48.3328 48.26453333-48.26453333 48.26453334-48.3328-48.26453334 48.26453333-48.26453333zM415.47093333 561.69813333l48.26453334 48.26453334-48.26453334 48.26453333-48.26453333-48.26453333 48.26453333-48.26453334z m193.05813334 0l48.26453333 48.26453334-48.26453333 48.26453333-48.26453334-48.26453333 48.26453334-48.26453334z m193.1264 0l48.26453333 48.26453334-48.26453333 48.26453333-48.26453334-48.26453333 48.26453334-48.26453334zM512 465.16906667l48.26453333 48.26453333L512 561.69813333l-48.26453333-48.26453333L512 465.16906667z m193.05813333 0l48.3328 48.26453333-48.3328 48.26453333-48.26453333-48.26453333 48.26453333-48.26453333zM608.52906667 368.57173333l48.26453333 48.3328-48.26453333 48.26453334-48.26453334-48.26453334 48.26453334-48.3328z m193.1264 0l48.26453333 48.3328-48.26453333 48.26453334-48.26453334-48.26453334 48.26453334-48.3328z m-96.59733334-96.52906666l48.3328 48.26453333-48.3328 48.26453333-48.26453333-48.26453333 48.26453333-48.26453333z m96.59733334-96.52906667l48.26453333 48.26453333-48.26453333 48.26453334-48.26453334-48.26453334 48.26453334-48.26453333z"
                className={hoverAccentClass}
            />
        </svg>
    );
}


// =========================
// Shape Tools
// =========================
export function BlobGeneratorIcon({ className = "h-8 w-8" }: IconProps) {
    return (
        <svg
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} ${wholeIconHoverDelayClass}`}
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M 272.32 150.00 C 269.26 198.45, 251.54 194.59, 207.38 221.95 C 163.21 249.31, 182.62 243.73, 129.85 238.27 C 77.09 232.80, 57.36 244.42, 37.18 204.33 C 16.99 164.24, 36.18 153.90, 64.73 108.94 C 93.29 63.98, 82.01 72.72, 129.30 59.30 C 176.58 45.88, 172.93 37.53, 217.27 65.65 C 261.61 93.76, 275.39 101.55, 272.32 150.00 Z"
                fill="currentColor"
            />
        </svg>
    );
}
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