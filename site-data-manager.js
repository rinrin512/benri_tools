(() => {
  "use strict";

  const APP_ID = "yaa-site-backup";
  const FORMAT_VERSION = 1;
  const MAX_IMPORT_BYTES = 250 * 1024 * 1024;
  const modules = new Map();

  const elements = {
    downloadButton: document.querySelector("#downloadSiteDataButton"),
    fileInput: document.querySelector("#siteDataFileInput"),
    status: document.querySelector("#siteDataStatus"),
  };

  function setStatus(message, isError = false) {
    elements.status.textContent = message;
    elements.status.style.color = isError ? "#b42318" : "#067647";
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function collectModuleData() {
    const result = {};
    for (const [name, provider] of modules) result[name] = await provider.exportData();
    return result;
  }

  async function downloadSiteData() {
    elements.downloadButton.disabled = true;
    setStatus("全データをまとめています…");
    try {
      const backup = {
        app: APP_ID,
        version: FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        modules: await collectModuleData(),
      };
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `yaa-site-backup-${date}.json`);
      setStatus(`全データを保存しました（${formatBytes(blob.size)}）。`);
    } catch (error) {
      setStatus(`全データを保存できませんでした: ${error.message}`, true);
    } finally {
      elements.downloadButton.disabled = false;
    }
  }

  function validateBackup(backup) {
    if (!backup || typeof backup !== "object" || backup.app !== APP_ID) throw new Error("yaa-siteのバックアップではありません");
    if (backup.version !== FORMAT_VERSION) throw new Error("対応していないバックアップ形式です");
    if (!backup.modules || typeof backup.modules !== "object" || Array.isArray(backup.modules)) throw new Error("機能データがありません");
  }

  async function restoreModules(moduleData) {
    const currentData = await collectModuleData();
    const restoredNames = [];
    try {
      for (const [name, provider] of modules) {
        if (!Object.hasOwn(moduleData, name)) continue;
        restoredNames.push(name);
        await provider.importData(moduleData[name]);
      }
    } catch (error) {
      for (const name of restoredNames.reverse()) {
        try {
          await modules.get(name).importData(currentData[name]);
        } catch {
          // 復元失敗時も元データの巻き戻しを可能な範囲で継続します。
        }
      }
      throw error;
    }
    return restoredNames.length;
  }

  async function loadSiteData(file) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setStatus("バックアップが大きすぎます。250MB以下のJSONを選択してください。", true);
      return;
    }
    elements.fileInput.disabled = true;
    setStatus("全データを読み込んでいます…");
    try {
      const backup = JSON.parse(await file.text());
      validateBackup(backup);
      const restoredCount = await restoreModules(backup.modules);
      window.dispatchEvent(new CustomEvent("yaa:sitedataimported", { detail: { restoredCount } }));
      setStatus(`全データを読み込みました（${restoredCount}機能）。`);
    } catch (error) {
      setStatus(`全データを読み込めませんでした: ${error.message}`, true);
    } finally {
      elements.fileInput.disabled = false;
    }
  }

  window.YaaSiteData = Object.freeze({
    register(name, provider) {
      if (typeof name !== "string" || !name || !provider || typeof provider.exportData !== "function" || typeof provider.importData !== "function") {
        throw new TypeError("サイトデータ機能の登録内容が不正です");
      }
      if (modules.has(name)) throw new Error(`${name}は登録済みです`);
      modules.set(name, provider);
    },
  });

  elements.downloadButton.addEventListener("click", downloadSiteData);
  elements.fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    loadSiteData(file);
    event.target.value = "";
  });
})();
