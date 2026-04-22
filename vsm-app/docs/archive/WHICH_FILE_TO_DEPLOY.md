# 📄 Which File to Deploy?

## ✅ DEPLOY THIS FILE:

```
vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs
```

**This is the ONLY file you need!**

---

## ✅ What's Inside This File?

### 1. **11 Fixed Process Stages** ✅
```javascript
function getAllProcessStages() {
  const fixedProcesses = [
    { seq: 1, stage: 'Fabric Inhouse' },
    { seq: 2, stage: 'Fabric QC' },
    { seq: 3, stage: 'File Release' },
    { seq: 4, stage: 'Pre-Production' },
    { seq: 5, stage: 'CAD / Pattern' },
    { seq: 6, stage: 'Cutting' },
    { seq: 7, stage: 'Sewing' },
    { seq: 8, stage: 'Washing' },
    { seq: 9, stage: 'Finishing' },
    { seq: 10, stage: 'Inspection' },
    { seq: 11, stage: 'Dispatch' }
  ];
  return fixedProcesses;
}
```

### 2. **Progressive SOP Lookup** (10-level fallback) ✅
```javascript
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  // Returns: { sopLt, va, nnva, nva }
  // 10-level fallback logic
}
```

### 3. **VA/NNVA/NVA Breakdown** ✅
```javascript
const SOP_COL = {
  SOP_LT: 9,    // J - Total SOP Lead Time
  VA: 10,       // K - Value Added time
  NNVA: 11,     // L - Necessary Non-Value Added
  NVA: 12       // M - Non-Value Added (waste/queue)
};
```

### 4. **5 Supermarkets Tracking** ✅
```javascript
let supermarket1 = 0;        // Before Cutting (from Cutting NVA)
const supermarket2 = 3;      // After Cutting (Cutting WIP) - FIXED
const supermarket3 = 3;      // Before Sewing (Sewing WIP) - FIXED
let supermarket4 = 0;        // Finishing WIP (from Finishing NVA)
const supermarket5 = 1;      // After Finishing (Cartoning WIP) - FIXED
```

### 5. **Inter-Process WIP in Target Dates** ✅
```javascript
// Add inter-process WIP AFTER specific processes
if (process.stage === 'Finishing') {
  currentEndDate = subtractWorkingDays(currentEndDate, supermarket5, holidays);
} else if (process.stage === 'Sewing') {
  currentEndDate = subtractWorkingDays(currentEndDate, supermarket3, holidays);
} else if (process.stage === 'Cutting') {
  currentEndDate = subtractWorkingDays(currentEndDate, supermarket2, holidays);
}
```

### 6. **Holiday Calendar System** (NEW!) ✅
```javascript
function getHolidays() {
  // Reads from "Holidays" sheet
  // Returns array of holiday dates
}

function isWorkingDay(date, holidays) {
  // Sunday: Always off
  // Saturday: 1st & 5th working, 2nd/3rd/4th off
  // Public holidays: From sheet
}

function subtractWorkingDays(startDate, workingDays, holidays) {
  // Subtracts working days, skips weekends and holidays
}
```

### 7. **Batch Write Optimization** ✅
```javascript
// Prepare all values in array
const rowData = [];
for (let i = 1; i <= 41; i++) rowData.push('');

// Set all fields
rowData[COL.LINE_NO - 1] = data.lineNo;
rowData[COL.OC_NO - 1] = data.ocNo;
// ... more fields

// Write entire row in ONE operation (fast!)
sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
SpreadsheetApp.flush();
```

### 8. **Always Create New Row** ✅
```javascript
// ALWAYS CREATE NEW ROW (no update logic)
const newRow = actualLastRow + 1;
```

---

## 🚫 DO NOT Use These Files:

- ❌ `Code.gs` - Old version
- ❌ `Code_WithCalculations.gs` - Old version
- ❌ `Code_WithCalculations_FIXED.gs` - Old version
- ❌ `Code_CLEAN_ENGINE.gs` - Old version
- ❌ Any other .gs files in the folder

**Only use:** `Code_WithCalculations_FIXED_V2.gs` ✅

---

## 📋 Deployment Steps

### 1. Open the File
```
vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs
```

### 2. Copy ALL Code
```
Ctrl+A (Select All)
Ctrl+C (Copy)
```

### 3. Go to Apps Script
```
https://script.google.com/home
```

### 4. Find Your VSM Project
Click on your existing VSM project

### 5. Paste Code
```
Ctrl+A (Select all existing code)
Ctrl+V (Paste new code)
```

### 6. Save
```
Click Save icon (💾) or Ctrl+S
```

### 7. Deploy
```
Click Deploy → New deployment
Select Web app
Description: "Complete system with holidays"
Click Deploy
Copy Web App URL
```

---

## ✅ Verification

After deployment, the file includes:

```javascript
// At the top of the file:
const SHEET_HOLIDAYS = 'Holidays'; // ← Holiday sheet

// SOP_Cal columns for VA/NNVA/NVA:
const SOP_COL = {
  VA: 10,       // K
  NNVA: 11,     // L
  NVA: 12       // M
};

// 5 Supermarkets:
const supermarket2 = 3;
const supermarket3 = 3;
const supermarket5 = 1;

// Holiday functions:
function getHolidays() { ... }
function isWorkingDay(date, holidays) { ... }
function subtractWorkingDays(startDate, workingDays, holidays) { ... }
```

---

## 📊 What This File Calculates

### Input:
```
OC NO: LC/DMN/25/12270
Process Stage: Cutting
Actual Start: 2026-01-20
Actual End: 2026-01-25
```

### Output:
```json
{
  "success": true,
  "calculation": {
    "totalSopLt": 26.65,
    "totalVA": 15.8,
    "totalNNVA": 6.3,
    "totalNVA": 4.65,
    "interProcessWIP": 7,
    "totalLeadTime": 33.65,
    "supermarkets": {
      "supermarket1": 2.2,
      "supermarket2": 3,
      "supermarket3": 3,
      "supermarket4": 0.6,
      "supermarket5": 1,
      "total": 9.8
    },
    "currentProcess": {
      "stage": "Cutting",
      "sopLt": 4.9,
      "va": 1.9,
      "nnva": 0.8,
      "nva": 2.2,
      "targetStartDate": "2026-02-12",
      "targetEndDate": "2026-02-19"
    }
  }
}
```

---

## 🎯 Summary

**File to Deploy:**
```
Code_WithCalculations_FIXED_V2.gs
```

**What It Has:**
- ✅ 11 fixed process stages
- ✅ Progressive SOP lookup
- ✅ VA/NNVA/NVA breakdown
- ✅ 5 supermarkets tracking
- ✅ Inter-process WIP in target dates
- ✅ Holiday calendar with working days
- ✅ Batch write optimization
- ✅ Always create new row

**This is the complete, final version with ALL features!** 🚀
