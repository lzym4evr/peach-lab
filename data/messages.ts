export const messages = {
    en: {
        // =========================
        // Common
        // =========================
        common: {
            backToHome: "← Back to home",
            viewAllTools: "View all tools",
            toolNotFound: "Tool not found",
            toolNotFoundDescription:
                "The tool you are looking for does not exist yet.",
            placeholderTitle: "Tool function placeholder",
            placeholderDescription:
                "The real function for this tool will be added here later. For now, this page is ready as a clean tool detail layout.",
            localProcessing: "Local processing",
            copied: "Copied!",
            copy: "Copy",
            clear: "Clear",
            chooseFile: "Choose file",
            uploadError: "Please upload a valid file.",
        },

        // =========================
        // Home Page
        // =========================
        home: {
            navTools: "Tools",
            navCategories: "Categories",
            navAllTools: "All Tools",

            heroTitleLine1: "Design tools",
            heroTitleLine2: "made",
            heroTitleHighlight: "simple",
            heroDescription:
                "Fast, free and easy-to-use online tools for creators, developers and designers.",
            exploreTools: "Explore Tools →",
            viewAllTools: "View All Tools",

            searchPlaceholder: "Search tools, e.g. gradient, svg, noise...",
            browseByCategory: "Browse by Category",
            searchResults: "Search Results",
            noSearchResults: "No matching tools found.",
            pressEnterHint: "Press Enter to open the first result.",

            popularTools: "Popular Tools",
            viewAllPopularTools: "View all popular tools →",
            openTool: "Open →",

            allTools: "All Tools",
            all: "All",
            popular: "Popular",
            newest: "Newest",

            footerDescription:
                "Simple online design tools for creators. Made with peach for the creative community.",
            footerProduct: "Product",
            footerResources: "Resources",
            footerBlog: "Blog",
            footerGuides: "Guides",
            footerHelpCenter: "Help Center",
            footerStayInLoop: "Stay in the loop",
            footerUpdateDescription: "Get updates on new tools and features.",
            footerEmailPlaceholder: "Enter your email",
            footerSubscribe: "Subscribe",
            footerCopyright: "© 2024 Peach Lab. All rights reserved.",
        },

        // =========================
        // Tool Meta
        // Used in data/tools.ts
        // =========================
        toolMeta: {
            // Color Tools
            colorPicker: {
                title: "Color Picker",
                description: "Pick colors from any image and get HEX, RGB values.",
            },
            hexRgbConverter: {
                title: "HEX RGB Converter",
                description: "Convert colors between HEX, RGB, and HSL formats.",
            },
            colorPaletteGenerator: {
                title: "Color Palette Generator",
                description: "Create beautiful color palettes from a base color with copy-ready HEX values.",
            },

            // Gradient Tools
            gradientGenerator: {
                title: "Gradient Generator",
                description: "Create beautiful linear and radial gradients.",
            },

            // Image Tools
            imageSizeChecker: {
                title: "Image Size Checker",
                description:
                    "Check image dimensions, file size, format, aspect ratio, and transparency.",
            },
            imageResizer: {
                title: "Image Resizer",
                description:
                    "Resize images by width and height, then download as PNG, JPEG, or WebP.",
            },
            imageCompressor: {
                title: "Image Compressor",
                description: "Compress JPG, PNG, and WebP images in your browser with adjustable quality and size.",
            },
            qrCodeGenerator: {
                title: "QR Code Generator",
                description: "Create custom QR codes for links, text, email, and contact information.",
            },
            faviconGenerator: {
                title: "Favicon Generator",
                description: "Generate favicon images and copy-ready HTML code from a logo or image.",
            },

            // Background Tools
            backgroundGenerator: {
                title: "Background Generator",
                description:
                    "Create soft gradient backgrounds and download them as PNG or copy CSS.",
            },
            glassmorphismGenerator: {
                title: "Glassmorphism Generator",
                description:
                    "Create frosted glass CSS effects for cards, panels, and modern UI layouts.",
            },

            // Pattern Tools
            patternGenerator: {
                title: "Pattern Generator",
                description:
                    "Create simple repeating patterns and download them as PNG or copy CSS.",
            },

            // Texture Tools
            noiseTextureGenerator: {
                title: "Noise Texture Generator",
                description: "Generate seamless noise textures instantly.",
            },

            // Shape Tools
            blobGenerator: {
                title: "Blob Generator",
                description: "Create random organic blobs and shapes.",
            },
            boxShadowGenerator: {
                title: "Box Shadow Generator",
                description: "Create soft CSS box shadow styles for cards, buttons, panels, and UI elements.",
            },
            borderRadiusGenerator: {
                title: "CSS Border Radius Generator",
                description: "Create custom CSS border radius styles for cards, buttons, images, and UI blocks.",
            },
            cssButtonGenerator: {
                title: "CSS Button Generator",
                description: "Create clean CSS button styles with live preview and copy-ready code.",
            },

            // SVG Tools
            svgToPng: {
                title: "SVG to PNG",
                description: "Convert SVG files to high-quality PNG images.",
            },
            svgColorChanger: {
                title: "SVG Color Changer",
                description:
                    "Upload an SVG, detect colors, replace them, then copy or download the updated SVG.",
            },
            svgOptimizer: {
                title: "SVG Optimizer",
                description: "Clean and optimize SVG code in your browser with copy-ready output.",
            },
            svgTransparentBackground: {
                title: "SVG Transparent Background",
                description: "Remove solid SVG background rectangles and export a transparent SVG.",
            },

            // Text Tools
            textCaseConverter: {
                title: "Text Case Converter",
                description:
                    "Convert text to uppercase, lowercase, title case, and sentence case.",
            },
            characterCounter: {
                title: "Character Counter",
                description:
                    "Count characters, words, spaces, lines, and paragraphs instantly.",
            },
            textShadowGenerator: {
                title: "Text Shadow Generator",
                description: "Create clean CSS text shadow styles with live preview and copy-ready code.",
            },
            textGradientGenerator: {
                title: "CSS Text Gradient Generator",
                description: "Create gradient text styles with live preview and copy-ready CSS.",
            },
            textStrokeGenerator: {
                title: "CSS Text Stroke Generator",
                description: "Create outlined text styles with live preview and copy-ready CSS.",
            },
            fluidTypographyGenerator: {
                title: "Fluid Typography Generator",
                description: "Create responsive CSS clamp font sizes with live preview and copy-ready code.",
            },
        },

        // =========================
        // Category Meta
        // Used in data/tools.ts
        // =========================
        categoryMeta: {
            colorTools: {
                name: "Color Tools",
                description: "Pick, convert and explore colors.",
            },
            gradientTools: {
                name: "Gradient Tools",
                description: "Create and customize beautiful gradients.",
            },
            imageTools: {
                name: "Image Tools",
                description: "Resize, check, convert, and inspect image files.",
            },
            backgroundTools: {
                name: "Background Tools",
                description: "Generate backgrounds and visual assets.",
            },
            patternTools: {
                name: "Pattern Tools",
                description: "Design repeating patterns.",
            },
            textureTools: {
                name: "Texture Tools",
                description: "Create textures and visual surfaces.",
            },
            shapeTools: {
                name: "Shape Tools",
                description: "Generate and edit shapes.",
            },
            svgTools: {
                name: "SVG Tools",
                description: "Work with SVG files and code.",
            },
            textTools: {
                name: "Text Tools",
                description: "Format, convert and optimize text.",
            },
        },

        // =========================
        // Color Tools
        // =========================
        colorPicker: {
            uploadTitle: "Drag and drop an image here",
            uploadDescription:
                "Or click to upload. Pick colors from any image and copy HEX, RGB, or HSL values. Your image is processed locally in your browser.",
            chooseImage: "Choose image",
            imagePreview: "Image Preview",
            previewHint: "Click anywhere on the image to pick a color.",
            emptyPreview: "Upload an image to start picking colors.",
            pickedColor: "Picked Color",
            pixelMagnifier: "Pixel Magnifier",
            magnifierHint: "Move over the image to inspect pixels.",
            emptyPickedColor: "Upload an image and click on any pixel to pick a color.",
            localProcessingDescription:
                "This image is read directly in your browser. It is not uploaded to a server.",
            invalidImage: "Please upload a valid image file.",
            readError: "Could not read this image. Please try another file.",

            supportedFormats: "Supports JPG, PNG, WebP, and common mobile image formats.",
            invalidFileType: "Please upload a JPG, PNG, or WebP image.",
            unsupportedFormat:
                "This image format may not be supported. Please try JPG, PNG, or WebP.",
            noFileSelectedError: "No image file was selected.",
            noFileSelected: "No file selected",
            previewEmpty: "Upload an image to preview it here.",
            loadingImage: "Loading image...",
            mobileActionTitle: "Pick a color",
            mobileActionDescription: "Upload an image and tap any pixel.",
            tapValueToCopy: "Tap a value to copy",
            valueCopied: "{label} copied",
        },

        hexRgbConverter: {
            previewColor: "Preview color",
            invalidHex: "Invalid HEX",
            pickColor: "Pick a color",
            hexValue: "HEX value",
            invalidHexDescription: "Please enter a valid HEX color, such as #F28C6F.",
            hex: "HEX",
            rgb: "RGB",
            hsl: "HSL",
            copyHex: "Copy HEX",
            copyRgb: "Copy RGB",
            copyHsl: "Copy HSL",
            colorValues: "Color values",
        },

        colorPaletteGenerator: {
            previewTitle: "Palette Preview",
            controlsTitle: "Controls",
            outputTitle: "Palette Output",

            previewDescription:
                "Create beautiful color palettes from a base color with copy-ready HEX values.",
            controlsDescription: "Adjust the base color, palette style, and color count.",

            baseColorLabel: "Base Color",
            paletteTypeLabel: "Palette Type",
            colorCountLabel: "Color Count",

            chooseBaseColor: "Choose base color",
            chooseBaseColorDescription: "Pick a color, adjust it, then apply it.",
            selectedBaseColor: "Selected base color",

            analogous: "Analogous",
            monochrome: "Monochrome",
            monochromatic: "Monochromatic",
            complementary: "Complementary",
            triadic: "Triadic",
            warm: "Warm",
            cool: "Cool",
            random: "Random",

            palettePreview: "Palette Preview",
            palettePreviewHint: "Swipe or tap a color",
            cssOutput: "CSS Output",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyPalette: "Copy Palette",
            copyCss: "Copy CSS",
            reset: "Reset",
            cancel: "Cancel",
            apply: "Apply",

            keepColor: "Keep color",
            newPalette: "New palette",
            download: "Download",
            downloadPng: "Download PNG",
            png: "PNG",

            hex: "HEX",
            hexColor: "HEX color",
            copySelectedColor: "Copy selected color",
            hue: "Hue",
            saturation: "Saturation",
            lightness: "Lightness",
            currentColor: "Current color",
            presets: "Presets",

            copied: "Copied",
            copyError: "Copy failed. Please copy the palette manually.",
        },

        // =========================
        // Gradient Tools
        // =========================
        gradientGenerator: {
            preview: "Preview",
            random: "Random",
            color1: "Color 1",
            color2: "Color 2",
            angle: "Angle",
            cssOutput: "CSS Output",
            copyCss: "Copy CSS",
        },

        // =========================
        // Image Tools
        // =========================
        imageSizeChecker: {
            uploadTitle: "Drag and drop an image here",
            uploadDescription:
                "Or click to upload. Check image width, height, file size, format, aspect ratio, and PNG transparency. Your image is processed locally in your browser.",
            chooseImage: "Choose image",
            preview: "Preview",
            imageInformation: "Image information",
            width: "Width",
            height: "Height",
            aspectRatio: "Aspect ratio",
            fileSize: "File size",
            format: "Format",
            transparency: "Transparency",
            notChecked: "Not checked",
            yes: "Yes",
            no: "No",
            localProcessingDescription:
                "This file is read directly in your browser. It is not uploaded to a server.",
            invalidImage: "Please upload a valid image file.",
            readError: "Could not read this image. Please try another file.",
        },

        imageResizer: {
            uploadTitle: "Drag and drop an image here",
            uploadDescription:
                "Or click to upload. Resize your image by width and height. Your image is processed locally in your browser.",
            chooseImage: "Choose image",
            originalImage: "Original Image",
            resizedOutput: "Resized Output",
            originalSize: "Original size",
            newWidth: "New width",
            newHeight: "New height",
            lockAspectRatio: "Lock aspect ratio",
            outputFormat: "Output format",
            quality: "Quality",
            resizeImage: "Resize Image",
            downloadImage: "Download Image",
            noOutput: "Resize the image to preview and download the result.",
            localProcessingDescription:
                "This image is resized directly in your browser. It is not uploaded to a server.",
            invalidImage: "Please upload a valid image file.",
            readError: "Could not read this image. Please try another file.",
        },

        imageCompressor: {
            localProcessing: "Local processing: your image is compressed in your browser. No files are uploaded.",
            uploadTitle: "Upload Image",
            uploadDescription: "Choose a JPG, PNG, or WebP image to compress locally.",
            uploadButton: "Choose Image",
            changeImage: "Change Image",
            dropHint: "Drag and drop an image here, or click to choose a file.",
            emptyTitle: "No image selected",
            emptyDescription: "Upload an image to preview and compress it.",

            controlsTitle: "Controls",
            outputTitle: "Compressed Result",

            qualityLabel: "Quality",
            formatLabel: "Output Format",

            compressImage: "Compress Image",
            downloadImage: "Download Image",
            processing: "Compressing...",
            ready: "Image compressed successfully.",

            originalImage: "Original Image",
            compressedImage: "Compressed Image",
            originalSize: "Original Size",
            compressedSize: "Compressed Size",
            saved: "Saved",

            noFileError: "Please upload an image first.",
            loadError: "Could not load this image. Please try another file.",
            compressError: "Compression failed. Please try a different format or image.",
        },

        qrCodeGenerator: {
            previewTitle: "QR Code Preview",
            controlsTitle: "Controls",
            outputTitle: "Output",

            previewDescription: "Create custom QR codes for links, text, email, and contact information.",

            contentLabel: "QR Content",
            contentPlaceholder: "Enter a URL or text",
            sizeLabel: "Size",
            marginLabel: "Margin",
            foregroundColorLabel: "Foreground Color",
            backgroundColorLabel: "Background Color",
            errorCorrectionLabel: "Error Correction",

            low: "Low",
            medium: "Medium",
            quartile: "Quartile",
            high: "High",

            shuffle: "Shuffle",
            randomAll: "Random All",
            downloadPng: "Download PNG",
            downloadSvg: "Download SVG",
            copySvg: "Copy SVG",
            reset: "Reset",

            emptyTitle: "Enter content to generate a QR code.",
            copied: "Copied",
            copyError: "Copy failed. Please copy manually.",
            generateError: "Could not generate this QR code. Please check your content.",
        },

        faviconGenerator: {
            localProcessing: "Local processing: your favicon is generated in your browser. No files are uploaded.",
            uploadTitle: "Upload Image",
            uploadDescription: "Choose or drag a PNG, JPG, WebP, or SVG image to generate favicon files locally.",
            uploadButton: "Choose Image",
            changeImage: "Change Image",
            dropHint: "Drag and drop an image here, or click to choose a file.",

            previewTitle: "Favicon Preview",
            controlsTitle: "Controls",
            outputTitle: "HTML Output",

            emptyTitle: "No image selected",
            emptyDescription: "Upload a logo or image to generate favicon files.",

            backgroundColorLabel: "Background Color",
            transparentBackgroundLabel: "Transparent Background",
            paddingLabel: "Padding",
            cornerRadiusLabel: "Corner Radius",

            generateFavicons: "Generate Favicons",
            downloadPng: "Download PNG",
            downloadAll: "Download All",
            copyHtml: "Copy HTML",
            reset: "Reset",

            generatedFiles: "Generated Files",
            size: "Size",
            fileName: "File Name",

            copied: "Copied",
            ready: "Favicons generated successfully.",
            noFileError: "Please upload an image first.",
            loadError: "Could not load this image. Please try another file.",
            generateError: "Could not generate favicons. Please try another image.",
            copyError: "Copy failed. Please copy the HTML manually.",
        },

        // =========================
        // Background Tools
        // =========================
        backgroundGenerator: {
            previewTitle: "Background Preview",
            previewDescription:
                "Create soft gradient backgrounds for websites, cards, and visual assets.",
            emptyHint: "Adjust the settings to generate a background preview.",
            controls: "Controls",
            canvasWidth: "Canvas Width",
            canvasHeight: "Canvas Height",
            baseColor: "Base Color",
            accentColor1: "Accent Color 1",
            accentColor2: "Accent Color 2",
            blobSize: "Blob Size",
            blur: "Blur",
            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            downloadPng: "Download PNG",
            cssTitle: "CSS Background",
        },
        glassmorphismGenerator: {
            previewTitle: "Glass Preview",
            previewDescription:
                "Create frosted glass effects for cards, panels, and modern UI layouts.",
            controls: "Controls",
            cardText: "Glass Card",
            cardDescription: "Soft, clean, and modern UI effect.",
            opacity: "Opacity",
            blur: "Blur",
            borderRadius: "Border Radius",
            borderOpacity: "Border Opacity",
            shadowIntensity: "Shadow Intensity",
            backgroundColor1: "Background Color 1",
            backgroundColor2: "Background Color 2",
            glassColor: "Glass Color",
            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            cssTitle: "CSS Glass Effect",
        },

        // =========================
        // Pattern Tools
        // =========================
        patternGenerator: {
            previewTitle: "Pattern Preview",
            previewDescription:
                "Create repeating patterns for backgrounds, cards, and visual assets.",
            emptyHint: "Adjust the settings to generate a pattern preview.",
            controls: "Controls",
            patternType: "Pattern Type",
            dots: "Dots",
            grid: "Grid",
            diagonalLines: "Diagonal Lines",
            checkerboard: "Checkerboard",
            canvasWidth: "Canvas Width",
            canvasHeight: "Canvas Height",
            patternSize: "Pattern Size",
            spacing: "Spacing",
            foregroundColor: "Foreground Color",
            backgroundColor: "Background Color",
            generatePreview: "Generate Preview",
            shufflePattern: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            downloadPng: "Download PNG",
            cssTitle: "CSS Pattern Background",
        },

        // =========================
        // Texture Tools
        // =========================
        noiseTextureGenerator: {
            previewTitle: "Noise Preview",
            previewDescription: "Generate subtle grain and noise textures for backgrounds.",
            emptyHint: "Adjust the settings to see a live preview.",
            shuffleNoise: "Shuffle",
            randomAll: "Random All",
            controls: "Controls",
            width: "Width",
            height: "Height",
            backgroundColor: "Background Color",
            noiseColor: "Noise Color",
            density: "Density",
            opacity: "Opacity",
            copyCss: "Copy CSS",
            downloadPng: "Download PNG",
            cssTitle: "CSS Noise Background",
        },

        // =========================
        // Shape Tools
        // =========================
        blobGenerator: {
            previewTitle: "Blob Preview",
            previewDescription:
                "Generate smooth organic SVG shapes for backgrounds and layouts.",
            generate: "Generate",
            controls: "Controls",
            fillColor: "Fill Color",
            points: "Points",
            smoothness: "Smoothness",
            copySvg: "Copy SVG",
            downloadSvg: "Download SVG",
            svgCode: "SVG Code",
        },

        boxShadowGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create soft CSS box shadow styles for cards, buttons, panels, and UI elements.",
            emptyPreview: "Adjust the settings to generate a box shadow preview.",

            boxWidthLabel: "Box Width",
            boxHeightLabel: "Box Height",
            boxColorLabel: "Box Color",
            shadowColorLabel: "Shadow Color",
            backgroundColorLabel: "Background Color",

            horizontalOffsetLabel: "Horizontal Offset",
            verticalOffsetLabel: "Vertical Offset",
            blurRadiusLabel: "Blur Radius",
            spreadRadiusLabel: "Spread Radius",
            shadowOpacityLabel: "Shadow Opacity",
            borderRadiusLabel: "Border Radius",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",
            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        borderRadiusGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create custom CSS border radius styles for cards, buttons, images, and UI blocks.",
            boxWidthLabel: "Box Width",
            boxHeightLabel: "Box Height",
            boxColorLabel: "Box Color",
            backgroundColorLabel: "Background Color",

            topLeftLabel: "Top Left",
            topRightLabel: "Top Right",
            bottomRightLabel: "Bottom Right",
            bottomLeftLabel: "Bottom Left",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",
            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        cssButtonGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create clean CSS button styles with live preview and copy-ready code.",

            buttonTextLabel: "Button Text",
            buttonTextPlaceholder: "Type button text",
            fontSizeLabel: "Font Size",
            paddingXLabel: "Horizontal Padding",
            paddingYLabel: "Vertical Padding",
            borderRadiusLabel: "Border Radius",
            borderWidthLabel: "Border Width",
            shadowBlurLabel: "Shadow Blur",
            shadowOffsetYLabel: "Shadow Offset Y",
            shadowOpacityLabel: "Shadow Opacity",

            backgroundColorLabel: "Background Color",
            textColorLabel: "Text Color",
            borderColorLabel: "Border Color",
            shadowColorLabel: "Shadow Color",
            previewBackgroundLabel: "Preview Background",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",
            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        // =========================
        // SVG Tools
        // =========================
        svgToPng: {
            uploadTitle: "Drag and drop an SVG file here",
            uploadDescription:
                "Or click to upload. Convert SVG files to PNG images at custom sizes. The conversion runs locally in your browser.",
            chooseSvg: "Choose SVG",
            svgPreview: "SVG Preview",
            exportPng: "Export PNG",
            width: "Width",
            height: "Height",
            downloadPng: "Download PNG",
            localProcessingDescription:
                "Your SVG file is converted in your browser. It is not uploaded to a server.",
            invalidSvg: "Please upload a valid SVG file.",
            invalidSvgContent: "This file does not look like a valid SVG.",
            readError: "Could not read this SVG file. Please try another file.",
            canvasUnsupported: "Canvas is not supported in this browser.",
            convertError: "Could not convert this SVG. Please try another SVG file.",
        },

        svgColorChanger: {
            uploadTitle: "Drag and drop an SVG file here",
            uploadDescription:
                "Or click to upload. Detect and replace colors in SVG code. Your SVG is processed locally in your browser.",
            chooseSvg: "Choose SVG",
            svgPreview: "SVG Preview",
            colorControls: "Color Controls",
            detectedColors: "Detected Colors",
            originalColor: "Original Color",
            newColor: "New Color",
            replaceColor: "Replace Color",
            replaceAllColors: "Replace All Colors",
            undo: "Undo",
            redo: "Redo",
            copySvg: "Copy SVG",
            downloadSvg: "Download SVG",
            svgCode: "SVG Code",
            noColors:
                "No editable HEX colors were detected. You can still edit the SVG code manually later.",
            emptyState: "Upload an SVG file to start changing colors.",
            localProcessingDescription:
                "Your SVG file is read and updated directly in your browser. It is not uploaded to a server.",
            invalidSvg: "Please upload a valid SVG file.",
            invalidSvgContent: "This file does not look like a valid SVG.",
            readError: "Could not read this SVG file. Please try another file.",
        },

        svgOptimizer: {
            localProcessing: "Local processing: your SVG is optimized in your browser. No files are uploaded.",
            uploadTitle: "Upload SVG",
            uploadDescription: "Choose or drag an SVG file to clean and optimize it locally.",
            uploadButton: "Choose SVG",
            changeSvg: "Change SVG",
            dropHint: "Drag and drop an SVG file here, or click to choose a file.",

            previewTitle: "SVG Preview",
            controlsTitle: "Controls",
            outputTitle: "Optimized SVG",

            emptyTitle: "No SVG selected",
            emptyDescription: "Upload an SVG file to preview and optimize it.",

            removeComments: "Remove Comments",
            removeMetadata: "Remove Metadata",
            removeTitleDesc: "Remove Title and Description",
            removeEmptyGroups: "Remove Empty Groups",
            collapseWhitespace: "Collapse Whitespace",
            removeDimensions: "Remove Width and Height",

            optimizeSvg: "Optimize SVG",
            copySvg: "Copy SVG",
            downloadSvg: "Download SVG",
            reset: "Reset",

            originalSize: "Original Size",
            optimizedSize: "Optimized Size",
            saved: "Saved",

            copied: "Copied",
            ready: "SVG optimized successfully.",
            noFileError: "Please upload an SVG file first.",
            loadError: "Could not load this SVG file. Please try another file.",
            invalidSvgError: "This does not look like valid SVG code.",
            copyError: "Copy failed. Please copy the SVG manually.",
        },

        svgTransparentBackground: {
            localProcessing: "Local processing: your SVG is processed in your browser. No files are uploaded.",
            uploadTitle: "Upload SVG",
            uploadDescription: "Choose or drag an SVG file to remove solid background layers locally.",
            uploadButton: "Choose SVG",
            changeSvg: "Change SVG",
            dropHint: "Drag and drop an SVG file here, or click to choose a file.",

            previewTitle: "Preview",
            controlsTitle: "Controls",
            outputTitle: "Transparent SVG",

            emptyTitle: "No SVG selected",
            emptyDescription: "Upload an SVG file to preview it and make the background transparent.",

            originalSvg: "Original SVG",
            transparentSvg: "Transparent SVG",

            targetColorLabel: "Target Background Color",
            removeWhiteBackgroundRect: "Remove White Background Rect",
            removeTargetColorRect: "Remove Target Color Rect",
            removeFirstBackgroundRect: "Remove First Background Rect",
            removeSvgBackgroundStyle: "Remove SVG Background Style",

            makeTransparent: "Make Transparent",
            copySvg: "Copy SVG",
            downloadSvg: "Download SVG",
            reset: "Reset",

            originalSize: "Original Size",
            transparentSize: "Transparent Size",
            saved: "Saved",

            copied: "Copied",
            ready: "SVG transparent background created successfully.",
            noFileError: "Please upload an SVG file first.",
            loadError: "Could not load this SVG file. Please try another file.",
            invalidSvgError: "This does not look like valid SVG code.",
            copyError: "Copy failed. Please copy the SVG manually.",
        },

        // =========================
        // Text Tools
        // =========================
        textCaseConverter: {
            enterText: "Enter your text",
            placeholder: "Type or paste your text here...",
            uppercase: "UPPERCASE",
            lowercase: "lowercase",
            titleCase: "Title Case",
            sentenceCase: "Sentence case",
            copyResult: "Copy result",
            clear: "Clear",
            characters: "Characters",
            noSpaces: "No spaces",
            words: "Words",
            lines: "Lines",
        },

        characterCounter: {
            enterText: "Paste or type your text",
            placeholder: "Start typing or paste your text here...",
            copyText: "Copy text",
            clear: "Clear",
            characters: "Characters",
            charactersNoSpaces: "Characters no spaces",
            words: "Words",
            spaces: "Spaces",
            lines: "Lines",
            paragraphs: "Paragraphs",
        },

        textShadowGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Shadow Controls",
            outputTitle: "CSS Output",

            sampleTextLabel: "Preview Text",
            sampleTextPlaceholder: "Type your preview text here",
            textColorLabel: "Text Color",
            shadowColorLabel: "Shadow Color",
            backgroundColorLabel: "Background Color",

            horizontalOffsetLabel: "Horizontal Offset",
            verticalOffsetLabel: "Vertical Offset",
            blurRadiusLabel: "Blur Radius",
            shadowOpacityLabel: "Shadow Opacity",
            fontSizeLabel: "Font Size",

            shuffle: "Shuffle",
            randomAll: "Random All",
            reset: "Reset",
            copyCss: "Copy CSS",
            copied: "Copied",

            emptyPreview: "Your text shadow preview will appear here.",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        textGradientGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create gradient text styles with live preview and copy-ready CSS.",

            sampleTextLabel: "Preview Text",
            sampleTextPlaceholder: "Type your preview text here",
            fontSizeLabel: "Font Size",
            fontWeightLabel: "Font Weight",
            gradientAngleLabel: "Gradient Angle",
            colorOneLabel: "Color 1",
            colorTwoLabel: "Color 2",
            colorThreeLabel: "Color 3",
            backgroundColorLabel: "Preview Background",

            normal: "Normal",
            medium: "Medium",
            bold: "Bold",
            extraBold: "Extra Bold",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",

            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        textStrokeGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create outlined text styles with live preview and copy-ready CSS.",

            sampleTextLabel: "Preview Text",
            sampleTextPlaceholder: "Type your preview text here",

            fontSizeLabel: "Font Size",
            fontWeightLabel: "Font Weight",
            strokeWidthLabel: "Stroke Width",

            textColorLabel: "Text Color",
            strokeColorLabel: "Stroke Color",
            backgroundColorLabel: "Preview Background",

            fillModeLabel: "Fill Mode",
            solidFill: "Solid Fill",
            transparentFill: "Transparent Fill",

            normal: "Normal",
            medium: "Medium",
            bold: "Bold",
            extraBold: "Extra Bold",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",

            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },

        fluidTypographyGenerator: {
            previewTitle: "Live Preview",
            controlsTitle: "Controls",
            outputTitle: "CSS Output",

            previewDescription: "Create responsive CSS clamp font sizes with live preview and copy-ready code.",

            sampleTextLabel: "Preview Text",
            sampleTextPlaceholder: "Type your preview text here",

            minFontSizeLabel: "Min Font Size",
            maxFontSizeLabel: "Max Font Size",
            minViewportLabel: "Min Viewport",
            maxViewportLabel: "Max Viewport",
            previewWidthLabel: "Preview Width",
            fontWeightLabel: "Font Weight",

            textColorLabel: "Text Color",
            backgroundColorLabel: "Preview Background",

            normal: "Normal",
            medium: "Medium",
            bold: "Bold",
            extraBold: "Extra Bold",

            shuffle: "Shuffle",
            randomAll: "Random All",
            copyCss: "Copy CSS",
            reset: "Reset",

            copied: "Copied",
            copyError: "Copy failed. Please copy the CSS manually.",
        },
    },
};

export const currentLocale = "en";

export const t = messages[currentLocale];