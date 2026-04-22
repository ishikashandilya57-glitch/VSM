# SOP_Cal Sheet - Correct Structure Example

## 🎯 This is what your SOP_Cal sheet should look like

---

## ✅ Correct Structure

| A (Helper) | B (Process Stage) | C (Product Type) | D (Wash Category) | E (Order Type) | F (Order Qty Band) | G | H | I | J (SOP LT Days) |
|------------|-------------------|------------------|-------------------|----------------|-------------------|---|---|---|-----------------|
| (optional) | Cutting | T-Shirt | Stone Wash | Repeat | Q1 | | | | 3 |
| (optional) | Cutting | T-Shirt | Stone Wash | Repeat | Q2 | | | | 3 |
| (optional) | Cutting | T-Shirt | Stone Wash | Repeat | Q3 | | | | 4 |
| (optional) | Cutting | T-Shirt | All | All | All | | | | 5 |
| (optional) | Cutting | Jeans | All | All | All | | | | 6 |
| (optional) | Cutting | All | All | All | All | | | | 5 |
| (optional) | Sewing | T-Shirt | All | Repeat | Q1 | | | | 7 |
| (optional) | Sewing | T-Shirt | All | Repeat | Q2 | | | | 8 |
| (optional) | Sewing | T-Shirt | All | Non-Repeat | Q1 | | | | 10 |
| (optional) | Sewing | All | All | All | All | | | | 9 |
| (optional) | Finishing | All | Stone Wash | All | All | | | | 4 |
| (optional) | Finishing | All | Enzyme Wash | All | All | | | | 5 |
| (optional) | Finishing | All | All | All | All | | | | 4 |
| (optional) | Pre-Production | All | All | Repeat | All | | | | 2 |
| (optional) | Pre-Production | All | All | Non-Repeat | All | | | | 5 |

---

## 🔍 Key Points

### **Column B: Process Stage**
- Must match EXACTLY with Process Stage in VSM_execution sheet
- No extra spaces
- Consistent capitalization
- Examples: "Cutting", "Sewing", "Finishing", "Pre-Production"

### **Column C: Product Type**
- Use "All" if process doesn't depend on product type
- Examples: "T-Shirt", "Jeans", "Shirt", "All"

### **Column D: Wash Category**
- Use "All" if process doesn't depend on wash
- Examples: "Stone Wash", "Enzyme Wash", "Acid Wash", "All"

### **Column E: Order Type**
- Use "All" if process doesn't depend on order type
- Examples: "Repeat", "Non-Repeat", "All"

### **Column F: Order Qty Band**
- Use "All" if process doesn't depend on quantity
- Examples: "Q1", "Q2", "Q3", "Q4", "Q5", "All"

### **Column J: SOP Lead Time (Days)**
- MUST be a number (not text)
- No units (just "7", not "7 days")
- Can be decimal (e.g., 3.5)

---

## ❌ Common Mistakes

### **Mistake 1: Extra Spaces**
```
❌ "Cutting " (with space at end)
✅ "Cutting"
```

### **Mistake 2: Inconsistent Capitalization**
```
❌ "all" or "ALL"
✅ "All"
```

### **Mistake 3: Text in SOP LT Column**
```
❌ "7 days" or "Seven"
✅ 7
```

### **Mistake 4: Blank Cells**
```
❌ Leaving C, D, E, or F blank
✅ Use "All" if dimension doesn't matter
```

### **Mistake 5: Missing Combinations**
If your VSM_execution has:
- Process Stage: "Cutting"
- Product Type: "T-Shirt"
- Wash: "Stone Wash"
- Order Type: "Repeat"
- Qty Band: "Q2"

And derived columns show:
- Drv_Product: "T-Shirt"
- Drv_Wash: "Stone Wash"
- Drv_OrderType: "All"
- Drv_QtyBand: "All"

Then SOP_Cal MUST have a row with:
```
B: Cutting | C: T-Shirt | D: Stone Wash | E: All | F: All | J: (some number)
```

---

## 🧪 Test Your SOP_Cal Sheet

### **Step 1: Check for Extra Spaces**

In a new column (e.g., column K), add this formula:
```excel
=LEN(B2)-LEN(TRIM(B2))
```

If it returns anything other than 0, you have extra spaces!

**Fix:** Select column B → Find & Replace → Find: " " (space) → Replace with: "" (nothing) → Replace all

Repeat for columns C, D, E, F.

---

### **Step 2: Check Data Types**

In column K, add:
```excel
=ISNUMBER(J2)
```

Should return TRUE. If FALSE, column J has text instead of numbers.

**Fix:** Select column J → Format → Number → Number

---

### **Step 3: Create Test Lookup**

In a test cell, try:
```excel
=FILTER(J:J,(B:B="Cutting")*(C:C="All")*(D:D="All")*(E:E="All")*(F:F="All"))
```

Replace "Cutting" with an actual process stage from your sheet.

**Expected:** Should return a number
**If error:** That combination doesn't exist in your sheet

---

## 📋 Sample Data to Copy

If you want to start fresh, here's sample data you can copy-paste:

```
Process Stage	Product Type	Wash Category	Order Type	Order Qty Band	SOP LT Days
Cutting	All	All	All	All	5
Sewing	All	All	All	All	9
Finishing	All	All	All	All	4
Pre-Production	All	All	Repeat	All	2
Pre-Production	All	All	Non-Repeat	All	5
Quality Check	All	All	All	All	2
Packing	All	All	All	All	1
```

**How to use:**
1. Copy the above (including header)
2. In SOP_Cal sheet, select cell B1
3. Paste
4. Column J should have numbers (5, 9, 4, 2, 5, 2, 1)

---

## 🔧 Debugging Checklist

If SOP LT formula still returns 0:

- [ ] Column B has no extra spaces
- [ ] Column C has no extra spaces
- [ ] Column D has no extra spaces
- [ ] Column E has no extra spaces
- [ ] Column F has no extra spaces
- [ ] Column J has numbers (not text)
- [ ] No blank cells in columns B-F
- [ ] "All" is capitalized consistently
- [ ] Process stages match VSM_execution exactly
- [ ] At least one row with all "All" values exists for each process

---

## 🎯 Minimum Required Rows

At minimum, your SOP_Cal should have one row per process with all "All" values:

```
Cutting | All | All | All | All | 5
Sewing | All | All | All | All | 9
Finishing | All | All | All | All | 4
Pre-Production | All | All | All | All | 3
Quality Check | All | All | All | All | 2
Packing | All | All | All | All | 1
```

This ensures every process has a fallback SOP value.

---

## 💡 Pro Tip: Add Helper Column

In column A of SOP_Cal, add this formula:
```excel
=B2&"|"&C2&"|"&D2&"|"&E2&"|"&F2
```

This creates a concatenated key like: "Cutting|All|All|All|All"

Then in VSM_execution, add a helper column (AQ):
```excel
=$G2&"|"&$AM2&"|"&$AL2&"|"&$AN2&"|"&$AO2
```

Now you can visually compare if the combination exists!

---

## ✅ Verification

Once your SOP_Cal is set up correctly:

1. Go to VSM_execution sheet
2. Enter test data in Row 2:
   - G2: "Cutting"
   - AL2: "All"
   - AM2: "All"
   - AN2: "All"
   - AO2: "All"

3. In I2, use this formula:
```excel
=FILTER(SOP_Cal!$J:$J,(SOP_Cal!$B:$B=$G2)*(SOP_Cal!$C:$C=$AM2)*(SOP_Cal!$D:$D=$AL2)*(SOP_Cal!$E:$E=$AN2)*(SOP_Cal!$F:$F=$AO2))
```

4. Should return the SOP LT value (e.g., 5)

If it works, your SOP_Cal is correct! 🎉

---

## 📞 Still Not Working?

If you've checked everything and it still doesn't work:

1. **Export your SOP_Cal sheet** as CSV
2. **Check for hidden characters** (open in Notepad)
3. **Recreate the sheet** from scratch with sample data above
4. **Test with simple data** first (all "All" values)
5. **Gradually add complexity** (specific product types, wash categories, etc.)

The issue is almost always in the data, not the formula! 🔍

