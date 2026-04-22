# Formula-Based Calculation System

## 🎯 System Architecture

**Apps Script**: Only saves user input (7 columns)
**Google Sheet Formulas**: Calculate everything else (30+ columns)

This is the **recommended approach** because:
✅ Easy to modify formulas without redeploying script
✅ Transparent - you can see calculations in the sheet
✅ Works with your existing array formulas
✅ Fast and reliable

---

## 📝 User Input Columns (Saved by App)

These are the ONLY columns the app saves:

| Column | Name | Example |
|--------|------|---------|
| A | Line No | DBR_L5 |
| B | OC NO | LC/THE/25/11735 |
| C | Order No | ORD12345 |
| G | Process Stage | Sewing |
| L | Actual Start Date | 2026-03-15 |
| M | Actual End Date | 2026-03-20 |
| T | Delay Reason | Machine breakdown |

---

## 🔢 Calculated Columns (By Formulas)

All other columns are calculated by formulas in your sheet.

### **Setup Instructions:**

1. **Keep your existing array formulas** - they will continue to work
2. **Add formulas to Row 2** for any new calculated columns
3. **Copy formulas down** to cover all rows (e.g., Row 2 to Row 1000)

---

## 📊 Recommended Formulas

### **Column I: SOP Lead Time (Days)**

**Most Reliable Formula (RECOMMENDED):**

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

**Alternative (if FILTER doesn't work):**

```excel
=IF($G2="","",IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,
  (SOP_Cal!$B:$B=$G2)*
  (SOP_Cal!$C:$C=$AM2)*
  (SOP_Cal!$D:$D=$AL2)*
  (SOP_Cal!$E:$E=$AN2)*
  (SOP_Cal!$F:$F=$AO2),0)),0))
```

**Simple version (Process Stage only):**

```excel
=IF($G2="","",IFERROR(VLOOKUP($G2,SOP_Cal!$B:$J,9,FALSE),0))
```

---

### **Column J: Target Start Date**

Working backwards from delivery date:

```excel
=IF($B2="","",
  IF($F2=1,$E2-$I2,
    INDEX($K:$K,MATCH($F2-1,IF($B:$B=$B2,$F:$F),0))-$I2))
```

Or if you have all processes in order:

```excel
=IF($K2="","",$K2-$I2)
```

---

### **Column K: Target End Date**

```excel
=IF($B2="","",
  IF($F2=MAX(IF($B:$B=$B2,$F:$F)),
    $E2,
    INDEX($J:$J,MATCH($F2+1,IF($B:$B=$B2,$F:$F),0))))
```

Or simpler:

```excel
=IF($J2="","",$J2+$I2)
```

---

### **Column N: Process Status**

```excel
=IF($M2="","Not Started",
  IF($M2<=$K2,"Completed - On Time","Completed - Delayed"))
```

---

### **Column O: Process Time (Days)**

```excel
=IF(AND($L2<>"",$M2<>""),DAYS($M2,$L2),0)
```

---

### **Column P: Variance (Days)**

```excel
=IF($M2="",$K2-TODAY(),DAYS($M2,$K2))
```

---

### **Column Q: Delay Reason Category**

```excel
=IF($P2<=0,"On Time",
  IF($P2<=2,"Minor Delay",
    IF($P2<=5,"Moderate Delay","Major Delay")))
```

---

### **Column R: Alert Triggered**

```excel
=IF($P2>2,"Yes","No")
```

---

### **Column S: Delay Flag**

```excel
=IF($P2>0,"Yes","No")
```

---

### **Column U: Risk Level**

```excel
=IF($P2>7,"High",
  IF($P2>3,"Medium","Low"))
```

---

### **Column AL: Drv_Wash**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE)="Y",$D2,"All")
```

---

### **Column AM: Drv_Product**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE)="Y",$AK2,"All")
```

---

### **Column AN: Drv_OrderType**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE)="Y",$AJ2,"All")
```

---

### **Column AO: Drv_QtyBand**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE)="Y",$AH2,"All")
```

---

## 🚀 Setup Steps

### **Step 1: Use Simple Apps Script**

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Delete all code
4. Copy from `vsm-app/google-apps-script/Code.gs`
5. Paste and Save
6. Deploy as Web App (New version)

### **Step 2: Keep Your Existing Formulas**

Your existing array formulas will continue to work! No changes needed.

### **Step 3: Add Missing Formulas**

If any calculated columns don't have formulas yet:

1. Add formula to Row 2
2. Copy down to Row 1000 (or use ARRAYFORMULA)

### **Step 4: Test**

1. Use the app to add a new task
2. Check your sheet - formulas should calculate automatically!

---

## 🎯 How It Works

```
User fills form → App sends data → Apps Script saves to sheet → Formulas calculate → Dashboard reads data
```

**Example Flow:**

1. User enters:
   - Line No: DBR_L5
   - OC NO: LC/THE/25/11735
   - Process Stage: Sewing
   - Actual Start: 2026-03-15
   - Actual End: 2026-03-20

2. Apps Script writes to columns: A, B, C, G, L, M, T

3. Formulas automatically calculate:
   - Column I (SOP LT): 7 days
   - Column J (Target Start): 2026-03-14
   - Column K (Target End): 2026-03-21
   - Column N (Status): "Completed - On Time"
   - Column O (Process Time): 5 days
   - Column P (Variance): -1 day
   - Column U (Risk): "Low"
   - Columns AL-AO (Derived values)

---

## ✅ Benefits of Formula-Based System

### **Advantages:**

✅ **Easy to modify** - Change formulas without redeploying script
✅ **Transparent** - See calculations in the sheet
✅ **Fast** - Google Sheets formulas are optimized
✅ **Flexible** - Easy to add new calculated columns
✅ **Auditable** - Can trace how values are calculated
✅ **Works with existing formulas** - No need to rewrite

### **When to Use Apps Script Instead:**

❌ Very complex calculations (100+ lines of logic)
❌ Need to call external APIs
❌ Need to update multiple sheets
❌ Need transaction-like behavior

For your use case, **formulas are perfect**! ✨

---

## 🔄 Maintenance

### **To Add a New Calculated Column:**

1. Add column header in Row 1
2. Add formula in Row 2
3. Copy formula down to Row 1000
4. Done! No script changes needed

### **To Modify Calculation Logic:**

1. Edit the formula in Row 2
2. Copy down to all rows
3. Done! No deployment needed

### **To Fix Calculation Errors:**

1. Check the formula in Row 2
2. Verify reference sheets (SOP_Cal, SOP_Drivers)
3. Test with sample data
4. Copy corrected formula down

---

## 📋 Deployment Checklist

- [ ] Simple Apps Script deployed (Code.gs)
- [ ] Web App URL in .env.local
- [ ] Existing array formulas working
- [ ] New formulas added to Row 2
- [ ] Formulas copied down to Row 1000
- [ ] Test: Add task via app
- [ ] Verify: Formulas calculate correctly
- [ ] Check: Dashboard shows calculated data

---

## 🎉 You're All Set!

Your system now works like this:

1. **App** → Saves user input (simple and fast)
2. **Formulas** → Calculate everything else (flexible and transparent)
3. **Dashboard** → Shows complete data (real-time)

Perfect balance of simplicity and power! 🚀

---

## 📞 Next Steps

1. Deploy the simple `Code.gs` script
2. Keep your existing formulas
3. Add any missing formulas from this guide
4. Test with the app
5. Enjoy your formula-based system!

No complex Apps Script needed - let Google Sheets do what it does best! ✨
