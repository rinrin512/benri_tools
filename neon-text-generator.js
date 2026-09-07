(() => {
  "use strict";

  const FONT_FAMILIES = {
    sans: 'Arial, "Noto Sans JP", sans-serif',
    rounded: '"Arial Rounded MT Bold", "Hiragino Maru Gothic ProN", sans-serif',
    serif: 'Georgia, "Yu Mincho", serif',
    monospace: 'Consolas, "Courier New", monospace',
    cursive: '"Segoe Script", "Brush Script MT", cursive',
  };

  const PRESETS = {
    electric: { primary: "#4DEBFF", secondary: "#B84DFF", background: "#090B16", frame: "#FF4DA6", backgroundStyle: "brick" },
    pink: { primary: "#FF4DA6", secondary: "#FFB3DA", background: "#160912", frame: "#FF4DA6", backgroundStyle: "wall" },
    cyber: { primary: "#00FFD1", secondary: "#FFE600", background: "#050816", frame: "#7C3AED", backgroundStyle: "brick" },
    sunset: { primary: "#FF7A18", secondary: "#FF2E93", background: "#160A14", frame: "#FFB347", backgroundStyle: "wall" },
    green: { primary: "#65FF6A", secondary: "#D7FF6A", background: "#07120A", frame: "#34D399", backgroundStyle: "brick" },
    gold: { primary: "#FFD166", secondary: "#FFF1B8", background: "#151005", frame: "#FF9F1C", backgroundStyle: "wall" },
  };

  const DEFAULTS = {
    text: "NEON\nNIGHT",
    preset: "electric",
    fontFamily: "sans",
    fontSize: 150,
    fontWeight: "700",
    letterSpacing: 4,
    lineHeight: 1.15,
    textAlign: "center",
    writingMode: "horizontal",
    italic: false,
    primaryColor: "#4DEBFF",
    secondaryColor: "#B84DFF",
    gradientEnabled: true,
    glowStrength: 78,
    glowSpread: 34,
    tubeWidth: 7,
    backgroundStyle: "brick",
    backgroundColor: "#090B16",
    width: 1200,
    height: 800,
    frameEnabled: true,
    frameColor: "#FF4DA6",
    flickerEnabled: true,
    flickerSpeed: 5,
  };
  const PROJECT_APP_ID = "yaa-site-neon-text";
  const PROJECT_VERSION = 1;
  const STORAGE_KEY = "yaa-site-neon-text-project-v1";
  const MAX_PROJECT_FILE_BYTES = 1024 * 1024;
  const ENUM_VALUES = {
    preset: new Set(Object.keys(PRESETS)),
    fontFamily: new Set(Object.keys(FONT_FAMILIES)),
    fontWeight: new Set(["400", "700", "900"]),
    textAlign: new Set(["left", "center", "right"]),
    writingMode: new Set(["horizontal", "vertical"]),
    backgroundStyle: new Set(["brick", "wall", "solid", "transparent"]),
  };

  const elements = {
    view: document.querySelector("#neonTextView"),
    canvas: document.querySelector("#neonCanvas"),
    text: document.querySelector("#neonTextInput"),
    preset: document.querySelector("#neonPreset"),
    fontFamily: document.querySelector("#neonFontFamily"),
    fontSize: document.querySelector("#neonFontSize"),
    fontSizeValue: document.querySelector("#neonFontSizeValue"),
    fontWeight: document.querySelector("#neonFontWeight"),
    letterSpacing: document.querySelector("#neonLetterSpacing"),
    letterSpacingValue: document.querySelector("#neonLetterSpacingValue"),
    lineHeight: document.querySelector("#neonLineHeight"),
    lineHeightValue: document.querySelector("#neonLineHeightValue"),
    textAlign: document.querySelector("#neonTextAlign"),
    writingMode: document.querySelector("#neonWritingMode"),
    italic: document.querySelector("#neonItalic"),
    primaryColor: document.querySelector("#neonPrimaryColor"),
    secondaryColor: document.querySelector("#neonSecondaryColor"),
    gradientEnabled: document.querySelector("#neonGradientEnabled"),
    glowStrength: document.querySelector("#neonGlowStrength"),
    glowStrengthValue: document.querySelector("#neonGlowStrengthValue"),
    glowSpread: document.querySelector("#neonGlowSpread"),
    glowSpreadValue: document.querySelector("#neonGlowSpreadValue"),
    tubeWidth: document.querySelector("#neonTubeWidth"),
    tubeWidthValue: document.querySelector("#neonTubeWidthValue"),
    backgroundStyle: document.querySelector("#neonBackgroundStyle"),
    backgroundColor: document.querySelector("#neonBackgroundColor"),
    backgroundPresetButtons: [...document.querySelectorAll("[data-neon-background-color]")],
    canvasWidth: document.querySelector("#neonCanvasWidth"),
    canvasHeight: document.querySelector("#neonCanvasHeight"),
    frameEnabled: document.querySelector("#neonFrameEnabled"),
    frameColor: document.querySelector("#neonFrameColor"),
    flickerEnabled: document.querySelector("#neonFlickerEnabled"),
    flickerSpeed: document.querySelector("#neonFlickerSpeed"),
    flickerSpeedValue: document.querySelector("#neonFlickerSpeedValue"),
    canvasSizeLabel: document.querySelector("#neonCanvasSizeLabel"),
    liveIndicator: document.querySelector("#neonLiveIndicator"),
    cssOutput: document.querySelector("#neonCssOutput"),
    downloadPng: document.querySelector("#neonDownloadPng"),
    downloadWebp: document.querySelector("#neonDownloadWebp"),
    downloadSvg: document.querySelector("#neonDownloadSvg"),
    downloadWebm: document.querySelector("#neonDownloadWebm"),
    downloadGif: document.querySelector("#neonDownloadGif"),
    downloadProject: document.querySelector("#neonDownloadProject"),
    projectFileInput: document.querySelector("#neonProjectFileInput"),
    copyCss: document.querySelector("#neonCopyCss"),
    reset: document.querySelector("#neonResetButton"),
    status: document.querySelector("#neonStatus"),
  };

  if (!elements.view || !elements.canvas) return;

  const context = elements.canvas.getContext("2d");
  let currentOptions = { ...DEFAULTS };
  let viewIsActive = false;
  let animationFrameId = 0;
  let exportInProgress = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function numericValue(element, fallback, min, max) {
    const parsed = Number(element.value);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  }

  function safeNumber(value, fallback, min, max, round = false) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const result = clamp(parsed, min, max);
    return round ? Math.round(result) : result;
  }

  function safeChoice(value, choices, fallback) {
    return choices.has(value) ? value : fallback;
  }

  function safeColor(value, fallback) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
  }

  function normalizeOptions(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      text: typeof source.text === "string" ? source.text.slice(0, 10000) : DEFAULTS.text,
      preset: safeChoice(source.preset, ENUM_VALUES.preset, DEFAULTS.preset),
      fontFamily: safeChoice(source.fontFamily, ENUM_VALUES.fontFamily, DEFAULTS.fontFamily),
      fontSize: safeNumber(source.fontSize, DEFAULTS.fontSize, 24, 320),
      fontWeight: safeChoice(String(source.fontWeight), ENUM_VALUES.fontWeight, DEFAULTS.fontWeight),
      letterSpacing: safeNumber(source.letterSpacing, DEFAULTS.letterSpacing, -5, 30),
      lineHeight: safeNumber(source.lineHeight, DEFAULTS.lineHeight, 0.8, 2),
      textAlign: safeChoice(source.textAlign, ENUM_VALUES.textAlign, DEFAULTS.textAlign),
      writingMode: safeChoice(source.writingMode, ENUM_VALUES.writingMode, DEFAULTS.writingMode),
      italic: typeof source.italic === "boolean" ? source.italic : DEFAULTS.italic,
      primaryColor: safeColor(source.primaryColor, DEFAULTS.primaryColor),
      secondaryColor: safeColor(source.secondaryColor, DEFAULTS.secondaryColor),
      gradientEnabled: typeof source.gradientEnabled === "boolean" ? source.gradientEnabled : DEFAULTS.gradientEnabled,
      glowStrength: safeNumber(source.glowStrength, DEFAULTS.glowStrength, 0, 100),
      glowSpread: safeNumber(source.glowSpread, DEFAULTS.glowSpread, 0, 80),
      tubeWidth: safeNumber(source.tubeWidth, DEFAULTS.tubeWidth, 1, 24),
      backgroundStyle: safeChoice(source.backgroundStyle, ENUM_VALUES.backgroundStyle, DEFAULTS.backgroundStyle),
      backgroundColor: safeColor(source.backgroundColor, DEFAULTS.backgroundColor),
      width: safeNumber(source.width, DEFAULTS.width, 160, 4000, true),
      height: safeNumber(source.height, DEFAULTS.height, 160, 4000, true),
      frameEnabled: typeof source.frameEnabled === "boolean" ? source.frameEnabled : DEFAULTS.frameEnabled,
      frameColor: safeColor(source.frameColor, DEFAULTS.frameColor),
      flickerEnabled: typeof source.flickerEnabled === "boolean" ? source.flickerEnabled : DEFAULTS.flickerEnabled,
      flickerSpeed: safeNumber(source.flickerSpeed, DEFAULTS.flickerSpeed, 1, 10),
    };
  }

  function saveToBrowser(options) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: PROJECT_VERSION, settings: options }));
      return true;
    } catch {
      return false;
    }
  }

  function loadFromBrowser() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || stored.version !== PROJECT_VERSION || !stored.settings) return null;
      return normalizeOptions(stored.settings);
    } catch {
      return null;
    }
  }

  function readOptions() {
    return {
      text: elements.text.value,
      preset: elements.preset.value,
      fontFamily: elements.fontFamily.value,
      fontSize: numericValue(elements.fontSize, DEFAULTS.fontSize, 24, 320),
      fontWeight: elements.fontWeight.value,
      letterSpacing: numericValue(elements.letterSpacing, DEFAULTS.letterSpacing, -5, 30),
      lineHeight: numericValue(elements.lineHeight, DEFAULTS.lineHeight, 0.8, 2),
      textAlign: elements.textAlign.value,
      writingMode: elements.writingMode.value,
      italic: elements.italic.checked,
      primaryColor: elements.primaryColor.value,
      secondaryColor: elements.secondaryColor.value,
      gradientEnabled: elements.gradientEnabled.checked,
      glowStrength: numericValue(elements.glowStrength, DEFAULTS.glowStrength, 0, 100),
      glowSpread: numericValue(elements.glowSpread, DEFAULTS.glowSpread, 0, 80),
      tubeWidth: numericValue(elements.tubeWidth, DEFAULTS.tubeWidth, 1, 24),
      backgroundStyle: elements.backgroundStyle.value,
      backgroundColor: elements.backgroundColor.value,
      width: Math.round(numericValue(elements.canvasWidth, DEFAULTS.width, 160, 4000)),
      height: Math.round(numericValue(elements.canvasHeight, DEFAULTS.height, 160, 4000)),
      frameEnabled: elements.frameEnabled.checked,
      frameColor: elements.frameColor.value,
      flickerEnabled: elements.flickerEnabled.checked,
      flickerSpeed: numericValue(elements.flickerSpeed, DEFAULTS.flickerSpeed, 1, 10),
    };
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    };
  }

  function rgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function mixWithWhite(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const mix = (channel) => Math.round(channel + (255 - channel) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  }

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
    ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
    ctx.arcTo(x, y + height, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
  }

  function drawBackground(ctx, options, forceOpaque) {
    const { width, height, backgroundColor, backgroundStyle } = options;
    ctx.clearRect(0, 0, width, height);
    if (backgroundStyle === "transparent" && !forceOpaque) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (backgroundStyle === "wall") {
      const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      glow.addColorStop(0, "rgba(255, 255, 255, 0.07)");
      glow.addColorStop(0.55, "rgba(0, 0, 0, 0.04)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0.58)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    if (backgroundStyle === "brick") {
      const brickWidth = Math.max(70, Math.round(width / 10));
      const brickHeight = Math.max(34, Math.round(brickWidth * 0.46));
      ctx.lineWidth = Math.max(2, width / 500);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.48)";
      for (let y = 0, row = 0; y <= height + brickHeight; y += brickHeight, row += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        const offset = row % 2 === 0 ? 0 : -brickWidth / 2;
        for (let x = offset; x <= width + brickWidth; x += brickWidth) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + brickHeight);
          ctx.stroke();
        }
      }
      const shade = ctx.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, "rgba(255, 255, 255, 0.06)");
      shade.addColorStop(0.5, "rgba(0, 0, 0, 0.04)");
      shade.addColorStop(1, "rgba(0, 0, 0, 0.48)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function flickerAlpha(options, timeMs) {
    if (!options.flickerEnabled) return 1;
    const phase = (timeMs / 1000) * options.flickerSpeed;
    const pulse = 0.91 + Math.sin(phase * 5.1) * 0.055 + Math.sin(phase * 11.7) * 0.035;
    const dropout = Math.sin(phase * 17.3) > 0.965 ? 0.38 : 1;
    return clamp(pulse * dropout, 0.25, 1);
  }

  function drawFrame(ctx, options, alpha) {
    if (!options.frameEnabled) return;
    const margin = Math.max(24, Math.min(options.width, options.height) * 0.065);
    const radius = Math.max(14, margin * 0.45);
    const tube = Math.max(2, options.tubeWidth * 0.75);
    ctx.save();
    ctx.globalAlpha = alpha;
    roundedRectPath(ctx, margin, margin, options.width - margin * 2, options.height - margin * 2, radius);
    ctx.strokeStyle = options.frameColor;
    ctx.lineWidth = tube * 1.8;
    ctx.shadowColor = options.frameColor;
    ctx.shadowBlur = options.glowSpread * 1.2;
    ctx.stroke();
    ctx.shadowBlur = options.glowSpread * 0.45;
    ctx.lineWidth = Math.max(1, tube * 0.45);
    ctx.strokeStyle = mixWithWhite(options.frameColor, 0.72);
    ctx.stroke();
    ctx.restore();
  }

  function textFont(options) {
    const italic = options.italic ? "italic " : "";
    return `${italic}${options.fontWeight} ${options.fontSize}px ${FONT_FAMILIES[options.fontFamily]}`;
  }

  function measuredTextWidth(ctx, text, spacing) {
    const characters = Array.from(text);
    if (characters.length === 0) return 0;
    return characters.reduce((sum, character) => sum + ctx.measureText(character).width, 0) + spacing * (characters.length - 1);
  }

  function createTextRuns(ctx, options) {
    ctx.font = textFont(options);
    ctx.textBaseline = "middle";
    const lines = options.text.split(/\r?\n/);
    const safeLines = lines.length ? lines : [""];
    const runs = [];

    if (options.writingMode === "vertical") {
      const columnGap = options.fontSize * options.lineHeight;
      const totalWidth = options.fontSize + Math.max(0, safeLines.length - 1) * columnGap;
      const firstX = options.width / 2 + totalWidth / 2 - options.fontSize / 2;
      safeLines.forEach((line, columnIndex) => {
        const characters = Array.from(line);
        const step = options.fontSize + options.letterSpacing;
        const totalHeight = options.fontSize + Math.max(0, characters.length - 1) * step;
        const firstY = options.height / 2 - totalHeight / 2 + options.fontSize / 2;
        characters.forEach((character, index) => {
          runs.push({ character, x: firstX - columnIndex * columnGap, y: firstY + index * step });
        });
      });
      return runs;
    }

    const lineStep = options.fontSize * options.lineHeight;
    const totalHeight = options.fontSize + Math.max(0, safeLines.length - 1) * lineStep;
    const firstY = options.height / 2 - totalHeight / 2 + options.fontSize / 2;
    safeLines.forEach((line, lineIndex) => {
      const width = measuredTextWidth(ctx, line, options.letterSpacing);
      let x = options.width * 0.1;
      if (options.textAlign === "center") x = (options.width - width) / 2;
      if (options.textAlign === "right") x = options.width * 0.9 - width;
      Array.from(line).forEach((character) => {
        const characterWidth = ctx.measureText(character).width;
        runs.push({ character, x: x + characterWidth / 2, y: firstY + lineIndex * lineStep });
        x += characterWidth + options.letterSpacing;
      });
    });
    return runs;
  }

  function createNeonPaint(ctx, options) {
    if (!options.gradientEnabled) return options.primaryColor;
    const gradient = options.writingMode === "vertical"
      ? ctx.createLinearGradient(0, options.height * 0.2, 0, options.height * 0.8)
      : ctx.createLinearGradient(options.width * 0.15, 0, options.width * 0.85, 0);
    gradient.addColorStop(0, options.primaryColor);
    gradient.addColorStop(1, options.secondaryColor);
    return gradient;
  }

  function paintRuns(ctx, runs, method) {
    runs.forEach(({ character, x, y }) => ctx[method](character, x, y));
  }

  function drawNeonText(ctx, options, alpha) {
    const runs = createTextRuns(ctx, options);
    const paint = createNeonPaint(ctx, options);
    const strength = options.glowStrength / 100;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = textFont(options);
    ctx.lineJoin = "round";
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = paint;
    ctx.fillStyle = paint;

    if (strength > 0) {
      ctx.shadowColor = options.primaryColor;
      ctx.shadowBlur = options.glowSpread * 2;
      ctx.globalAlpha = alpha * strength * 0.32;
      ctx.lineWidth = options.tubeWidth * 3.2;
      paintRuns(ctx, runs, "strokeText");

      ctx.shadowColor = options.secondaryColor;
      ctx.shadowBlur = options.glowSpread;
      ctx.globalAlpha = alpha * strength * 0.7;
      ctx.lineWidth = options.tubeWidth * 2.1;
      paintRuns(ctx, runs, "strokeText");
    }

    ctx.shadowBlur = Math.max(1, options.glowSpread * 0.28);
    ctx.shadowColor = options.primaryColor;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = paint;
    ctx.lineWidth = options.tubeWidth * 1.55;
    paintRuns(ctx, runs, "strokeText");

    ctx.shadowBlur = 0;
    ctx.strokeStyle = mixWithWhite(options.primaryColor, 0.82);
    ctx.lineWidth = Math.max(1, options.tubeWidth * 0.34);
    paintRuns(ctx, runs, "strokeText");
    ctx.fillStyle = rgba(options.primaryColor, 0.17);
    paintRuns(ctx, runs, "fillText");
    ctx.restore();
  }

  function drawScene(ctx, options, timeMs = 0, forceOpaque = false) {
    drawBackground(ctx, options, forceOpaque);
    const alpha = flickerAlpha(options, timeMs);
    drawFrame(ctx, options, Math.min(1, alpha + 0.08));
    drawNeonText(ctx, options, alpha);
  }

  function scaledOptions(options, scale) {
    return {
      ...options,
      width: Math.max(1, Math.round(options.width * scale)),
      height: Math.max(1, Math.round(options.height * scale)),
      fontSize: options.fontSize * scale,
      letterSpacing: options.letterSpacing * scale,
      glowSpread: options.glowSpread * scale,
      tubeWidth: options.tubeWidth * scale,
    };
  }

  function buildCss(options) {
    const shadows = [
      `0 0 ${Math.max(1, Math.round(options.glowSpread * 0.2))}px ${options.primaryColor}`,
      `0 0 ${Math.max(2, Math.round(options.glowSpread * 0.55))}px ${options.primaryColor}`,
      `0 0 ${Math.max(3, Math.round(options.glowSpread))}px ${options.secondaryColor}`,
    ].join(",\n    ");
    const colorRules = options.gradientEnabled
      ? `background: linear-gradient(90deg, ${options.primaryColor}, ${options.secondaryColor});\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;`
      : `color: ${options.primaryColor};`;
    const animation = options.flickerEnabled ? "\n  animation: neon-flicker 2.4s infinite alternate;" : "";
    const keyframes = options.flickerEnabled
      ? `\n\n@keyframes neon-flicker {\n  0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; }\n  20%, 24%, 55% { opacity: .35; }\n}`
      : "";
    return `.neon-text {\n  ${colorRules}\n  font-family: ${FONT_FAMILIES[options.fontFamily]};\n  font-size: ${Math.round(options.fontSize)}px;\n  font-weight: ${options.fontWeight};\n  font-style: ${options.italic ? "italic" : "normal"};\n  letter-spacing: ${options.letterSpacing}px;\n  line-height: ${options.lineHeight};\n  text-align: ${options.textAlign};\n  writing-mode: ${options.writingMode === "vertical" ? "vertical-rl" : "horizontal-tb"};\n  text-shadow:\n    ${shadows};${animation}\n}${keyframes}`;
  }

  function refreshLabelsAndCss() {
    elements.fontSizeValue.textContent = `${Math.round(currentOptions.fontSize)}px`;
    elements.letterSpacingValue.textContent = `${currentOptions.letterSpacing}px`;
    elements.lineHeightValue.textContent = currentOptions.lineHeight.toFixed(2).replace(/0$/, "");
    elements.glowStrengthValue.textContent = `${Math.round(currentOptions.glowStrength)}%`;
    elements.glowSpreadValue.textContent = `${Math.round(currentOptions.glowSpread)}px`;
    elements.tubeWidthValue.textContent = `${Math.round(currentOptions.tubeWidth)}px`;
    elements.flickerSpeedValue.textContent = String(Math.round(currentOptions.flickerSpeed));
    elements.canvasSizeLabel.textContent = `${currentOptions.width} × ${currentOptions.height} px`;
    elements.liveIndicator.textContent = currentOptions.flickerEnabled ? "● LIVE" : "● STATIC";
    elements.liveIndicator.classList.toggle("is-static", !currentOptions.flickerEnabled);
    elements.secondaryColor.disabled = !currentOptions.gradientEnabled;
    elements.backgroundPresetButtons.forEach((button) => {
      const isSelected = button.dataset.neonBackgroundColor.toUpperCase() === currentOptions.backgroundColor.toUpperCase();
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
    elements.cssOutput.value = buildCss(currentOptions);
  }

  function renderPreview(timeMs = performance.now()) {
    if (elements.canvas.width !== currentOptions.width || elements.canvas.height !== currentOptions.height) {
      elements.canvas.width = currentOptions.width;
      elements.canvas.height = currentOptions.height;
    }
    drawScene(context, currentOptions, timeMs);
  }

  function stopAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  function animationLoop(timeMs) {
    renderPreview(timeMs);
    if (viewIsActive && currentOptions.flickerEnabled) {
      animationFrameId = requestAnimationFrame(animationLoop);
    } else {
      animationFrameId = 0;
    }
  }

  function restartPreview() {
    stopAnimation();
    refreshLabelsAndCss();
    renderPreview();
    if (viewIsActive && currentOptions.flickerEnabled) animationFrameId = requestAnimationFrame(animationLoop);
  }

  function updateFromControls() {
    currentOptions = readOptions();
    saveToBrowser(currentOptions);
    restartPreview();
    setStatus("");
  }

  function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function setBusy(busy, message = "") {
    exportInProgress = busy;
    [elements.downloadPng, elements.downloadWebp, elements.downloadSvg, elements.downloadWebm, elements.downloadGif].forEach((button) => {
      button.disabled = busy;
    });
    if (message) setStatus(message);
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportCanvas(options, forceOpaque = false) {
    const canvas = document.createElement("canvas");
    canvas.width = options.width;
    canvas.height = options.height;
    drawScene(canvas.getContext("2d"), { ...options, flickerEnabled: false }, 0, forceOpaque);
    return canvas;
  }

  function downloadRaster(type) {
    const canvas = exportCanvas(currentOptions, type === "image/jpeg");
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("画像の生成に失敗しました。", true);
        return;
      }
      const extension = type === "image/png" ? "png" : "webp";
      downloadBlob(blob, `neon-text.${extension}`);
      setStatus(`${extension.toUpperCase()}をダウンロードしました。`);
    }, type, 0.94);
  }

  function escapeXml(value) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]);
  }

  function svgBackground(options) {
    if (options.backgroundStyle === "transparent") return "";
    if (options.backgroundStyle === "brick") return `<rect width="100%" height="100%" fill="url(#brickPattern)"/>`;
    if (options.backgroundStyle === "wall") return `<rect width="100%" height="100%" fill="url(#wallGradient)"/>`;
    return `<rect width="100%" height="100%" fill="${options.backgroundColor}"/>`;
  }

  function svgText(options) {
    const paint = options.gradientEnabled ? "url(#neonGradient)" : options.primaryColor;
    const style = `font-family:${escapeXml(FONT_FAMILIES[options.fontFamily])};font-size:${options.fontSize}px;font-weight:${options.fontWeight};font-style:${options.italic ? "italic" : "normal"};letter-spacing:${options.letterSpacing}px`;
    const animationClass = options.flickerEnabled ? " animated" : "";
    if (options.writingMode === "vertical") {
      const lines = options.text.split(/\r?\n/);
      const gap = options.fontSize * options.lineHeight;
      const totalWidth = options.fontSize + Math.max(0, lines.length - 1) * gap;
      const firstX = options.width / 2 + totalWidth / 2 - options.fontSize / 2;
      return lines.map((line, index) => `<text class="neon${animationClass}" x="${firstX - index * gap}" y="50%" text-anchor="middle" dominant-baseline="middle" writing-mode="vertical-rl" style="${style}" fill="${paint}" stroke="${paint}" stroke-width="${options.tubeWidth * 1.3}">${escapeXml(line)}</text>`).join("");
    }
    const lines = options.text.split(/\r?\n/);
    const lineStep = options.fontSize * options.lineHeight;
    const totalHeight = options.fontSize + Math.max(0, lines.length - 1) * lineStep;
    const firstY = options.height / 2 - totalHeight / 2 + options.fontSize / 2;
    const anchor = options.textAlign === "left" ? "start" : options.textAlign === "right" ? "end" : "middle";
    const x = options.textAlign === "left" ? options.width * 0.1 : options.textAlign === "right" ? options.width * 0.9 : options.width / 2;
    return lines.map((line, index) => `<text class="neon${animationClass}" x="${x}" y="${firstY + index * lineStep}" text-anchor="${anchor}" dominant-baseline="middle" style="${style}" fill="${paint}" stroke="${paint}" stroke-width="${options.tubeWidth * 1.3}">${escapeXml(line)}</text>`).join("");
  }

  function buildSvg(options) {
    const brickWidth = Math.max(70, Math.round(options.width / 10));
    const brickHeight = Math.max(34, Math.round(brickWidth * 0.46));
    const margin = Math.max(24, Math.min(options.width, options.height) * 0.065);
    const frame = options.frameEnabled
      ? `<rect class="frame${options.flickerEnabled ? " animated" : ""}" x="${margin}" y="${margin}" width="${options.width - margin * 2}" height="${options.height - margin * 2}" rx="${margin * 0.45}" fill="none" stroke="${options.frameColor}" stroke-width="${options.tubeWidth * 1.35}"/>`
      : "";
    const animationCss = options.flickerEnabled ? ".animated{animation:flicker 2.4s infinite alternate}@keyframes flicker{0%,18%,22%,25%,53%,57%,100%{opacity:1}20%,24%,55%{opacity:.35}}" : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}">
  <defs>
    <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="${options.writingMode === "vertical" ? "1" : "0"}"><stop stop-color="${options.primaryColor}"/><stop offset="1" stop-color="${options.secondaryColor}"/></linearGradient>
    <radialGradient id="wallGradient"><stop stop-color="${options.backgroundColor}"/><stop offset="1" stop-color="#000"/></radialGradient>
    <pattern id="brickPattern" width="${brickWidth}" height="${brickHeight * 2}" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="${options.backgroundColor}"/><path d="M0 ${brickHeight}H${brickWidth} M0 0V${brickHeight} M${brickWidth / 2} ${brickHeight}V${brickHeight * 2}" stroke="#000" stroke-opacity=".45" stroke-width="3"/></pattern>
    <filter id="neonGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${Math.max(1, options.glowSpread * 0.34)}" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>.neon,.frame{filter:url(#neonGlow);stroke-linejoin:round}${animationCss}</style>
  </defs>
  ${svgBackground(options)}
  ${frame}
  ${svgText(options)}
</svg>`;
  }

  function downloadSvg() {
    const blob = new Blob([buildSvg(currentOptions)], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, "neon-text.svg");
    setStatus("SVGをダウンロードしました。点滅設定もSVG内に含まれます。");
  }

  function downloadProject() {
    const project = {
      app: PROJECT_APP_ID,
      version: PROJECT_VERSION,
      savedAt: new Date().toISOString(),
      settings: currentOptions,
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json;charset=utf-8" });
    downloadBlob(blob, "neon-text-project.json");
    setStatus("編集設定をJSONファイルへ保存しました。");
  }

  async function loadProject(file) {
    if (!file) return;
    if (file.size > MAX_PROJECT_FILE_BYTES) {
      setStatus("設定ファイルが大きすぎます。1MB以下のJSONを選択してください。", true);
      return;
    }
    try {
      const project = JSON.parse(await file.text());
      if (project?.app !== PROJECT_APP_ID || project.version !== PROJECT_VERSION || !project.settings) {
        throw new Error("対応していない設定ファイルです");
      }
      const loadedOptions = normalizeOptions(project.settings);
      setControls(loadedOptions);
      currentOptions = readOptions();
      saveToBrowser(currentOptions);
      restartPreview();
      setStatus(`「${file.name}」から編集設定を読み込みました。`);
    } catch (error) {
      setStatus(`設定を読み込めませんでした: ${error.message}`, true);
    }
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const temporary = document.createElement("textarea");
    temporary.value = value;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
  }

  async function copyCss() {
    try {
      await copyText(elements.cssOutput.value);
      setStatus("生成したCSSをコピーしました。");
    } catch {
      setStatus("CSSをコピーできませんでした。表示欄から手動でコピーしてください。", true);
    }
  }

  function chooseWebmMimeType() {
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  async function downloadWebm() {
    if (exportInProgress) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      setStatus("このブラウザはWebM生成に対応していません。ChromeまたはEdgeをお試しください。", true);
      return;
    }
    setBusy(true, "WebMを生成しています…");
    const canvas = document.createElement("canvas");
    canvas.width = currentOptions.width;
    canvas.height = currentOptions.height;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(30);
    const mimeType = chooseWebmMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size) chunks.push(event.data);
    });
    const stopped = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
    recorder.start();
    const start = performance.now();
    await new Promise((resolve) => {
      const renderFrame = (time) => {
        drawScene(ctx, currentOptions, time - start);
        if (time - start < 3000) requestAnimationFrame(renderFrame);
        else resolve();
      };
      requestAnimationFrame(renderFrame);
    });
    recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
    downloadBlob(new Blob(chunks, { type: mimeType || "video/webm" }), "neon-text.webm");
    setBusy(false);
    setStatus("3秒のWebMをダウンロードしました。");
  }

  function pushWord(bytes, value) {
    bytes.push(value & 0xff, (value >> 8) & 0xff);
  }

  function pushString(bytes, value) {
    for (const character of value) bytes.push(character.charCodeAt(0));
  }

  function buildGifPalette() {
    const palette = [];
    for (let index = 0; index < 256; index += 1) {
      const red = (index >> 5) & 7;
      const green = (index >> 2) & 7;
      const blue = index & 3;
      palette.push(Math.round(red * 255 / 7), Math.round(green * 255 / 7), Math.round(blue * 255 / 3));
    }
    return palette;
  }

  function imageDataToPaletteIndexes(imageData) {
    const result = new Uint8Array(imageData.width * imageData.height);
    const data = imageData.data;
    for (let pixel = 0, output = 0; pixel < data.length; pixel += 4, output += 1) {
      result[output] = ((data[pixel] >> 5) << 5) | ((data[pixel + 1] >> 5) << 2) | (data[pixel + 2] >> 6);
    }
    return result;
  }

  function lzwEncode(indexes) {
    const minimumCodeSize = 8;
    const clearCode = 1 << minimumCodeSize;
    const endCode = clearCode + 1;
    const bytes = [];
    let accumulator = 0;
    let bitCount = 0;
    const codeSize = minimumCodeSize + 1;

    const writeCode = (code) => {
      accumulator |= code << bitCount;
      bitCount += codeSize;
      while (bitCount >= 8) {
        bytes.push(accumulator & 0xff);
        accumulator >>>= 8;
        bitCount -= 8;
      }
    };

    writeCode(clearCode);
    let codesSinceClear = 0;
    for (const paletteIndex of indexes) {
      if (codesSinceClear === 254) {
        writeCode(clearCode);
        codesSinceClear = 0;
      }
      writeCode(paletteIndex);
      codesSinceClear += 1;
    }
    writeCode(endCode);
    if (bitCount > 0) bytes.push(accumulator & 0xff);
    return bytes;
  }

  function appendGifFrame(bytes, indexes, width, height, delay) {
    bytes.push(0x21, 0xf9, 0x04, 0x04);
    pushWord(bytes, delay);
    bytes.push(0x00, 0x00);
    bytes.push(0x2c);
    pushWord(bytes, 0);
    pushWord(bytes, 0);
    pushWord(bytes, width);
    pushWord(bytes, height);
    bytes.push(0x00, 0x08);
    const compressed = lzwEncode(indexes);
    for (let offset = 0; offset < compressed.length; offset += 255) {
      const block = compressed.slice(offset, offset + 255);
      bytes.push(block.length, ...block);
    }
    bytes.push(0x00);
  }

  async function downloadGif() {
    if (exportInProgress) return;
    setBusy(true, "GIFを生成しています… しばらくお待ちください。");
    try {
      const edgeScale = Math.min(1, 720 / Math.max(currentOptions.width, currentOptions.height));
      const pixelScale = Math.min(1, Math.sqrt(250000 / (currentOptions.width * currentOptions.height)));
      const scale = Math.min(edgeScale, pixelScale);
      const options = scaledOptions(currentOptions, scale);
      const canvas = document.createElement("canvas");
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const bytes = [];
      pushString(bytes, "GIF89a");
      pushWord(bytes, options.width);
      pushWord(bytes, options.height);
      bytes.push(0xf7, 0x00, 0x00, ...buildGifPalette());
      bytes.push(0x21, 0xff, 0x0b);
      pushString(bytes, "NETSCAPE2.0");
      bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);

      const frameCount = 24;
      for (let frame = 0; frame < frameCount; frame += 1) {
        drawScene(ctx, options, frame * 125, true);
        const imageData = ctx.getImageData(0, 0, options.width, options.height);
        appendGifFrame(bytes, imageDataToPaletteIndexes(imageData), options.width, options.height, 13);
        if (frame % 3 === 2) {
          setStatus(`GIFを生成しています… ${Math.round((frame + 1) / frameCount * 100)}%`);
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
      }
      bytes.push(0x3b);
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "image/gif" }), "neon-text.gif");
      const resized = scale < 1 ? `（${options.width} × ${options.height}px）` : "";
      setStatus(`3秒のGIFをダウンロードしました${resized}。`);
    } catch (error) {
      setStatus(`GIFを生成できませんでした: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  }

  function applyPreset() {
    const preset = PRESETS[elements.preset.value] || PRESETS.electric;
    elements.primaryColor.value = preset.primary;
    elements.secondaryColor.value = preset.secondary;
    elements.backgroundColor.value = preset.background;
    elements.frameColor.value = preset.frame;
    elements.backgroundStyle.value = preset.backgroundStyle;
    updateFromControls();
  }

  function setControls(values) {
    elements.text.value = values.text;
    elements.preset.value = values.preset;
    elements.fontFamily.value = values.fontFamily;
    elements.fontSize.value = values.fontSize;
    elements.fontWeight.value = values.fontWeight;
    elements.letterSpacing.value = values.letterSpacing;
    elements.lineHeight.value = values.lineHeight;
    elements.textAlign.value = values.textAlign;
    elements.writingMode.value = values.writingMode;
    elements.italic.checked = values.italic;
    elements.primaryColor.value = values.primaryColor;
    elements.secondaryColor.value = values.secondaryColor;
    elements.gradientEnabled.checked = values.gradientEnabled;
    elements.glowStrength.value = values.glowStrength;
    elements.glowSpread.value = values.glowSpread;
    elements.tubeWidth.value = values.tubeWidth;
    elements.backgroundStyle.value = values.backgroundStyle;
    elements.backgroundColor.value = values.backgroundColor;
    elements.canvasWidth.value = values.width;
    elements.canvasHeight.value = values.height;
    elements.frameEnabled.checked = values.frameEnabled;
    elements.frameColor.value = values.frameColor;
    elements.flickerEnabled.checked = values.flickerEnabled;
    elements.flickerSpeed.value = values.flickerSpeed;
  }

  function resetControls() {
    setControls(DEFAULTS);
    currentOptions = readOptions();
    saveToBrowser(currentOptions);
    restartPreview();
    setStatus("設定を初期状態に戻しました。");
  }

  function exportSiteData() {
    return { settings: currentOptions };
  }

  function importSiteData(data) {
    if (!data || typeof data !== "object" || !data.settings) throw new Error("ネオン文字データが不正です");
    const options = normalizeOptions(data.settings);
    setControls(options);
    currentOptions = readOptions();
    saveToBrowser(currentOptions);
    restartPreview();
    setStatus("サイト全体バックアップからネオン設定を復元しました。");
  }

  const liveControls = [
    elements.text, elements.fontFamily, elements.fontSize, elements.fontWeight, elements.letterSpacing,
    elements.lineHeight, elements.textAlign, elements.writingMode, elements.italic, elements.primaryColor,
    elements.secondaryColor, elements.gradientEnabled, elements.glowStrength, elements.glowSpread,
    elements.tubeWidth, elements.backgroundStyle, elements.backgroundColor, elements.canvasWidth,
    elements.canvasHeight, elements.frameEnabled, elements.frameColor, elements.flickerEnabled,
    elements.flickerSpeed,
  ];
  liveControls.forEach((control) => control.addEventListener("input", updateFromControls));
  elements.backgroundPresetButtons.forEach((button) => button.addEventListener("click", () => {
    elements.backgroundColor.value = button.dataset.neonBackgroundColor;
    if (elements.backgroundStyle.value === "transparent") elements.backgroundStyle.value = "solid";
    updateFromControls();
  }));
  elements.preset.addEventListener("change", applyPreset);
  elements.downloadPng.addEventListener("click", () => downloadRaster("image/png"));
  elements.downloadWebp.addEventListener("click", () => downloadRaster("image/webp"));
  elements.downloadSvg.addEventListener("click", downloadSvg);
  elements.downloadWebm.addEventListener("click", () => downloadWebm().catch((error) => {
    setBusy(false);
    setStatus(`WebMを生成できませんでした: ${error.message}`, true);
  }));
  elements.downloadGif.addEventListener("click", downloadGif);
  elements.downloadProject.addEventListener("click", downloadProject);
  elements.projectFileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    loadProject(file);
    event.target.value = "";
  });
  elements.copyCss.addEventListener("click", copyCss);
  elements.reset.addEventListener("click", resetControls);
  window.addEventListener("yaa:viewchange", (event) => {
    viewIsActive = event.detail.view === "neonText";
    restartPreview();
  });

  const storedOptions = loadFromBrowser();
  setControls(storedOptions || DEFAULTS);
  currentOptions = readOptions();
  restartPreview();
  if (storedOptions) setStatus("前回の編集設定をこのブラウザから復元しました。");
  window.YaaSiteData?.register("neonText", { exportData: exportSiteData, importData: importSiteData });
})();
