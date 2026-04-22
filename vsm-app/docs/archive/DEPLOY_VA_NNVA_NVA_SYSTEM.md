# 🚀 DEPLOY VA/NNVA/NVA BREAKDOWN SYSTEM

## What This Adds
✅ **VA/NNVA/NVA breakdown** for each process stage
✅ **Supermarket tracking** (4 supermarkets across production flow)
✅ **Enhanced calculation steps** showing value-add percentages
✅ **Dashboard-ready data** for NVA visibility

## Supermarket Definitions
- **Supermarket 1**: Before Cutting (queue after Fabric Issue+Relaxation)
- **Supermarket 2**: After Cutting (Cutting WIP = 3 days)
- **Supermarket 3**: Before Sewing (Sewing WIP = 3 days)
- **Supermarket 4**: Finishing WIP (1 day)

## Implementation Steps

### STEP 1: Add VA/NNVA/NVA Columns to SOP_Cal Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0
2. Go to **SOP_Cal** tab
3. Add three new column headers:
   - **Column K**: `VA` (Value Added)
   - **Column L**: `NNVA` (Necessary Non-Value Added)
   - **Column M**: `NVA` (Non-Value Added)

4. Copy data from `SOP_CAL_WITH_VA_NNVA_NVA.csv` file
   - Open the CSV file in this folder
   - Copy columns K, L, M values
   - Paste into your SOP_Cal sheet

### STEP 2: Verify Data Integrity

Check that for each row:
```
VA + NNVA + NVA = SOP LT (Column J)
```

**Example for Cutting Q1:**
- VA: 1.9 days
- NNVA: 0.8 days (Fabric Issue + Relaxation)
- NVA: 2.2 days (Supermarket 1 queue)
- **Total**: 4.9 days ✅

**Example for Cutting Q5:**
- VA: 1.9 days
- NNVA: 1.5 days
- NVA: 4.0 days
- **Total**: 7.4 days ✅

### STEP 3: Deploy Updated Apps Script

1. Open: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to: https://script.google.com/home
5. Open your VSM project
6. Paste the new code (Ctrl+V)
7. Click **Save** (💾 icon)

### STEP 4: Create NEW Deployment

1. Click **Deploy** → **New deployment**
2. Click ⚙️ gear icon → Select **Web app**
3. Settings:
   - Description: "VA/NNVA/NVA breakdown + Supermarket tracking"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access**
6. Copy the NEW Web App URL

### STEP 5: Update .env.local (if URL changed)

If you got a new URL, update both lines in `.env.local`:
```
GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
```

### STEP 6: Test the System

1. Restart dev server: `npm run dev`
2. Submit a test form with:
   - OC NO: LC/DMN/25/12270
   - Process Stage: Cutting
   - Dates: Any valid dates
3. Check the calculation steps in console/logs

## Expected Output in Calculation Steps

You should now see:

```
📊 Total SOP Lead Time: 25.3 days
   ✅ VA (Value Added): 15.8 days (62.5%)
   🔧 NNVA (Necessary Non-VA): 6.3 days (24.9%)
   ⏳ NVA (Waste/Queue): 3.2 days (12.6%)

🏬 Supermarket Breakdown (NVA Components):
   Supermarket 1 (Before Cutting): 0.2 days
   Supermarket 2 (Cutting WIP): 3 days
   Supermarket 3 (Sewing WIP): 3 days
   Supermarket 4 (Finishing WIP): 1 day
   Total Supermarket Time: 7.2 days
```

## What Changed in Code

### 1. New SOP_COL Constants
```javascript
const SOP_COL = {
  PROCESS_SEQ: 0,
  PROCESS_STAGE: 1,
  PRODUCT_TYPE: 2,
  WASH_CATEGORY: 3,
  ORDER_TYPE: 4,
  QTY_BAND: 5,
  SOP_LT: 9,      // J - Total
  VA: 10,         // K - Value Added
  NNVA: 11,       // L - Necessary Non-VA
  NVA: 12         // M - Non-VA
};
```

### 2. Enhanced lookupSopLeadTime()
Now returns object instead of number:
```javascript
return {
  sopLt: 4.9,
  va: 1.9,
  nnva: 0.8,
  nva: 2.2
};
```

### 3. Supermarket Tracking
Automatically calculates:
- Supermarket 1 = Cutting NVA - 6 days (excludes SM2+SM3)
- Supermarket 2 = 3 days (Cutting WIP)
- Supermarket 3 = 3 days (Sewing WIP)
- Supermarket 4 = 1 day (Finishing WIP)

### 4. Enhanced Calculation Steps
Shows VA/NNVA/NVA for each process and totals with percentages.

## Dashboard Integration (Next Phase)

The calculation response now includes:
```javascript
{
  totalVA: 15.8,
  totalNNVA: 6.3,
  totalNVA: 3.2,
  supermarkets: {
    supermarket1: 0.2,
    supermarket2: 3,
    supermarket3: 3,
    supermarket4: 1,
    total: 7.2
  }
}
```

You can use this data to create dashboard widgets showing:
- VA Ratio pie chart
- NVA trend over time
- Supermarket bottleneck analysis
- Process efficiency metrics

## Troubleshooting

### Issue: VA + NNVA + NVA ≠ SOP LT
**Solution**: Check your SOP_Cal sheet data. Each row must satisfy:
```
Column K + Column L + Column M = Column J
```

### Issue: Supermarket values are negative
**Solution**: Verify Cutting NVA values in SOP_Cal. They should be:
- Q1: 2.2 days (minimum)
- Q5: 4.0 days (maximum)

### Issue: Calculation steps don't show VA/NNVA/NVA
**Solution**: 
1. Verify columns K, L, M exist in SOP_Cal sheet
2. Check Apps Script is deployed (new version)
3. Clear browser cache and restart dev server

---

**DEPLOY THIS NOW** to get full VA/NNVA/NVA visibility! 🎯
