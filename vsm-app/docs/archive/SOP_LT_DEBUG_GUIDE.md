# SOP Lead Time Formula - Debugging Guide

## 🔍 Current Problem
The formula `=IF($G2="","",IFERROR(SUMIFS(SOP_Cal!$J:$J,SOP_Cal!$B:$B,$G2,SOP_Cal!$C:$C,$AM2,SOP_Cal!$D:$D,$AL2,SOP_Cal!$E:$E,$AN2,SOP_Cal!$F:$F,$AO2),0))` is returning 0.

## 🎯 Step-by-Step Debugging

### **Step 1: Check Derived Columns (AL, AM, AN, AO)**

First, verify that your derived columns are working correctly.

**In cell AL2 (Drv_Wash):**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE),"N")="Y",$D2,"All"))
```

**In cell AM2 (Drv_Product):**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE),"N")="Y",$AK2,"All"))
```

**In cell AN2 (Drv_OrderType):**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE),"N")="Y",$AJ2,"All"))
```

**In cell AO2 (Drv_QtyBand):**
```excel
=IF($G2="","",IF(IFERROR(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE),"N")="Y",$AH2,"All"))
```

**Test:** Enter a Process Stage in G2 and check if AL2, AM2, AN2, AO2 show values (not blank, not #N/A).

---

### **Step 2: Verify SOP_Cal Sheet Structure**

Your SOP_Cal sheet MUST have this exact structure:

| Column | Name | Example Values |
|--------|------|----------------|
| B | Process Stage | Cutting, Sewing, Finishing |
| C | Product Type | T-Shirt, Jeans, All |
| D | Wash Category | Stone Wash, Enzyme Wash, All |
| E | Order Type | Repeat, Non-Repeat, All |
| F | Order Qty Band | Q1, Q2, Q3, Q4, Q5, All |
| J | SOP Lead Time (Days) | 3, 5, 7, 10 |

**Important Checks:**
- ✅ No blank cells in columns B-F
- ✅ No extra spaces (e.g., "Cutting " vs "Cutting")
- ✅ Consistent capitalization (e.g., "All" not "all")
- ✅ Column J has numeric values (not text)

---

### **Step 3: Test with Simple VLOOKUP**

Before using complex SUMIFS, test if basic lookup works.

**In a test cell (e.g., AP2):**
```excel
=VLOOKUP($G2,SOP_Cal!$B:$J,9,FALSE)
```

This looks up Process Stage only and returns SOP LT from column J (9th column from B).

**Expected Result:**
- If it returns a number → SOP_Cal structure is correct
- If it returns #N/A → Process Stage doesn't exist in SOP_Cal
- If it returns 0 → Column J might have text instead of numbers

---

### **Step 4: Test with Concatenated Lookup**

Create a helper column to see what you're actually matching.

**In cell AQ2 (Test Match String):**
```excel
=$G2&"|"&$AM2&"|"&$AL2&"|"&$AN2&"|"&$AO2
```

This shows what combination you're trying to match (e.g., "Cutting|T-Shirt|Stone Wash|Repeat|Q2").

**In SOP_Cal sheet, add a helper column (e.g., column A):**
```excel
=B2&"|"&C2&"|"&D2&"|"&E2&"|"&F2
```

Copy this down for all rows in SOP_Cal.

**Now test lookup:**
```excel
=IFERROR(VLOOKUP($AQ2,SOP_Cal!$A:$J,10,FALSE),0)
```

This should return the SOP LT if there's a match.

---

### **Step 5: Use INDEX-MATCH Instead of SUMIFS**

SUMIFS can be finicky with text matching. Try INDEX-MATCH:

**In cell I2 (SOP Lead Time):**
```excel
=IF($G2="","",IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,
  (SOP_Cal!$B:$B=$G2)*
  (SOP_Cal!$C:$C=$AM2)*
  (SOP_Cal!$D:$D=$AL2)*
  (SOP_Cal!$E:$E=$AN2)*
  (SOP_Cal!$F:$F=$AO2),0)),0))
```

**Note:** In Google Sheets, this is an array formula. Just paste it normally (don't press Ctrl+Shift+Enter).

---

### **Step 6: Most Reliable Formula (Recommended)**

If all else fails, use this bulletproof approach:

**In cell I2:**
```excel
=IF($G2="","",
  IFERROR(
    FILTER(SOP_Cal!$J:$J,
      (SOP_Cal!$B:$B=$G2)*
      (SOP_Cal!$C:$C=$AM2)*
      (SOP_Cal!$D:$D=$AL2)*
      (SOP_Cal!$E:$E=$AN2)*
      (SOP_Cal!$F:$F=$AO2)),
  0))
```

This uses FILTER which is more reliable than SUMIFS or VLOOKUP.

---

## 🔧 Common Issues and Fixes

### **Issue 1: Extra Spaces**

**Problem:** "Cutting " (with space) doesn't match "Cutting"

**Fix:** Use TRIM in your formulas:
```excel
=IF($G2="","",IFERROR(FILTER(SOP_Cal!$J:$J,
  (TRIM(SOP_Cal!$B:$B)=TRIM($G2))*
  (TRIM(SOP_Cal!$C:$C)=TRIM($AM2))*
  (TRIM(SOP_Cal!$D:$D)=TRIM($AL2))*
  (TRIM(SOP_Cal!$E:$E)=TRIM($AN2))*
  (TRIM(SOP_Cal!$F:$F)=TRIM($AO2)),0))
```

---

### **Issue 2: Case Sensitivity**

**Problem:** "All" doesn't match "all"

**Fix:** Use UPPER or LOWER:
```excel
=IF($G2="","",IFERROR(FILTER(SOP_Cal!$J:$J,
  (UPPER(SOP_Cal!$B:$B)=UPPER($G2))*
  (UPPER(SOP_Cal!$C:$C)=UPPER($AM2))*
  (UPPER(SOP_Cal!$D:$D)=UPPER($AL2))*
  (UPPER(SOP_Cal!$E:$E)=UPPER($AN2))*
  (UPPER(SOP_Cal!$F:$F)=UPPER($AO2)),0))
```

---

### **Issue 3: Column J Has Text**

**Problem:** SOP LT column has "7 days" instead of 7

**Fix:** Clean your SOP_Cal sheet - column J should only have numbers.

Or use VALUE in formula:
```excel
=IF($G2="","",IFERROR(VALUE(FILTER(SOP_Cal!$J:$J,...)),0))
```

---

### **Issue 4: No Matching Row**

**Problem:** The combination doesn't exist in SOP_Cal

**Fix:** Add a fallback lookup that tries with "All" values:

```excel
=IF($G2="","",
  IFERROR(
    FILTER(SOP_Cal!$J:$J,
      (SOP_Cal!$B:$B=$G2)*
      (SOP_Cal!$C:$C=$AM2)*
      (SOP_Cal!$D:$D=$AL2)*
      (SOP_Cal!$E:$E=$AN2)*
      (SOP_Cal!$F:$F=$AO2)),
    IFERROR(
      FILTER(SOP_Cal!$J:$J,
        (SOP_Cal!$B:$B=$G2)*
        (SOP_Cal!$C:$C="All")*
        (SOP_Cal!$D:$D="All")*
        (SOP_Cal!$E:$E="All")*
        (SOP_Cal!$F:$F="All")),
    0)))
```

This tries exact match first, then falls back to "All" values.

---

## 🎯 Recommended Final Formula

**Use this in cell I2 (SOP Lead Time):**

```excel
=IF($G2="","",
  IFERROR(
    FILTER(SOP_Cal!$J:$J,
      (TRIM(SOP_Cal!$B:$B)=TRIM($G2))*
      (TRIM(SOP_Cal!$C:$C)=TRIM($AM2))*
      (TRIM(SOP_Cal!$D:$D)=TRIM($AL2))*
      (TRIM(SOP_Cal!$E:$E)=TRIM($AN2))*
      (TRIM(SOP_Cal!$F:$F)=TRIM($AO2))),
  0))
```

**Why this works:**
✅ FILTER is more reliable than SUMIFS
✅ TRIM handles extra spaces
✅ IFERROR returns 0 if no match
✅ Works with Google Sheets array formulas

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Derived columns (AL, AM, AN, AO) show values (not blank)
- [ ] SOP_Cal sheet has data in columns B-F and J
- [ ] No extra spaces in SOP_Cal data
- [ ] Column J in SOP_Cal has numbers (not text)
- [ ] At least one row in SOP_Cal matches your test data
- [ ] Process Stage in G2 exists in SOP_Cal column B
- [ ] Tried the FILTER formula above

---

## 🚀 Next Steps

1. **Test derived columns** - Make sure AL, AM, AN, AO work
2. **Verify SOP_Cal structure** - Check columns B-F and J
3. **Use FILTER formula** - Replace SUMIFS with FILTER
4. **Test with sample data** - Enter a known process and check result
5. **Copy formula down** - Once working, copy to all rows

If FILTER still returns 0, the issue is in your SOP_Cal data, not the formula!

---

## 💡 Pro Tip

Add a debug column to see what's being matched:

**In column AQ2:**
```excel
="Looking for: "&$G2&" | "&$AM2&" | "&$AL2&" | "&$AN2&" | "&$AO2
```

Then manually check if this combination exists in SOP_Cal. If not, that's your problem!

