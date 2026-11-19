# Material Error Dashboard — UI/UX Comparison Studio (SAP Fiori)

A modern, responsive, enterprise-grade **Material Error Dashboard** featuring **selectable UI/UX implementations** within a single web application, designed in compliance with SAP Fiori / SAP Horizon visual design standards.

---

## 🎨 Selectable UI/UX Designs

| Design | Name | Visual Theme | Architecture & Concept |
|---|---|---|---|
| **01** | **Design 1: Current** | Classic SAP Fiori | Baseline implementation with horizontal category cards, progressive disclosure, and contextual row actions. |
| **03** | **Design 3: Claude** | Blue Glassmorphism + Aurora Gradient | Tabbed Accordion Console with category tabs, frosted glass panels, independent group accordions, and refined enterprise typography. |

---

## 🚀 Deployment to Vercel

The application is completely static (vanilla HTML5, CSS3, ES6 JavaScript) and requires zero build configuration:

### Method 1: Deploy with Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy directly from the project directory
vercel
```

### Method 2: Deploy from GitHub
1. Push your repository to GitHub (`https://github.com/h3lium4u/CostRdns`).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `CostRdns` repository.
4. Leave all settings at their defaults:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: *None* (or `npm run build`)
   - **Output Directory**: *None*
5. Click **Deploy**.

The included `vercel.json` automatically configures clean URLs and routing.

---

## 💻 Local Development

### 1. Start the Local Server
```bash
npm start
# or
node local-server.js
```
The server will run at:
- **Primary**: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- **Secondary**: [http://127.0.0.1:8085/](http://127.0.0.1:8085/)

### 2. Run the Test Suite
```bash
npm test
```

---

## 📁 Project Structure

```
D:\Cost rdnss\
├── index.html              # Multi-design comparative shell with top switcher
├── vercel.json             # Vercel deployment configuration
├── package.json            # Node manifest with start, build, and test scripts
├── .gitignore              # Git ignore rules
├── local-server.js         # Zero-dependency local development server
├── css/
│   ├── style.css           # Design 1 styles (Untouched Baseline)
│   ├── design-selector.css # Top comparison switcher navigation bar
│   └── design-claude.css   # Design 3 styles (Tabbed Accordion Console)
├── js/
│   ├── data.js             # Shared deterministic master data model
│   ├── chatbot.js          # Shared floating Material Assistant & Recents drawer
│   ├── app.js              # Design 1 controller
│   ├── design-claude.js    # Design 3 controller
│   └── design-switcher.js  # Top navigation switcher controller
└── test/
    └── app.test.js         # Automated unit tests
```
