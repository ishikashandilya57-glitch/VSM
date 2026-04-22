# 🔴 FIX: Sewing Shows 0 Days Instead of 5.35 Days

## Current Problem

Your calculation shows:
```
7. Sewing: 0 days        ❌ WRONG (should be 5.35 for Q2)
8. Washing: 4.5 days     ✅ CORRECT
9. Finishing: 0 days     ✅ CORRECT
10. Inspection: 1.7 days ✅ CORRECT
11. Dispatch: 1.2 days   ✅ CORRECT
```

**Why Washing works but Sewing doesn't?**
- Both use the same lookup logic
- Washing finds a match in SOP_Cal
- Sewing does NOT find a match

## 🎯 Root Cause

One of these is true:
1. **You haven't deployed the updated script** (most likely)
2. **Your SOP_Cal table is missing the Sewing row for Q2**
3. **The data has whitespace or spelling issues**

## ✅ SOLUTION (3 Steps)

### STEP 1: Run the Test Script (5 minutes)

This will show you EXACTLY what's in your SOP_Cal table.

1. Open Google Apps Script Editor
2. Create a new file: Click + next to "Files"
3. Name it: `Test.gs`
4. Copy the entire content from: `vsm-app/google-apps-script/TEST_SOP_LOOKUP.gs`
5. Paste it into Test.gs
6. Save (Ctrl+S)
7. Select function: `testSopLookup` (dropdown at top)
8. Click "Run" ▶️
9. Click "View" → "Logs"

**What the logs will tell you:**
- ✅ If the row exists → Shows the exact values
- ❌ If the row is missing → Tells you to add it
- ⚠️ If there's a mismatch → Shows what's different

### STEP 2: Fix Your SOP_Cal Table

Based on the test results:

**If the row is missing:**
Add this row to your SOP_Cal sheet:

| A | B      | C   | D            | E   | F  | G | H | I | J    |
|---|--------|-----|--------------|-----|----|----|----|----|------|
| 7 | Sewing | All | Garment Wash | All | Q2 | ... | ... | ... | 5.35 |

**If there's whitespace:**
1. Select the entire SOP_Cal sheet
2. Data → Trim whitespace
3. Save

**If there's a spelling issue:**
Make sure it's exactly:
- "Sewing" (not "sewing" or "SEWING")
- "Garment Wash" (not "garment wash" or "Garment wash")
- "Q2" (not "q2" or " Q2")

### STEP 3: Deploy the Updated Script

Even if you fix the SOP_Cal table, you MUST deploy the updated script for the enhanced fallback logic.

1. Open Google Apps Script Editor
2. Open your main code file (Code.gs or similar)
3. Select ALL (Ctrl+A) and DELETE
4. Open: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
5. Copy ALL (Ctrl+A, Ctrl+C)
6. Paste into Apps Script (Ctrl+V)
7. Save (Ctrl+S)
8. Deploy:
   - Click "Deploy" → "Manage deployments"
   - Click pencil icon ✏️ on existing deployment
   - Change "Version" to "New version"
   - Click "Deploy"
9. Refresh your browser at http://localhost:3000
10. Test again

## 🎯 Expected Result After Fix

```
📈 Remaining Processes (5):
  7. Sewing: 5.35 days     ✅ CORRECT
  8. Washing: 4.5 days     ✅ CORRECT
  9. Finishing: 0 days     ✅ CORRECT
  10. Inspection: 1.7 days ✅ CORRECT
  11. Dispatch: 1.2 days   ✅ CORRECT

📊 Total SOP Lead Time: 12.75 days  ✅ (was 7.4)
```

## 📊 Verify All Quantity Bands

After fixing, test with different quantities to verify:

| Qty Order | Qty Band | Expected Sewing SOP LT |
|-----------|----------|------------------------|
| 500       | Q1       | 4.85 days              |
| 1360      | Q2       | 5.35 days              |
| 4000      | Q3       | 5.35 days              |
| 7000      | Q4       | 6.15 days              |
| 9000      | Q5       | 6.35 days              |

Each should show the correct SOP LT for Sewing based on the quantity band.

## 🔍 Debug Checklist

- [ ] Ran TEST_SOP_LOOKUP.gs and checked logs
- [ ] Verified SOP_Cal has the Sewing row for Q2
- [ ] Trimmed whitespace in SOP_Cal
- [ ] Verified spelling is exact (case-sensitive)
- [ ] Deployed updated Code_WithCalculations_FIXED_V2.gs
- [ ] Created new deployment version
- [ ] Refreshed browser
- [ ] Tested with Q2 order (1360 qty)
- [ ] Verified Sewing shows 5.35 days (not 0)
- [ ] Verified Total SOP LT is 12.75 days (not 7.4)

## 🚨 If Still Not Working

Share the output from TEST_SOP_LOOKUP.gs logs. It will show exactly what's wrong.

The test script will tell you:
1. What columns your SOP_Cal has
2. All rows for Sewing
3. Whether the exact match exists
4. What's different if it doesn't match
