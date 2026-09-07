(() => {
  "use strict";

  const elements = {
    textInput: document.querySelector("#md5TextInput"),
    fileInput: document.querySelector("#md5FileInput"),
    dropZone: document.querySelector("#md5DropZone"),
    fileName: document.querySelector("#md5FileName"),
    generateTextButton: document.querySelector("#generateTextMd5Button"),
    generateFileButton: document.querySelector("#generateFileMd5Button"),
    result: document.querySelector("#md5Result"),
    copyButton: document.querySelector("#copyMd5Button"),
    clearButton: document.querySelector("#clearMd5Button"),
    status: document.querySelector("#md5Status"),
  };
  let selectedFile = null;

  function rotateLeft(value, count) {
    return (value << count) | (value >>> (32 - count));
  }

  function md5(bytes) {
    const originalLength = bytes.length;
    const paddedLength = (((originalLength + 8) >>> 6) + 1) * 64;
    const data = new Uint8Array(paddedLength);
    data.set(bytes);
    data[originalLength] = 0x80;
    const bitLength = originalLength * 8;
    const view = new DataView(data.buffer);
    view.setUint32(paddedLength - 8, bitLength >>> 0, true);
    view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;
    const shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    const constants = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0);

    for (let offset = 0; offset < paddedLength; offset += 64) {
      let a = a0;
      let b = b0;
      let c = c0;
      let d = d0;
      for (let index = 0; index < 64; index += 1) {
        let f;
        let wordIndex;
        if (index < 16) {
          f = (b & c) | (~b & d);
          wordIndex = index;
        } else if (index < 32) {
          f = (d & b) | (~d & c);
          wordIndex = (5 * index + 1) % 16;
        } else if (index < 48) {
          f = b ^ c ^ d;
          wordIndex = (3 * index + 5) % 16;
        } else {
          f = c ^ (b | ~d);
          wordIndex = (7 * index) % 16;
        }
        const previousD = d;
        d = c;
        c = b;
        const shift = shifts[Math.floor(index / 16) * 4 + (index % 4)];
        const sum = (a + f + constants[index] + view.getUint32(offset + wordIndex * 4, true)) >>> 0;
        b = (b + rotateLeft(sum, shift)) >>> 0;
        a = previousD;
      }
      a0 = (a0 + a) >>> 0;
      b0 = (b0 + b) >>> 0;
      c0 = (c0 + c) >>> 0;
      d0 = (d0 + d) >>> 0;
    }

    return [a0, b0, c0, d0]
      .map((value) => Array.from({ length: 4 }, (_, index) => ((value >>> (index * 8)) & 0xff).toString(16).padStart(2, "0")).join(""))
      .join("");
  }

  function translated(message) {
    return window.YaaI18n?.translate(message) || message;
  }

  function setStatus(message, isError = false) {
    elements.status.textContent = translated(message);
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function showResult(hash) {
    elements.result.value = hash;
    elements.copyButton.disabled = false;
    setStatus("MD5ハッシュを生成しました。");
  }

  function chooseFile(file) {
    selectedFile = file || null;
    elements.fileName.textContent = selectedFile
      ? `${selectedFile.name}（${selectedFile.size.toLocaleString(window.YaaI18n?.locale() || "ja-JP")} bytes）`
      : "ファイル未選択";
    elements.generateFileButton.disabled = !selectedFile;
    setStatus("");
  }

  elements.generateTextButton.addEventListener("click", () => {
    showResult(md5(new TextEncoder().encode(elements.textInput.value)));
  });
  elements.generateFileButton.addEventListener("click", async () => {
    if (!selectedFile) return;
    elements.generateFileButton.disabled = true;
    setStatus("計算中です…");
    try {
      showResult(md5(new Uint8Array(await selectedFile.arrayBuffer())));
    } catch {
      setStatus("ファイルを読み込めませんでした。", true);
    } finally {
      elements.generateFileButton.disabled = !selectedFile;
    }
  });
  elements.fileInput.addEventListener("change", (event) => {
    chooseFile(event.target.files[0]);
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
  elements.dropZone.addEventListener("drop", (event) => chooseFile(event.dataTransfer.files[0]));
  elements.copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.result.value);
      setStatus("MD5ハッシュをコピーしました。");
    } catch {
      elements.result.focus();
      elements.result.select();
      setStatus("自動コピーできませんでした。選択状態なのでCtrl+Cでコピーしてください。", true);
    }
  });
  elements.clearButton.addEventListener("click", () => {
    elements.textInput.value = "";
    elements.result.value = "";
    elements.copyButton.disabled = true;
    chooseFile(null);
    setStatus("");
  });
})();
