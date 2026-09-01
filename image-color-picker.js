(() => {
  "use strict";

  const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  const HISTORY_LIMIT = 8;
  const MAGNIFIER_SOURCE_SIZE = 14;

  const elements = {
    dropZone: document.querySelector("#colorPickerDropZone"),
    fileInput: document.querySelector("#colorPickerFileInput"),
    result: document.querySelector("#colorPickerResult"),
    fileName: document.querySelector("#colorPickerFileName"),
    swatch: document.querySelector("#colorPickerSwatch"),
    hex: document.querySelector("#colorPickerHex"),
    details: document.querySelector("#colorPickerDetails"),
    copyButton: document.querySelector("#copyColorButton"),
    clearHistoryButton: document.querySelector("#clearColorHistoryButton"),
    history: document.querySelector("#colorPickerHistory"),
    placeholder: document.querySelector("#colorPickerPlaceholder"),
    editor: document.querySelector(".color-picker-editor"),
    canvas: document.querySelector("#colorPickerCanvas"),
    magnifier: document.querySelector("#colorPickerMagnifier"),
    status: document.querySelector("#colorPickerStatus"),
  };

  const state = {
    image: null,
    fileName: "",
    sampling: false,
    selectedColor: null,
    history: [],
  };

  function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function componentToHex(value) {
    return value.toString(16).padStart(2, "0").toUpperCase();
  }

  function rgbToHex(red, green, blue) {
    return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
  }

  function renderHistory() {
    elements.history.replaceChildren();
    state.history.forEach((color) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-color";
      button.style.backgroundColor = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})`;
      button.dataset.hex = color.hex;
      button.setAttribute("aria-label", `${color.hex}を選択`);
      button.title = color.hex;
      elements.history.append(button);
    });
    elements.clearHistoryButton.disabled = state.history.length === 0;
  }

  function displayColor(color, addToHistory = true) {
    state.selectedColor = color;
    elements.hex.value = color.hex;
    elements.swatch.style.backgroundColor = `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 255})`;
    const opacity = Math.round((color.alpha / 255) * 100);
    const coordinate = Number.isFinite(color.x) && Number.isFinite(color.y) ? `・座標 (${color.x}, ${color.y})px` : "・履歴から選択";
    elements.details.textContent = `RGB(${color.red}, ${color.green}, ${color.blue})・透明度 ${opacity}%${coordinate}`;
    elements.copyButton.disabled = false;

    if (addToHistory) {
      state.history = [color, ...state.history.filter((entry) => entry.hex !== color.hex)].slice(0, HISTORY_LIMIT);
      renderHistory();
    }
  }

  function canvasPoint(event) {
    const rectangle = elements.canvas.getBoundingClientRect();
    return {
      x: Math.min(elements.canvas.width - 1, Math.max(0, Math.floor(((event.clientX - rectangle.left) / rectangle.width) * elements.canvas.width))),
      y: Math.min(elements.canvas.height - 1, Math.max(0, Math.floor(((event.clientY - rectangle.top) / rectangle.height) * elements.canvas.height))),
    };
  }

  function sampleColor(event) {
    if (!state.image) return;
    const point = canvasPoint(event);
    const [red, green, blue, alpha] = elements.canvas.getContext("2d").getImageData(point.x, point.y, 1, 1).data;
    displayColor({ red, green, blue, alpha, hex: rgbToHex(red, green, blue), x: point.x, y: point.y });
    setStatus(`${point.x}, ${point.y}pxの色を取得しました。`);
  }

  function updateMagnifier(event) {
    if (!state.image) return;
    const point = canvasPoint(event);
    const sourceSize = Math.min(MAGNIFIER_SOURCE_SIZE, elements.canvas.width, elements.canvas.height);
    const sourceX = Math.max(0, Math.min(elements.canvas.width - sourceSize, point.x - Math.floor(sourceSize / 2)));
    const sourceY = Math.max(0, Math.min(elements.canvas.height - sourceSize, point.y - Math.floor(sourceSize / 2)));
    const context = elements.magnifier.getContext("2d");
    context.clearRect(0, 0, elements.magnifier.width, elements.magnifier.height);
    context.imageSmoothingEnabled = false;
    context.drawImage(
      elements.canvas,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      elements.magnifier.width,
      elements.magnifier.height,
    );
    const markerX = ((point.x - sourceX + 0.5) / sourceSize) * elements.magnifier.width;
    const markerY = ((point.y - sourceY + 0.5) / sourceSize) * elements.magnifier.height;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 3;
    context.strokeRect(markerX - 5, markerY - 5, 10, 10);
    context.strokeStyle = "#d92d20";
    context.lineWidth = 1;
    context.strokeRect(markerX - 4, markerY - 4, 8, 8);

    const editorRectangle = elements.editor.getBoundingClientRect();
    const lensSize = 120;
    const pointerX = event.clientX - editorRectangle.left;
    const pointerY = event.clientY - editorRectangle.top;
    let left = pointerX + 20;
    if (left + lensSize > editorRectangle.width - 4) left = pointerX - lensSize - 20;
    const top = Math.max(4, Math.min(editorRectangle.height - lensSize - 4, pointerY - lensSize / 2));
    elements.magnifier.style.left = `${Math.max(4, left)}px`;
    elements.magnifier.style.top = `${top}px`;
    elements.magnifier.hidden = false;
  }

  function hideMagnifier() {
    elements.magnifier.hidden = true;
  }

  function clearHistory() {
    state.history = [];
    renderHistory();
    setStatus("色の履歴を消去しました。");
  }

  function startSampling(event) {
    if (!state.image) return;
    state.sampling = true;
    elements.canvas.setPointerCapture(event.pointerId);
    updateMagnifier(event);
    sampleColor(event);
    event.preventDefault();
  }

  function moveSampling(event) {
    updateMagnifier(event);
    if (state.sampling) sampleColor(event);
  }

  function finishSampling(event) {
    state.sampling = false;
    if (event.pointerType !== "mouse") hideMagnifier();
  }

  async function copyHex() {
    if (!state.selectedColor) return;
    try {
      await navigator.clipboard.writeText(state.selectedColor.hex);
      setStatus(`${state.selectedColor.hex}をクリップボードへコピーしました。`);
    } catch {
      elements.hex.focus();
      elements.hex.select();
      const copied = document.execCommand("copy");
      setStatus(copied ? `${state.selectedColor.hex}をコピーしました。` : "自動コピーできませんでした。選択状態なのでCtrl+Cでコピーしてください。", !copied);
    }
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
      state.selectedColor = null;
      state.history = [];
      elements.canvas.width = image.naturalWidth;
      elements.canvas.height = image.naturalHeight;
      elements.canvas.getContext("2d", { willReadFrequently: true }).drawImage(image, 0, 0);
      elements.fileName.textContent = `${file.name}（${image.naturalWidth} × ${image.naturalHeight}px）`;
      elements.result.hidden = false;
      elements.placeholder.hidden = true;
      elements.canvas.hidden = false;
      elements.hex.value = "#000000";
      elements.swatch.style.backgroundColor = "#000000";
      elements.details.textContent = "画像をクリックして色を選択してください。";
      elements.copyButton.disabled = true;
      hideMagnifier();
      renderHistory();
      setStatus("画像を読み込みました。調べたい部分をクリックしてください。");
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
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
  elements.canvas.addEventListener("pointerdown", startSampling);
  elements.canvas.addEventListener("pointermove", moveSampling);
  elements.canvas.addEventListener("pointerup", finishSampling);
  elements.canvas.addEventListener("pointercancel", finishSampling);
  elements.canvas.addEventListener("pointerleave", hideMagnifier);
  elements.copyButton.addEventListener("click", copyHex);
  elements.clearHistoryButton.addEventListener("click", clearHistory);
  elements.history.addEventListener("click", (event) => {
    const button = event.target.closest(".history-color");
    if (!button) return;
    const color = state.history.find((entry) => entry.hex === button.dataset.hex);
    if (color) displayColor({ ...color, x: Number.NaN, y: Number.NaN }, false);
  });
})();
