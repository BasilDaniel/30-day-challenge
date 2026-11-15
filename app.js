const $ = (s) => document.querySelector(s);
const KEY = "film-challenge-v1";
let state;
try {
  state = JSON.parse(localStorage.getItem(KEY)) || { done: [], notes: {} };
} catch {
  state = { done: [], notes: {} };
}
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
function renderWeeks() {
  const root = $("#weeks");
  root.innerHTML = "";
  for (let w = 0; w < 5; w++) {
    const start = w * 7,
      end = Math.min(start + 7, 30);
    if (start >= 30) break;
    const wrap = document.createElement("div");
    wrap.className = "week";
    wrap.innerHTML = `<div class="week-heading"><span class="week-no">НЕДЕЛЯ ${w + 1}</span><h3>${WEEK_TITLES[w]}</h3></div><div class="day-grid"></div>`;
    for (let i = start; i < end; i++) {
      const d = DAYS[i],
        b = document.createElement("button");
      b.className = "day-card" + (state.done.includes(i) ? " complete" : "");
      b.dataset.day = i;
      b.innerHTML = `<span class="day-num">${String(i + 1).padStart(2, "0")}</span><span class="day-check">${state.done.includes(i) ? "✓" : "↗"}</span><strong>${d[0]}</strong><small>${d[1]}</small>`;
      b.addEventListener("click", () => openDay(i));
      wrap.querySelector(".day-grid").append(b);
    }
    root.append(wrap);
  }
  updateProgress();
}
function updateProgress() {
  const n = state.done.length;
  $("#doneCount").textContent = n;
  $("#progressPercent").textContent = Math.round((n / 30) * 100) + "%";
  $("#progressBar").style.width = (n / 30) * 100 + "%";
}
function openDay(i) {
  const d = DAYS[i],
    special = i === 0 || i === 6;
  const shotTimes =
    i === 0 ? [4, 2, 4, 3, 3, 3, 5] : i === 6 ? [3, 4, 3, 4, 3, 7, 6] : null;
  const shotLabels =
    i === 0
      ? ["ОБЩИЙ", "ДЕТАЛЬ", "СРЕДНИЙ", "КРУПНЫЙ", "КРУПНЫЙ", "ДЕТАЛЬ", "ОБЩИЙ"]
      : i === 6
        ? [
            "ДЕТАЛЬ",
            "ОБЩИЙ",
            "КРУПНЫЙ",
            "СРЕДНИЙ",
            "ДЕТАЛЬ",
            "СВЕРХОБЩИЙ",
            "ОБЩИЙ",
          ]
        : [];
  $("#detail").innerHTML =
    `<div class="detail-top"><span class="eyebrow">ДЕНЬ ${String(i + 1).padStart(2, "0")} / 30 · РЕЖИССЁРСКОЕ ЗАДАНИЕ</span><h2>${d[0]}</h2><p class="skill-pill">◎ ${d[1]}</p><p class="detail-lead">${d[2]}</p><div class="meta"><span>◷ ${special ? "20–35" : "20–40"} секунд</span><span>▣ ${d[4].length} кадров</span><span>◉ iPhone / DJI</span></div></div><div class="detail-columns"><article class="panel"><h3>01 / История</h3><p>${d[2]}</p><div class="subheading">ЭМОЦИОНАЛЬНАЯ ДУГА</div><p>${d[3]}</p></article><article class="panel"><h3>02 / Движение камеры</h3><p>${d[5]}</p><div class="subheading">ПРАВИЛО ДНЯ</div><p>Один главный навык важнее эффектов. Каждый кадр должен сообщать что-то новое.</p></article></div><div class="section-heading shot-heading"><div><span class="eyebrow">SHOT LIST</span><h3>03 / Раскадровка</h3></div><p>Снимай каждый дубль с запасом 2–3 секунды</p></div><div class="shot-list">${d[4].map((s, j) => `<div class="shot"><div class="shot-index">${String(j + 1).padStart(2, "0")}</div><div><div class="shot-kind">${shotLabels[j] || "КАДР"} ${shotTimes ? " · " + shotTimes[j] + " СЕК" : ""}</div><p>${s}</p></div><label class="shot-done"><input type="checkbox" data-shot="${j}"><span>Снято</span></label></div>`).join("")}</div><div class="detail-columns"><article class="panel"><h3>04 / Настройки съёмки</h3><div class="tabs"><button class="tab active" data-camera="iphone">iPhone 16 Pro</button><button class="tab" data-camera="dji">DJI Osmo Pocket</button></div><div id="cameraSettings"></div></article><article class="panel"><h3>05 / Монтаж в iMovie</h3><p>${d[6]}</p><ol><li>Создай проект «Фильм» и импортируй кадры по порядку.</li><li>Обрежь лишнее до и после каждого действия.</li><li>Выбери между клипами переход «Нет».</li><li>Проверь историю без музыки, затем добавь атмосферный звук.</li><li>Экспортируй в доступном высоком качестве.</li></ol></article></div><article class="panel challenge"><h3>★ Бонусное упражнение</h3><p>${d[7]}</p></article><div class="finish"><label for="dayNotes">ЗАМЕТКИ ПОСЛЕ СЪЁМКИ</label><textarea id="dayNotes" rows="3" placeholder="Что получилось? Что переснять?">${escapeHtml(state.notes[i] || "")}</textarea><button id="completeBtn" class="primary">${state.done.includes(i) ? "✓ Задание выполнено — отменить" : "Отметить день выполненным ✓"}</button></div>`;
  const checks = $("#detail").querySelectorAll("[data-shot]");
  const checkKey = "film-shots-" + i;
  let shots = [];
  try {
    shots = JSON.parse(localStorage.getItem(checkKey)) || [];
  } catch {}
  checks.forEach((c) => {
    c.checked = shots.includes(+c.dataset.shot);
    c.addEventListener("change", () => {
      const done = [...checks]
        .filter((x) => x.checked)
        .map((x) => +x.dataset.shot);
      localStorage.setItem(checkKey, JSON.stringify(done));
    });
  });
  $("#dayNotes").addEventListener("input", (e) => {
    state.notes[i] = e.target.value;
    save();
  });
  $("#completeBtn").addEventListener("click", () => {
    state.done = state.done.includes(i)
      ? state.done.filter((x) => x !== i)
      : [...state.done, i];
    save();
    renderWeeks();
    openDay(i);
  });
  document.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      b.classList.add("active");
      camera(b.dataset.camera);
    }),
  );
  camera("iphone");
  location.hash = "day-" + (i + 1);
  $("#detail").scrollIntoView({ behavior: "smooth", block: "start" });
}
function camera(which) {
  $("#cameraSettings").innerHTML =
    which === "iphone"
      ? "<ul><li>Режим «Видео», 4K, 25 fps (или 30 fps, если 25 недоступно).</li><li>Для большинства планов используй основную камеру 1×.</li><li>Нажми и удерживай объект, чтобы зафиксировать AE/AF; проверь экспозицию.</li><li>Отключи ненужные фильтры; снимай в обычном SDR для простого монтажа.</li><li>Протри объектив и включи сетку композиции.</li></ul>"
      : "<ul><li>Выбери 4K и 25 fps (или 30 fps при необходимости).</li><li>Используй обычный цветовой профиль, без D-Log для первых упражнений.</li><li>Для статичных планов поставь камеру на устойчивую поверхность или мини-штатив.</li><li>При движении иди плавно, с согнутыми коленями; не злоупотребляй панорамированием.</li><li>Проверь баланс белого и экспозицию, чтобы соседние кадры не различались резко.</li></ul>";
}
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
renderWeeks();
const match = location.hash.match(/^#day-(\d+)$/);
if (match && +match[1] >= 1 && +match[1] <= 30) openDay(+match[1] - 1);
else if (location.hash === "#home") window.scrollTo(0, 0);
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn").hidden = false;
});
$("#installBtn").addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#installBtn").hidden = true;
  }
});
window.addEventListener("appinstalled", () => ($("#installBtn").hidden = true));
if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(console.warn),
  );
