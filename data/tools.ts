import { t } from "@/data/messages";

export const tools = [
  // =========================
  // Color Tools
  // =========================
  {
    title: t.toolMeta.colorPicker.title,
    slug: "color-picker",
    category: "Color Tools",
    description: t.toolMeta.colorPicker.description,
    icon: "🎨",
    featured: true,
  },
  {
    title: t.toolMeta.hexRgbConverter.title,
    slug: "hex-rgb-converter",
    category: "Color Tools",
    description: t.toolMeta.hexRgbConverter.description,
    icon: "#",
    featured: true,
  },
  {
    title: t.toolMeta.colorPaletteGenerator.title,
    slug: "color-palette-generator",
    category: "Color Tools",
    description: t.toolMeta.colorPaletteGenerator.description,
    icon: "Palette",
    featured: false,
  },

  // =========================
  // Gradient Tools
  // =========================
  {
    title: t.toolMeta.gradientGenerator.title,
    slug: "gradient-generator",
    category: "Gradient Tools",
    description: t.toolMeta.gradientGenerator.description,
    icon: "🌈",
    featured: true,
  },

  // =========================
  // Image Tools
  // =========================
  {
    title: t.toolMeta.imageSizeChecker.title,
    slug: "image-size-checker",
    category: "Image Tools",
    description: t.toolMeta.imageSizeChecker.description,
    icon: "🖼️",
    featured: true,
  },
  {
    title: t.toolMeta.imageResizer.title,
    slug: "image-resizer",
    category: "Image Tools",
    description: t.toolMeta.imageResizer.description,
    icon: "↔️",
    featured: false,
  },
  {
    title: t.toolMeta.imageCompressor.title,
    slug: "image-compressor",
    category: "Image Tools",
    description: t.toolMeta.imageCompressor.description,
    icon: "Image",
    featured: false,
  },
  {
    title: t.toolMeta.qrCodeGenerator.title,
    slug: "qr-code-generator",
    category: "Image Tools",
    description: t.toolMeta.qrCodeGenerator.description,
    icon: "QrCode",
    featured: false,
  },
  {
    title: t.toolMeta.faviconGenerator.title,
    slug: "favicon-generator",
    category: "Image Tools",
    description: t.toolMeta.faviconGenerator.description,
    icon: "Star",
    featured: false,
  },

  // =========================
  // Background Tools
  // =========================
  {
    title: t.toolMeta.backgroundGenerator.title,
    slug: "background-generator",
    category: "Background Tools",
    description: t.toolMeta.backgroundGenerator.description,
    icon: "▧",
    featured: false,
  },
  {
    title: t.toolMeta.glassmorphismGenerator.title,
    slug: "glassmorphism-generator",
    category: "Background Tools",
    description: t.toolMeta.glassmorphismGenerator.description,
    icon: "◫",
    featured: false,
  },

  // =========================
  // Pattern Tools
  // =========================
  {
    title: t.toolMeta.patternGenerator.title,
    slug: "pattern-generator",
    category: "Pattern Tools",
    description: t.toolMeta.patternGenerator.description,
    icon: "▦",
    featured: false,
  },

  // =========================
  // Texture Tools
  // =========================
  {
    title: t.toolMeta.noiseTextureGenerator.title,
    slug: "noise-texture-generator",
    category: "Texture Tools",
    description: t.toolMeta.noiseTextureGenerator.description,
    icon: "▦",
    featured: true,
  },

  // =========================
  // Shape Tools
  // =========================
  {
    title: t.toolMeta.blobGenerator.title,
    slug: "blob-generator",
    category: "Shape Tools",
    description: t.toolMeta.blobGenerator.description,
    icon: "●",
    featured: true,
  },
  {
    title: t.toolMeta.boxShadowGenerator.title,
    slug: "box-shadow-generator",
    category: "Shape Tools",
    description: t.toolMeta.boxShadowGenerator.description,
    icon: "Square",
    featured: false,
  },
  {
    title: t.toolMeta.borderRadiusGenerator.title,
    slug: "border-radius-generator",
    category: "Shape Tools",
    description: t.toolMeta.borderRadiusGenerator.description,
    icon: "Square",
    featured: false,
  },
  {
    title: t.toolMeta.cssButtonGenerator.title,
    slug: "css-button-generator",
    category: "Shape Tools",
    description: t.toolMeta.cssButtonGenerator.description,
    icon: "MousePointerClick",
    featured: false,
  },

  // =========================
  // SVG Tools
  // =========================
  {
    title: t.toolMeta.svgToPng.title,
    slug: "svg-to-png",
    category: "SVG Tools",
    description: t.toolMeta.svgToPng.description,
    icon: "📄",
    featured: true,
  },
  {
    title: t.toolMeta.svgColorChanger.title,
    slug: "svg-color-changer",
    category: "SVG Tools",
    description: t.toolMeta.svgColorChanger.description,
    icon: "🎛️",
    featured: false,
  },
  {
    title: t.toolMeta.svgOptimizer.title,
    slug: "svg-optimizer",
    category: "SVG Tools",
    description: t.toolMeta.svgOptimizer.description,
    icon: "FileCode",
    featured: false,
  },
  //{
  //title: t.toolMeta.svgTransparentBackground.title,
  //slug: "svg-transparent-background",
  //category: "SVG Tools",
  //description: t.toolMeta.svgTransparentBackground.description,
  //icon: "Eraser",
  //featured: false,
  //},

  // =========================
  // Text Tools
  // =========================
  {
    title: t.toolMeta.textCaseConverter.title,
    slug: "text-case-converter",
    category: "Text Tools",
    description: t.toolMeta.textCaseConverter.description,
    icon: "T",
    featured: true,
  },
  {
    title: t.toolMeta.characterCounter.title,
    slug: "character-counter",
    category: "Text Tools",
    description: t.toolMeta.characterCounter.description,
    icon: "#",
    featured: true,
  },
  {
    title: t.toolMeta.textShadowGenerator.title,
    slug: "text-shadow-generator",
    category: "Text Tools",
    description: t.toolMeta.textShadowGenerator.description,
    icon: "Type",
    featured: false,
  },
  {
    title: t.toolMeta.textGradientGenerator.title,
    slug: "text-gradient-generator",
    category: "Text Tools",
    description: t.toolMeta.textGradientGenerator.description,
    icon: "Type",
    featured: false,
  },
  {
    title: t.toolMeta.textStrokeGenerator.title,
    slug: "text-stroke-generator",
    category: "Text Tools",
    description: t.toolMeta.textStrokeGenerator.description,
    icon: "Type",
    featured: false,
  },
  {
    title: t.toolMeta.fluidTypographyGenerator.title,
    slug: "fluid-typography-generator",
    category: "Text Tools",
    description: t.toolMeta.fluidTypographyGenerator.description,
    icon: "Type",
    featured: false,
  },
];

export const categories = [
  {
    name: t.categoryMeta.colorTools.name,
    key: "Color Tools",
    description: t.categoryMeta.colorTools.description,
    icon: "🎨",
  },
  {
    name: t.categoryMeta.gradientTools.name,
    key: "Gradient Tools",
    description: t.categoryMeta.gradientTools.description,
    icon: "🌈",
  },
  {
    name: t.categoryMeta.imageTools.name,
    key: "Image Tools",
    description: t.categoryMeta.imageTools.description,
    icon: "🖼️",
  },
  {
    name: t.categoryMeta.backgroundTools.name,
    key: "Background Tools",
    description: t.categoryMeta.backgroundTools.description,
    icon: "▧",
  },
  {
    name: t.categoryMeta.patternTools.name,
    key: "Pattern Tools",
    description: t.categoryMeta.patternTools.description,
    icon: "▦",
  },
  {
    name: t.categoryMeta.textureTools.name,
    key: "Texture Tools",
    description: t.categoryMeta.textureTools.description,
    icon: "✦",
  },
  {
    name: t.categoryMeta.shapeTools.name,
    key: "Shape Tools",
    description: t.categoryMeta.shapeTools.description,
    icon: "●",
  },
  {
    name: t.categoryMeta.svgTools.name,
    key: "SVG Tools",
    description: t.categoryMeta.svgTools.description,
    icon: "⌁",
  },
  {
    name: t.categoryMeta.textTools.name,
    key: "Text Tools",
    description: t.categoryMeta.textTools.description,
    icon: "T",
  },
];