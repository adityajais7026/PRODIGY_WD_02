# ⏱️ Prodigy Infotech — Web Development Internship · Task 02

## Stopwatch Web Application

A premium, modern stopwatch built with **pure HTML5, CSS3 and vanilla JavaScript** — no frameworks, no libraries. It features timestamp-based timing (via `performance.now()`) so the elapsed time stays accurate even after pause/resume, tab throttling or browser delays, plus full lap analysis with fastest/slowest highlighting, a glassmorphism dark UI and a fully responsive, accessible layout.

---

## 📌 Project Description

This project implements Task 02 of the Prodigy Infotech Web Development Internship: a fully functional stopwatch web application.

The timer records laps with their lap number, lap duration and the total elapsed time, and automatically highlights the **fastest** lap in green and the **slowest** lap in red (from the second lap onwards). All timing is derived from timestamps rather than counters, so pausing, resuming, or heavy browser load never affects accuracy. The lap history becomes smoothly scrollable as laps accumulate and each new lap animates in.

---

## ✨ Features

- **Start / Pause / Resume / Reset** with a single adaptive main button
- **Lap recording** — unlimited laps; new laps appear instantly at the top
- **Lap details** — lap number, lap duration, and total elapsed time per lap
- **Fastest & slowest lap highlighting** (green / red accents)
- **Accurate elapsed time in `HH : MM : SS : MS`** — timestamp-based (`performance.now()`), unaffected by pause/resume or background-tab throttling
- **Scrollable lap history** that grows with the number of laps
- **Proper button states** — `Lap` is only enabled while running, `Reset` only after a run has begun, and invalid actions are ignored
- **Clear `READY / RUNNING / PAUSED` status pill** with a live status dot
- **Keyboard support** — `Space` (start/pause/resume), `L` (lap), `R` (reset), plus tab-focusable controls and visible focus states
- **Responsive design** — desktop, tablet and mobile (no horizontal scrolling)
- **`prefers-reduced-motion` support** — all animations are disabled for users who prefer less motion
- Lightweight, hardware-friendly animations that never touch the timing logic

---

## 💻 Technologies

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Structure  | HTML5 (semantic markup)             |
| Styling    | CSS3 (gradients, glassmorphism, keyframe animations, media queries) |
| Logic      | Vanilla JavaScript (ES2020, no dependencies) |

---

## 🗂️ Project Structure

```text
├── index.html   # Semantic page structure
├── style.css    # Premium dark theme, glassmorphism, animations, responsive rules
├── script.js    # Timestamp-based stopwatch engine + lap logic + keyboard control
├── README.md    # This file
```

---

## 🚀 How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/adityajais7026/PRODIGY_WD_02.git
   ```

2. Open `index.html` directly in any modern browser, **or** serve it locally:

   ```bash
   cd PRODIGY_WD_02
   python -m http.server 5500
   # then open http://localhost:5500
   ```

---

## 📸 Screenshots

<!-- Screenshot placeholder — desktop view -->

_Desktop screenshot coming soon._

<!-- Screenshot placeholder — mobile view -->

_Mobile screenshot coming soon._

---

## 🔗 Live Demo

<!-- Live demo placeholder — do not add a URL until it is actually deployed -->

_Live demo link coming soon._

---

## ✍️ Author

**Aditya Prakash**

_Grateful to Prodigy Infotech for this internship opportunity._
