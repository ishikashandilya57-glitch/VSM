# 🚀 Deploy Final Version - Complete Guide

## What's Been Implemented ✅

1. ✅ **Timeout fix** - Batch write optimization (1 operation instead of 20+)
2. ✅ **VA/NNVA/NVA breakdown** - Reads from SOP_Cal columns K, L, M
3. ✅ **5 Supermarkets tracking**:
   - SM1: Before Cutting (from Cutting NVA)
   - SM2: After Cutting (3 days - hardcoded)
   - SM3: After Sewing (3 days - hardcoded)
   - SM4: Finishing WIP (from Finishing NVA)
   - SM5: After Finishing (1 day - hardcoded)
4. ✅ **Target dates with inter-process WIP** - Includes SM2, SM3, SM5 in timeline
5. ✅ **Always create new row** - No updates to existing data

---

## Step 1: Add VA/NNVA/NVA Columns to SOP_Cal Sheet

### Open Your Google Sheet:
https://docs.google.com/spreadsheets/d/1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0

### Go to SOP_Cal Tab

### Add Column Headers (if not already there):
- **Column K**: `VA` (Value Added)
- **Column L**: `NNVA` (Necessary Non-Value Added)
- **Column M**: `NVA` (Non-Value Added)

### Verify Your Data:
Make sure for each row: **VA + NNVA + NVA = SOP LT (Column J)**

Example for Cutting Q1:
```
VA (K) + NNVA (L) + NVA (M) = SOP LT (J)
1.9 + 0.8 + 2.2 = 4.9 ✅
```

---

## Step 2: Deploy Updated Apps Script

### A. Copy the Code

1. Open: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)

### B. Paste to Apps Script

1. Go to: https://script.google.com/home
2. Find and open your **VSM** project
3. Select ALL existing code in the editor
4. Paste the new code (Ctrl+V)
5. Click **Save** (💾 icon or Ctrl+S)

### C. Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click ⚙️ gear icon → Select **Web app**
3. Fill in:
   - **Description**: "Final version - VA/NNVA/NVA + 5 Supermarkets + Inter-Process WIP"
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Click **Authorize access** (if prompted)
6. **Copy the Web App URL**

### D. Update .env.local (if URL changed)

If you got a new URL, update in `vsm-app/.env.local`:
```
GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
```

---

## Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C if running)

# Start fresh
cd vsm-app
npm run dev
```

Server will start at: http://localhost:3000

---

## Step 4: Test the System

### A. Open Browser Console

1. Open: http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to **Console** tab

### B. Submit Test Form

Fill in the form with:
- **Line No**: TEST-001
- **OC NO**: LC/DMN/25/12270 (or any valid OC from your Order_Master)
- **Order NO**: TEST-ORDER
- **Process Stage**: Cutting
- **Actual Start Date**: 2026-01-20
- **Actual End Date**: 2026-01-25
- **Delay Reason**: (leave empty if on time)

Click **Save**

### C. Verify in Console

Look for:
```
📨 Apps Script parsed result:
{
  success: true,
  calculation: {
    totalSopLt: 26.65,
    totalVA: 15.8,
    totalNNVA: 6.3,
    totalNVA: 4.65,
    interProcessWIP: 7,
    totalLeadTime: 33.65,
    supermarkets: {
      supermarket1: 2.2,
      supermarket2: 3,
      supermarket3: 3,
      supermarket4: 0.6,
      supermarket5: 1,
      total: 9.8
    },
    steps: [...]
  }
}
```

### D. Verify in Google Sheet

1. Open your VSM_Execution sheet
2. Check the last row - should have your test data
3. Verify:
   - Line No: TEST-001
   - OC NO: LC/DMN/25/12270
   - Process Stage: Cutting
   - Target Start/End dates are calculated
   - SOP LT: 4.9 days (for Cutting Q1)

---

## Step 5: View Calculation Details

### In Console, expand the `steps` array:

You should see:
```
📋 Order Details:
  OC NO: LC/DMN/25/12270
  Wash Category: Garment Wash
  Delivery Date: 2026-03-15
  Qty Order: 800
  Qty Band: Q1

📊 All Process Stages (11):
  1. Fabric Inhouse
  2. Fabric QC
  ...
  11. Dispatch

📈 Remaining Processes (11):
  1. Fabric Inhouse: 2 days (VA: 0, NNVA: 2, NVA: 0)
  ...
  6. Cutting: 4.9 days (VA: 1.9, NNVA: 0.8, NVA: 2.2)
  7. Sewing: 4.85 days (VA: 1.85, NNVA: 0.8, NVA: 2.2)
  ...
  9. Finishing: 2.6 days (VA: 1.2, NNVA: 0.8, NVA: 0.6)
  ...

📊 Process SOP Lead Time: 26.65 days
   ✅ VA (Value Added): 15.8 days (59.3%)
   🔧 NNVA (Necessary Non-VA): 6.3 days (23.6%)
   ⏳ NVA (Waste/Queue): 4.65 days (17.4%)

🏬 Supermarket Breakdown (NVA Components):
   Supermarket 1 (Before Cutting): 2.2 days
   Supermarket 2 (Cutting WIP): 3 days
   Supermarket 3 (Sewing WIP): 3 days
   Supermarket 4 (Finishing WIP): 0.6 days
   Supermarket 5 (Cartoning WIP): 1 day
   Total Supermarket Time: 9.8 days

📦 Inter-Process WIP: 7 days (SM2 + SM3 + SM5)
🎯 Total Lead Time: 33.65 days (Process SOP + Inter-Process WIP)

🔙 Calculating backwards from Delivery Date:
   Starting from: 2026-03-15

  11. Dispatch:
     Current End Date: 2026-03-15
     Subtract SOP LT: 1 days (VA: 0.5, NNVA: 0.5, NVA: 0)
     Target Start: 2026-03-14
     Target End: 2026-03-15

  10. Inspection:
     Current End Date: 2026-03-14
     Subtract SOP LT: 2 days (VA: 1.5, NNVA: 0.5, NVA: 0)
     Target Start: 2026-03-12
     Target End: 2026-03-14
     
     ⏳ Supermarket 5 (Cartoning WIP): 1 day
     New End Date after SM5: 2026-03-11

  9. Finishing:
     Current End Date: 2026-03-11
     Subtract SOP LT: 2.6 days (VA: 1.2, NNVA: 0.8, NVA: 0.6)
     Target Start: 2026-03-08
     Target End: 2026-03-11

  ...

  7. Sewing:
     Current End Date: 2026-02-28
     Subtract SOP LT: 4.85 days (VA: 1.85, NNVA: 0.8, NVA: 2.2)
     Target Start: 2026-02-23
     Target End: 2026-02-28
     
     ⏳ Supermarket 3 (Sewing WIP): 3 days
     New End Date after SM3: 2026-02-20

  6. Cutting:
     Current End Date: 2026-02-20
     Subtract SOP LT: 4.9 days (VA: 1.9, NNVA: 0.8, NVA: 2.2)
     Target Start: 2026-02-15
     Target End: 2026-02-20
     
     ⏳ Supermarket 2 (Cutting WIP): 3 days
     New End Date after SM2: 2026-02-12

  ...

✅ Target Start Date for Cutting: 2026-02-15
✅ Target End Date for Cutting: 2026-02-20
```

---

## Verification Checklist

- [ ] SOP_Cal has columns K (VA), L (NNVA), M (NVA) ✅
- [ ] VA + NNVA + NVA = SOP LT for all rows ✅
- [ ] Apps Script deployed successfully ✅
- [ ] Dev server running on http://localhost:3000 ✅
- [ ] Test form submission successful ✅
- [ ] Data saved to VSM_Execution sheet ✅
- [ ] Console shows calculation with 5 supermarkets ✅
- [ ] Target dates include inter-process WIP ✅
- [ ] Total Lead Time = 33.65 days (26.65 + 7) ✅

---

## Troubleshooting

### Issue: "SOP_Cal sheet not found"
**Solution**: Check sheet name is exactly `SOP_Cal` (case-sensitive)

### Issue: VA/NNVA/NVA values are 0
**Solution**: 
1. Verify columns K, L, M exist in SOP_Cal
2. Check data is populated
3. Redeploy Apps Script

### Issue: Timeout on save
**Solution**: 
1. Verify you deployed the latest code with batch write
2. Check Apps Script execution logs for errors

### Issue: Target dates don't include supermarkets
**Solution**: 
1. Verify you deployed the code with inter-process WIP logic
2. Check console for "⏳ Supermarket" messages in calculation steps

---

## Success Criteria

✅ Form saves in <1 second
✅ Data appears in VSM_Execution sheet
✅ Console shows complete calculation with:
   - VA/NNVA/NVA breakdown
   - 5 supermarkets tracked
   - Inter-process WIP included
   - Target dates calculated correctly
✅ Total Lead Time = 33.65 days (for Q1)

---

## Next Steps After Deployment

1. **Test with real data** - Use actual OC numbers from your Order_Master
2. **Verify calculations** - Check target dates match expectations
3. **Monitor performance** - Ensure saves complete quickly
4. **Dashboard integration** - Use the supermarket data for NVA reporting

**You're ready to deploy!** 🚀
