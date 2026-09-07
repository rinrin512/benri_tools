(() => {
  "use strict";

  const STORAGE_KEY = "yaa-site-notepad-v1";
  const elements = {
    title: document.querySelector("#notepadDocumentTitle"),
    text: document.querySelector("#notepadText"),
    count: document.querySelector("#notepadCount"),
    status: document.querySelector("#notepadStatus"),
    copyButton: document.querySelector("#copyNotepadButton"),
    downloadButton: document.querySelector("#downloadNotepadButton"),
    clearButton: document.querySelector("#clearNotepadButton"),
  };
  let saveTimer = 0;

  function translated(message) {
    return window.YaaI18n?.translate(message) || message;
  }

  function setStatus(message, isError = false) {
    elements.status.textContent = translated(message);
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function currentData() {
    return { title: elements.title.value, text: elements.text.value };
  }

  function validateData(data) {
    if (!data || typeof data !== "object" || typeof data.title !== "string" || typeof data.text !== "string") {
      throw new Error("メモ帳データが不正です");
    }
    return { title: data.title.slice(0, 100), text: data.text };
  }

  function updateCount() {
    const characters = Array.from(elements.text.value).length;
    const lines = elements.text.value.length === 0 ? 0 : elements.text.value.split(/\r\n|\r|\n/).length;
    const language = window.YaaI18n?.getLanguage() || "ja";
    elements.count.textContent = language === "en"
      ? `${characters.toLocaleString("en-US")} characters · ${lines.toLocaleString("en-US")} lines`
      : `${characters.toLocaleString("ja-JP")}文字・${lines.toLocaleString("ja-JP")}行`;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData()));
      setStatus("メモを自動保存しました。");
    } catch {
      setStatus("メモを保存できませんでした。", true);
    }
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 350);
    updateCount();
    setStatus("");
  }

  function applyData(data) {
    const validated = validateData(data);
    elements.title.value = validated.title;
    elements.text.value = validated.text;
    updateCount();
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) applyData(saved);
    } catch {
      setStatus("保存済みのメモを読み込めませんでした。", true);
    }
  }

  function safeFileName() {
    const base = elements.title.value.trim() || "memo";
    return `${base.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 80)}.txt`;
  }

  async function copyNote() {
    if (!elements.text.value) {
      setStatus("コピーするメモがありません。", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(elements.text.value);
      setStatus("メモをコピーしました。");
    } catch {
      elements.text.focus();
      elements.text.select();
      setStatus("自動コピーできませんでした。選択状態なのでCtrl+Cでコピーしてください。", true);
    }
  }

  function downloadNote() {
    if (!elements.text.value) {
      setStatus("保存するメモがありません。", true);
      return;
    }
    const blob = new Blob([elements.text.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFileName();
    link.click();
    URL.revokeObjectURL(url);
    setStatus("メモをTXTファイルへ保存しました。");
  }

  function clearNote() {
    if (!elements.title.value && !elements.text.value) return;
    if (!window.confirm(translated("タイトルと本文をすべて消去しますか？"))) return;
    elements.title.value = "";
    elements.text.value = "";
    save();
    updateCount();
    setStatus("メモを消去しました。");
    elements.text.focus();
  }

  elements.title.addEventListener("input", scheduleSave);
  elements.text.addEventListener("input", scheduleSave);
  elements.copyButton.addEventListener("click", copyNote);
  elements.downloadButton.addEventListener("click", downloadNote);
  elements.clearButton.addEventListener("click", clearNote);
  window.addEventListener("yaa:languagechange", updateCount);

  load();
  updateCount();
  window.YaaSiteData?.register("notepad", {
    exportData: currentData,
    importData(data) {
      applyData(data);
      save();
    },
  });
})();
