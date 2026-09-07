(() => {
  "use strict";

  const START_YEAR = 2026;
  const END_YEAR = 2030;
  const MIN_CONSECUTIVE_DAYS = 3;
  const elements = {
    main: document.querySelector("#holidayCountdownMain"),
  };
  if (!elements.main) return;

  const FIXED_HOLIDAYS = [
    ["01-01", "元日", "New Year's Day"], ["02-11", "建国記念の日", "National Foundation Day"], ["02-23", "天皇誕生日", "Emperor's Birthday"],
    ["04-29", "昭和の日", "Showa Day"], ["05-03", "憲法記念日", "Constitution Memorial Day"], ["05-04", "みどりの日", "Greenery Day"], ["05-05", "こどもの日", "Children's Day"],
    ["08-11", "山の日", "Mountain Day"], ["11-03", "文化の日", "Culture Day"], ["11-23", "勤労感謝の日", "Labor Thanksgiving Day"],
  ];
  const EQUINOX = { 2026: ["03-20", "09-23"], 2027: ["03-21", "09-23"], 2028: ["03-20", "09-22"], 2029: ["03-20", "09-23"], 2030: ["03-20", "09-23"] };
  const MONDAY_HOLIDAYS = [[1, 2, "成人の日", "Coming of Age Day"], [7, 3, "海の日", "Marine Day"], [9, 3, "敬老の日", "Respect for the Aged Day"], [10, 2, "スポーツの日", "Sports Day"]];

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function dateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function getHolidays() {
    const holidays = new Map();
    const add = (date, ja, en) => holidays.set(date, { date: dateFromKey(date), ja, en });
    for (let year = START_YEAR; year <= END_YEAR; year += 1) {
      for (const [monthDay, ja, en] of FIXED_HOLIDAYS) add(`${year}-${monthDay}`, ja, en);
      for (const [month, ordinal, ja, en] of MONDAY_HOLIDAYS) {
        const first = new Date(year, month - 1, 1);
        const day = 1 + ((8 - first.getDay()) % 7) + (ordinal - 1) * 7;
        add(dateKey(new Date(year, month - 1, day)), ja, en);
      }
      add(`${year}-${EQUINOX[year][0]}`, "春分の日", "Vernal Equinox Day");
      add(`${year}-${EQUINOX[year][1]}`, "秋分の日", "Autumnal Equinox Day");
    }
    for (const holiday of [...holidays.values()]) {
      if (holiday.date.getDay() !== 0) continue;
      let substitute = addDays(holiday.date, 1);
      while (holidays.has(dateKey(substitute))) substitute = addDays(substitute, 1);
      if (substitute.getFullYear() <= END_YEAR) add(dateKey(substitute), "振替休日", "Substitute holiday");
    }
    let changed = true;
    while (changed) {
      changed = false;
      for (let year = START_YEAR; year <= END_YEAR; year += 1) {
        for (let month = 0; month < 12; month += 1) {
          const days = new Date(year, month + 1, 0).getDate();
          for (let day = 2; day < days; day += 1) {
            const current = new Date(year, month, day);
            const key = dateKey(current);
            if (!holidays.has(key) && holidays.has(dateKey(addDays(current, -1))) && holidays.has(dateKey(addDays(current, 1)))) {
              add(key, "休日", "Holiday");
              changed = true;
            }
          }
        }
      }
    }
    return holidays;
  }

  function getLongHolidayRuns(today) {
    const holidays = getHolidays();
    const runs = [];
    let currentRun = [];
    const start = new Date(START_YEAR, 0, 1);
    const end = new Date(END_YEAR, 11, 31);
    for (let date = start; date <= end; date = addDays(date, 1)) {
      const key = dateKey(date);
      const isDayOff = date.getDay() === 0 || date.getDay() === 6 || holidays.has(key);
      if (isDayOff) currentRun.push(new Date(date));
      else if (currentRun.length) {
        if (currentRun.length >= MIN_CONSECUTIVE_DAYS) runs.push(currentRun);
        currentRun = [];
      }
    }
    if (currentRun.length >= MIN_CONSECUTIVE_DAYS) runs.push(currentRun);
    return { holidays, runs, today };
  }

  function formatDate(date, language) {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
  }

  function render() {
    const language = window.YaaI18n?.getLanguage() === "en" ? "en" : "ja";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { holidays, runs } = getLongHolidayRuns(today);
    const active = runs.find((run) => run.some((date) => dateKey(date) === dateKey(today)));
    const next = active || runs.find((run) => run[0] > today);
    const otherRuns = runs.filter((run) => run !== next && run[0] >= today).slice(0, 5);
    if (!next) {
      elements.main.innerHTML = `<div class="holiday-countdown-hero"><p class="holiday-countdown-label">${language === "en" ? "Holiday data available through 2030" : "連休データは2030年まで対応"}</p><p class="holiday-countdown-period">${language === "en" ? "There are no more long holiday periods in the data." : "登録されている期間内に次の連休はありません。"}</p></div>`;
      return;
    }
    const daysUntil = Math.max(0, Math.round((next[0] - today) / 86400000));
    const isActive = Boolean(active);
    const range = `${formatDate(next[0], language)} – ${formatDate(next.at(-1), language)}`;
    const label = isActive ? (language === "en" ? "Current long holiday" : "現在の連休") : (language === "en" ? "Days until the next long holiday" : "次の連休まで");
    const countLabel = language === "en" ? " days" : "日";
    const detail = language === "en" ? `${next.length} consecutive days off` : `${next.length}日間の連休`;
    const list = otherRuns.map((run) => `<div class="holiday-period"><strong>${formatDate(run[0], language)} – ${formatDate(run.at(-1), language)}</strong><span>${run.length}${countLabel === "日" ? "日間" : " days"}</span></div>`).join("");
    elements.main.innerHTML = `<div class="holiday-countdown-hero"><p class="holiday-countdown-label">${label}</p><p class="holiday-countdown-days">${daysUntil}<small>${countLabel}</small></p><p class="holiday-countdown-period">${range}</p><p class="holiday-countdown-sub">${detail}</p></div><div><h3>${language === "en" ? "Upcoming long holidays" : "今後の連休"}</h3><div class="holiday-period-list">${list || `<p class="helper-text">${language === "en" ? "No other periods are available." : "ほかの連休データはありません。"}</p>`}</div></div>`;
    const holidayNames = next.map((date) => holidays.get(dateKey(date))?.[language] || "").filter(Boolean);
    elements.main.querySelector(".holiday-countdown-sub").title = holidayNames.join(", ");
  }

  render();
  window.addEventListener("yaa:languagechange", render);
})();
