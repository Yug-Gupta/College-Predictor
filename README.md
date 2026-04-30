<p align="center">
  <img src="public/favicon.svg" width="80" height="80" alt="UPTAC College Predictor Logo" />
</p>

<h1 align="center">UPTAC College Predictor 2026</h1>

<p align="center">
  <strong>Predict your best engineering college for UPTAC 2026 counselling — powered by official data.</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-8+-4f46e5?style=for-the-badge" alt="Features" /></a>
  <a href="#data-source"><img src="https://img.shields.io/badge/Records-10%2C804-10b981?style=for-the-badge" alt="Records" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Built%20With-Vite%20%2B%20JS-f59e0b?style=for-the-badge" alt="Tech Stack" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-38bdf8?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 📋 Overview

**UPTAC College Predictor 2026** is a free, open-source Single Page Application (SPA) that helps JEE Main aspirants predict their admission chances at **200+ AKTU-affiliated engineering colleges** in Uttar Pradesh. 

The prediction engine uses **10,804 official Opening Rank / Closing Rank records** from the UPTAC 2025 B.Tech Counselling data (sourced from [admissions.nic.in](https://uptac.admissions.nic.in)) to estimate chances for the upcoming **2026 counselling cycle**.

> Built by students, for students. Every prediction is transparent, backed by real cutoff data, and completely free.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Smart Predictions** | Rank-based predictions with **Safe / Moderate / Ambitious** classification and confidence percentages |
| 📊 **Cutoff Trend Charts** | Interactive Chart.js visualizations of cutoff trends across counselling rounds |
| ⚖️ **College Comparison** | Side-by-side comparison of up to **3 colleges** across cutoffs, type, location, and more |
| 🔖 **Bookmark & Save** | Save favourite college-branch combinations with instant reactivity across all pages |
| 📥 **CSV Export** | Export your prediction results as a downloadable CSV file for offline reference |
| 🔍 **Smart Filters** | Filter by chance level, college type, region, branch, and free-text search |
| 🎨 **5 Visual Themes** | Indigo Pro, Midnight Dark, Ocean Breeze, Sunset Warm, and Forest Green |
| 📱 **Fully Responsive** | Optimized layouts for mobile, tablet, and desktop screens |
| 📖 **Counselling Guide** | Step-by-step guide to the UPTAC counselling process |
| 💡 **Smart Recommendations** | AI-powered "Best Fit" college suggestions with personalized counselling tips |

---

## 🖥️ Pages

The app includes **8 fully-featured pages** with hash-based SPA routing:

| Route | Page | Description |
|---|---|---|
| `#/` | **Home** | Landing page with hero, stats, features, and how-it-works |
| `#/predict` | **Predictor** | Input form for rank, category, quota, branch, and filter preferences |
| `#/results` | **Results** | Paginated results with filters, sorting, search, and export |
| `#/college` | **College Detail** | Detailed view with cutoff charts, branch list, and bookmark actions |
| `#/compare` | **Compare** | Side-by-side comparison table for up to 3 colleges |
| `#/saved` | **Saved Colleges** | Bookmarked colleges list with quick access and management |
| `#/guide` | **Counselling Guide** | UPTAC counselling process walkthrough and tips |
| `#/about` | **About** | Project info, methodology, disclaimer, and credits |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Yug-Gupta/College-Predictor.git

# 2. Navigate to the project directory
cd College-Predictor

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will open automatically at **http://localhost:3000**.

### Build for Production

```bash
# Generate optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The production build will be output to the `dist/` directory, ready for deployment.

---

## ⚙️ How It Works

### Prediction Engine

The core prediction engine (`src/engine/predictor.js`) follows a **closing-rank-anchored** methodology:

1. **Data Loading** — Official UPTAC 2025 OR-CR data is loaded from `src/data/official/cutoffs-2025.json`
2. **Rank Adjustment** — A **5% buffer** is applied to 2025 cutoffs to estimate 2026 thresholds (`adjust2026()`)
3. **Chance Classification** — Your rank is compared against the adjusted opening/closing ranks:

| Classification | Condition | Confidence |
|---|---|---|
| 🟢 **Safe** | Rank ≤ Opening Rank | 95% |
| 🟢 **Safe** | Rank within top 50% of range | 80% |
| 🟡 **Moderate** | Rank within 50–85% of range | 55% |
| 🟡 **Moderate** | Rank near Closing Rank | 38% |
| 🔴 **Ambitious** | Rank within 8% beyond cutoff | 22% |
| 🔴 **Ambitious** | Rank within 8–15% beyond cutoff | 10% |

4. **Filtering** — Results are filtered by category, quota, round, branch, college type, region, and seat gender
5. **Sorting** — Results are sorted by chance level (safe → moderate → ambitious), then confidence, then closing rank

### Recommendation Engine

The recommender (`src/engine/recommender.js`) provides:
- **Best Fit** colleges — Safe picks sorted by prestige (government first, then by competitiveness)
- **Counselling Tips** — Personalized advice based on rank bracket and result distribution

---

## 📂 Project Structure

```
College-Predictor/
├── public/                     # Static assets
│   ├── favicon.svg             # App favicon
│   └── icons.svg               # SVG icon sprite
├── scripts/                    # Data pipeline scripts
│   ├── scrape-uptac-orcr.js    # Official UPTAC data scraper
│   ├── normalize-data.js       # Raw → structured JSON normalizer
│   └── verify-data.js          # Data integrity verification
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── header.js           # Navigation header with badges
│   │   ├── footer.js           # Site footer
│   │   └── theme-switcher.js   # Theme picker dropdown
│   ├── data/                   # Data layer
│   │   ├── official/           # Official UPTAC 2025 JSON datasets
│   │   │   ├── cutoffs-2025.json       # 10,804 OR-CR records (~6 MB)
│   │   │   ├── colleges-2025.json      # 200 college profiles
│   │   │   ├── branches-2025.json      # 50 B.Tech branches
│   │   │   └── metadata.json           # Categories, quotas, genders
│   │   ├── colleges.js         # College query functions
│   │   ├── branches.js         # Branch query functions
│   │   ├── cutoffs.js          # Cutoff query functions
│   │   └── categories.js       # Category/quota definitions
│   ├── engine/                 # Prediction logic
│   │   ├── predictor.js        # Core prediction engine
│   │   └── recommender.js      # Smart recommendation engine
│   ├── pages/                  # Page renderers (8 pages)
│   │   ├── home.js             # Landing page
│   │   ├── predictor.js        # Prediction input form
│   │   ├── results.js          # Results display with filters
│   │   ├── college-detail.js   # Individual college view
│   │   ├── compare.js          # College comparison
│   │   ├── saved.js            # Bookmarked colleges
│   │   ├── guide.js            # Counselling guide
│   │   └── about.js            # About & disclaimer
│   ├── styles/                 # CSS design system
│   │   ├── base.css            # Reset, typography, layout
│   │   ├── themes.css          # 5 color themes via CSS vars
│   │   ├── components.css      # Component styles
│   │   ├── pages.css           # Page-specific styles
│   │   ├── animations.css      # Transitions & keyframes
│   │   └── utilities.css       # Utility classes
│   ├── utils/                  # Helper utilities
│   │   ├── dom.js              # DOM manipulation helpers
│   │   ├── format.js           # Number/text formatting
│   │   ├── storage.js          # LocalStorage wrapper
│   │   └── export.js           # CSV export utility
│   ├── main.js                 # App bootstrap & route registration
│   ├── router.js               # Hash-based SPA router
│   └── state.js                # Centralized state management
├── index.html                  # Entry HTML
├── vite.config.js              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
└── .gitignore                  # Git ignore rules
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **[Vite](https://vite.dev/)** | Build tool & dev server (v8) |
| **Vanilla JavaScript** | Zero-framework SPA with ES modules |
| **CSS Custom Properties** | Design system with 5 switchable themes |
| **[Chart.js](https://www.chartjs.org/)** | Interactive cutoff trend visualizations |
| **[Lucide Icons](https://lucide.dev/)** | Beautiful open-source SVG icons |
| **[DM Sans + Inter](https://fonts.google.com/)** | Premium Google Fonts typography |
| **LocalStorage** | Client-side persistence for bookmarks, preferences, and state |

### Architecture Highlights

- **Custom SPA Router** — Hash-based routing with parameter parsing and page transitions
- **Reactive State Management** — Pub/sub pattern with subscriber notifications for real-time UI updates
- **Data Pipeline** — Automated scraping → normalization → verification scripts for official UPTAC data
- **Theme System** — 5 complete themes defined entirely through CSS custom properties (~60 tokens each)
- **No External Framework** — Pure vanilla JS for minimal bundle size and maximum control

---

## 📊 Data Source

| Field | Value |
|---|---|
| **Source** | Official UPTAC 2025 B.Tech Counselling OR-CR Report |
| **Portal** | [uptac.admissions.nic.in](https://uptac.admissions.nic.in) |
| **Total Records** | 10,804 |
| **Colleges** | 200 |
| **Branches** | 50 |
| **Categories** | OPEN, BC, SC, ST, EWS + subcategories (20+) |
| **Quotas** | Home State, All India |
| **Rounds** | All counselling rounds |
| **Estimated For** | 2026 UPTAC Counselling |

---

## ⚠️ Disclaimer

> This tool provides **estimated predictions** based on official UPTAC 2025 data. Actual cutoffs for 2026 may vary significantly due to:
> - Number of applicants in 2026
> - Difficulty level of JEE Main 2026
> - Changes in college intake capacity
> - Policy changes by AKTU / government
> - New colleges or branches added
>
> **Always verify** with the [official UPTAC portal](https://uptac.admissions.nic.in) before making final counselling decisions. This project is **not affiliated** with AKTU, UPTAC, or any government body.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Ideas

- 🗃️ Updated cutoff data for newer years
- 🐛 Bug fixes and performance improvements
- 🌐 Multi-language support (Hindi, etc.)
- 📈 Additional data visualizations
- ♿ Accessibility improvements

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- **UPTAC / admissions.nic.in** — For publishing official OR-CR counselling data
- **Chart.js** — For beautiful, responsive chart components
- **Lucide** — For the elegant icon library
- **Vite** — For the blazing-fast development experience

---

<p align="center">
  Made with ❤️ for engineering aspirants<br/>
  <strong>© 2026 UPTAC College Predictor</strong>
</p>
