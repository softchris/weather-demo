# 🌤️ Weather App

A beautiful, mobile-first weather app built with vanilla HTML, CSS, and JavaScript. Powered by the free [Open-Meteo API](https://open-meteo.com/) — no API key required!

![Mobile First](https://img.shields.io/badge/Mobile-First-blue?style=flat-square) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-green?style=flat-square) ![Free API](https://img.shields.io/badge/API-Open--Meteo-orange?style=flat-square)

---

## ✨ Features

- 🔍 **City Search** — Search any city worldwide with smart autocomplete disambiguation
- 📍 **Geolocation** — One-tap "Use My Location" via browser GPS
- 🌡️ **Current Weather** — Real-time temperature, feels-like, humidity, wind speed
- ⏱️ **Hourly Forecast** — Hour-by-hour timeline with temp, rain chance, humidity, wind & UV
- 📅 **7-Day Forecast** — Tap any day card to see full details + hourly breakdown
- ☀️ **UV Index** — With severity labels (Low / Moderate / High / Very High / Extreme)
- 🌧️ **Precipitation Probability** — Rain chance percentage for every hour and day
- 🌿 **Pollen Levels** — Daily pollen data with color-coded severity (where available)
- 🎨 **Adaptive Gradients** — Background changes based on weather conditions & day/night:
  - ☀️ Sunny → warm sunrise tones
  - 🌙 Night → deep blue
  - ☁️ Cloudy → muted grey
  - 🌧️ Rain → stormy blue
  - ❄️ Snow → icy white-blue
  - ⛈️ Thunderstorm → dark purple
- 💎 **Glassmorphism UI** — Semi-transparent cards with backdrop blur
- 📱 **Responsive** — Horizontal scroll on mobile, grid layout on desktop

---

## 🚀 Getting Started

### Prerequisites

All you need is a web browser! No Node.js, no build tools, no package manager.

### Installation

```bash
# Clone the repository
git clone https://github.com/softchris/weather-demo.git

# Navigate into the project
cd weather-demo
```

### ▶️ Running the App

**Option 1 — Just open the file:**

```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

**Option 2 — Use a local dev server** (for the best experience):

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have npx)
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → "Open with Live Server"
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📁 Project Structure

```
weather-demo/
├── index.html   # 📄 Semantic HTML5 structure
├── style.css    # 🎨 Mobile-first responsive styles & adaptive gradients
├── app.js       # ⚙️ All logic: API calls, rendering, interactions
└── README.md    # 📖 You are here!
```

---

## 🌐 APIs Used

| API | Purpose | Key Required? |
|-----|---------|:---:|
| [Open-Meteo Forecast](https://open-meteo.com/en/docs) | Current, hourly & daily weather | ❌ Free |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City name → coordinates | ❌ Free |
| [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) | Pollen data | ❌ Free |
| [Pexels](https://www.pexels.com/api/) | City background images | 🔑 Free key |

> 📝 Open-Meteo allows 10,000 API calls/day. Pexels allows 200 requests/hour — both more than enough for personal use.

### 🖼️ City Background Images (Optional)

To show beautiful city photos behind the weather data, get a free Pexels API key:

1. Go to [pexels.com/api](https://www.pexels.com/api/) and create a free account
2. Copy your API key
3. Open `app.js` and paste it into the `PEXELS_API_KEY` constant at the top
4. That's it! The app works great without it too — you'll just see gradient backgrounds instead

---

## 📱 Screenshots

Search a city → see current conditions → scroll hourly → browse the 7-day forecast → tap a day for details!

---

## 🛠️ Tech Stack

- **HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, `backdrop-filter`, CSS Grid, Flexbox
- **Vanilla JavaScript** — ES6+, Fetch API, Promises, async/await
- **Zero dependencies** — No frameworks, no build step, no npm

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ☕ and 🌦️ by [softchris](https://github.com/softchris)
