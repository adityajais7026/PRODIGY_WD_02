/* ============================================================
   Prodigy Infotech — Task 02 · Stopwatch logic
   Timestamp-based timing (performance.now) so the elapsed time
   stays accurate across pause/resume, tab throttling and delays.
   v2: lap statistics + comparison, clear laps, session summary,
   CSV export, dark/light theme and localStorage persistence.
   ============================================================ */

"use strict";

(() => {
  const STATE = { READY: "ready", RUNNING: "running", PAUSED: "paused" };
  const RESET_FADE_MS = 300;
  const SAVE_TICK_MS = 1000; // throttle while running

  const KEYS = {
    session: "stopwatch.session.v2",
    theme: "stopwatch.theme",
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const app = document.getElementById("app");
  const statusText = document.getElementById("statusText");
  const toggleBtn = document.getElementById("toggleBtn");
  const toggleLabel = document.getElementById("toggleLabel");
  const playIcon = toggleBtn.querySelector(".btn__icon--play");
  const pauseIcon = toggleBtn.querySelector(".btn__icon--pause");
  const lapBtn = document.getElementById("lapBtn");
  const resetBtn = document.getElementById("resetBtn");
  const lapsList = document.getElementById("lapsList");
  const lapsEmpty = document.getElementById("lapsEmpty");
  const clearLapsBtn = document.getElementById("clearLapsBtn");
  const exportLapsBtn = document.getElementById("exportLapsBtn");

  const themeBtn = document.getElementById("themeBtn");
  const themeSun = themeBtn.querySelector(".icon-btn__icon--sun");
  const themeMoon = themeBtn.querySelector(".icon-btn__icon--moon");
  const menuBtn = document.getElementById("menuBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const clearDataBtn = document.getElementById("clearDataBtn");

  const statTotal = document.getElementById("statTotal");
  const statAvg = document.getElementById("statAvg");
  const statFastest = document.getElementById("statFastest");
  const statSlowest = document.getElementById("statSlowest");

  const summaryOverlay = document.getElementById("summaryOverlay");
  const summaryClose = document.getElementById("summaryClose");
  const summaryOk = document.getElementById("summaryOk");
  const summaryTotal = document.getElementById("summaryTotal");
  const summaryLaps = document.getElementById("summaryLaps");
  const summaryFastest = document.getElementById("summaryFastest");
  const summarySlowest = document.getElementById("summarySlowest");
  const summaryAvg = document.getElementById("summaryAvg");

  const confirmOverlay = document.getElementById("confirmOverlay");
  const confirmTitle = document.getElementById("confirmTitle");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmYes = document.getElementById("confirmYes");
  const confirmCancel = document.getElementById("confirmCancel");

  const digits = {
    hh: document.getElementById("timerHh"),
    mm: document.getElementById("timerMm"),
    ss: document.getElementById("timerSs"),
    ms: document.getElementById("timerMs"),
  };

  let status = STATE.READY;
  let carriedMs = 0;      // elapsed time accumulated before the current run
  let baseline = 0;       // performance.now() at the start of the current run
  let lapCount = 0;
  let laps = [];          // { el, no, ms, totalMs, cmp } — newest first
  let frameId = null;
  let isResetting = false;
  let prevSplitMs = 0;    // total elapsed at the previous lap (survives Clear Laps)
  let lastLapMs = null;   // lap duration of the previous recorded lap
  let saveThrottleAt = 0;

  const pad = (value, length) => String(value).padStart(length, "0");

  /* ---------- Storage helpers (fail-safe) ---------- */

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable (private mode etc.) — the app keeps working */
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }

  /* ---------- Time helpers ---------- */

  function elapsedNow() {
    return status === STATE.RUNNING
      ? carriedMs + (performance.now() - baseline)
      : carriedMs;
  }

  function breakdown(totalMs) {
    const hours = Math.floor(totalMs / 3_600_000);
    const minutes = Math.floor(totalMs / 60_000) % 60;
    const seconds = Math.floor(totalMs / 1_000) % 60;
    const millis = Math.floor(totalMs % 1000);
    return { hours, minutes, seconds, millis };
  }

  /** Main timer: always HH : MM : SS : MS */
  function renderTimer(totalMs) {
    const { hours, minutes, seconds, millis } = breakdown(totalMs);
    digits.hh.textContent = pad(hours, 2);
    digits.mm.textContent = pad(minutes, 2);
    digits.ss.textContent = pad(seconds, 2);
    digits.ms.textContent = pad(millis, 3);
  }

  /** Lap rows: MM : SS . MS, with hours only when needed */
  function formatClock(totalMs) {
    const { hours, minutes, seconds, millis } = breakdown(totalMs);
    const core = `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
    return hours > 0 ? `${hours} : ${core}` : core;
  }

  /** Session summary total: full HH : MM : SS . MS */
  function formatFull(totalMs) {
    const { hours, minutes, seconds, millis } = breakdown(totalMs);
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(millis, 3)}`;
  }

  /** Comparison text: "↑ 1.24s slower" / "↓ 0.85s faster" / "Same" */
  function formatCmp(cmp) {
    if (!cmp) return "First";
    if (cmp.dir === "same") return "Same";
    const secs = (Math.round(cmp.secs * 100) / 100).toFixed(2);
    return cmp.dir === "slower" ? `↑ ${secs}s slower` : `↓ ${secs}s faster`;
  }

  function comparisonFor(lapMs) {
    if (lastLapMs === null) return null;
    const delta = (lapMs - lastLapMs) / 1000;
    if (Math.abs(delta) < 0.01) return { dir: "same", secs: 0 };
    return delta > 0
      ? { dir: "slower", secs: Math.abs(delta) }
      : { dir: "faster", secs: Math.abs(delta) };
  }

  /* ---------- Timer loop (requestAnimationFrame) ---------- */

  function tick() {
    if (status !== STATE.RUNNING) return;
    const now = performance.now();
    renderTimer(elapsedNow());
    if (now - saveThrottleAt >= SAVE_TICK_MS) {
      saveThrottleAt = now;
      saveSession();
    }
    frameId = requestAnimationFrame(tick);
  }

  /* ---------- State / controls ---------- */

  function renderState() {
    const labels = { [STATE.READY]: "Start", [STATE.RUNNING]: "Pause", [STATE.PAUSED]: "Resume" };
    toggleLabel.textContent = labels[status];
    playIcon.hidden = status === STATE.RUNNING;
    pauseIcon.hidden = status !== STATE.RUNNING;

    lapBtn.disabled = status !== STATE.RUNNING;
    resetBtn.disabled = status === STATE.READY;
    app.dataset.status = status;
  }

  function updateStatusText() {
    const text = { [STATE.READY]: "Ready", [STATE.RUNNING]: "Running", [STATE.PAUSED]: "Paused" };
    statusText.textContent = text[status];
  }

  function startRun() {
    baseline = performance.now();
    status = STATE.RUNNING;
    frameId = requestAnimationFrame(tick);
    renderState();
    updateStatusText();
    saveSession();
  }

  function pauseRun() {
    carriedMs = elapsedNow(); // freeze the exact elapsed value
    status = STATE.PAUSED;
    cancelAnimationFrame(frameId);
    frameId = null;
    renderTimer(carriedMs);
    renderState();
    updateStatusText();
    saveSession();
  }

  function handleToggle() {
    if (isResetting) return;
    if (status === STATE.RUNNING) pauseRun();
    else startRun(); // "ready" → Start, "paused" → Resume (same resume path)
  }

  /* ---------- Statistics ---------- */

  function updateStats() {
    statTotal.textContent = String(laps.length);

    // Secondary lap controls follow the record availability.
    clearLapsBtn.disabled = exportLapsBtn.disabled = laps.length === 0;

    if (laps.length === 0) {
      statAvg.textContent = "—";
      statFastest.textContent = "—";
      statSlowest.textContent = "—";
      return;
    }

    const sum = laps.reduce((acc, lap) => acc + lap.ms, 0);
    statAvg.textContent = formatClock(sum / laps.length);

    // Extremes only make sense with at least two laps (matches row highlighting).
    if (laps.length >= 2) {
      statFastest.textContent = formatClock(Math.min(...laps.map((l) => l.ms)));
      statSlowest.textContent = formatClock(Math.max(...laps.map((l) => l.ms)));
    } else {
      statFastest.textContent = "—";
      statSlowest.textContent = "—";
    }
  }

  /* ---------- Laps ---------- */

  function highlightExtremes() {
    laps.forEach((lap) => lap.el.classList.remove("lap--fastest", "lap--slowest"));

    // Extremes only make sense with at least two laps.
    if (laps.length < 2) return;

    let fastest = laps[0];
    let slowest = laps[0];
    laps.forEach((lap) => {
      if (lap.ms < fastest.ms) fastest = lap;
      if (lap.ms > slowest.ms) slowest = lap;
    });
    fastest.el.classList.add("lap--fastest");
    slowest.el.classList.add("lap--slowest");
  }

  function buildLapRow(lap) {
    const li = document.createElement("li");
    li.className = "lap";

    const num = document.createElement("span");
    num.className = "lap__num";
    num.textContent = `Lap ${lap.no}`;

    const time = document.createElement("span");
    time.className = "lap__time";
    time.textContent = formatClock(lap.ms);

    const cmp = document.createElement("span");
    cmp.className = "lap__cmp";
    cmp.textContent = formatCmp(lap.cmp);
    if (lap.cmp) cmp.classList.add(`lap__cmp--${lap.cmp.dir}`);
    else cmp.classList.add("lap__cmp--first");

    const total = document.createElement("span");
    total.className = "lap__total";
    total.textContent = formatClock(lap.totalMs);

    li.append(num, time, cmp, total);
    return li;
  }

  function recordLap() {
    if (status !== STATE.RUNNING) return; // invalid action guard

    const totalMs = elapsedNow();
    const lapMs = totalMs - prevSplitMs;
    lapCount += 1;

    const lap = { no: lapCount, ms: lapMs, totalMs, cmp: comparisonFor(lapMs) };
    lap.el = buildLapRow(lap);
    lapsList.prepend(lap.el); // newest first, keeps the fresh entry visible

    laps.unshift(lap);
    prevSplitMs = totalMs;
    lastLapMs = lapMs;

    lapsEmpty.hidden = true;
    updateStats();
    highlightExtremes();
    saveSession();
  }

  /* ---------- Clear laps (keep the timer running) ---------- */

  function clearLaps() {
    laps = [];
    lapCount = 0; // numbering restarts once the history is wiped
    prevSplitMs = elapsedNow(); // keep new lap durations relative to now
    lastLapMs = null;
    lapsList.replaceChildren();
    lapsEmpty.hidden = false;
    updateStats();
    saveSession();
  }

  /* ---------- Session summary modal ---------- */

  function openModal(overlay) {
    overlay.hidden = false;
    const button = overlay.querySelector(".modal__cta, .modal__close");
    if (button) button.focus();
  }

  function closeModal(overlay) {
    overlay.hidden = true;
  }

  function showSummary(data) {
    const fastest = data.durations.length >= 2 ? Math.min(...data.durations) : null;
    const slowest = data.durations.length >= 2 ? Math.max(...data.durations) : null;
    const avg = data.durations.length
      ? data.durations.reduce((a, b) => a + b, 0) / data.durations.length
      : null;

    summaryTotal.textContent = formatFull(data.totalMs);
    summaryLaps.textContent = String(data.durations.length);
    summaryFastest.textContent = fastest === null ? "—" : formatClock(fastest);
    summarySlowest.textContent = slowest === null ? "—" : formatClock(slowest);
    summaryAvg.textContent = avg === null ? "—" : formatClock(avg);
    openModal(summaryOverlay);
  }

  /* ---------- Confirm modal ---------- */

  let confirmAction = null;

  function askConfirm(title, message, confirmLabel, action) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmYes.textContent = confirmLabel;
    confirmAction = action;
    openModal(confirmOverlay);
  }

  /* ---------- Reset ---------- */

  function reset() {
    if (status === STATE.READY) return; // invalid action guard
    if (isResetting) return;

    isResetting = true;
    const summary = {
      totalMs: elapsedNow(),
      durations: laps.map((lap) => lap.ms),
    };

    carriedMs = summary.totalMs; // freeze the visible value during the fade-out
    status = STATE.PAUSED;
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    // Fade-out, then wipe the session.
    if (reduceMotion.matches) {
      finishReset(summary);
      return;
    }

    app.classList.add("app--resetting");
    setTimeout(() => {
      app.classList.remove("app--resetting");
      finishReset(summary);
    }, RESET_FADE_MS);
  }

  function finishReset(summary) {
    isResetting = false;
    status = STATE.READY;
    carriedMs = 0;
    baseline = 0;
    lapCount = 0;
    prevSplitMs = 0;
    lastLapMs = null;
    laps = [];
    lapsList.replaceChildren();
    lapsEmpty.hidden = false;
    renderTimer(0);
    renderState();
    updateStatusText();
    updateStats();
    if (summary && (summary.totalMs > 0 || summary.durations.length > 0)) {
      showSummary(summary); // polished recap before the next session
    }
    saveSession();
  }

  /* ---------- Persistence ---------- */

  function snapshotSession() {
    return {
      v: 2,
      elapsedMs: Math.max(0, Math.round(elapsedNow())),
      lapCount,
      prevSplitMs: Math.round(prevSplitMs),
      lastLapMs: lastLapMs === null ? null : Math.round(lastLapMs),
      laps: laps.map((lap) => ({
        no: lap.no,
        ms: Math.round(lap.ms),
        totalMs: Math.round(lap.totalMs),
        cmp: lap.cmp,
      })),
    };
  }

  function saveSession() {
    if (isResetting) return;
    const snap = snapshotSession();
    // Empty sessions are not persisted — keep storage clean so Clear Saved
    // Data leaves no stray keys behind.
    if (snap.elapsedMs === 0 && snap.laps.length === 0) {
      removeStorage(KEYS.session);
      return;
    }
    writeStorage(KEYS.session, JSON.stringify(snap));
  }

  function restoreSession(raw) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return false;
    }
    if (!data || data.v !== 2) return false;
    if (!Number.isFinite(data.elapsedMs) || data.elapsedMs < 0) return false;
    if (!Array.isArray(data.laps)) return false;
    if (!Number.isInteger(data.lapCount) || data.lapCount < 0) return false;
    if (!Number.isFinite(data.prevSplitMs) || data.prevSplitMs < 0) return false;
    if (
      !(data.lastLapMs === null || (Number.isFinite(data.lastLapMs) && data.lastLapMs >= 0))
    ) {
      return false;
    }

    // Sanitize every lap (values came from storage, not from trusted code).
    const safeLaps = [];
    for (const laps2 of data.laps) {
      if (
        laps2 &&
        Number.isInteger(laps2.no) &&
        laps2.no > 0 &&
        Number.isFinite(laps2.ms) &&
        laps2.ms >= 0 &&
        Number.isFinite(laps2.totalMs) &&
        laps2.totalMs >= 0
      ) {
        safeLaps.push({
          no: laps2.no,
          ms: laps2.ms,
          totalMs: laps2.totalMs,
          cmp: laps2.cmp && ["slower", "faster", "same"].includes(laps2.cmp.dir) ? laps2.cmp : null,
        });
      } else {
        return false; // malformed entry → discard the whole session
      }
    }

    if (safeLaps.length === 0 && data.elapsedMs === 0) return false; // empty session

    // Restore as PAUSED (running state can't survive a reload accurately; the
    // next Resume re-derives the baseline from performance.now(), so timing
    // stays timestamp-based).
    carriedMs = data.elapsedMs;
    lapCount = data.lapCount;
    prevSplitMs = data.prevSplitMs;
    lastLapMs = data.lastLapMs;

    for (const lap of safeLaps) {
      lap.el = buildLapRow(lap);
      lapsList.prepend(lap.el);
      laps.unshift(lap);
    }

    lapsEmpty.hidden = laps.length > 0;
    status = STATE.PAUSED;
    renderTimer(carriedMs);
    renderState();
    updateStatusText();
    updateStats();
    return laps.length > 0 || carriedMs > 0;
  }

  function clearSavedData() {
    removeStorage(KEYS.session);
    removeStorage(KEYS.theme);
    applyTheme("dark", false); // back to the default theme, don't re-persist
    if (isResetting) return;
    if (status !== STATE.READY) {
      // Reset to a fresh UI without a summary (this is a data wipe, not a session).
      isResetting = false;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
      finishReset(null); // no summary for a manual wipe
    }
  }

  /* ---------- CSV export ---------- */

  function exportCsv() {
    if (laps.length === 0) return;

    const rows = ["Lap Number,Lap Time,Total Time,Comparison"];
    // laps[] is newest-first; export chronologically.
    for (let i = laps.length - 1; i >= 0; i -= 1) {
      const lap = laps[i];
      rows.push([lap.no, formatClock(lap.ms), formatClock(lap.totalMs), formatCmp(lap.cmp)].join(","));
    }

    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stopwatch-laps.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  /* ---------- Theme ---------- */

  function applyTheme(theme, persist) {
    document.documentElement.dataset.theme = theme;
    const isLight = theme === "light";
    themeSun.hidden = isLight;
    themeMoon.hidden = !isLight;
    themeBtn.setAttribute("aria-pressed", String(isLight));
    themeBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    if (persist) writeStorage(KEYS.theme, theme);
  }

  /* ---------- Settings menu ---------- */

  let lastFocus = null;

  function openMenu() {
    settingsMenu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    lastFocus = document.activeElement;
    const first = settingsMenu.querySelector("button");
    if (first) first.focus();
  }

  function closeMenu(refocus) {
    if (settingsMenu.hidden) return;
    settingsMenu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    if (refocus && lastFocus instanceof HTMLElement) lastFocus.focus();
  }

  /* ---------- Wiring ---------- */

  toggleBtn.addEventListener("click", handleToggle);
  lapBtn.addEventListener("click", recordLap);
  resetBtn.addEventListener("click", reset);
  clearLapsBtn.addEventListener("click", () => {
    if (laps.length === 0) return;
    askConfirm(
      "Clear all laps",
      "This removes every lap record and its statistics, but keeps the current elapsed time and continues the session.",
      "Clear laps",
      clearLaps,
    );
  });
  exportLapsBtn.addEventListener("click", exportCsv);

  clearDataBtn.addEventListener("click", () => {
    closeMenu(true);
    askConfirm(
      "Clear saved data",
      "This deletes the stopwatch session and theme saved in this browser's localStorage, then resets the UI to a fresh state. Data from other websites and apps is untouched.",
      "Clear data",
      clearSavedData,
    );
  });

  confirmYes.addEventListener("click", () => {
    const action = confirmAction;
    confirmAction = null;
    closeModal(confirmOverlay);
    if (action) action();
  });

  confirmCancel.addEventListener("click", () => {
    confirmAction = null;
    closeModal(confirmOverlay);
  });

  summaryClose.addEventListener("click", () => closeModal(summaryOverlay));
  summaryOk.addEventListener("click", () => closeModal(summaryOverlay));

  // Clicking the dark backdrop closes any open modal.
  summaryOverlay.addEventListener("click", (event) => {
    if (event.target === summaryOverlay) closeModal(summaryOverlay);
  });
  confirmOverlay.addEventListener("click", (event) => {
    if (event.target === confirmOverlay) {
      confirmAction = null;
      closeModal(confirmOverlay);
    }
  });

  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
  });
  document.getElementById("menuThemeItem").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true);
    closeMenu(false);
  });

  menuBtn.addEventListener("click", () => {
    if (settingsMenu.hidden) openMenu();
    else closeMenu(true);
  });

  document.addEventListener("click", (event) => {
    if (!settingsMenu.hidden && event.target instanceof Node) {
      if (!settingsMenu.contains(event.target) && !menuBtn.contains(event.target)) closeMenu(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    // Close menu / modal first (works even while typing).
    if (event.key === "Escape") {
      if (!settingsMenu.hidden) {
        closeMenu(true);
        event.preventDefault();
        return;
      }
      if (!confirmOverlay.hidden) {
        confirmAction = null;
        closeModal(confirmOverlay);
        event.preventDefault();
        return;
      }
      if (!summaryOverlay.hidden) {
        closeModal(summaryOverlay);
        event.preventDefault();
        return;
      }
    }

    // Don't hijack keys while the user is typing in an editable field.
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT")
    ) {
      return;
    }

    // Shortcuts stay silent while a dialog is open.
    if (!confirmOverlay.hidden || !summaryOverlay.hidden) return;

    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key;
    if (key === " ") {
      if (
        target instanceof HTMLElement &&
        target.closest("button") &&
        target !== document.body
      ) {
        // Buttons handle Space/Enter natively when focused.
        return;
      }
      event.preventDefault();
      handleToggle();
    } else if (key === "l" || key === "L") {
      recordLap();
    } else if (key === "r" || key === "R") {
      reset();
    }
  });

  // Persist while running, before the tab is hidden / closed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveSession();
  });
  window.addEventListener("pagehide", saveSession);

  /* ---------- Init: theme first (avoids a themed flash), then session ---------- */

  const storedTheme = readStorage(KEYS.theme);
  applyTheme(storedTheme === "light" ? "light" : "dark", false);

  const storedSession = readStorage(KEYS.session);
  let restored = false;
  if (storedSession) restored = restoreSession(storedSession);
  if (!restored) {
    // No (or invalid) saved session → fresh state.
    status = STATE.READY;
    renderTimer(0);
    renderState();
    updateStatusText();
    updateStats();
    if (storedSession) removeStorage(KEYS.session); // discard the malformed entry
  }
})();
