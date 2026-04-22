# 🔍 SOP Lookup Debugging Guide

## 🔴 Current Issue

**Sewing process is showing 0 days instead of 5.35 days for Q2 (2000 qty)**

Your calculation shows:
```
7. Sewing: 0 days  ❌ WRONG (should be 5.35 days)
8. Washing: 4.5 days  ✅ CORRECT
```

This means the SOP lookup is failing for Sewing but working for Washing.

## 🎯 What We're Looking For

For this order:
- **Process Stage:** Sewing
- **Wash Category:** Garment Wash
- **Qty Band:** Q2 (2000 units)
- **Product Type:** All (default)
- **Order Type:** All (default)

The system should find a row in SOP_Cal that matches and return **5.35 days**.

## 🔍 Possible Causes

### Cause 1: Column Mismatch
Your SOP_Cal table might have:
- Column D (Wash Category): "Garment Wash" but the system is looking for "Garment Wash" with extra spaces
- Column F (Qty Band): "Q2" but stored as " Q2" or "Q2 "

**Solution:** Check for whitespace in your SOP_Cal data

### Cause 2: Different Column Values
Your SOP_Cal might have:
- Product Type: "Shirt" or "Pant" (not "All")
- Order Type: "Regular" or "Rush" (not "All")

**Solution:** The enhanced fallback logic will now try more combinations

### Cause 3: Wrong Column Positions
The script expects:
- Column A: Process Seq
- Column B: Process Stage
- Column C: Product Type
- Column D: Wash Category
- Column E: Order Type
- Column F: Qty Band
- Column J: SOP LT

**Solution:** Verify your SOP_Cal sheet has data in these exact columns

## ✅ How to Debug

### Step 1: Check Your SOP_Cal Sheet

Open your Google Sheet and go to the SOP_Cal tab. Find rows where:
- Column B (Process Stage) = "Sewing"
- Column D (Wash Category) = "Garment Wash"
- Column F (Qty Band) = "Q2"

**What should you see?**
```
| A | B      | C   | D            | E   | F  | ... | J    |
|---|--------|-----|--------------|-----|----|----|------|
| 7 | Sewing | All | Garment Wash | All | Q2 | ... | 5.35 |
```

### Step 2: Deploy Updated Script

The updated script now has:
1. ✅ Enhanced fallback logic (10 levels instead of 6)
2. ✅ Debug logging that shows all SOP_Cal rows for the process stage
3. ✅ Shows exactly what it's searching for

Deploy the updated `Code_WithCalculations_FIXED_V2.gs` and check the Apps Script logs.

### Step 3: Check Apps Script Logs

1. Open Google Apps Script Editor
2. Run a test calculation
3. View → Logs
4. Look for:

```
🔍 Looking up SOP for: Sewing | Product: All | Wash: Garment Wash | Order: All | Qty: Q2

📋 All SOP_Cal rows for "Sewing":
  Row 15: Product="All" | Wash="Garment Wash" | Order="All" | Qty="Q1" | SOP LT=4.5
  Row 16: Product="All" | Wash="Garment Wash" | Order="All" | Qty="Q2" | SOP LT=5.35
  Row 17: Product="All" | Wash="Garment Wash" | Order="All" | Qty="Q3" | SOP LT=6.2
  ...
```

This will show you EXACTLY what's in your table.

## 🔧 Quick Fixes

### Fix 1: Add Missing Row
If the row doesn't exist, add it to SOP_Cal:
```
Process Seq: 7
Process Stage: Sewing
Product Type: All
Wash Category: Garment Wash
Order Type: All
Qty Band: Q2
SOP LT: 5.35
```

### Fix 2: Trim Whitespace
If you see extra spaces in the logs, clean your SOP_Cal data:
1. Select the entire SOP_Cal sheet
2. Data → Trim whitespace

### Fix 3: Check Case Sensitivity
Make sure:
- "Sewing" not "sewing" or "SEWING"
- "Garment Wash" not "garment wash" or "GARMENT WASH"
- "Q2" not "q2" or "Q 2"

## 📊 Expected Behavior After Fix

When you test with the same order (PRLS/25/13149), you should see:

```
📈 Remaining Processes (5):
  7. Sewing: 5.35 days     ✅ CORRECT
  8. Washing: 4.5 days     ✅ CORRECT
  9. Finishing: 0 days     ✅ (might be 0 if no finishing for this wash type)
  10. Inspection: 1.7 days ✅ CORRECT
  11. Dispatch: 1.2 days   ✅ CORRECT

📊 Total SOP Lead Time: 12.75 days  ✅ (instead of 7.4)
```

## 🚨 If Still Not Working

The enhanced fallback will try these combinations in order:

1. Exact: Sewing | All | Garment Wash | All | Q2
2. Sewing | All | Garment Wash | All | Q2 (Product=All)
3. Sewing | All | All | All | Q2 (Wash=All)
4. Sewing | All | Garment Wash | All | Q2 (OrderType=All)
5. Sewing | All | Garment Wash | All | Q2 (Product=All, OrderType=All)
6. Sewing | All | All | All | Q2 (Wash=All, OrderType=All)
7. Sewing | All | All | All | Q2 (Product=All, Wash=All)
8. Sewing | All | All | All | Q2 (Product=All, Wash=All, OrderType=All)
9. Sewing | All | Garment Wash | All | All (QtyBand=All)
10. Sewing | All | All | All | All (Everything=All)

If NONE of these match, the logs will show you why.

## 📞 Next Steps

1. Deploy the updated script
2. Test with the same order
3. Check Apps Script logs
4. Share the log output if still showing 0 days
