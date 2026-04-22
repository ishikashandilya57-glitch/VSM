# VSM (Value Stream Mapping) Production Dashboard

A high-performance, real-time production tracking system built with Next.js and Google Apps Script. This application provides visibility across multiple factory environments, allowing for process-level monitoring, bottleneck analysis, and production timeline forecasting.

## 🚀 Features

- **Multi-Factory Dashboards**: Dedicated views for DBR and KPR factories with independent data sources.
- **Real-time Analytics**: Live KPIs for on-time delivery, delay rates, and average variance.
- **Process Queue Tracking**: Visual insight into "Not Started" vs "In Progress" tasks across the entire value stream.
- **Supermarket Monitoring**: metrics for WIP and supermarket day calculations to optimize lead times.
- **Advanced Reporting**: Cumulative achievement tracking and automated delay reason analysis.
- **Factory-Aware Context**: Dynamic routing and API switching based on the selected factory environment.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Recharts, Lucide-React.
- **Backend**: Next.js API Routes (Dynamic), Google Apps Script (GAS) for Sheet integration.
- **Styling**: Vanilla CSS with TailwindCSS 4 support.

## ⚙️ Setup & Installation

### 1. Prerequisite
- A Google Sheet to serve as the database.
- A deployed Google Apps Script (GAS) to handle the `getIntegratedData` and other API actions.

### 2. Environment Variables
Clone `.env.example` to `.env.local` and fill in your details:

```basy
cp .env.example .env.local
```

### 3. Install Dependenci
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

## 📂 Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/app/api/[factory]`: Dynamic API routes for multi-factory support.
- `src/components`: UI components (Sidebar, Dashboard, Charts, etc.).
- `src/lib`: Shared utilities and factory configuration.
- `google-apps-script/`: Backend logic to be deployed in Google Apps Script.

## 🛡️ License
Copyright © 2026. All rights reserved.
