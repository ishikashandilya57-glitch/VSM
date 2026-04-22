# 🚀 Quick Start Guide - Formula-Based System

## ✅ What You Have Now

Your system is now set up to work like this:

1. **User enters data** in the app → Line No, OC NO, Process Stage, Dates, Delay Reason
2. **Apps Script saves** only user input to Google Sheet
3. **Sheet formulas** auto-calculate everything else (SOP, Status, Variance, Risk, etc.)
4. **Dashboard** displays the complete calculated data

## 📋 Setup Steps

### **Step 1: Update Google Apps Script** ✅ DONE

The new `Code.gs` file is ready. It only saves user input - no calculations.

**To deploy:**
1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Delete all existing code
4. Copy content from `vsm-app/google-apps-script/Code.gs`
5. Paste and **Save**
6. Click **Deploy** → **Manage deployments** → **Edit** → **New version** → **Deploy**

---

### **Step 2: Set Up Sheet Formulas** ⚠️ TODO

You need to add formulas to your VS_execution sheet so columns auto-calculate.

**Follow this guide:** `SHEET_FORMULAS_SETUP.md`

**Quick version:**

1. Open your VS_execution sheet
2. In **Row 2**, add these formulas:

**Column AL (Drv_Wash):**
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE)="Y",$D2,"All")
```

**Column AM (Drv_Product):**
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE)="Y",$AK2,"All")
```

**Column AN (Drv_OrderType):**
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE)="Y",$AJ2,"All")
```

**Column AO (Drv_QtyBand):**
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE)="Y",$AH2,"All")
```

**Column I (SOP Lead Time):**
```
=IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,(SOP_Cal!$B:$B=$G2)*(SOP_Cal!$C:$C=$AM2)*(SOP_Cal!$D:$D=$AL2)*(SOP_Cal!$E:$E=$AN2)*(SOP_Cal!$F:$F=$AO2),0)),0)
```

3. Copy these formulas down to Row 1000
4. Add formulas for other calculated columns (Status, Variance, Risk, etc.)

---

### **Step 3: Test the System**

1. **Test in Google Sheet:**
   - Manually enter data in Row 2
   - Check if formulas calculate correctly

2. **Test from App:**
   - Go to http://localhost:3000
   - Click **Update Task**
   - Fill in the form
   - Click **Save**
   - Check Google Sheet - new row should appear with formulas calculated

---

## 🎯 What Gets Saved vs Calculated

### **User Input (Saved by App):**
- Line No (Column A)
- OC NO (Column B)
- Order No (Column C)
- Process Stage (Column G)
- Actual Start Date (Column L)
- Actual End Date (Column M)
- Delay Reason (Column T)

### **Auto-Calculated (By Sheet Formulas):**
- Wash Category (Column D)
- Delivery Date (Column E)
- Process Seq (Column F)
- VA/NVA (Column H)
- **SOP Lead Time (Column I)** ⭐
- Target Start Date (Column J)
- Target End Date (Column K)
- Process Status (Column N)
- Process Time (Column O)
- Variance (Column P)
- Delay Reason Category (Column Q)
- Alert Triggered (Column R)
- Delay Flag (Column S)
- Risk Level (Column U)
- **Drv_Wash (Column AL)** ⭐
- **Drv_Product (Column AM)** ⭐
- **Drv_OrderType (Column AN)** ⭐
- **Drv_QtyBand (Column AO)** ⭐

---

## 📊 Required Reference Sheets

Make sure you have these sheets with data:

### **1. SOP_Drivers**
```
Process Stage | Use Product | Use Wash | Use Order Type | Use Qty Band
File Release  | N           | N        | N              | N
Pre-Production| N           | N        | Y              | N
Cutting       | N           | N        | N              | N
Sewing        | Y           | N        | N              | Y
Washing       | N           | Y        | N              | N
```

### **2. SOP_Cal**
```
ID | Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT (Days)
1  | Cutting       | All          | All           | All        | All      | 2
2  | Sewing        | T-Shirt      | All           | All        | Q1       | 5
3  | Washing       | All          | Enzyme        | All        | All      | 3
```

---

## ✅ Verification Checklist

- [ ] Apps Script updated with new Code.gs
- [ ] Apps Script deployed as Web App
- [ ] Web App URL in .env.local
- [ ] SOP_Drivers sheet has all process stages
- [ ] SOP_Cal sheet has SOP master data
- [ ] Formulas added to VS_execution Row 2
- [ ] Formulas copied down to Row 1000
- [ ] Manual test in sheet works
- [ ] App test creates new row successfully
- [ ] Formulas calculate correctly for new rows

---

## 🎉 Benefits of This Approach

✅ **Simple Apps Script** - Only handles data entry, no complex calculations
✅ **Flexible Formulas** - Easy to modify formulas without redeploying script
✅ **Transparent** - You can see and audit all calculations in the sheet
✅ **Fast** - Google Sheets formulas are optimized and instant
✅ **Maintainable** - Business users can update formulas without coding

---

## 🐛 Troubleshooting

**Problem:** Formulas show #REF! error
- **Solution:** Check sheet names (SOP_Drivers, SOP_Cal) are correct

**Problem:** Formulas show #N/A error
- **Solution:** Verify SOP_Drivers has all process stages

**Problem:** New rows don't have formulas
- **Solution:** Copy formulas down to more rows (e.g., Row 2000)

**Problem:** App shows "Sheet not found" error
- **Solution:** Verify sheet name is exactly "VS_execution" (case-sensitive)

---

## 📞 Next Steps

1. ✅ Apps Script is ready
2. ⚠️ Add formulas to your sheet (follow SHEET_FORMULAS_SETUP.md)
3. ✅ Test the system
4. 🎉 Start using the app!

Your app is ready to save data, and your sheet will auto-calculate everything! 🚀
