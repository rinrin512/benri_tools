(() => {
  "use strict";

  const PAPER_SIZES = {
    a4: { label: "A4", width: 210, height: 297 },
    a3: { label: "A3", width: 297, height: 420 },
    b5: { label: "B5", width: 182, height: 257 },
    postcard: { label: "はがき", width: 100, height: 148 },
  };
  const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  const CONVERTER_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
  const CONVERTER_TEXT_EXTENSIONS = new Set(["txt", "csv", "json", "md", "html", "htm"]);
  const CORRECTION_STORAGE_KEY = "actual-size-print-printer-correction-v1";
  const SCRIPT_UPPER_CODE_POINTS = [
    0x1d49c, 0x212c, 0x1d49e, 0x1d49f, 0x2130, 0x2131, 0x1d4a2, 0x210b, 0x2110, 0x1d4a5,
    0x1d4a6, 0x2112, 0x2133, 0x1d4a9, 0x1d4aa, 0x1d4ab, 0x1d4ac, 0x211b, 0x1d4ae, 0x1d4af,
    0x1d4b0, 0x1d4b1, 0x1d4b2, 0x1d4b3, 0x1d4b4, 0x1d4b5,
  ];
  const SCRIPT_LOWER_CODE_POINTS = [
    0x1d4b6, 0x1d4b7, 0x1d4b8, 0x1d4b9, 0x212f, 0x1d4bb, 0x210a, 0x1d4bd, 0x1d4be, 0x1d4bf,
    0x1d4c0, 0x1d4c1, 0x1d4c2, 0x1d4c3, 0x2134, 0x1d4c5, 0x1d4c6, 0x1d4c7, 0x1d4c8, 0x1d4c9,
    0x1d4ca, 0x1d4cb, 0x1d4cc, 0x1d4cd, 0x1d4ce, 0x1d4cf,
  ];
  const CURSIVE_MAP = Object.fromEntries([
    ...SCRIPT_UPPER_CODE_POINTS.map((codePoint, index) => [String.fromCharCode(65 + index), String.fromCodePoint(codePoint)]),
    ...SCRIPT_LOWER_CODE_POINTS.map((codePoint, index) => [String.fromCharCode(97 + index), String.fromCodePoint(codePoint)]),
  ]);

  const elements = {
    homeView: document.querySelector("#homeView"),
    homeIntro: document.querySelector("#homeIntro"),
    categorySelector: document.querySelector("#categorySelector"),
    lifeCategory: document.querySelector("#lifeCategory"),
    productivityCategory: document.querySelector("#productivityCategory"),
    showLifeCategoryButton: document.querySelector("#showLifeCategoryButton"),
    showProductivityCategoryButton: document.querySelector("#showProductivityCategoryButton"),
    printFeatureView: document.querySelector("#printFeatureView"),
    characterCountView: document.querySelector("#characterCountView"),
    md5View: document.querySelector("#md5View"),
    notepadView: document.querySelector("#notepadView"),
    cursiveView: document.querySelector("#cursiveView"),
    converterView: document.querySelector("#converterView"),
    cropperView: document.querySelector("#cropperView"),
    colorPickerView: document.querySelector("#colorPickerView"),
    composerView: document.querySelector("#composerView"),
    neonTextView: document.querySelector("#neonTextView"),
    holidayCountdownView: document.querySelector("#holidayCountdownView"),
    wakeTimeView: document.querySelector("#wakeTimeView"),
    settingsView: document.querySelector("#settingsView"),
    homeButton: document.querySelector("#homeButton"),
    openPrintButton: document.querySelector("#openPrintButton"),
    openCharacterCountButton: document.querySelector("#openCharacterCountButton"),
    openMd5Button: document.querySelector("#openMd5Button"),
    openNotepadButton: document.querySelector("#openNotepadButton"),
    openCursiveButton: document.querySelector("#openCursiveButton"),
    openCursiveLifeButton: document.querySelector("#openCursiveLifeButton"),
    openConverterButton: document.querySelector("#openConverterButton"),
    openCropperButton: document.querySelector("#openCropperButton"),
    openColorPickerButton: document.querySelector("#openColorPickerButton"),
    openComposerButton: document.querySelector("#openComposerButton"),
    openNeonTextButton: document.querySelector("#openNeonTextButton"),
    openHolidayCountdownButton: document.querySelector("#openHolidayCountdownButton"),
    openWakeTimeButton: document.querySelector("#openWakeTimeButton"),
    openSettingsButton: document.querySelector("#openSettingsButton"),
    dropZone: document.querySelector("#dropZone"),
    fileInput: document.querySelector("#fileInput"),
    fileStatus: document.querySelector("#fileStatus"),
    imageList: document.querySelector("#imageList"),
    paperSize: document.querySelector("#paperSize"),
    orientation: document.querySelector("#orientation"),
    correctionSpecifiedInput: document.querySelector("#correctionSpecifiedInput"),
    correctionMeasuredInput: document.querySelector("#correctionMeasuredInput"),
    correctionEnabled: document.querySelector("#correctionEnabled"),
    correctionResult: document.querySelector("#correctionResult"),
    correctionError: document.querySelector("#correctionError"),
    noSelection: document.querySelector("#noSelection"),
    selectedControls: document.querySelector("#selectedControls"),
    selectedName: document.querySelector("#selectedName"),
    effectiveSize: document.querySelector("#effectiveSize"),
    widthInput: document.querySelector("#widthInput"),
    heightInput: document.querySelector("#heightInput"),
    lockAspect: document.querySelector("#lockAspect"),
    xInput: document.querySelector("#xInput"),
    yInput: document.querySelector("#yInput"),
    positionSelect: document.querySelector("#positionSelect"),
    applyPositionButton: document.querySelector("#applyPositionButton"),
    duplicateButton: document.querySelector("#duplicateButton"),
    deleteButton: document.querySelector("#deleteButton"),
    copyCount: document.querySelector("#copyCount"),
    addCopiesButton: document.querySelector("#addCopiesButton"),
    autoArrangeButton: document.querySelector("#autoArrangeButton"),
    downloadButton: document.querySelector("#downloadButton"),
    paperSummary: document.querySelector("#paperSummary"),
    previewPaper: document.querySelector("#previewPaper"),
    overflowWarning: document.querySelector("#overflowWarning"),
    statusMessage: document.querySelector("#statusMessage"),
    characterText: document.querySelector("#characterText"),
    countAll: document.querySelector("#countAll"),
    countNoSpace: document.querySelector("#countNoSpace"),
    countLines: document.querySelector("#countLines"),
    countBytes: document.querySelector("#countBytes"),
    cursiveInput: document.querySelector("#cursiveInput"),
    cursiveOutput: document.querySelector("#cursiveOutput"),
    copyCursiveButton: document.querySelector("#copyCursiveButton"),
    converterDropZone: document.querySelector("#converterDropZone"),
    converterFileInput: document.querySelector("#converterFileInput"),
    converterFileName: document.querySelector("#converterFileName"),
    converterFileMeta: document.querySelector("#converterFileMeta"),
    converterOutputFormat: document.querySelector("#converterOutputFormat"),
    converterDownloadButton: document.querySelector("#converterDownloadButton"),
    converterStatus: document.querySelector("#converterStatus"),
  };

  const state = {
    items: [],
    selectedId: null,
    nextId: 1,
    paperKey: "a4",
    orientation: "portrait",
    converterFile: null,
    correction: {
      specified: "",
      measured: "",
      multiplier: 1,
      enabled: false,
      valid: false,
      interacted: false,
    },
  };

  function loadCorrection() {
    try {
      const saved = JSON.parse(localStorage.getItem(CORRECTION_STORAGE_KEY) || "null");
      if (!saved) return;
      state.correction.specified = typeof saved.specified === "string" ? saved.specified : "";
      state.correction.measured = typeof saved.measured === "string" ? saved.measured : "";
      state.correction.enabled = Boolean(saved.enabled);
      state.correction.interacted = state.correction.enabled || Boolean(state.correction.specified || state.correction.measured);
      validateCorrection(false);
    } catch {
      // localStorageが使えない環境では、補正をセッション内だけで扱います。
    }
  }

  function saveCorrection() {
    try {
      localStorage.setItem(CORRECTION_STORAGE_KEY, JSON.stringify({
        specified: state.correction.specified,
        measured: state.correction.measured,
        enabled: state.correction.enabled,
      }));
    } catch {
      // 保存できない環境でも印刷機能自体は継続します。
    }
  }

  function correctionErrorMessage() {
    const specified = Number(state.correction.specified);
    const measured = Number(state.correction.measured);
    if (!state.correction.specified.trim() || !Number.isFinite(specified) || specified <= 0) return "指定した長さは0より大きい数値で入力してください。";
    if (!state.correction.measured.trim() || !Number.isFinite(measured) || measured <= 0) return "実測した長さは0より大きい数値で入力してください。";
    return "";
  }

  function validateCorrection(showError = true) {
    const error = correctionErrorMessage();
    state.correction.valid = error === "";
    state.correction.multiplier = state.correction.valid
      ? Number(state.correction.specified) / Number(state.correction.measured)
      : 1;
    const shouldShowError = showError && state.correction.interacted && Boolean(error);
    elements.correctionError.hidden = !shouldShowError;
    elements.correctionError.textContent = shouldShowError ? error : "";
    elements.correctionResult.textContent = state.correction.valid
      ? `補正倍率：${state.correction.multiplier.toFixed(6)}倍${state.correction.enabled ? "（有効）" : "（OFF）"}`
      : "補正倍率：計算できません";
    elements.correctionResult.style.color = state.correction.valid ? "#175cd3" : "#b42318";
    return state.correction.valid;
  }

  function correctionMultiplier() {
    return state.correction.enabled && state.correction.valid ? state.correction.multiplier : 1;
  }

  function correctedDimensions(item) {
    const multiplier = correctionMultiplier();
    return { widthMm: item.widthMm * multiplier, heightMm: item.heightMm * multiplier };
  }

  function currentPaper() {
    const base = PAPER_SIZES[state.paperKey];
    return state.orientation === "portrait"
      ? base
      : { ...base, width: base.height, height: base.width };
  }

  function selectedItem() {
    return state.items.find((item) => item.id === state.selectedId) || null;
  }

  function formatMm(value) {
    const rounded = Math.round(Number(value) * 100) / 100;
    return Object.is(rounded, -0) ? "0" : rounded.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
  }

  function setStatus(message, isError = false) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.style.color = isError ? "#b42318" : "#067647";
  }

  function showView(view) {
    const isHome = view === "home";
    const isPrint = view === "print";
    elements.homeView.hidden = !isHome;
    elements.printFeatureView.hidden = !isPrint;
    elements.characterCountView.hidden = view !== "characterCount";
    elements.md5View.hidden = view !== "md5";
    elements.notepadView.hidden = view !== "notepad";
    elements.cursiveView.hidden = view !== "cursive";
    elements.converterView.hidden = view !== "converter";
    elements.cropperView.hidden = view !== "cropper";
    elements.colorPickerView.hidden = view !== "colorPicker";
    elements.composerView.hidden = view !== "composer";
    elements.neonTextView.hidden = view !== "neonText";
    elements.settingsView.hidden = view !== "settings";
    elements.holidayCountdownView.hidden = view !== "holidayCountdown";
    elements.wakeTimeView.hidden = view !== "wakeTime";
    elements.homeButton.hidden = isHome;
    if (isHome) document.title = "yaa-site | 便利ツール";
    if (isPrint) document.title = "actual-size-print | 実寸画像印刷";
    if (view === "characterCount") document.title = "yaa-site | 文字数カウント";
    if (view === "md5") document.title = "yaa-site | MD5ハッシュ生成";
    if (view === "notepad") document.title = "yaa-site | メモ帳";
    if (view === "cursive") document.title = "yaa-site | 英語筆記体変換";
    if (view === "converter") document.title = "yaa-site | ファイル形式変換";
    if (view === "cropper") document.title = "yaa-site | 画像トリミング";
    if (view === "colorPicker") document.title = "yaa-site | 画像カラー抽出";
    if (view === "composer") document.title = "yaa-site | 画像合成・編集";
    if (view === "neonText") document.title = "yaa-site | ネオン文字生成";
    if (view === "settings") document.title = "yaa-site | 設定";
    if (view === "holidayCountdown") document.title = "yaa-site | 次の連休カウントダウン";
    if (view === "wakeTime") document.title = "yaa-site | 明日の起床時間";
    window.YaaI18n?.refresh();
    window.dispatchEvent(new CustomEvent("yaa:viewchange", { detail: { view } }));
  }

  function showHomeCategory(category) {
    const isCategoryPage = category === "life" || category === "productivity";
    elements.homeIntro.hidden = isCategoryPage;
    elements.categorySelector.hidden = isCategoryPage;
    elements.lifeCategory.hidden = category !== "life";
    elements.productivityCategory.hidden = category !== "productivity";
    elements.homeButton.hidden = !isCategoryPage;
    elements.homeView.classList.toggle("is-category-page", isCategoryPage);
    if (category === "life") document.title = "yaa-site | 生活機能";
    if (category === "productivity") document.title = "yaa-site | 効率化機能";
    if (!isCategoryPage) document.title = "yaa-site | 便利ツール";
    window.YaaI18n?.refresh();
  }

  function updateCharacterCount() {
    const text = elements.characterText.value;
    const characters = Array.from(text);
    const charactersWithoutSpace = characters.filter((character) => !/\s/u.test(character));
    elements.countAll.textContent = characters.length.toLocaleString("ja-JP");
    elements.countNoSpace.textContent = charactersWithoutSpace.length.toLocaleString("ja-JP");
    elements.countLines.textContent = text.length === 0 ? "0" : String(text.split(/\r\n|\r|\n/).length);
    elements.countBytes.textContent = new TextEncoder().encode(text).length.toLocaleString("ja-JP");
  }

  function updateCursiveOutput() {
    elements.cursiveOutput.value = Array.from(elements.cursiveInput.value, (character) => CURSIVE_MAP[character] || character).join("");
  }

  async function copyCursiveOutput() {
    if (elements.cursiveOutput.value.length === 0) {
      setStatus("コピーする変換結果がありません。", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(elements.cursiveOutput.value);
      setStatus("変換結果をクリップボードへコピーしました。");
    } catch {
      elements.cursiveOutput.focus();
      elements.cursiveOutput.select();
      setStatus("自動コピーできませんでした。選択状態なのでCtrl+Cでコピーしてください。", true);
    }
  }

  function converterExtension(fileName) {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function converterBaseName(fileName) {
    return fileName.replace(/\.[^/.]+$/, "") || "converted-file";
  }

  function setConverterOptions(kind) {
    const options = kind === "image"
      ? [["png", "PNG画像"], ["jpeg", "JPG画像"], ["webp", "WebP画像"]]
      : [["txt", "プレーンテキスト（TXT）"], ["html", "HTML（テキスト）"], ["json", "JSON（textプロパティ）"]];
    elements.converterOutputFormat.replaceChildren();
    options.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      elements.converterOutputFormat.append(option);
    });
    elements.converterOutputFormat.disabled = false;
    elements.converterDownloadButton.disabled = false;
  }

  function isConverterImage(file) {
    return CONVERTER_IMAGE_TYPES.has(file.type) || file.name.toLowerCase().endsWith(".svg");
  }

  async function loadConverterFile(file) {
    const extension = converterExtension(file.name);
    const isImage = isConverterImage(file);
    const isText = file.type.startsWith("text/") || CONVERTER_TEXT_EXTENSIONS.has(extension);
    if (!isImage && !isText) {
      elements.converterStatus.textContent = "対応していない形式です。画像またはテキストファイルを選択してください。";
      elements.converterStatus.style.color = "#b42318";
      return;
    }
    try {
      if (isImage) {
        const loaded = await readImageFile(file);
        state.converterFile = { file, kind: "image", dataUrl: loaded.dataUrl, format: loaded.format, width: loaded.naturalWidth, height: loaded.naturalHeight };
        elements.converterFileMeta.textContent = `${loaded.naturalWidth} × ${loaded.naturalHeight}px。PNG / JPG / WebPへ変換できます。`;
        setConverterOptions("image");
      } else {
        state.converterFile = { file, kind: "text", text: await readAsText(file) };
        elements.converterFileMeta.textContent = "TXT / HTML / JSONへ変換できます。文字コードはUTF-8として読み込みます。";
        setConverterOptions("text");
      }
      elements.converterFileName.textContent = file.name;
      elements.converterStatus.textContent = "変換先を選択してダウンロードしてください。";
      elements.converterStatus.style.color = "#067647";
    } catch (error) {
      state.converterFile = null;
      elements.converterOutputFormat.disabled = true;
      elements.converterDownloadButton.disabled = true;
      elements.converterStatus.textContent = error.message;
      elements.converterStatus.style.color = "#b42318";
    }
  }

  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`${file.name}を読み込めませんでした。`));
      reader.readAsText(file, "UTF-8");
    });
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function convertAndDownload() {
    const converterFile = state.converterFile;
    if (!converterFile) return;
    const outputFormat = elements.converterOutputFormat.value;
    const baseName = converterBaseName(converterFile.file.name);
    try {
      if (converterFile.kind === "text") {
        let content = converterFile.text;
        let mimeType = "text/plain;charset=utf-8";
        if (outputFormat === "html") {
          content = `<!doctype html>\n<html lang="ja">\n<head><meta charset="utf-8"><title>${escapeHtml(baseName)}</title></head>\n<body><pre>${escapeHtml(converterFile.text)}</pre></body>\n</html>`;
          mimeType = "text/html;charset=utf-8";
        } else if (outputFormat === "json") {
          content = JSON.stringify({ text: converterFile.text }, null, 2);
          mimeType = "application/json;charset=utf-8";
        }
        downloadBlob(new Blob([content], { type: mimeType }), `${baseName}.${outputFormat}`);
      } else {
        const image = await new Promise((resolve, reject) => {
          const element = new Image();
          element.onload = () => resolve(element);
          element.onerror = () => reject(new Error("画像を変換できませんでした。"));
          element.src = converterFile.dataUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = converterFile.width;
        canvas.height = converterFile.height;
        const context = canvas.getContext("2d");
        if (outputFormat === "jpeg") {
          context.fillStyle = "#fff";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(image, 0, 0);
        const mimeType = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[outputFormat];
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
        if (!blob) throw new Error("画像の変換に失敗しました。");
        downloadBlob(blob, `${baseName}.${outputFormat === "jpeg" ? "jpg" : outputFormat}`);
      }
      elements.converterStatus.textContent = "変換してダウンロードしました。";
      elements.converterStatus.style.color = "#067647";
    } catch (error) {
      elements.converterStatus.textContent = error.message;
      elements.converterStatus.style.color = "#b42318";
    }
  }

  function getNumericInput(input) {
    const value = Number(input.value);
    return Number.isFinite(value) ? value : null;
  }

  function isOverflowing(item, paper = currentPaper()) {
    const dimensions = correctedDimensions(item);
    return item.xMm < 0 || item.yMm < 0 || item.xMm + dimensions.widthMm > paper.width || item.yMm + dimensions.heightMm > paper.height;
  }

  function overflowMessages(paper = currentPaper()) {
    return state.items
      .filter((item) => isOverflowing(item, paper))
      .map((item) => {
        const sides = [];
        if (item.xMm < 0) sides.push("左");
        if (item.yMm < 0) sides.push("上");
        const dimensions = correctedDimensions(item);
        if (item.xMm + dimensions.widthMm > paper.width) sides.push("右");
        if (item.yMm + dimensions.heightMm > paper.height) sides.push("下");
        return `${item.name}（${sides.join("・")}）`;
      });
  }

  function updateOverflowWarning() {
    const messages = overflowMessages();
    if (messages.length === 0) {
      elements.overflowWarning.hidden = true;
      elements.overflowWarning.textContent = "";
      return;
    }
    elements.overflowWarning.hidden = false;
    elements.overflowWarning.textContent = `用紙範囲外の画像があります：${messages.join("、")}。赤い枠の部分はPDFでも用紙外にはみ出します。`;
  }

  function updatePreviewVisuals() {
    const paper = currentPaper();
    elements.previewPaper.style.setProperty("--paper-width-mm", paper.width);
    elements.previewPaper.style.setProperty("--paper-height-mm", paper.height);
    elements.previewPaper.style.aspectRatio = `${paper.width} / ${paper.height}`;
    elements.previewPaper.querySelectorAll(".preview-item").forEach((node) => {
      const item = state.items.find((candidate) => candidate.id === Number(node.dataset.id));
      if (!item) return;
      const dimensions = correctedDimensions(item);
      node.style.setProperty("--x-mm", item.xMm);
      node.style.setProperty("--y-mm", item.yMm);
      node.style.setProperty("--width-mm", dimensions.widthMm);
      node.style.setProperty("--height-mm", dimensions.heightMm);
      node.classList.toggle("is-selected", item.id === state.selectedId);
      node.classList.toggle("is-overflowing", isOverflowing(item, paper));
    });
  }

  function syncSelectedControls() {
    const item = selectedItem();
    const hasSelection = Boolean(item);
    elements.noSelection.hidden = hasSelection;
    elements.selectedControls.hidden = !hasSelection;
    if (!item) return;
    elements.selectedName.textContent = item.name;
    const dimensions = correctedDimensions(item);
    elements.effectiveSize.textContent = correctionMultiplier() === 1
      ? `PDF出力サイズ：${formatMm(dimensions.widthMm)} × ${formatMm(dimensions.heightMm)} mm`
      : `PDF出力サイズ（補正後）：${formatMm(dimensions.widthMm)} × ${formatMm(dimensions.heightMm)} mm`;
    elements.widthInput.value = formatMm(item.widthMm);
    elements.heightInput.value = formatMm(item.heightMm);
    elements.xInput.value = formatMm(item.xMm);
    elements.yInput.value = formatMm(item.yMm);
    elements.positionSelect.value = "custom";
  }

  function renderImageList() {
    elements.imageList.replaceChildren();
    state.items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `image-card${item.id === state.selectedId ? " is-selected" : ""}`;
      button.dataset.id = item.id;
      button.setAttribute("aria-label", `${item.name}を選択`);

      const thumbnail = document.createElement("img");
      thumbnail.src = item.dataUrl;
      thumbnail.alt = "";
      const details = document.createElement("span");
      const name = document.createElement("span");
      name.className = "image-card-name";
      name.textContent = item.name;
      const meta = document.createElement("span");
      meta.className = "image-card-meta";
      const dimensions = correctedDimensions(item);
      meta.textContent = `${formatMm(item.widthMm)} × ${formatMm(item.heightMm)} mm（出力 ${formatMm(dimensions.widthMm)} × ${formatMm(dimensions.heightMm)}）`;
      details.append(name, document.createElement("br"), meta);
      const number = document.createElement("span");
      number.className = "image-card-index";
      number.textContent = `#${index + 1}`;
      button.append(thumbnail, details, number);
      elements.imageList.append(button);
    });
  }

  function renderPreviewItems() {
    elements.previewPaper.replaceChildren();
    state.items.forEach((item) => {
      const node = document.createElement("div");
      node.className = "preview-item";
      node.dataset.id = item.id;
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-label", `${item.name}。ドラッグして配置`);
      const image = document.createElement("img");
      image.src = item.dataUrl;
      image.alt = item.name;
      image.draggable = false;
      const label = document.createElement("span");
      label.className = "preview-item-label";
      label.textContent = item.name;
      node.append(image, label);
      elements.previewPaper.append(node);
    });
    updatePreviewVisuals();
  }

  function render() {
    const paper = currentPaper();
    elements.paperSummary.textContent = `${paper.label}・${state.orientation === "portrait" ? "縦" : "横"} — ${paper.width} × ${paper.height} mm`;
    renderImageList();
    renderPreviewItems();
    syncSelectedControls();
    updateOverflowWarning();
    elements.downloadButton.disabled = state.items.length === 0;
    elements.fileStatus.textContent = state.items.length === 0
      ? "画像を追加すると、ここに一覧が表示されます。"
      : `${state.items.length}枚を配置中。画像を選択して寸法・座標を編集できます。`;
  }

  function centerItem(item, paper = currentPaper()) {
    const dimensions = correctedDimensions(item);
    item.xMm = (paper.width - dimensions.widthMm) / 2;
    item.yMm = (paper.height - dimensions.heightMm) / 2;
  }

  function createItem(file, dataUrl, naturalWidth, naturalHeight, format) {
    const aspectRatio = naturalWidth / naturalHeight;
    const widthMm = Math.min(50, currentPaper().width - 20);
    const item = {
      id: state.nextId++,
      name: file.name,
      dataUrl,
      format,
      aspectRatio,
      widthMm,
      heightMm: widthMm / aspectRatio,
      xMm: 0,
      yMm: 0,
    };
    centerItem(item);
    return item;
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`${file.name}を読み込めませんでした。`));
      reader.readAsDataURL(file);
    });
  }

  async function readImageFile(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error(`${file.name}は画像として読み込めませんでした。`));
        element.src = objectUrl;
      });
      let dataUrl;
      let format = "PNG";
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        dataUrl = canvas.toDataURL("image/png");
      } catch {
        dataUrl = await readAsDataUrl(file);
        format = file.type === "image/jpeg" ? "JPEG" : file.type === "image/webp" ? "WEBP" : "PNG";
      }
      return { dataUrl, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, format };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList).filter((file) => SUPPORTED_TYPES.has(file.type));
    const rejected = Array.from(fileList).filter((file) => !SUPPORTED_TYPES.has(file.type));
    if (rejected.length > 0) setStatus(`対応形式ではないファイルを${rejected.length}件スキップしました。`, true);
    for (const file of files) {
      try {
        const loaded = await readImageFile(file);
        const item = createItem(file, loaded.dataUrl, loaded.naturalWidth, loaded.naturalHeight, loaded.format);
        state.items.push(item);
        state.selectedId = item.id;
      } catch (error) {
        setStatus(error.message, true);
      }
    }
    if (files.length > 0) {
      render();
      setStatus(`${files.length}枚の画像を追加しました。`);
    }
  }

  function updateDimensions(axis) {
    const item = selectedItem();
    if (!item) return;
    const input = axis === "width" ? elements.widthInput : elements.heightInput;
    const value = getNumericInput(input);
    if (value === null || value <= 0) return;
    if (axis === "width") {
      item.widthMm = value;
      if (elements.lockAspect.checked) item.heightMm = value / item.aspectRatio;
    } else {
      item.heightMm = value;
      if (elements.lockAspect.checked) item.widthMm = value * item.aspectRatio;
    }
    render();
  }

  function updateCoordinate(axis) {
    const item = selectedItem();
    if (!item) return;
    const value = getNumericInput(axis === "x" ? elements.xInput : elements.yInput);
    if (value === null) return;
    item[axis === "x" ? "xMm" : "yMm"] = value;
    updatePreviewVisuals();
    renderImageList();
    updateOverflowWarning();
  }

  function applyPosition() {
    const item = selectedItem();
    if (!item) return;
    const paper = currentPaper();
    const dimensions = correctedDimensions(item);
    const position = elements.positionSelect.value;
    const horizontal = position.includes("left") ? "left" : position.includes("right") ? "right" : "center";
    const vertical = position.includes("top") ? "top" : position.includes("bottom") ? "bottom" : "center";
    if (position === "custom") return;
    item.xMm = horizontal === "left" ? 0 : horizontal === "right" ? paper.width - dimensions.widthMm : (paper.width - dimensions.widthMm) / 2;
    item.yMm = vertical === "top" ? 0 : vertical === "bottom" ? paper.height - dimensions.heightMm : (paper.height - dimensions.heightMm) / 2;
    render();
    setStatus("配置位置を更新しました。");
  }

  function duplicateSelected(offset = 5) {
    const item = selectedItem();
    if (!item) return;
    const copy = { ...item, id: state.nextId++, name: `${item.name}（コピー）`, xMm: item.xMm + offset, yMm: item.yMm + offset };
    state.items.push(copy);
    state.selectedId = copy.id;
    render();
    setStatus("画像を複製しました。");
  }

  function addCopies() {
    const item = selectedItem();
    const count = Math.max(1, Math.min(100, Math.floor(getNumericInput(elements.copyCount) || 1)));
    if (!item || count < 2) return;
    for (let index = 1; index < count; index += 1) {
      state.items.push({ ...item, id: state.nextId++, name: `${item.name}（${index + 1}）`, xMm: item.xMm + index * 5, yMm: item.yMm + index * 5 });
    }
    render();
    setStatus(`${count}枚になるようにコピーを追加しました。`);
  }

  function deleteSelected() {
    if (!selectedItem()) return;
    const removedId = state.selectedId;
    state.items = state.items.filter((item) => item.id !== removedId);
    state.selectedId = state.items.length > 0 ? state.items[Math.max(0, state.items.length - 1)].id : null;
    render();
    setStatus("画像を削除しました。");
  }

  function autoArrange() {
    const paper = currentPaper();
    const gap = 5;
    let columnCount = Math.floor((paper.width + gap) / (Math.max(...state.items.map((item) => correctedDimensions(item).widthMm), 1) + gap));
    columnCount = Math.max(1, columnCount);
    state.items.forEach((item, index) => {
      const column = index % columnCount;
      const row = Math.floor(index / columnCount);
      const dimensions = correctedDimensions(item);
      item.xMm = gap + column * (dimensions.widthMm + gap);
      item.yMm = gap + row * (dimensions.heightMm + gap);
    });
    render();
    setStatus("画像を自動整列しました。用紙外にはみ出した画像は警告で確認できます。");
  }

  function startDrag(event) {
    const node = event.target.closest(".preview-item");
    if (!node) return;
    const item = state.items.find((candidate) => candidate.id === Number(node.dataset.id));
    if (!item) return;
    state.selectedId = item.id;
    renderImageList();
    syncSelectedControls();
    node.setPointerCapture(event.pointerId);
    const rect = elements.previewPaper.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = item.xMm;
    const originalY = item.yMm;
    const move = (moveEvent) => {
      item.xMm = originalX + ((moveEvent.clientX - startX) / rect.width) * currentPaper().width;
      item.yMm = originalY + ((moveEvent.clientY - startY) / rect.height) * currentPaper().height;
      updatePreviewVisuals();
      syncSelectedControls();
      updateOverflowWarning();
    };
    const finish = () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", finish);
      node.removeEventListener("pointercancel", finish);
      renderImageList();
      setStatus("画像の配置を更新しました。");
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", finish);
    node.addEventListener("pointercancel", finish);
    event.preventDefault();
  }

  function selectFromPreview(event) {
    const node = event.target.closest(".preview-item");
    if (!node) return;
    state.selectedId = Number(node.dataset.id);
    renderImageList();
    syncSelectedControls();
    updatePreviewVisuals();
  }

  async function generatePdf() {
    if (state.items.length === 0) return;
    if (state.correction.enabled && !validateCorrection()) {
      setStatus("プリンター実寸補正が有効ですが、補正値が正しくありません。入力を確認してください。", true);
      return;
    }
    const jsPdfConstructor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPdfConstructor) {
      setStatus("PDFライブラリを読み込めませんでした。ネットワーク接続を確認してください。", true);
      return;
    }
    const paper = currentPaper();
    const doc = new jsPdfConstructor({ unit: "mm", format: [paper.width, paper.height], precision: 10, compress: true });
    state.items.forEach((item) => {
      const dimensions = correctedDimensions(item);
      doc.addImage(item.dataUrl, item.format, item.xMm, item.yMm, dimensions.widthMm, dimensions.heightMm, undefined, "FAST");
    });
    doc.save("actual-size-print.pdf");
    setStatus("PDFを生成しました。印刷時は「実際のサイズ」または倍率100%を選択してください。");
  }

  function safeSiteNumber(value, fallback, minimum, maximum) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
  }

  function exportConverterData() {
    if (!state.converterFile) return null;
    const converter = state.converterFile;
    return {
      name: converter.file.name,
      kind: converter.kind,
      dataUrl: converter.kind === "image" ? converter.dataUrl : undefined,
      text: converter.kind === "text" ? converter.text : undefined,
      format: converter.format,
      width: converter.width,
      height: converter.height,
      outputFormat: elements.converterOutputFormat.value,
    };
  }

  function exportSiteData() {
    return {
      print: {
        items: state.items.map((item) => ({ ...item })),
        selectedId: state.selectedId,
        nextId: state.nextId,
        paperKey: state.paperKey,
        orientation: state.orientation,
        correction: {
          specified: state.correction.specified,
          measured: state.correction.measured,
          enabled: state.correction.enabled,
        },
        lockAspect: elements.lockAspect.checked,
        copyCount: elements.copyCount.value,
      },
      characterText: elements.characterText.value,
      cursiveText: elements.cursiveInput.value,
      converter: exportConverterData(),
    };
  }

  function normalizePrintItem(item, index) {
    if (!item || typeof item !== "object" || typeof item.dataUrl !== "string" || !item.dataUrl.startsWith("data:image/")) {
      throw new Error(`実寸印刷の画像${index + 1}が不正です`);
    }
    const aspectRatio = safeSiteNumber(item.aspectRatio, 1, 0.000001, 1000000);
    return {
      id: Math.max(1, Math.round(safeSiteNumber(item.id, index + 1, 1, Number.MAX_SAFE_INTEGER))),
      name: typeof item.name === "string" ? item.name.slice(0, 300) : `画像${index + 1}`,
      dataUrl: item.dataUrl,
      format: ["PNG", "JPEG", "WEBP"].includes(item.format) ? item.format : "PNG",
      aspectRatio,
      widthMm: safeSiteNumber(item.widthMm, 50, 0.01, 100000),
      heightMm: safeSiteNumber(item.heightMm, 50 / aspectRatio, 0.01, 100000),
      xMm: safeSiteNumber(item.xMm, 0, -100000, 100000),
      yMm: safeSiteNumber(item.yMm, 0, -100000, 100000),
    };
  }

  function restoreConverterData(converter) {
    if (!converter) {
      state.converterFile = null;
      elements.converterFileName.textContent = "ファイルが選択されていません。";
      elements.converterFileMeta.textContent = "";
      elements.converterOutputFormat.replaceChildren();
      elements.converterOutputFormat.disabled = true;
      elements.converterDownloadButton.disabled = true;
      elements.converterStatus.textContent = "";
      return;
    }
    if (converter.kind === "image") {
      if (typeof converter.dataUrl !== "string" || !converter.dataUrl.startsWith("data:image/")) throw new Error("形式変換の画像データが不正です");
      const width = Math.round(safeSiteNumber(converter.width, 1, 1, 100000));
      const height = Math.round(safeSiteNumber(converter.height, 1, 1, 100000));
      state.converterFile = {
        file: { name: typeof converter.name === "string" ? converter.name.slice(0, 300) : "restored-image.png" },
        kind: "image",
        dataUrl: converter.dataUrl,
        format: typeof converter.format === "string" ? converter.format : "PNG",
        width,
        height,
      };
      elements.converterFileMeta.textContent = `${width} × ${height}px。PNG / JPG / WebPへ変換できます。`;
    } else if (converter.kind === "text") {
      state.converterFile = {
        file: { name: typeof converter.name === "string" ? converter.name.slice(0, 300) : "restored-text.txt" },
        kind: "text",
        text: typeof converter.text === "string" ? converter.text : "",
      };
      elements.converterFileMeta.textContent = "TXT / HTML / JSONへ変換できます。文字コードはUTF-8として読み込みます。";
    } else throw new Error("形式変換データの種類が不正です");
    setConverterOptions(state.converterFile.kind);
    const allowedOutput = state.converterFile.kind === "image" ? ["png", "jpeg", "webp"] : ["txt", "html", "json"];
    elements.converterOutputFormat.value = allowedOutput.includes(converter.outputFormat) ? converter.outputFormat : allowedOutput[0];
    elements.converterFileName.textContent = state.converterFile.file.name;
    elements.converterStatus.textContent = "サイト全体バックアップから変換元を復元しました。";
    elements.converterStatus.style.color = "#067647";
  }

  function importSiteData(data) {
    if (!data || typeof data !== "object" || !data.print || typeof data.print !== "object") throw new Error("基本機能データが不正です");
    const print = data.print;
    const items = Array.isArray(print.items) ? print.items.map(normalizePrintItem) : [];
    state.items = items;
    const itemIds = new Set(items.map((item) => item.id));
    state.selectedId = itemIds.has(Number(print.selectedId)) ? Number(print.selectedId) : items.at(-1)?.id ?? null;
    const maximumId = items.reduce((maximum, item) => Math.max(maximum, item.id), 0);
    state.nextId = Math.max(maximumId + 1, Math.round(safeSiteNumber(print.nextId, maximumId + 1, 1, Number.MAX_SAFE_INTEGER)));
    state.paperKey = Object.hasOwn(PAPER_SIZES, print.paperKey) ? print.paperKey : "a4";
    state.orientation = ["portrait", "landscape"].includes(print.orientation) ? print.orientation : "portrait";
    const correction = print.correction && typeof print.correction === "object" ? print.correction : {};
    state.correction.specified = typeof correction.specified === "string" ? correction.specified : "";
    state.correction.measured = typeof correction.measured === "string" ? correction.measured : "";
    state.correction.enabled = Boolean(correction.enabled);
    state.correction.interacted = state.correction.enabled || Boolean(state.correction.specified || state.correction.measured);
    elements.paperSize.value = state.paperKey;
    elements.orientation.value = state.orientation;
    elements.correctionSpecifiedInput.value = state.correction.specified;
    elements.correctionMeasuredInput.value = state.correction.measured;
    elements.correctionEnabled.checked = state.correction.enabled;
    elements.lockAspect.checked = typeof print.lockAspect === "boolean" ? print.lockAspect : true;
    elements.copyCount.value = String(Math.round(safeSiteNumber(print.copyCount, 1, 1, 100)));
    elements.characterText.value = typeof data.characterText === "string" ? data.characterText.slice(0, 5000000) : "";
    elements.cursiveInput.value = typeof data.cursiveText === "string" ? data.cursiveText.slice(0, 5000000) : "";
    restoreConverterData(data.converter);
    validateCorrection(false);
    saveCorrection();
    updateCharacterCount();
    updateCursiveOutput();
    render();
    setStatus("サイト全体バックアップから実寸印刷と文章データを復元しました。");
  }

  elements.fileInput.addEventListener("change", (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  });
  ["dragenter", "dragover"].forEach((eventName) => elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("is-dragging");
  }));
  ["dragleave", "drop"].forEach((eventName) => elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("is-dragging");
  }));
  elements.dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
  elements.imageList.addEventListener("click", (event) => {
    const card = event.target.closest(".image-card");
    if (!card) return;
    state.selectedId = Number(card.dataset.id);
    render();
  });
  elements.previewPaper.addEventListener("pointerdown", startDrag);
  elements.previewPaper.addEventListener("click", selectFromPreview);
  elements.paperSize.addEventListener("change", (event) => {
    state.paperKey = event.target.value;
    render();
  });
  elements.orientation.addEventListener("change", (event) => {
    state.orientation = event.target.value;
    render();
  });
  [elements.correctionSpecifiedInput, elements.correctionMeasuredInput].forEach((input, index) => input.addEventListener("input", (event) => {
    state.correction[index === 0 ? "specified" : "measured"] = event.target.value;
    state.correction.interacted = true;
    validateCorrection();
    saveCorrection();
    renderImageList();
    syncSelectedControls();
    updatePreviewVisuals();
    updateOverflowWarning();
  }));
  elements.correctionEnabled.addEventListener("change", (event) => {
    state.correction.enabled = event.target.checked;
    state.correction.interacted = true;
    validateCorrection();
    saveCorrection();
    render();
  });
  elements.widthInput.addEventListener("change", () => updateDimensions("width"));
  elements.heightInput.addEventListener("change", () => updateDimensions("height"));
  elements.xInput.addEventListener("change", () => updateCoordinate("x"));
  elements.yInput.addEventListener("change", () => updateCoordinate("y"));
  elements.positionSelect.addEventListener("change", () => {
    if (elements.positionSelect.value !== "custom") applyPosition();
  });
  elements.applyPositionButton.addEventListener("click", applyPosition);
  elements.duplicateButton.addEventListener("click", () => duplicateSelected());
  elements.deleteButton.addEventListener("click", deleteSelected);
  elements.addCopiesButton.addEventListener("click", addCopies);
  elements.autoArrangeButton.addEventListener("click", autoArrange);
  elements.downloadButton.addEventListener("click", generatePdf);
  elements.openPrintButton.addEventListener("click", () => showView("print"));
  elements.openCharacterCountButton.addEventListener("click", () => showView("characterCount"));
  elements.openMd5Button.addEventListener("click", () => showView("md5"));
  elements.openNotepadButton.addEventListener("click", () => showView("notepad"));
  elements.openCursiveButton.addEventListener("click", () => showView("cursive"));
  elements.openCursiveLifeButton.addEventListener("click", () => showView("cursive"));
  elements.openConverterButton.addEventListener("click", () => showView("converter"));
  elements.openCropperButton.addEventListener("click", () => showView("cropper"));
  elements.openColorPickerButton.addEventListener("click", () => showView("colorPicker"));
  elements.openComposerButton.addEventListener("click", () => showView("composer"));
  elements.openNeonTextButton.addEventListener("click", () => showView("neonText"));
  elements.openHolidayCountdownButton.addEventListener("click", () => showView("holidayCountdown"));
  elements.openWakeTimeButton.addEventListener("click", () => showView("wakeTime"));
  elements.openSettingsButton.addEventListener("click", () => showView("settings"));
  elements.showLifeCategoryButton.addEventListener("click", () => showHomeCategory("life"));
  elements.showProductivityCategoryButton.addEventListener("click", () => showHomeCategory("productivity"));
  elements.homeButton.addEventListener("click", () => { showView("home"); showHomeCategory(null); });
  elements.characterText.addEventListener("input", updateCharacterCount);
  elements.cursiveInput.addEventListener("input", updateCursiveOutput);
  elements.copyCursiveButton.addEventListener("click", copyCursiveOutput);
  elements.converterFileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) loadConverterFile(file);
    event.target.value = "";
  });
  ["dragenter", "dragover"].forEach((eventName) => elements.converterDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.converterDropZone.classList.add("is-dragging");
  }));
  ["dragleave", "drop"].forEach((eventName) => elements.converterDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.converterDropZone.classList.remove("is-dragging");
  }));
  elements.converterDropZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) loadConverterFile(file);
  });
  elements.converterDownloadButton.addEventListener("click", convertAndDownload);

  render();
  loadCorrection();
  elements.correctionSpecifiedInput.value = state.correction.specified;
  elements.correctionMeasuredInput.value = state.correction.measured;
  elements.correctionEnabled.checked = state.correction.enabled;
  validateCorrection(false);
  render();
  updateCharacterCount();
  updateCursiveOutput();
  showView("home");
  showHomeCategory(null);
  window.YaaSiteData?.register("coreTools", { exportData: exportSiteData, importData: importSiteData });
})();
