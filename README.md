# ⏱️ Prodigy Infotech — Web Development Internship · Task 02

🔗 **Live Demo:** https://adityajais7026.github.io/PRODIGY_WD_02/

## Stopwatch Web Application

A premium, modern stopwatch built with **pure HTML5, CSS3 and vanilla JavaScript** — no frameworks, no libraries. It features timestamp-based timing (via `performance.now()`) so the elapsed time stays accurate even after pause/resume, tab throttling or browser delays, plus full lap analysis with fastest/slowest highlighting and lap-to-lap comparison, a session summary on reset, CSV export, a dark/light theme and automatic localStorage session persistence — all inside a responsive, accessible UI.

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
- **Live statistics bar** — total laps, average lap, fastest lap and slowest lap, recalculated on every change (`—` shown until the values exist)
- **Lap comparison** — every lap shows how much slower (`↑`) or faster (`↓`) it was than the previous lap (`Same` within 10 ms; the first lap reads `First`)
- **Clear laps** — wipes the lap history and statistics without pausing, resetting or altering the running timer, guarded by a confirmation dialog
- **Session summary modal** — on reset, a summary of total time, lap count, fastest, slowest and average lap is shown (only when the session actually had time or laps)
- **CSV export** — downloads `stopwatch-laps.csv` with lap number, lap time, total time and comparison, ready for spreadsheets
- **Dark / light theme toggle** — premium dark theme by default, light theme fully designed; the choice persists across reloads
- **Session persistence** — elapsed time, laps and statistics survive a page refresh and are restored in a paused state, ready to resume with no time lost
- **Clear saved data** — a dedicated menu action (with confirmation) removes only this app's localStorage entries and resets the UI
- **Accurate elapsed time in `HH : MM : SS : MS`** — timestamp-based (`performance.now()`), unaffected by pause/resume or background-tab throttling
- **Scrollable lap history** that grows with the number of laps
- **Proper button states** — `Lap` is only enabled while running, `Reset` only after a run has begun, and invalid actions are ignored
- **Clear `READY / RUNNING / PAUSED` status pill** with a live status dot
- **Keyboard support** — `Space` (start/pause/resume), `L` (lap), `R` (reset), `Esc` (close any dialog or menu); shortcuts are ignored while typing in a field or while a modal is open
- **Responsive design** — desktop, tablet and mobile (no horizontal scrolling), 4-column lap table on desktop, condensed layout on small screens
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
├── index.html   # Semantic page structure, stats bar, lap table, modals, menu
├── style.css    # Premium dark + light themes, glassmorphism, animations, responsive rules
├── script.js    # Timestamp-based engine, laps, stats, comparison, CSV, theme, persistence
├── README.md    # This file
```

### Persistence keys

| Key                    | Contents                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| `stopwatch.session.v2` | JSON session snapshot: elapsed ms, lap count, laps and their statistics |
| `stopwatch.theme`      | `"dark"` or `"light"`                                                  |

Only these two keys are ever written; **Clear saved data** deletes exactly them and leaves other sites'/apps' storage untouched. No cookies, no personal data, no server.

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
