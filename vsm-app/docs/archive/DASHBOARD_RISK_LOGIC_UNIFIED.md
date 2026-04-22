# Dashboard Risk Logic – Single Source of Truth

## Problem

- **High Risk Rate** showed one value (e.g. 47%).
- **Average Risk Score** showed 0 in another view.
- **Per-order risk** sometimes showed "Low" for the same data.

Different views used different data (raw backend vs calculated), so risk looked contradictory.

---

## Solution: One Definition of Risk

All risk-related metrics now use **one computed dataset**: `enrichedData`.

### 1. `enrichedData` (single source of truth)

- **Input**: `filteredData` (from API).
- **Computed per row**:
  - **Variance**: From `actualEndDate` and `targetEndDate` when both exist; otherwise from backend `variance`.
  - **Status**: From variance when dates exist; otherwise from backend `processStatus` if valid.
  - **Risk level**: **Always from variance** (aligned with backend):
    - `variance > 7` → **High**
    - `variance > 3` → **Medium**
    - else → **Low**

So delay and risk are **calculation-based** when dates are present, and backend is only used when dates are missing.

### 2. Where `enrichedData` is used

| View / Metric | What uses it | What it shows |
|---------------|--------------|----------------|
| **High Risk Rate %** | `kpis` | % of unique orders with at least one process where `calculatedRiskLevel === 'High'` |
| **Delayed Rate %** | `kpis` | % of unique orders with at least one delayed process (by calculated status/variance) |
| **Average Risk Score** | `predictiveRiskScoring` | 0–100 score per order from `calculatedVariance`, `calculatedRiskLevel`, `calculatedStatus`; then average over orders |
| **Predictive Risk Distribution** | `predictiveRiskScoring` | Critical / High / Medium / Low counts from same scores |
| **Top 10 High-Risk Orders** | `predictiveRiskScoring` | Orders sorted by same risk score |
| **KPI modal (order list)** | `enrichedData` | Each order’s badge from `calculatedRiskLevel` (High / Medium) |
| **Table (if used)** | `tableDisplayData` | Rows built from `enrichedData` with `riskLevel` = `calculatedRiskLevel`, etc. |

So: **High Risk Rate**, **Average Risk Score**, **per-order risk**, and **table/modal** all share the same underlying logic and data.

### 3. Risk level rule (backend and dashboard)

- **Variance** = `actualEndDate` − `targetEndDate` (days).
- **Risk level**:
  - **High**: variance > 7  
  - **Medium**: variance > 3 and ≤ 7  
  - **Low**: variance ≤ 3  

This matches the backend (e.g. Apps Script) and is applied consistently in the dashboard via `enrichedData`.

### 4. Why Average Risk Score was 0 before

- **Before**: Predictive risk used **raw** `filteredData` (`item.riskLevel`, `item.variance`, `item.processStatus`). If the sheet had empty or invalid values, variance and risk stayed 0, so every order got risk score 0 and the average was 0.
- **After**: Predictive risk uses **enrichedData** (`calculatedVariance`, `calculatedRiskLevel`, `calculatedStatus`). So when dates exist, variance and risk are computed the same way as the rest of the dashboard, and Average Risk Score reflects real delays and risk.

### 5. Files / code touched

- **`src/app/page.tsx`**
  - Added `enrichedData` useMemo (single place where variance/status/risk are derived).
  - **KPIs**: Use `enrichedData` for counts and rates.
  - **handleKPIClick**: Uses `enrichedData` for on-time / delayed / high-risk order lists.
  - **predictiveRiskScoring**: Uses `enrichedData` and `calculated*` fields for scores and distribution.
  - **KPI modal**: Uses `enrichedData` and `calculatedRiskLevel` for badges.
  - **tableDisplayData**: Built from `enrichedData` so any table using `tableColumns` shows the same risk/status/variance.
  - **Risk Level column**: StatusBadge for Medium = `warning` (amber).

---

## Summary

- **One definition of risk**: variance-based (High > 7 days, Medium > 3 days, Low ≤ 3).
- **One dataset**: `enrichedData` with `calculatedVariance`, `calculatedStatus`, `calculatedRiskLevel`.
- **All views** (High Risk Rate, Delayed Rate, Average Risk Score, predictive charts, order list, table) use this same logic and data, so the dashboard is consistent and accurate with the input dates and backend rules.
