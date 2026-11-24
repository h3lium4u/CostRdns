# Material Error Dashboard (SAP Fiori / SAP Horizon)

A modern, responsive, enterprise-grade **Material Error Dashboard** with integrated **AI Copilot (Material Assistant)**, built in compliance with SAP Fiori / SAP Horizon visual design standards.

---

## 🚀 Key Features

- **Enterprise SAP Fiori Layout**: Clean, structured top filter bar, dynamic summary KPI cards, and progressive disclosure error tables.
- **Period Filter**: Dedicated Month & Year picker (`YYYY-MM`) with a single clean calendar picker icon (no date/day range).
- **SAP CS15 Where-Used Analysis**:
  - Full BOM hierarchy tracking (`Component` → `Parent Assembly` → `Finished Product`).
  - SA3 (Root Cause Analysis Agent) intelligence.
  - Multi-material batch Where-Used analysis with BOM convergence detection and exposure calculations.
- **Batch Multi-Select & Resolution**:
  - Select individual rows or use "Select All" to batch execute actions.
  - "Fix All" and "Where-Used All" batch action triggers.
- **Integrated AI Assistant**:
  - Docked popup and full-screen maximized mode.
  - Smooth minimize without canceling pending fixes or resolution prompts.
  - Integrated Recents sidebar drawer within the maximized copilot window.
  - Editable resolution prompts with complete chat history scrollability.

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
├── index.html              # Material Error Dashboard application
├── vercel.json             # Vercel deployment configuration
├── package.json            # Node manifest with start, build, and test scripts
├── .gitignore              # Git ignore rules
├── local-server.js         # Zero-dependency local development server
├── css/
│   └── style.css           # SAP Fiori enterprise design system stylesheet
├── js/
│   ├── data.js             # Master data model, BOM hierarchy & CS15 engine
│   ├── chatbot.js          # Material Assistant AI Copilot & Recents drawer
│   └── app.js              # Dashboard application controller
└── test/
    └── app.test.js         # Automated unit tests
```
