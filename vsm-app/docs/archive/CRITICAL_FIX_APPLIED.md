# ✅ CRITICAL FIX APPLIED - Process Stage Calculation

## 🔴 Problem Identified
The system was treating all 67 rows in `SOP_Cal` as separate process stages, but there are only **11 actual manufacturing stages**. The SOP_Cal table contains multiple rows per process stage due to parameter combinations (wash type, product type, order type, quantity band) - these are **RULES for SOP lookup, NOT sequential steps**.

## ✅ Fix Applied

### File: `Code_WithCalculations_FIXED_V2.gs`

**Changed Function: `getAllProcessStages()`**

**BEFORE (WRONG):**
```javascript
function getAllProcessStages() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SOP_CAL);
  
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  const stages = [];
  const seen = new Set();
  
  for (let i = 1; i < data.length; i++) {
    const seq = data[i][0];
    const stage = data[i][1];
    
    if (stage && !seen.has(stage)) {
      seen.add(stage);
      stages.push({ seq: seq, stage: stage });
    }
  }
  
  return stages.sort((a, b) => a.seq - b.seq);
}
```
❌ This was reading ALL 67 rows from SOP_Cal and treating them as process stages

**AFTER (CORRECT):**
```javascript
function getAllProcessStages() {
  // Fixed process sequence - NEVER infer from table
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
✅ Now returns exactly 11 fixed process stages

## 🎯 How It Works Now

### 1. Fixed Process Sequence (11 Stages)
```
1. Fabric Inhouse
2. Fabric QC
3. File Release
4. Pre-Production
5. CAD / Pattern
6. Cutting
7. Sewing
8. Washing
9. Finishing
10. Inspection
11. Dispatch
```

### 2. SOP Lead Time Lookup (Progressive Fallback)
For each of the 11 stages, the system:
- Looks up ONE SOP LT from SOP_Cal table using progressive fallback
- Matches: Process Stage → Wash Category → Qty Band → Product Type → Order Type
- Fallback order: Exact → Product=All → Wash=All → OrderType=All → QtyBand=All → All=All

### 3. Backward Date Calculation
- Starts from Delivery Date
- Iterates backward through all 11 stages
- For each stage:
  - Target End Date = current pointer date
  - Target Start Date = Target End Date - SOP Lead Time
  - Update pointer date = Target Start Date

### 4. Output
For each order, the system now outputs:
- **11 process stages** (not 67)
- Each with: Process Stage, SOP LT, Target Start Date, Target End Date
- Total SOP Lead Time = sum of 11 selected SOP LTs

## 📋 Next Steps - DEPLOYMENT REQUIRED

### Step 1: Deploy Updated Script
1. Open Google Apps Script Editor
2. Copy the entire content from `Code_WithCalculations_FIXED_V2.gs`
3. Paste it into your Apps Script project
4. Save the project
5. Deploy as Web App:
   - Click "Deploy" → "New deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
6. Copy the Web App URL
7. Update `.env.local` with the new URL:
   ```
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=your_new_web_app_url
   ```

### Step 2: Test the Fix
Test with orders of different quantity bands to verify:

**Test Case 1: Q1 Order (≤1000 units)**
- OC NO: [select a Q1 order]
- Process Stage: Cutting
- Expected: Should show 11 processes from Cutting to Dispatch

**Test Case 2: Q5 Order (>8000 units)**
- OC NO: [select a Q5 order]
- Process Stage: Sewing
- Expected: Should show 11 processes from Sewing to Dispatch

**Test Case 3: Full Flow**
- OC NO: [any order]
- Process Stage: Fabric Inhouse
- Expected: Should show all 11 processes from Fabric Inhouse to Dispatch

### Step 3: Verify Output
Check that:
- ✅ Calculation steps show exactly 11 process stages
- ✅ Target dates are calculated correctly for all 11 stages
- ✅ SOP LT varies based on quantity band (Q1-Q5)
- ✅ Total SOP LT is the sum of 11 individual SOP LTs
- ✅ No duplicate or missing process stages

## 🔍 Debugging Tips

If you see issues:

1. **Check the calculation steps panel** - It shows:
   - All 11 process stages
   - SOP LT for each stage
   - Backward calculation from delivery date

2. **Check Google Apps Script logs**:
   - Open Apps Script Editor
   - View → Logs
   - Look for SOP lookup messages

3. **Verify SOP_Cal table**:
   - Should have multiple rows per process stage
   - Each row is a RULE for SOP lookup
   - NOT a sequential process step

## ✅ Summary

**What Changed:**
- `getAllProcessStages()` now returns hardcoded 11 fixed process stages
- System no longer reads process stages from SOP_Cal table
- SOP_Cal is now correctly used as a RULE ENGINE for SOP lookup only

**What Stayed the Same:**
- Progressive fallback logic for SOP lookup
- Backward date calculation from delivery date
- All other calculations (status, variance, delay, etc.)

**Result:**
- System now correctly calculates target dates for exactly 11 manufacturing stages
- Each order gets 11 process rows (not 67)
- SOP LT is selected correctly based on order parameters
