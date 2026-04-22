# 📊 Risk Level Calculation - Complete Explanation

## Overview

Risk Level is calculated based on **Variance** (the difference between actual completion date and target completion date). The calculation logic is **identical** in both backend and dashboard to ensure consistency.

---

## 🔢 Step-by-Step Calculation

### Step 1: Calculate Variance

**Variance** = Actual End Date - Target End Date (in days)

#### Backend (Google Apps Script)
```javascript
// Line 1288-1299 in Code_WithCalculations_FIXED_V2.gs
let variance = 0;
if (actualEnd && targetEnd) {
  const actualEndDate = new Date(actualEnd);
  const targetEndDate = new Date(targetEnd);
  variance = Math.ceil((actualEndDate - targetEndDate) / (1000 * 60 * 60 * 24));
} else if (targetEnd && !actualEnd) {
  // If not completed yet, calculate variance from today
  const today = new Date();
  const targetEndDate = new Date(targetEnd);
  variance = Math.ceil((today - targetEndDate) / (1000 * 60 * 60 * 24));
}
```

#### Dashboard (Frontend)
```typescript
// Lines 412-425 in src/app/page.tsx
if (item.variance !== undefined && item.variance !== null && !isNaN(item.variance)) {
  finalVariance = item.variance; // Use backend variance if available
} else if (actualEnd && targetEnd) {
  const actualEndDate = new Date(actualEnd);
  const targetEndDate = new Date(targetEnd);
  if (!isNaN(actualEndDate.getTime()) && !isNaN(targetEndDate.getTime())) {
    finalVariance = Math.ceil((actualEndDate.getTime() - targetEndDate.getTime()) / (1000 * 60 * 60 * 24));
  }
}
```

**Key Points:**
- Variance is measured in **days**
- Positive variance = Delayed (actual end date is later than target)
- Negative variance = On Time (actual end date is earlier than target)
- If process not completed yet, variance is calculated from today

---

### Step 2: Determine Risk Level from Variance

Risk Level is determined using **thresholds** based on variance:

#### Backend Logic (Google Apps Script)
```javascript
// Line 1305 in Code_WithCalculations_FIXED_V2.gs
const riskLevel = variance > 7 ? 'High' : variance > 3 ? 'Medium' : 'Low';
```

#### Dashboard Logic (Frontend)
```typescript
// Lines 456-472 in src/app/page.tsx
// Use backend riskLevel if available and valid
const backendRiskLevel = item.riskLevel?.trim();
const isValidBackendRiskLevel = backendRiskLevel && 
  (backendRiskLevel === 'High' || backendRiskLevel === 'Medium' || backendRiskLevel === 'Low');

if (isValidBackendRiskLevel) {
  finalRiskLevel = backendRiskLevel; // Use backend value
} else {
  // Calculate risk level from variance (matching backend logic)
  if (finalVariance > 7) {
    finalRiskLevel = 'High';
  } else if (finalVariance > 3) {
    finalRiskLevel = 'Medium';
  } else {
    finalRiskLevel = 'Low';
  }
}
```

---

## 📋 Risk Level Thresholds

| Variance (Days) | Risk Level | Description |
|-----------------|------------|-------------|
| **≤ 0** | **Low** | On time or early |
| **1-3** | **Low** | Minor delay (1-3 days) |
| **4-7** | **Medium** | Moderate delay (4-7 days) |
| **> 7** | **High** | Major delay (more than 7 days) |

### Visual Representation

```
Variance:  -5    0    3    7    10    15
           |-----|-----|-----|-----|-----|
Risk:      Low   Low  Low  Medium High High
```

---

## 🔍 Examples

### Example 1: On-Time Process
- **Target End Date**: 2026-02-15
- **Actual End Date**: 2026-02-14
- **Variance**: -1 day (negative = early)
- **Risk Level**: **Low** ✅

### Example 2: Minor Delay
- **Target End Date**: 2026-02-15
- **Actual End Date**: 2026-02-17
- **Variance**: +2 days
- **Risk Level**: **Low** ✅

### Example 3: Moderate Delay
- **Target End Date**: 2026-02-15
- **Actual End Date**: 2026-02-20
- **Variance**: +5 days
- **Risk Level**: **Medium** ⚠️

### Example 4: Major Delay
- **Target End Date**: 2026-02-15
- **Actual End Date**: 2026-02-25
- **Variance**: +10 days
- **Risk Level**: **High** 🔴

### Example 5: Not Completed Yet
- **Target End Date**: 2026-02-15
- **Actual End Date**: (not set)
- **Today**: 2026-02-20
- **Variance**: +5 days (calculated from today)
- **Risk Level**: **Medium** ⚠️

---

## 🏗️ Backend Implementation Details

### Location: `google-apps-script/Code_WithCalculations_FIXED_V2.gs`

#### 1. **New Task Creation** (doPost function)
- **Line 1288-1299**: Calculate variance
- **Line 1305**: Calculate risk level
- **Line 1314**: Save to Column U (RISK_LEVEL)

#### 2. **Task Update** (updateTask function)
- **Line 1022-1027**: Calculate variance
- **Line 1037**: Calculate risk level
- **Line 1038**: Update Column U (RISK_LEVEL)

### Column Mapping
- **Column U (21)**: `RISK_LEVEL` - Stores "High", "Medium", or "Low"

---

## 🎨 Dashboard Implementation Details

### Location: `src/app/page.tsx`

#### 1. **Data Processing** (Lines 402-480)
- **Priority 1**: Use backend `riskLevel` field if available and valid
- **Priority 2**: Calculate from backend `variance` field if available
- **Priority 3**: Calculate from dates if backend data missing

#### 2. **KPI Calculation** (Lines 509-516)
- Counts unique orders with at least one process where `riskLevel === 'High'`
- Used for "High Risk Rate" KPI card

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  User submits task update                               │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Google Apps Script (Backend)                          │
│                                                         │
│  1. Calculate Variance                                  │
│     variance = actualEndDate - targetEndDate           │
│                                                         │
│  2. Calculate Risk Level                                │
│     if (variance > 7) → 'High'                          │
│     else if (variance > 3) → 'Medium'                   │
│     else → 'Low'                                        │
│                                                         │
│  3. Save to Sheet (Column U)                            │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Google Sheets                                          │
│  Column U: RISK_LEVEL = "High" | "Medium" | "Low"      │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard API (/api/production-data)                   │
│  Reads Column U and returns riskLevel field            │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Dashboard Frontend                                     │
│                                                         │
│  1. Check if backend riskLevel exists                   │
│     → Use it if valid                                   │
│                                                         │
│  2. If missing, calculate from variance                 │
│     → Apply same thresholds                             │
│                                                         │
│  3. Display in KPIs and charts                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Consistency Guarantees

### Why Both Use Same Logic?

1. **Backend is Source of Truth**: Backend calculates and saves risk level to sheet
2. **Dashboard Uses Backend First**: Dashboard prioritizes backend `riskLevel` field
3. **Fallback Calculation**: Dashboard only calculates if backend data missing/invalid
4. **Same Thresholds**: Both use identical thresholds (7 days for High, 3 days for Medium)

---

## 🧪 Testing & Verification

### Check Backend Calculation
```javascript
// In Google Apps Script console
const variance = 10; // days
const riskLevel = variance > 7 ? 'High' : variance > 3 ? 'Medium' : 'Low';
console.log(riskLevel); // Should output "High"
```

### Check Dashboard Calculation
```typescript
// In browser console (F12)
// Look for debug logs:
console.log('Sample calculated statuses:', [
  { variance: 10, calculatedRiskLevel: 'High' },
  { variance: 5, calculatedRiskLevel: 'Medium' },
  { variance: 2, calculatedRiskLevel: 'Low' }
]);
```

### Verify in Google Sheet
1. Open `VSM_Execution` sheet
2. Check Column U (RISK_LEVEL)
3. Verify values match variance in Column P:
   - Variance > 7 → "High"
   - Variance 4-7 → "Medium"
   - Variance ≤ 3 → "Low"

---

## 📊 Related Fields

Risk Level is related to other calculated fields:

| Field | Column | Calculation | Relationship |
|-------|--------|-------------|--------------|
| **Variance** | P | `actualEndDate - targetEndDate` | **Base for Risk Level** |
| **Delay Category** | Q | Based on variance thresholds | Similar logic |
| **Alert** | R | `variance > 2 ? 'Yes' : 'No'` | Triggers at 2 days |
| **Delay Flag** | S | `variance > 0 ? 'Yes' : 'No'` | Any delay |
| **Risk Level** | U | `variance > 7 ? 'High' : ...` | **This field** |

---

## 🎯 Summary

**Risk Level Calculation:**
1. ✅ Calculate **Variance** = Actual End Date - Target End Date (days)
2. ✅ Apply **Thresholds**:
   - **High**: variance > 7 days
   - **Medium**: variance > 3 days
   - **Low**: variance ≤ 3 days
3. ✅ **Backend** calculates and saves to Column U
4. ✅ **Dashboard** uses backend value when available, calculates if missing
5. ✅ **Same logic** ensures consistency across system

**Key Formula:**
```
Risk Level = variance > 7 ? 'High' : variance > 3 ? 'Medium' : 'Low'
```
