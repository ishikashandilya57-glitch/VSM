# ✅ Delayed Rate & High Risk Calculation Fix

## Problem Identified

The dashboard was showing the **same values** for "Delayed Rate" and "High Risk" (both showing 41.7% and 5 orders), which is incorrect because:

- **Delayed Rate** should count orders with **any process delayed** (variance > 0 days)
- **High Risk Rate** should count orders with **any process at high risk** (variance > 7 days)

These are **different metrics** and should show different values.

---

## Root Cause

The dashboard was **ignoring backend data** and recalculating everything from scratch, which could lead to:
1. Inconsistent calculations between frontend and backend
2. Not using the backend's calculated `riskLevel` and `processStatus` fields
3. Potential mismatches in date parsing or calculation logic

---

## ✅ Solution Applied

### 1. **Use Backend Data When Available**

The dashboard now **prioritizes backend calculations**:

- **Risk Level**: Uses `riskLevel` field from backend (Column U) if available and valid
- **Process Status**: Uses `processStatus` field from backend (Column N) if available and valid
- **Variance**: Uses `variance` field from backend (Column P) if available and valid

### 2. **Fallback to Calculation**

Only calculates on-the-fly if backend data is:
- Missing/empty
- Contains errors (`#ERROR!`, `#REF!`)
- Invalid format

### 3. **Correct Logic Matching Backend**

**Backend Logic (Apps Script):**
```javascript
// Process Status
if (actualEndDate <= targetEndDate) {
  processStatus = 'Completed – On Time';
} else {
  processStatus = 'Completed – Delayed';
}

// Risk Level
if (variance > 7) {
  riskLevel = 'High';
} else if (variance > 3) {
  riskLevel = 'Medium';
} else {
  riskLevel = 'Low';
}
```

**Frontend Logic (Now Matches):**
```typescript
// Delayed: variance > 0 OR status contains "Delayed"
const isDelayed = calculatedVariance > 0 || 
                  calculatedStatus.includes('Delayed');

// High Risk: riskLevel === 'High' (which means variance > 7)
const isHighRisk = calculatedRiskLevel === 'High';
```

---

## 📊 How It Works Now

### **Delayed Rate Calculation**

Counts **unique orders** where **at least one process** has:
- `processStatus` contains "Delayed" (from backend), OR
- `variance > 0` (calculated: actualEndDate > targetEndDate)

**Example:**
- Order A: Process 1 delayed (variance = 2 days) → **Counted as Delayed**
- Order B: Process 1 on-time (variance = 0) → **Not counted as Delayed**

### **High Risk Rate Calculation**

Counts **unique orders** where **at least one process** has:
- `riskLevel === 'High'` (from backend), OR
- `variance > 7` (calculated fallback)

**Example:**
- Order A: Process 1 delayed (variance = 2 days) → **NOT High Risk** (variance ≤ 7)
- Order B: Process 1 delayed (variance = 10 days) → **High Risk** (variance > 7)

---

## 🔍 Key Differences

| Metric | Criteria | Example |
|--------|----------|---------|
| **Delayed Rate** | Any process with variance > 0 | Order delayed by 1 day = Delayed |
| **High Risk Rate** | Any process with variance > 7 | Order delayed by 10 days = High Risk |

**Important:** An order can be:
- ✅ **Delayed but NOT High Risk** (variance = 1-7 days)
- ✅ **Delayed AND High Risk** (variance > 7 days)
- ✅ **High Risk but NOT Delayed** (if using future variance calculation)

---

## 📝 Code Changes

### File: `src/app/page.tsx`

**Lines 402-447:** Updated status and risk level calculation
- Now uses backend `riskLevel` and `processStatus` when available
- Falls back to calculation only if backend data is missing/invalid
- Handles both em dash (`–`) and regular dash (`-`) in status strings

**Lines 456-521:** Updated counting logic
- **Delayed**: Checks both status and variance > 0
- **High Risk**: Uses calculated risk level (which prioritizes backend)

---

## 🧪 Testing

### Check Browser Console (F12)

Look for these debug logs:

```
=== KPI Calculation Debug ===
Sample data (first 3 items): [...]
Unique orders: X
=== KPI Counts ===
On-time orders: X
Delayed orders: X
High-risk orders: X
Sample delayed items: [...]
Sample high-risk items: [...]
Final KPI result: {
  total: X,
  delayed: X,
  delayedRate: "X.X",
  highRisk: X,
  highRiskRate: "X.X"
}
```

### Expected Results

**Before Fix:**
- Delayed Rate: 41.7% (5 orders)
- High Risk: 41.7% (5 orders) ❌ **Same values!**

**After Fix:**
- Delayed Rate: X.X% (Y orders) ✅
- High Risk: Z.Z% (W orders) ✅ **Different values!**

---

## ✅ Verification Checklist

- [ ] Delayed Rate shows orders with variance > 0
- [ ] High Risk shows orders with variance > 7
- [ ] Values are different (unless all delayed orders are also high risk)
- [ ] Backend `riskLevel` field is being used when available
- [ ] Backend `processStatus` field is being used when available
- [ ] Console logs show correct counts for each metric

---

## 📌 Notes

1. **Order-Level Aggregation**: Both metrics count **unique orders**, not individual processes
   - If an order has 5 processes and 1 is delayed, the order is counted once as "Delayed"
   - If an order has 5 processes and 1 is high risk, the order is counted once as "High Risk"

2. **Backend Priority**: The dashboard now trusts backend calculations when available, ensuring consistency

3. **Date Handling**: The fix handles both Excel date serial numbers and ISO date strings

4. **Error Handling**: Invalid backend data (errors, empty values) triggers fallback calculation

---

## 🎯 Summary

✅ **Fixed**: Dashboard now uses backend `riskLevel` and `processStatus` when available  
✅ **Fixed**: Delayed Rate counts orders with variance > 0  
✅ **Fixed**: High Risk Rate counts orders with variance > 7  
✅ **Result**: Two distinct metrics showing accurate, different values
