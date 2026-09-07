(() => {
  "use strict";

  const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  const MAX_PREVIEW_HEIGHT = 560;

  const elements = {
    dropZone: document.querySelector("#cropperDropZone"),
    fileInput: document.querySelector("#cropperFileInput"),
    settings: document.querySelector("#cropperSettings"),
    fileName: document.querySelector("#cropperFileName"),
    aspectRatio: document.querySelector("#cropperAspectRatio"),
    x: document.querySelector("#cropperX"),
    y: document.querySelector("#cropperY"),
    width: document.querySelector("#cropperWidth"),
    height: document.querySelector("#cropperHeight"),
    resetButton: document.querySelector("#cropperResetButton"),
    outputFormat: document.querySelector("#cropperOutputFormat"),
    qualityRow: document.querySelector("#cropperQualityRow"),
    quality: document.querySelector("#cropperQuality"),
    qualityValue: document.querySelector("#cropperQualityValue"),
    downloadButton: document.querySelector("#cropperDownloadButton"),
    placeholder: document.querySelector("#cropperPlaceholder"),
    canvas: document.querySelector("#cropperCanvas"),
    status: document.querySelector("#cropperStatus"),
  };

  const state = {
    image: null,
    fileName: "",
    crop: null,
    dragStart: null,
    cropBeforeDrag: null,
    dragging: false,
  };

  function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function selectedAspectRatio() {
    const value = Number(elements.aspectRatio.value);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function fullImageCrop() {
    return { x: 0, y: 0, width: state.image.naturalWidth, height: state.image.naturalHeight };
  }

  function syncInputs() {
    if (!state.crop) return;
    elements.x.value = String(Math.round(state.crop.x));
    elements.y.value = String(Math.round(state.crop.y));
    elements.width.value = String(Math.max(1, Math.round(state.crop.width)));
    elements.height.value = String(Math.max(1, Math.round(state.crop.height)));
  }

  function draw() {
    if (!state.image || !state.crop) return;
    const context = elements.canvas.getContext("2d");
    const scaleX = elements.canvas.width / state.image.naturalWidth;
    const scaleY = elements.canvas.height / state.image.naturalHeight;
    const cropX = state.crop.x * scaleX;
    const cropY = state.crop.y * scaleY;
    const cropWidth = state.crop.width * scaleX;
    const cropHeight = state.crop.height * scaleY;

    context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    context.drawImage(state.image, 0, 0, elements.canvas.width, elements.canvas.height);
    context.fillStyle = "rgba(16, 24, 40, 0.58)";
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    context.save();
    context.beginPath();
    context.rect(cropX, cropY, cropWidth, cropHeight);
    context.clip();
    context.drawImage(state.image, 0, 0, elements.canvas.width, elements.canvas.height);
    context.restore();

    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.setLineDash([7, 5]);
    context.strokeRect(cropX, cropY, cropWidth, cropHeight);
    context.setLineDash([]);
    context.strokeStyle = "#175cd3";
    context.lineWidth = 1;
    context.strokeRect(cropX + 2, cropY + 2, Math.max(0, cropWidth - 4), Math.max(0, cropHeight - 4));

    const handleSize = 8;
    context.fillStyle = "#ffffff";
    [[cropX, cropY], [cropX + cropWidth, cropY], [cropX, cropY + cropHeight], [cropX + cropWidth, cropY + cropHeight]].forEach(([x, y]) => {
      context.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
      context.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
    });
  }

  function resizeCanvas() {
    if (!state.image) return;
    const editorWidth = Math.max(240, elements.canvas.parentElement.clientWidth - 36);
    const scale = Math.min(editorWidth / state.image.naturalWidth, MAX_PREVIEW_HEIGHT / state.image.naturalHeight, 1);
    elements.canvas.width = Math.max(1, Math.round(state.image.naturalWidth * scale));
    elements.canvas.height = Math.max(1, Math.round(state.image.naturalHeight * scale));
    draw();
  }

  function canvasPoint(event) {
    const rectangle = elements.canvas.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rectangle.left) / rectangle.width) * state.image.naturalWidth, 0, state.image.naturalWidth),
      y: clamp(((event.clientY - rectangle.top) / rectangle.height) * state.image.naturalHeight, 0, state.image.naturalHeight),
    };
  }

  function cropFromDrag(start, end) {
    const directionX = end.x >= start.x ? 1 : -1;
    const directionY = end.y >= start.y ? 1 : -1;
    const maximumWidth = directionX > 0 ? state.image.naturalWidth - start.x : start.x;
    const maximumHeight = directionY > 0 ? state.image.naturalHeight - start.y : start.y;
    let width = Math.min(Math.abs(end.x - start.x), maximumWidth);
    let height = Math.min(Math.abs(end.y - start.y), maximumHeight);
    const aspectRatio = selectedAspectRatio();

    if (aspectRatio && (width > 0 || height > 0)) {
      if (width === 0) width = Math.min(height * aspectRatio, maximumWidth);
      if (height === 0) height = Math.min(width / aspectRatio, maximumHeight);
      if (width / height > aspectRatio) width = height * aspectRatio;
      else height = width / aspectRatio;
      if (height > maximumHeight) {
        height = maximumHeight;
        width = height * aspectRatio;
      }
      if (width > maximumWidth) {
        width = maximumWidth;
        height = width / aspectRatio;
      }
    }

    return {
      x: directionX > 0 ? start.x : start.x - width,
      y: directionY > 0 ? start.y : start.y - height,
      width,
      height,
    };
  }

  function startSelection(event) {
    if (!state.image) return;
    state.dragStart = canvasPoint(event);
    state.cropBeforeDrag = { ...state.crop };
    state.dragging = true;
    elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveSelection(event) {
    if (!state.dragging) return;
    state.crop = cropFromDrag(state.dragStart, canvasPoint(event));
    syncInputs();
    draw();
  }

  function finishSelection() {
    if (!state.dragging) return;
    state.dragging = false;
    if (state.crop.width < 1 || state.crop.height < 1) state.crop = state.cropBeforeDrag;
    syncInputs();
    draw();
    setStatus(`選択範囲：${Math.round(state.crop.width)} × ${Math.round(state.crop.height)}px`);
  }

  function applyAspectRatio() {
    if (!state.image || !state.crop) return;
    const aspectRatio = selectedAspectRatio();
    if (!aspectRatio) {
      draw();
      return;
    }
    const centerX = state.crop.x + state.crop.width / 2;
    const centerY = state.crop.y + state.crop.height / 2;
    let width = state.crop.width;
    let height = width / aspectRatio;
    if (height > state.crop.height) {
      height = state.crop.height;
      width = height * aspectRatio;
    }
    if (width > state.image.naturalWidth) {
      width = state.image.naturalWidth;
      height = width / aspectRatio;
    }
    if (height > state.image.naturalHeight) {
      height = state.image.naturalHeight;
      width = height * aspectRatio;
    }
    state.crop = {
      x: clamp(centerX - width / 2, 0, state.image.naturalWidth - width),
      y: clamp(centerY - height / 2, 0, state.image.naturalHeight - height),
      width,
      height,
    };
    syncInputs();
    draw();
  }

  function updateCropFromInputs(event) {
    if (!state.image) return;
    const values = [elements.x, elements.y, elements.width, elements.height].map((input) => Number(input.value));
    if (values.some((value) => !Number.isFinite(value)) || values[0] < 0 || values[1] < 0 || values[2] <= 0 || values[3] <= 0) {
      setStatus("X・Yは0以上、幅・高さは1以上の数値で入力してください。", true);
      return;
    }
    let [x, y, width, height] = values;
    x = clamp(x, 0, state.image.naturalWidth - 1);
    y = clamp(y, 0, state.image.naturalHeight - 1);
    width = clamp(width, 1, state.image.naturalWidth - x);
    height = clamp(height, 1, state.image.naturalHeight - y);
    const aspectRatio = selectedAspectRatio();
    if (aspectRatio) {
      if (event.target === elements.height) {
        width = height * aspectRatio;
        if (width > state.image.naturalWidth - x) {
          width = state.image.naturalWidth - x;
          height = width / aspectRatio;
        }
      } else {
        height = width / aspectRatio;
        if (height > state.image.naturalHeight - y) {
          height = state.image.naturalHeight - y;
          width = height * aspectRatio;
        }
      }
    }
    state.crop = { x, y, width, height };
    syncInputs();
    draw();
    setStatus(`選択範囲：${Math.round(width)} × ${Math.round(height)}px`);
  }

  function resetCrop() {
    if (!state.image) return;
    elements.aspectRatio.value = "free";
    state.crop = fullImageCrop();
    syncInputs();
    draw();
    setStatus("画像全体を選択しました。");
  }

  function updateQualityVisibility() {
    const isLossy = elements.outputFormat.value !== "png";
    elements.qualityRow.hidden = !isLossy;
    elements.qualityValue.textContent = `${elements.quality.value}%`;
  }

  function baseName(fileName) {
    return fileName.replace(/\.[^/.]+$/, "") || "cropped-image";
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function downloadCrop() {
    if (!state.image || !state.crop) return;
    const outputWidth = Math.max(1, Math.round(state.crop.width));
    const outputHeight = Math.max(1, Math.round(state.crop.height));
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const context = outputCanvas.getContext("2d");
    const format = elements.outputFormat.value;
    if (format === "jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);
    }
    context.drawImage(
      state.image,
      state.crop.x,
      state.crop.y,
      state.crop.width,
      state.crop.height,
      0,
      0,
      outputWidth,
      outputHeight,
    );
    const mimeType = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[format];
    const quality = Number(elements.quality.value) / 100;
    const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, mimeType, quality));
    if (!blob) {
      setStatus("画像の書き出しに失敗しました。別の保存形式を試してください。", true);
      return;
    }
    const extension = format === "jpeg" ? "jpg" : format;
    downloadBlob(blob, `${baseName(state.fileName)}-cropped.${extension}`);
    setStatus(`${outputWidth} × ${outputHeight}pxで保存しました。`);
  }

  async function loadImage(file) {
    if (!SUPPORTED_TYPES.has(file.type)) {
      setStatus("PNG / JPG / WebP画像を選択してください。", true);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const candidate = new Image();
        candidate.onload = () => resolve(candidate);
        candidate.onerror = () => reject(new Error("画像を読み込めませんでした。"));
        candidate.src = objectUrl;
      });
      state.image = image;
      state.fileName = file.name;
      state.crop = fullImageCrop();
      elements.fileName.textContent = `${file.name}（${image.naturalWidth} × ${image.naturalHeight}px）`;
      elements.settings.hidden = false;
      elements.placeholder.hidden = true;
      elements.canvas.hidden = false;
      syncInputs();
      resizeCanvas();
      setStatus("画像を読み込みました。ドラッグして範囲を選択してください。");
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function sourceImageDataUrl() {
    if (!state.image) return null;
    const canvas = document.createElement("canvas");
    canvas.width = state.image.naturalWidth;
    canvas.height = state.image.naturalHeight;
    canvas.getContext("2d").drawImage(state.image, 0, 0);
    return canvas.toDataURL("image/png");
  }

  function exportSiteData() {
    return {
      imageDataUrl: sourceImageDataUrl(),
      fileName: state.fileName,
      crop: state.crop ? { ...state.crop } : null,
      aspectRatio: elements.aspectRatio.value,
      outputFormat: elements.outputFormat.value,
      quality: Number(elements.quality.value),
    };
  }

  function loadDataUrlImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("トリミング画像を復元できませんでした"));
      image.src = dataUrl;
    });
  }

  function clearImportedImage() {
    state.image = null;
    state.fileName = "";
    state.crop = null;
    elements.settings.hidden = true;
    elements.placeholder.hidden = false;
    elements.canvas.hidden = true;
  }

  async function importSiteData(data) {
    if (!data || typeof data !== "object") throw new Error("トリミングデータが不正です");
    if (!data.imageDataUrl) {
      clearImportedImage();
      return;
    }
    if (typeof data.imageDataUrl !== "string" || !data.imageDataUrl.startsWith("data:image/")) throw new Error("トリミング画像形式が不正です");
    const image = await loadDataUrlImage(data.imageDataUrl);
    state.image = image;
    state.fileName = typeof data.fileName === "string" ? data.fileName.slice(0, 300) : "restored-image.png";
    const sourceCrop = data.crop && typeof data.crop === "object" ? data.crop : {};
    const x = clamp(Number(sourceCrop.x) || 0, 0, Math.max(0, image.naturalWidth - 1));
    const y = clamp(Number(sourceCrop.y) || 0, 0, Math.max(0, image.naturalHeight - 1));
    const width = clamp(Number(sourceCrop.width) || image.naturalWidth, 1, image.naturalWidth - x);
    const height = clamp(Number(sourceCrop.height) || image.naturalHeight, 1, image.naturalHeight - y);
    state.crop = { x, y, width, height };
    elements.aspectRatio.value = [...elements.aspectRatio.options].some((option) => option.value === data.aspectRatio) ? data.aspectRatio : "free";
    elements.outputFormat.value = ["png", "jpeg", "webp"].includes(data.outputFormat) ? data.outputFormat : "png";
    elements.quality.value = String(clamp(Number(data.quality) || 92, 10, 100));
    elements.fileName.textContent = `${state.fileName}（${image.naturalWidth} × ${image.naturalHeight}px）`;
    elements.settings.hidden = false;
    elements.placeholder.hidden = true;
    elements.canvas.hidden = false;
    syncInputs();
    resizeCanvas();
    updateQualityVisibility();
    setStatus("サイト全体バックアップからトリミング状態を復元しました。");
  }

  elements.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) loadImage(file);
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
  elements.dropZone.addEventListener("drop", (event) => {
    const [file] = event.dataTransfer.files;
    if (file) loadImage(file);
  });
  elements.canvas.addEventListener("pointerdown", startSelection);
  elements.canvas.addEventListener("pointermove", moveSelection);
  elements.canvas.addEventListener("pointerup", finishSelection);
  elements.canvas.addEventListener("pointercancel", finishSelection);
  elements.aspectRatio.addEventListener("change", applyAspectRatio);
  [elements.x, elements.y, elements.width, elements.height].forEach((input) => input.addEventListener("change", updateCropFromInputs));
  elements.resetButton.addEventListener("click", resetCrop);
  elements.outputFormat.addEventListener("change", updateQualityVisibility);
  elements.quality.addEventListener("input", updateQualityVisibility);
  elements.downloadButton.addEventListener("click", downloadCrop);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("yaa:viewchange", (event) => {
    if (event.detail.view === "cropper") requestAnimationFrame(resizeCanvas);
  });
  updateQualityVisibility();
  window.YaaSiteData?.register("imageCropper", { exportData: exportSiteData, importData: importSiteData });
})();
