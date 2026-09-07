(() => {
  "use strict";

  const SUPPORTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
  const HISTORY_LIMIT = 30;

  const elements = {
    view: document.querySelector("#composerView"),
    dropZone: document.querySelector("#composerDropZone"),
    fileInput: document.querySelector("#composerFileInput"),
    canvasWidth: document.querySelector("#composerCanvasWidth"),
    canvasHeight: document.querySelector("#composerCanvasHeight"),
    transparent: document.querySelector("#composerTransparent"),
    backgroundRow: document.querySelector("#composerBackgroundRow"),
    backgroundColor: document.querySelector("#composerBackgroundColor"),
    applyCanvasButton: document.querySelector("#composerApplyCanvasButton"),
    undoButton: document.querySelector("#composerUndoButton"),
    redoButton: document.querySelector("#composerRedoButton"),
    layerList: document.querySelector("#composerLayerList"),
    noSelection: document.querySelector("#composerNoSelection"),
    selectedControls: document.querySelector("#composerSelectedControls"),
    selectedName: document.querySelector("#composerSelectedName"),
    x: document.querySelector("#composerX"),
    y: document.querySelector("#composerY"),
    width: document.querySelector("#composerWidth"),
    height: document.querySelector("#composerHeight"),
    lockAspect: document.querySelector("#composerLockAspect"),
    rotation: document.querySelector("#composerRotation"),
    rotationValue: document.querySelector("#composerRotationValue"),
    opacity: document.querySelector("#composerOpacity"),
    opacityValue: document.querySelector("#composerOpacityValue"),
    centerButton: document.querySelector("#composerCenterButton"),
    duplicateButton: document.querySelector("#composerDuplicateButton"),
    forwardButton: document.querySelector("#composerForwardButton"),
    backwardButton: document.querySelector("#composerBackwardButton"),
    deleteButton: document.querySelector("#composerDeleteButton"),
    outputFormat: document.querySelector("#composerOutputFormat"),
    qualityRow: document.querySelector("#composerQualityRow"),
    quality: document.querySelector("#composerQuality"),
    qualityValue: document.querySelector("#composerQualityValue"),
    downloadButton: document.querySelector("#composerDownloadButton"),
    placeholder: document.querySelector("#composerPlaceholder"),
    canvas: document.querySelector("#composerCanvas"),
    status: document.querySelector("#composerStatus"),
  };

  const state = {
    canvasWidth: 1200,
    canvasHeight: 800,
    transparent: true,
    backgroundColor: "#FFFFFF",
    layers: [],
    selectedId: null,
    nextId: 1,
    interaction: null,
    history: [],
    historyIndex: -1,
  };

  function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function selectedLayer() {
    return state.layers.find((layer) => layer.id === state.selectedId) || null;
  }

  function cloneSnapshot() {
    return {
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      transparent: state.transparent,
      backgroundColor: state.backgroundColor,
      layers: state.layers.map((layer) => ({ ...layer })),
      selectedId: state.selectedId,
      nextId: state.nextId,
    };
  }

  function commitHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(cloneSnapshot());
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
    state.historyIndex = state.history.length - 1;
    updateHistoryButtons();
  }

  function restoreSnapshot(snapshot) {
    state.canvasWidth = snapshot.canvasWidth;
    state.canvasHeight = snapshot.canvasHeight;
    state.transparent = snapshot.transparent;
    state.backgroundColor = snapshot.backgroundColor;
    state.layers = snapshot.layers.map((layer) => ({ ...layer }));
    state.selectedId = snapshot.selectedId;
    state.nextId = snapshot.nextId;
    elements.canvasWidth.value = String(state.canvasWidth);
    elements.canvasHeight.value = String(state.canvasHeight);
    elements.transparent.checked = state.transparent;
    elements.backgroundColor.value = state.backgroundColor;
    render();
  }

  function undo() {
    if (state.historyIndex <= 0) return;
    state.historyIndex -= 1;
    restoreSnapshot(state.history[state.historyIndex]);
    updateHistoryButtons();
    setStatus("ひとつ前の状態へ戻しました。");
  }

  function redo() {
    if (state.historyIndex >= state.history.length - 1) return;
    state.historyIndex += 1;
    restoreSnapshot(state.history[state.historyIndex]);
    updateHistoryButtons();
    setStatus("操作をやり直しました。");
  }

  function updateHistoryButtons() {
    elements.undoButton.disabled = state.historyIndex <= 0;
    elements.redoButton.disabled = state.historyIndex >= state.history.length - 1;
  }

  function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  function rotatedPoint(centerX, centerY, localX, localY, radians) {
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return { x: centerX + localX * cosine - localY * sine, y: centerY + localX * sine + localY * cosine };
  }

  function layerCorners(layer) {
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    const radians = degreesToRadians(layer.rotation);
    return [
      rotatedPoint(centerX, centerY, -layer.width / 2, -layer.height / 2, radians),
      rotatedPoint(centerX, centerY, layer.width / 2, -layer.height / 2, radians),
      rotatedPoint(centerX, centerY, layer.width / 2, layer.height / 2, radians),
      rotatedPoint(centerX, centerY, -layer.width / 2, layer.height / 2, radians),
    ];
  }

  function drawLayer(context, layer) {
    context.save();
    context.globalAlpha = layer.opacity;
    context.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    context.rotate(degreesToRadians(layer.rotation));
    context.drawImage(layer.image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
    context.restore();
  }

  function selectionScale() {
    const rectangle = elements.canvas.getBoundingClientRect();
    return rectangle.width > 0 ? elements.canvas.width / rectangle.width : 1;
  }

  function drawSelection(context, layer) {
    const corners = layerCorners(layer);
    const scale = selectionScale();
    context.save();
    context.strokeStyle = "#175cd3";
    context.lineWidth = Math.max(1, 2 * scale);
    context.setLineDash([7 * scale, 5 * scale]);
    context.beginPath();
    context.moveTo(corners[0].x, corners[0].y);
    corners.slice(1).forEach((corner) => context.lineTo(corner.x, corner.y));
    context.closePath();
    context.stroke();
    context.setLineDash([]);
    const handleSize = 12 * scale;
    const handle = corners[2];
    context.fillStyle = "#ffffff";
    context.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    context.strokeStyle = "#175cd3";
    context.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    context.restore();
  }

  function drawScene(context, includeSelection = true, forceOpaqueBackground = false) {
    context.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    if (!state.transparent || forceOpaqueBackground) {
      context.fillStyle = state.transparent && forceOpaqueBackground ? "#FFFFFF" : state.backgroundColor;
      context.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
    }
    state.layers.forEach((layer) => drawLayer(context, layer));
    const selected = selectedLayer();
    if (includeSelection && selected) drawSelection(context, selected);
  }

  function renderLayerList() {
    elements.layerList.replaceChildren();
    [...state.layers].reverse().forEach((layer, reverseIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `composer-layer-button${layer.id === state.selectedId ? " is-selected" : ""}`;
      button.dataset.id = String(layer.id);
      const thumbnail = document.createElement("img");
      thumbnail.src = layer.dataUrl;
      thumbnail.alt = "";
      const name = document.createElement("span");
      name.className = "composer-layer-name";
      name.textContent = layer.name;
      const order = document.createElement("span");
      order.className = "composer-layer-order";
      order.textContent = `#${state.layers.length - reverseIndex}`;
      button.append(thumbnail, name, order);
      elements.layerList.append(button);
    });
  }

  function syncSelectedControls() {
    const layer = selectedLayer();
    elements.noSelection.hidden = Boolean(layer);
    elements.selectedControls.hidden = !layer;
    if (!layer) return;
    elements.selectedName.textContent = layer.name;
    elements.x.value = String(Math.round(layer.x));
    elements.y.value = String(Math.round(layer.y));
    elements.width.value = String(Math.round(layer.width));
    elements.height.value = String(Math.round(layer.height));
    elements.rotation.value = String(Math.round(layer.rotation));
    elements.rotationValue.textContent = `${Math.round(layer.rotation)}°`;
    elements.opacity.value = String(Math.round(layer.opacity * 100));
    elements.opacityValue.textContent = `${Math.round(layer.opacity * 100)}%`;
  }

  function render() {
    if (elements.canvas.width !== state.canvasWidth) elements.canvas.width = state.canvasWidth;
    if (elements.canvas.height !== state.canvasHeight) elements.canvas.height = state.canvasHeight;
    elements.backgroundRow.hidden = state.transparent;
    drawScene(elements.canvas.getContext("2d"), true);
    renderLayerList();
    syncSelectedControls();
    elements.placeholder.hidden = state.layers.length > 0;
    elements.downloadButton.disabled = state.layers.length === 0;
    updateHistoryButtons();
  }

  function canvasPoint(event) {
    const rectangle = elements.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rectangle.left) / rectangle.width) * state.canvasWidth,
      y: ((event.clientY - rectangle.top) / rectangle.height) * state.canvasHeight,
    };
  }

  function worldToLayer(layer, point) {
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    const radians = degreesToRadians(layer.rotation);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const deltaX = point.x - centerX;
    const deltaY = point.y - centerY;
    return {
      x: deltaX * cosine + deltaY * sine + layer.width / 2,
      y: -deltaX * sine + deltaY * cosine + layer.height / 2,
    };
  }

  function hitTest(point) {
    for (let index = state.layers.length - 1; index >= 0; index -= 1) {
      const layer = state.layers[index];
      const local = worldToLayer(layer, point);
      if (local.x >= 0 && local.x <= layer.width && local.y >= 0 && local.y <= layer.height) return layer;
    }
    return null;
  }

  function resizeHandleHit(layer, point) {
    const local = worldToLayer(layer, point);
    const tolerance = 16 * selectionScale();
    return Math.abs(local.x - layer.width) <= tolerance && Math.abs(local.y - layer.height) <= tolerance;
  }

  function startInteraction(event) {
    const point = canvasPoint(event);
    const selected = selectedLayer();
    if (selected && resizeHandleHit(selected, point)) {
      const topLeft = layerCorners(selected)[0];
      state.interaction = {
        mode: "resize",
        layerId: selected.id,
        topLeft,
        original: { ...selected },
        changed: false,
      };
    } else {
      const hit = hitTest(point);
      state.selectedId = hit ? hit.id : null;
      if (hit) {
        state.interaction = {
          mode: "move",
          layerId: hit.id,
          start: point,
          original: { ...hit },
          changed: false,
        };
      } else state.interaction = null;
      render();
    }
    if (state.interaction) elements.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveInteraction(event) {
    if (!state.interaction) return;
    const layer = state.layers.find((candidate) => candidate.id === state.interaction.layerId);
    if (!layer) return;
    const point = canvasPoint(event);
    if (state.interaction.mode === "move") {
      layer.x = state.interaction.original.x + point.x - state.interaction.start.x;
      layer.y = state.interaction.original.y + point.y - state.interaction.start.y;
    } else {
      const radians = degreesToRadians(layer.rotation);
      const cosine = Math.cos(radians);
      const sine = Math.sin(radians);
      const deltaX = point.x - state.interaction.topLeft.x;
      const deltaY = point.y - state.interaction.topLeft.y;
      let width = Math.max(10, deltaX * cosine + deltaY * sine);
      let height = Math.max(10, -deltaX * sine + deltaY * cosine);
      if (elements.lockAspect.checked) {
        const aspect = layer.sourceAspect;
        if (Math.abs(width - state.interaction.original.width) > Math.abs(height - state.interaction.original.height) * aspect) height = width / aspect;
        else width = height * aspect;
      }
      const center = rotatedPoint(state.interaction.topLeft.x, state.interaction.topLeft.y, width / 2, height / 2, radians);
      layer.width = width;
      layer.height = height;
      layer.x = center.x - width / 2;
      layer.y = center.y - height / 2;
    }
    state.interaction.changed = true;
    drawScene(elements.canvas.getContext("2d"), true);
    syncSelectedControls();
  }

  function finishInteraction() {
    if (!state.interaction) return;
    const changed = state.interaction.changed;
    state.interaction = null;
    if (changed) {
      commitHistory();
      renderLayerList();
      setStatus("レイヤーを更新しました。");
    }
  }

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error(`${file.name}を読み込めませんでした。`));
      reader.readAsDataURL(file);
    });
  }

  function loadImageFromDataUrl(dataUrl, fileName) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ image, dataUrl, fileName });
      image.onerror = () => reject(new Error(`${fileName}を画像として読み込めませんでした。`));
      image.src = dataUrl;
    });
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList);
    const supported = files.filter((file) => SUPPORTED_TYPES.has(file.type));
    const rejectedCount = files.length - supported.length;
    try {
      const loadedImages = await Promise.all(supported.map(async (file) => loadImageFromDataUrl(await readAsDataUrl(file), file.name)));
      loadedImages.forEach(({ image, dataUrl, fileName }, index) => {
        const fitScale = Math.min((state.canvasWidth * 0.6) / image.naturalWidth, (state.canvasHeight * 0.6) / image.naturalHeight, 1);
        const width = Math.max(1, image.naturalWidth * fitScale);
        const height = Math.max(1, image.naturalHeight * fitScale);
        const offset = index * 18;
        const layer = {
          id: state.nextId++,
          name: fileName,
          image,
          dataUrl,
          x: (state.canvasWidth - width) / 2 + offset,
          y: (state.canvasHeight - height) / 2 + offset,
          width,
          height,
          rotation: 0,
          opacity: 1,
          sourceAspect: image.naturalWidth / image.naturalHeight,
        };
        state.layers.push(layer);
        state.selectedId = layer.id;
      });
      if (loadedImages.length > 0) {
        commitHistory();
        render();
        setStatus(`${loadedImages.length}枚の画像を追加しました。${rejectedCount ? ` 対応外を${rejectedCount}件スキップしました。` : ""}`);
      } else if (rejectedCount) setStatus("PNG / JPG / WebP画像を選択してください。", true);
    } catch (error) {
      setStatus(error.message, true);
    }
  }

  function applyCanvasSettings() {
    const width = Number(elements.canvasWidth.value);
    const height = Number(elements.canvasHeight.value);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 8000 || height > 8000) {
      setStatus("キャンバス幅・高さは1〜8000pxで入力してください。", true);
      return;
    }
    state.canvasWidth = Math.round(width);
    state.canvasHeight = Math.round(height);
    commitHistory();
    render();
    setStatus(`キャンバスを${state.canvasWidth} × ${state.canvasHeight}pxに変更しました。`);
  }

  function updateSelectedFromInputs(event) {
    const layer = selectedLayer();
    if (!layer) return;
    const values = [elements.x, elements.y, elements.width, elements.height].map((input) => Number(input.value));
    if (values.some((value) => !Number.isFinite(value)) || values[2] <= 0 || values[3] <= 0) {
      setStatus("位置は数値、幅・高さは1以上で入力してください。", true);
      return;
    }
    [layer.x, layer.y, layer.width, layer.height] = values;
    if (elements.lockAspect.checked) {
      if (event.target === elements.height) layer.width = layer.height * layer.sourceAspect;
      else if (event.target === elements.width) layer.height = layer.width / layer.sourceAspect;
    }
    commitHistory();
    render();
  }

  function centerSelected() {
    const layer = selectedLayer();
    if (!layer) return;
    layer.x = (state.canvasWidth - layer.width) / 2;
    layer.y = (state.canvasHeight - layer.height) / 2;
    commitHistory();
    render();
  }

  function duplicateSelected() {
    const layer = selectedLayer();
    if (!layer) return;
    const copy = { ...layer, id: state.nextId++, name: `${layer.name}（コピー）`, x: layer.x + 20, y: layer.y + 20 };
    state.layers.push(copy);
    state.selectedId = copy.id;
    commitHistory();
    render();
  }

  function deleteSelected() {
    if (!selectedLayer()) return;
    const index = state.layers.findIndex((layer) => layer.id === state.selectedId);
    state.layers.splice(index, 1);
    state.selectedId = state.layers.length ? state.layers[Math.min(index, state.layers.length - 1)].id : null;
    commitHistory();
    render();
    setStatus("選択したレイヤーを削除しました。");
  }

  function moveLayerOrder(direction) {
    const index = state.layers.findIndex((layer) => layer.id === state.selectedId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= state.layers.length) return;
    [state.layers[index], state.layers[targetIndex]] = [state.layers[targetIndex], state.layers[index]];
    commitHistory();
    render();
  }

  function updateQualityVisibility() {
    elements.qualityRow.hidden = elements.outputFormat.value === "png";
    elements.qualityValue.textContent = `${elements.quality.value}%`;
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

  async function downloadComposition() {
    if (!state.layers.length) return;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = state.canvasWidth;
    outputCanvas.height = state.canvasHeight;
    const format = elements.outputFormat.value;
    drawScene(outputCanvas.getContext("2d"), false, format === "jpeg");
    const mimeType = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }[format];
    const quality = Number(elements.quality.value) / 100;
    const blob = await new Promise((resolve) => outputCanvas.toBlob(resolve, mimeType, quality));
    if (!blob) {
      setStatus("画像の書き出しに失敗しました。別の形式を試してください。", true);
      return;
    }
    downloadBlob(blob, `composed-image.${format === "jpeg" ? "jpg" : format}`);
    setStatus(`${state.canvasWidth} × ${state.canvasHeight}pxで保存しました。`);
  }

  function exportSiteData() {
    const assets = [];
    const assetIndexes = new Map();
    const serializeLayer = (layer) => {
      let assetIndex = assetIndexes.get(layer.dataUrl);
      if (assetIndex === undefined) {
        assetIndex = assets.length;
        assetIndexes.set(layer.dataUrl, assetIndex);
        assets.push(layer.dataUrl);
      }
      return {
        id: layer.id,
        name: layer.name,
        assetIndex,
        x: layer.x,
        y: layer.y,
        width: layer.width,
        height: layer.height,
        rotation: layer.rotation,
        opacity: layer.opacity,
        sourceAspect: layer.sourceAspect,
      };
    };
    const serializeSnapshot = (snapshot) => ({
      canvasWidth: snapshot.canvasWidth,
      canvasHeight: snapshot.canvasHeight,
      transparent: snapshot.transparent,
      backgroundColor: snapshot.backgroundColor,
      layers: snapshot.layers.map(serializeLayer),
      selectedId: snapshot.selectedId,
      nextId: snapshot.nextId,
    });
    return {
      assets,
      current: serializeSnapshot(cloneSnapshot()),
      history: state.history.map(serializeSnapshot),
      historyIndex: state.historyIndex,
      lockAspect: elements.lockAspect.checked,
      outputFormat: elements.outputFormat.value,
      quality: Number(elements.quality.value),
    };
  }

  function safeNumber(value, fallback, minimum, maximum) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
  }

  function deserializeSnapshot(snapshot, assets) {
    if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.layers)) throw new Error("画像合成の状態が不正です");
    const canvasWidth = Math.round(safeNumber(snapshot.canvasWidth, 1200, 1, 8000));
    const canvasHeight = Math.round(safeNumber(snapshot.canvasHeight, 800, 1, 8000));
    const layers = snapshot.layers.map((layer, index) => {
      const asset = assets[Number(layer.assetIndex)];
      if (!asset) throw new Error("画像合成の画像データが不足しています");
      const sourceAspect = safeNumber(layer.sourceAspect, asset.image.naturalWidth / asset.image.naturalHeight, 0.000001, 1000000);
      return {
        id: Math.max(1, Math.round(safeNumber(layer.id, index + 1, 1, Number.MAX_SAFE_INTEGER))),
        name: typeof layer.name === "string" ? layer.name.slice(0, 300) : `画像${index + 1}`,
        image: asset.image,
        dataUrl: asset.dataUrl,
        x: safeNumber(layer.x, 0, -1000000, 1000000),
        y: safeNumber(layer.y, 0, -1000000, 1000000),
        width: safeNumber(layer.width, asset.image.naturalWidth, 1, 1000000),
        height: safeNumber(layer.height, asset.image.naturalHeight, 1, 1000000),
        rotation: safeNumber(layer.rotation, 0, -360000, 360000),
        opacity: safeNumber(layer.opacity, 1, 0, 1),
        sourceAspect,
      };
    });
    const ids = new Set(layers.map((layer) => layer.id));
    const selectedId = ids.has(Number(snapshot.selectedId)) ? Number(snapshot.selectedId) : layers.at(-1)?.id ?? null;
    const maximumId = layers.reduce((maximum, layer) => Math.max(maximum, layer.id), 0);
    return {
      canvasWidth,
      canvasHeight,
      transparent: typeof snapshot.transparent === "boolean" ? snapshot.transparent : true,
      backgroundColor: typeof snapshot.backgroundColor === "string" && /^#[0-9a-f]{6}$/i.test(snapshot.backgroundColor) ? snapshot.backgroundColor.toUpperCase() : "#FFFFFF",
      layers,
      selectedId,
      nextId: Math.max(maximumId + 1, Math.round(safeNumber(snapshot.nextId, maximumId + 1, 1, Number.MAX_SAFE_INTEGER))),
    };
  }

  async function importSiteData(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.assets) || !data.current) throw new Error("画像合成データが不正です");
    const assets = await Promise.all(data.assets.map((dataUrl, index) => {
      if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) throw new Error(`画像合成の素材${index + 1}が不正です`);
      return loadImageFromDataUrl(dataUrl, `素材${index + 1}`);
    }));
    const current = deserializeSnapshot(data.current, assets);
    const history = Array.isArray(data.history) ? data.history.slice(-HISTORY_LIMIT).map((snapshot) => deserializeSnapshot(snapshot, assets)) : [];
    restoreSnapshot(current);
    state.history = history.length ? history : [current];
    state.historyIndex = Math.round(safeNumber(data.historyIndex, state.history.length - 1, 0, state.history.length - 1));
    elements.lockAspect.checked = typeof data.lockAspect === "boolean" ? data.lockAspect : true;
    elements.outputFormat.value = ["png", "jpeg", "webp"].includes(data.outputFormat) ? data.outputFormat : "png";
    elements.quality.value = String(Math.round(safeNumber(data.quality, 92, 10, 100)));
    updateHistoryButtons();
    updateQualityVisibility();
    render();
    setStatus("サイト全体バックアップから画像合成と操作履歴を復元しました。");
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
  elements.canvas.addEventListener("pointerdown", startInteraction);
  elements.canvas.addEventListener("pointermove", moveInteraction);
  elements.canvas.addEventListener("pointerup", finishInteraction);
  elements.canvas.addEventListener("pointercancel", finishInteraction);
  elements.layerList.addEventListener("click", (event) => {
    const button = event.target.closest(".composer-layer-button");
    if (!button) return;
    state.selectedId = Number(button.dataset.id);
    render();
  });
  elements.applyCanvasButton.addEventListener("click", applyCanvasSettings);
  elements.transparent.addEventListener("change", () => {
    state.transparent = elements.transparent.checked;
    commitHistory();
    render();
  });
  elements.backgroundColor.addEventListener("input", () => {
    state.backgroundColor = elements.backgroundColor.value.toUpperCase();
    drawScene(elements.canvas.getContext("2d"), true);
  });
  elements.backgroundColor.addEventListener("change", commitHistory);
  elements.undoButton.addEventListener("click", undo);
  elements.redoButton.addEventListener("click", redo);
  [elements.x, elements.y, elements.width, elements.height].forEach((input) => input.addEventListener("change", updateSelectedFromInputs));
  elements.rotation.addEventListener("input", () => {
    const layer = selectedLayer();
    if (!layer) return;
    layer.rotation = Number(elements.rotation.value);
    elements.rotationValue.textContent = `${layer.rotation}°`;
    drawScene(elements.canvas.getContext("2d"), true);
  });
  elements.rotation.addEventListener("change", commitHistory);
  elements.opacity.addEventListener("input", () => {
    const layer = selectedLayer();
    if (!layer) return;
    layer.opacity = Number(elements.opacity.value) / 100;
    elements.opacityValue.textContent = `${elements.opacity.value}%`;
    drawScene(elements.canvas.getContext("2d"), true);
  });
  elements.opacity.addEventListener("change", commitHistory);
  elements.centerButton.addEventListener("click", centerSelected);
  elements.duplicateButton.addEventListener("click", duplicateSelected);
  elements.deleteButton.addEventListener("click", deleteSelected);
  elements.forwardButton.addEventListener("click", () => moveLayerOrder(1));
  elements.backwardButton.addEventListener("click", () => moveLayerOrder(-1));
  elements.outputFormat.addEventListener("change", updateQualityVisibility);
  elements.quality.addEventListener("input", updateQualityVisibility);
  elements.downloadButton.addEventListener("click", downloadComposition);
  window.addEventListener("keydown", (event) => {
    if (elements.view.hidden) return;
    const tagName = event.target.tagName;
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tagName)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
      return;
    }
    const layer = selectedLayer();
    if (!layer || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const distance = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft") layer.x -= distance;
    if (event.key === "ArrowRight") layer.x += distance;
    if (event.key === "ArrowUp") layer.y -= distance;
    if (event.key === "ArrowDown") layer.y += distance;
    commitHistory();
    render();
  });
  window.addEventListener("yaa:viewchange", (event) => {
    if (event.detail.view === "composer") requestAnimationFrame(render);
  });

  commitHistory();
  updateQualityVisibility();
  render();
  window.YaaSiteData?.register("imageComposer", { exportData: exportSiteData, importData: importSiteData });
})();
