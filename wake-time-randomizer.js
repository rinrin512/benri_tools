(() => {
  "use strict";

  const STORAGE_KEY = "yaa-site-wake-time-v1";
  const SLOT_MINUTES = 5;
  const elements = {
    start: document.querySelector("#wakeTimeStart"),
    end: document.querySelector("#wakeTimeEnd"),
    randomize: document.querySelector("#randomizeWakeTimeButton"),
    error: document.querySelector("#wakeTimeError"),
    resultLabel: document.querySelector("#wakeTimeResultLabel"),
    resultValue: document.querySelector("#wakeTimeResultValue"),
    resultDate: document.querySelector("#wakeTimeResultDate"),
    status: document.querySelector("#wakeTimeStatus"),
  };
  if (!elements.start || !elements.end) return;

  const state = { start: "06:00", end: "09:00", result: null };

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function tomorrow() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }

  function formatDate(date, language) {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
  }

  function language() {
    return window.YaaI18n?.getLanguage() === "en" ? "en" : "ja";
  }

  function setError(message) {
    elements.error.hidden = !message;
    elements.error.textContent = message;
  }

  function parseMinutes(value) {
    if (!/^\d{2}:\d{2}$/.test(value)) return Number.NaN;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ start: state.start, end: state.end, result: state.result }));
    } catch {
      // 保存できない環境でも現在のタブでは利用を続けます。
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      if (typeof saved.start === "string") state.start = saved.start;
      if (typeof saved.end === "string") state.end = saved.end;
      if (saved.result && saved.result.dateKey === dateKey(tomorrow()) && /^\d{2}:\d{2}$/.test(saved.result.time)) state.result = saved.result;
    } catch {
      // 壊れた保存データは初期状態として扱います。
    }
  }

  function render() {
    const currentLanguage = language();
    elements.start.value = state.start;
    elements.end.value = state.end;
    elements.resultLabel.textContent = currentLanguage === "en" ? "Tomorrow's wake-up time" : "明日の起床時間";
    if (!state.result) {
      elements.resultValue.textContent = "--:--";
      elements.resultDate.textContent = currentLanguage === "en" ? "Not decided yet" : "まだ決まっていません";
      return;
    }
    elements.resultValue.textContent = state.result.time;
    elements.resultDate.textContent = formatDate(tomorrow(), currentLanguage);
  }

  function randomSlot(minimum, maximum) {
    const count = Math.floor((maximum - minimum) / SLOT_MINUTES) + 1;
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return minimum + (values[0] % count) * SLOT_MINUTES;
    }
    return minimum + Math.floor(Math.random() * count) * SLOT_MINUTES;
  }

  function minutesToTime(minutes) {
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }

  function randomize() {
    state.start = elements.start.value;
    state.end = elements.end.value;
    const minimum = parseMinutes(state.start);
    const maximum = parseMinutes(state.end);
    if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 0 || maximum > 1439 || maximum <= minimum) {
      setError(language() === "en" ? "Enter a valid range where the end time is later than the start time." : "開始時刻と終了時刻を正しく入力してください。終了時刻は開始時刻より後にしてください。");
      return;
    }
    setError("");
    state.result = { dateKey: dateKey(tomorrow()), time: minutesToTime(randomSlot(minimum, maximum)) };
    save();
    render();
    elements.status.textContent = language() === "en" ? "Tomorrow's wake-up time has been decided." : "明日の起床時間を決めました。";
  }

  load();
  render();
  elements.randomize.addEventListener("click", randomize);
  [elements.start, elements.end].forEach((input) => input.addEventListener("change", () => {
    state[input === elements.start ? "start" : "end"] = input.value;
    save();
  }));
  window.addEventListener("yaa:languagechange", render);
  window.YaaSiteData?.register("wakeTime", {
    exportData: () => ({ start: state.start, end: state.end, result: state.result }),
    importData(data) {
      if (!data || typeof data !== "object") throw new Error("起床時間データが不正です");
      state.start = typeof data.start === "string" ? data.start : "06:00";
      state.end = typeof data.end === "string" ? data.end : "09:00";
      state.result = data.result && data.result.dateKey === dateKey(tomorrow()) && /^\d{2}:\d{2}$/.test(data.result.time) ? data.result : null;
      save();
      render();
    },
  });
})();
