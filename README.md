# ⏱️ Prodigy Infotech — Web Development Internship · Task 02

## Stopwatch Web Application

A modern, fully responsive stopwatch built with **pure HTML5, CSS3 and vanilla JavaScript** — no frameworks, no libraries, no backend. It offers accurate timing, lap analysis, a session summary, CSV export, a dark/light theme and automatic session saving in the browser.

🔗 **Live Demo:** https://adityajais7026.github.io/PRODIGY_WD_02/

---

## 📌 Project Description

This project implements Task 02 of the Prodigy Infotech Web Development Internship: a fully functional stopwatch web application.

The stopwatch starts, pauses, resumes and resets with a single adaptive button, and records unlimited laps with their lap number, lap duration and total elapsed time. Each lap is compared with the previous one, and the fastest and slowest laps are highlighted automatically. A statistics bar and a session summary on reset give an at-a-glance view of the whole run, the lap history can be exported as a CSV file, and the session survives a page refresh so a run is never lost by accident.

The interface uses a premium glassmorphism design in dark mode with an optional light theme, and adapts cleanly from desktop to mobile.

---

## ✨ Features

- **Start / Pause / Resume / Reset** with a single adaptive main button
- **Accurate timing** displayed as `HH : MM : SS : MS`, unaffected by pause/resume or background tabs
- **Lap recording** — unlimited laps, newest first, with lap time and total elapsed time
- **Fastest & slowest lap highlighting** in green and red
- **Statistics bar** — total laps, average, fastest and slowest lap
- **Lap comparison** — how much faster or slower each lap was than the previous one
- **Clear laps** — resets the lap history and stats without stopping or resetting the timer, with a confirmation prompt
- **Session summary** — total time, laps, fastest, slowest and average shown when the stopwatch is reset
- **CSV export** — download the lap history as a spreadsheet-ready file
- **Dark / light theme** — persisted between visits
- **Automatic session saving** — the current session is restored after a page refresh, ready to resume
- **Clear saved data** — removes only this app's saved data, with a confirmation prompt
- **Keyboard shortcuts** — `Space` start/pause/resume, `L` lap, `R` reset, `Esc` close dialogs
- **Responsive design** — desktop, tablet and mobile with no horizontal scrolling
- **Accessible & motion-friendly** — visible focus states, semantic markup and reduced-motion support

---

## 💻 Technologies

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Structure | HTML5                                        |
| Styling   | CSS3                                         |
| Logic     | Vanilla JavaScript (ES2020, no dependencies) |

---

## 🗂️ Project Structure

```text
├── index.html   # Page structure and layout
├── style.css    # Themes, styling, animations and responsive rules
├── script.js    # Stopwatch logic, laps, statistics, CSV, theme and persistence
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

## ✍️ Author

**Aditya Prakash**

_Grateful to Prodigy Infotech for this internship opportunity._
