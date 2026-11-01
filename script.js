/* ============================================================
   Prodigy Infotech — Task 02 · Stopwatch logic
   Timestamp-based timing (performance.now) so the elapsed time
   stays accurate across pause/resume, tab throttling and delays.
   ============================================================ */

"use strict";

(() => {
  const STATE = { READY: "ready", RUNNING: "running", PAUSED: "paused" };
  const RESET_FADE_MS = 300;

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

  const digits = {
    hh: document.getElementById("timerHh"),
    mm: document.getElementById("timerMm"),
    ss: document.getElementById("timerSs"),
    ms: document.getElementById("timerMs"),
  };

  let status = STATE.READY;
  let carriedMs = 0; // elapsed time accumulated before the current run
  let baseline = 0;  // performance.now() at the start of the current run
  let lapCount = 0;
  let laps = [];     // { el, ms }
  let frameId = null;
  let isResetting = false;

  const pad = (value, length) => String(value).padStart(length, "0");

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

  /* ---------- Timer loop (requestAnimationFrame) ---------- */

  function tick() {
    if (status !== STATE.RUNNING) return;
    renderTimer(elapsedNow());
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
  }

  function pauseRun() {
    carriedMs = elapsedNow(); // freeze the exact elapsed value
    status = STATE.PAUSED;
    cancelAnimationFrame(frameId);
    frameId = null;
    renderTimer(carriedMs);
    renderState();
    updateStatusText();
  }

  function handleToggle() {
    if (isResetting) return;
    if (status === STATE.RUNNING) pauseRun();
    else startRun(); // "ready" → Start, "paused" → Resume (same resume path)
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

  function recordLap() {
    if (status !== STATE.RUNNING) return; // invalid action guard

    const totalMs = elapsedNow();
    const previousTotal = laps.length > 0 ? laps[0].totalMs : 0;
    const lapMs = totalMs - previousTotal;
    lapCount += 1;

    const li = document.createElement("li");
    li.className = "lap";

    const num = document.createElement("span");
    num.className = "lap__num";
    num.textContent = `Lap ${lapCount}`;

    const time = document.createElement("span");
    time.className = "lap__time";
    time.textContent = formatClock(lapMs);

    const total = document.createElement("span");
    total.className = "lap__total";
    total.textContent = formatClock(totalMs);

    li.append(num, time, total);
    lapsList.prepend(li); // newest lap first, keeps the fresh entry visible

    laps.unshift({ el: li, ms: lapMs, totalMs });
    lapsEmpty.hidden = true;
    highlightExtremes();
  }

  /* ---------- Reset ---------- */

  function reset() {
    if (status === STATE.READY) return; // invalid action guard
    if (isResetting) return;

    isResetting = true;
    status = STATE.PAUSED; // stop the loop during the fade-out
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    if (reduceMotion.matches) {
      clearAll();
      return;
    }

    app.classList.add("app--resetting");
    setTimeout(() => {
      app.classList.remove("app--resetting");
      clearAll();
    }, RESET_FADE_MS);
  }

  function clearAll() {
    isResetting = false;
    status = STATE.READY;
    carriedMs = 0;
    baseline = 0;
    lapCount = 0;
    laps = [];
    lapsList.replaceChildren();
    lapsEmpty.hidden = false;
    renderTimer(0);
    renderState();
    updateStatusText();
  }

  /* ---------- Wiring ---------- */

  toggleBtn.addEventListener("click", handleToggle);
  lapBtn.addEventListener("click", recordLap);
  resetBtn.addEventListener("click", reset);

  // Keyboard shortcuts (buttons already handle Space/Enter natively when focused).
  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key;
    if (key === " ") {
      if (event.target instanceof HTMLElement && event.target.closest("button")) return;
      event.preventDefault();
      handleToggle();
    } else if (key === "l" || key === "L") {
      recordLap();
    } else if (key === "r" || key === "R") {
      reset();
    }
  });

  /* ---------- Init ---------- */
  renderTimer(0);
  renderState();
  updateStatusText();
})();
