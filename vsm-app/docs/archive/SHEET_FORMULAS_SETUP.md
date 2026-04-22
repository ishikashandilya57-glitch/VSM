# Google Sheets Formula Setup Guide

## 🎯 Overview
This guide shows you how to set up formulas in your VS_execution sheet so that when users enter data through the app, all other columns auto-calculate automatically.

## 📋 Column Structure

Your VS_execution sheet has these columns:

| Col | Name | Type | Formula Needed? |
|-----|------|------|-----------------|
| A | Line No | Input | ❌ No (user enters) |
| B | OC NO | Input | ❌ No (user enters) |
| C | Order No | Input | ❌ No (user enters) |
| D | Wash Category | Calculated | ✅ Yes |
| E | Delivery Date | Lookup | ✅ Yes |
| F | Process Seq | Lookup | ✅ Yes |
| G | Process Stage | Input | ❌ No (user enters) |
| H | VA / NVA | Lookup | ✅ Yes |
| I | SOP Lead Time (Days) | Calculated | ✅ Yes |
| J | Target Start Date | Calculated | ✅ Yes |
| K | Target End Date | Calculated | ✅ Yes |
| L | Actual Start Date | Input | ❌ No (user enters) |
| M | Actual End Date | Input | ❌ No (user enters) |
| N | Process Status | Calculated | ✅ Yes |
| O | Process Time (Days) | Calculated | ✅ Yes |
| P | Variance (Days) | Calculated | ✅ Yes |
| Q | Delay Reason Category | Calculated | ✅ Yes |
| R | Alert Triggered | Calculated | ✅ Yes |
| S | Delay Flag | Calculated | ✅ Yes |
| T | Delay Reason | Input | ❌ No (user enters) |
| U | Risk Level | Calculated | ✅ Yes |
| ... | (other columns) | ... | ... |
| AH | Order Qty Band | Lookup | ✅ Yes |
| AJ | Derived Order Type | Lookup | ✅ Yes |
| AK | Product Type | Lookup | ✅ Yes |
| AL | Drv_Wash | Calculated | ✅ Yes |
| AM | Drv_Product | Calculated | ✅ Yes |
| AN | Drv_OrderType | Calculated | ✅ Yes |
| AO | Drv_QtyBand | Calculated | ✅ Yes |

## 🔧 Formula Setup Instructions

### Step 1: Set Up Helper Sheets

You need these reference sheets:

1. **SOP_Drivers** - Defines which dimensions affect each process
2. **SOP_Cal** - Master SOP calendar with lead times
3. **Order_Master** (optional) - Master order data for lookups

### Step 2: Add Formulas to VS_execution

Starting from **Row 2** (Row 1 is headers), add these formulas:

---

### **Column I: SOP Lead Time (Days)**

This looks up SOP based on derived dimensions:

```excel
=IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,
  (SOP_Cal!$B:$B=$G2)*
  (SOP_Cal!$C:$C=$AM2)*
  (SOP_Cal!$D:$D=$AL2)*
  (SOP_Cal!$E:$E=$AN2)*
  (SOP_Cal!$F:$F=$AO2),0)),0)
```

**Note:** This is an array formula. In Google Sheets, just paste it normally.

---

### **Column AL: Drv_Wash (Derived Wash Category)**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE)="Y",$D2,"All")
```

---

### **Column AM: Drv_Product (Derived Product Type)**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE)="Y",$AK2,"All")
```

---

### **Column AN: Drv_OrderType (Derived Order Type)**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE)="Y",$AJ2,"All")
```

---

### **Column AO: Drv_QtyBand (Derived Qty Band)**

```excel
=IF(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE)="Y",$AH2,"All")
```

---

### **Column J: Target Start Date**

Assuming you have a base start date and process sequence:

```excel
=IF($B2="","",E2-SUMIF($B:$B,$B2,$I:$I)+SUMIFS($I:$I,$B:$B,$B2,$F:$F,"<="&$F2))
```

Or if you have a simpler logic:

```excel
=IF($B2="","",E2-$I2)
```

---

### **Column K: Target End Date**

```excel
=IF($J2="","",$J2+$I2)
```

---

### **Column N: Process Status**

```excel
=IF($M2="","Not Started",
  IF($M2<=$K2,"Completed - On Time",
    "Completed - Delayed"))
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
=IF($P2>0,"On Time",
  IF($P2>-3,"Minor Delay",
    IF($P2>-7,"Moderate Delay","Major Delay")))
```

---

### **Column R: Alert Triggered**

```excel
=IF($P2<-2,"Yes","No")
```

---

### **Column S: Delay Flag**

```excel
=IF($P2<0,"Yes","No")
```

---

### **Column U: Risk Level**

```excel
=IF($P2<-7,"High",
  IF($P2<-3,"Medium","Low"))
```

---

## 📝 Step-by-Step Setup Process

### **Step 1: Prepare Your Sheet**

1. Open your VS_execution sheet
2. Make sure Row 1 has all column headers
3. **Important:** Keep Row 2 empty initially (we'll add formulas here)

### **Step 2: Add Formulas to Row 2**

1. Click on cell **I2** (SOP Lead Time)
2. Paste the SOP Lead Time formula
3. Click on cell **AL2** (Drv_Wash)
4. Paste the Drv_Wash formula
5. Continue for all calculated columns (AM2, AN2, AO2, J2, K2, N2, O2, P2, Q2, R2, S2, U2)

### **Step 3: Copy Formulas Down**

1. Select all cells in Row 2 that have formulas (I2, J2, K2, N2, O2, P2, Q2, R2, S2, U2, AL2, AM2, AN2, AO2)
2. Copy them (Ctrl+C)
3. Select the range from Row 3 to Row 1000 (or however many rows you need)
4. Paste (Ctrl+V)

**Alternative Method:**
1. Select cell I2
2. Hover over the small blue square at the bottom-right corner
3. Double-click it to auto-fill down to the last row with data

### **Step 4: Protect Formula Columns**

To prevent users from accidentally editing formulas:

1. Select all formula columns (I, J, K, N, O, P, Q, R, S, U, AL, AM, AN, AO)
2. Right-click → **Protect range**
3. Add a description: "Auto-calculated columns"
4. Click **Set permissions** → **Only you**
5. Click **Done**

### **Step 5: Test the Formulas**

1. Manually enter test data in Row 2:
   - A2: DBR_L1
   - B2: TEST/25/001
   - G2: Cutting
   - L2: 2026-01-15
   - M2: 2026-01-17

2. Check if formulas auto-calculate:
   - Column I should show SOP Lead Time
   - Columns AL-AO should show derived values
   - Columns J, K should show target dates
   - Column N should show process status
   - Column O should show process time
   - Column P should show variance

3. If everything works, delete the test row

---

## 🎯 Alternative: Use ArrayFormula (Advanced)

If you want formulas to auto-apply to new rows, use ArrayFormula in Row 2:

### **Column I (SOP Lead Time) with ArrayFormula:**

```excel
=ARRAYFORMULA(IF(ROW(G:G)=1,"SOP Lead Time (Days)",
  IF(G:G="","",
    IFERROR(VLOOKUP(G:G&AM:AM&AL:AL&AN:AN&AO:AO,
      {SOP_Cal!B:B&SOP_Cal!C:C&SOP_Cal!D:D&SOP_Cal!E:E&SOP_Cal!F:F,SOP_Cal!J:J},2,0),0))))
```

**Note:** ArrayFormula is more complex but automatically applies to all new rows.

---

## ✅ Verification Checklist

After setup, verify:

- [ ] All formula columns have formulas in Row 2
- [ ] Formulas are copied down to at least Row 100
- [ ] Test data shows correct calculations
- [ ] Formula columns are protected
- [ ] SOP_Drivers sheet is complete
- [ ] SOP_Cal sheet has all process combinations
- [ ] No #REF! or #N/A errors in formulas

---

## 🔄 How It Works with the App

1. **User fills form** in the app (Line No, OC NO, Process Stage, Dates, Delay Reason)
2. **App sends data** to Google Apps Script
3. **Script writes** only user input to columns A, B, C, G, L, M, T
4. **Sheet formulas** automatically calculate all other columns (I, J, K, N, O, P, Q, R, S, U, AL, AM, AN, AO)
5. **Dashboard** reads the complete data with all calculations

---

## 🐛 Troubleshooting

### Formulas show #REF! error
- Check that sheet names are correct (SOP_Drivers, SOP_Cal)
- Verify column references match your sheet structure

### Formulas show #N/A error
- Check that SOP_Drivers has all process stages
- Verify SOP_Cal has matching combinations

### Formulas don't auto-fill for new rows
- Use ArrayFormula (see advanced section)
- Or manually copy formulas down to more rows

### Circular dependency error
- Check that no formula references itself
- Verify Target Start/End Date formulas don't create loops

---

## 📞 Next Steps

1. Set up the formulas in your VS_execution sheet
2. Test with manual data entry
3. Deploy the simple Apps Script (Code.gs)
4. Test with the app
5. Monitor and refine formulas as needed

Your system will now work like this:
- **App** → Saves user input
- **Sheet** → Auto-calculates everything else
- **Dashboard** → Shows complete data

Perfect separation of concerns! 🎉
