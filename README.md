# 🌿 EcoTrack AI – Carbon Footprint Awareness Platform

<div align="center">

![EcoTrack AI Banner](https://img.shields.io/badge/EcoTrack%20AI-Carbon%20Footprint%20Platform-4ade80?style=for-the-badge&logo=leaf&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

**A modern, AI-powered carbon footprint awareness platform that helps individuals understand, track, and reduce their environmental impact.**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Problem Statement

Climate change is accelerating, yet most individuals have little understanding of their personal carbon footprint or how daily choices contribute to global emissions. Existing tools are either too complex, inaccessible, or fail to provide actionable, personalized guidance.

**EcoTrack AI** bridges this gap by providing a beautiful, intuitive platform that:
- Measures carbon footprint through a simple, engaging calculator
- Delivers personalized AI-powered recommendations
- Motivates users through daily green challenges and gamification
- Tracks weekly progress to sustain behavior change

---

## ✨ Features

### 🧮 Carbon Footprint Calculator
- Interactive form covering transportation, electricity, food, flights, plastic, and household size
- Computes personalized **Eco Score (0–100)** with animated ring visualization
- Displays risk level: Excellent 🌿 | Good ✅ | Moderate ⚠️ | High Impact 🔴
- Shows estimated annual CO₂ in tonnes and trees needed for offset

### 🤖 AI Smart Recommendations
- Personalized suggestions based on your calculated eco score
- Adaptive recommendation banks for each risk level
- Beautifully animated card layout

### 🏆 Daily Green Challenge
- Unique challenge generated daily (consistent per day, variety over time)
- Random challenge generator for extra motivation
- **Green Points** awarded upon completion
- **Day Streak** tracker to maintain momentum
- All progress saved via localStorage

### 📊 Eco Dashboard
- Live KPI cards: Eco Score, Green Points, Challenges Completed, CO₂ Saved
- Animated counters with smooth number transitions
- Interactive **weekly progress chart** (Chart.js) showing score trends
- All data persisted locally — no account required

### 💡 Green Tips Section
- 8 beautifully designed tip cards covering key sustainability areas
- Each card includes estimated annual CO₂ savings
- Scroll-triggered fade-in animations

### 🌙 Dark / Light Mode
- One-click theme toggle with smooth transitions
- Theme preference saved to localStorage

### 📱 Fully Responsive
- Optimized for desktop, tablet, and mobile
- Adaptive grid layouts, collapsible mobile navigation

### ♿ Accessibility
- Semantic HTML5 elements throughout
- ARIA labels and roles for screen readers
- Keyboard navigable
- Focus-visible styles for keyboard users

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure, accessibility |
| **CSS3** | Glassmorphism, animations, responsive layout, dark/light mode via CSS custom properties |
| **Vanilla JavaScript (ES6+)** | Calculator logic, localStorage, DOM manipulation, counters |
| **Chart.js v4** | Weekly progress line chart (CDN, lightweight) |
| **Phosphor Icons** | Open-source icon set (CDN) |
| **Google Fonts** | Inter + Outfit typefaces |

> **No frameworks, no build tools, no backend** — pure HTML/CSS/JS.

---

## 🧠 Approach

### Carbon Score Algorithm
The Eco Score is calculated using evidence-based emission factors:

```
Total CO₂ (kg/yr) = (Transport + Electricity + Food + Plastic + Flights×800) ÷ HouseholdSize

Eco Score = max(0, min(100, 100 - (totalTonnes / 10) × 100))
```

| Parameter | Low | Medium | High |
|-----------|-----|--------|------|
| Transport (car) | Walk: 0 kg | Public: 600 kg | Car: 2400 kg |
| Electricity | Low: 400 kg | Medium: 900 kg | High: 1600 kg |
| Food | Vegetarian: 1000 kg | Mixed: 1700 kg | Non-veg: 2500 kg |
| Plastic | Low: 50 kg | Medium: 150 kg | High: 300 kg |
| Each Flight | 800 kg per return flight | | |

### Design Approach
- **Glassmorphism** with `backdrop-filter: blur()` for modern aesthetic
- **CSS custom properties** for instant theme switching
- **Intersection Observer API** for performant scroll animations
- **requestAnimationFrame** for buttery smooth number counters

---

## 📁 Folder Structure

```
ecotrack-ai/
│
├── index.html        # Main HTML (single page application)
├── style.css         # All styles (glassmorphism, animations, responsive)
├── script.js         # Application logic (calculator, challenges, chart)
└── README.md         # Documentation
```

> **Total size:** < 50 KB (excluding CDN assets) — well within 10 MB limit.

---

## 🚀 How to Run Locally

No build step or server required.

### Option 1: Open directly
```bash
# Simply open index.html in your browser
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Option 2: Use a local server (recommended for best experience)
```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx)
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open `http://localhost:3000` in your browser.

---

## 🌐 How to Deploy on Netlify

### Method 1: Drag & Drop (Easiest)
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag the `ecotrack-ai/` folder into the upload zone
4. Your site is live in seconds! ✅

### Method 2: Connect GitHub Repository
1. Push the project to a GitHub repository
2. Go to [app.netlify.com](https://app.netlify.com) → **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select the repository
4. Set build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` (root)
5. Click **"Deploy site"** ✅

No server-side configuration, `netlify.toml`, or environment variables are needed.

---

## 🔮 Future Improvements

- [ ] **Backend Integration** – Store user data with Supabase or Firebase for cross-device sync
- [ ] **Real AI API** – Integrate Google Gemini API for truly personalized dynamic recommendations
- [ ] **Carbon Offset Marketplace** – Partner with verified reforestation projects for direct offset purchases
- [ ] **Social Sharing** – Share eco score as a dynamic image card on social media
- [ ] **Community Leaderboard** – Anonymous global ranking of eco scores
- [ ] **Historical Tracking** – Multi-month carbon trend analysis and graphs
- [ ] **PWA Support** – Progressive Web App with offline mode and push notifications for daily challenges
- [ ] **Geolocation** – Localize emission factors based on user's country/region
- [ ] **Import Data** – Connect to smart meters or utility APIs for automatic electricity tracking
- [ ] **Browser Extension** – Track carbon cost of online shopping and streaming in real-time

---

## 📄 License

```
MIT License

Copyright (c) 2025 EcoTrack AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

<div align="center">

Made with 💚 for the planet · **EcoTrack AI** · 2025

*Every small action counts. Start tracking yours today.*

</div>
