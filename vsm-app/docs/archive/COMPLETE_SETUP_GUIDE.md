# Complete Setup Guide - VSM Execution System

## 🎯 System Overview

Your VSM system works like this:

```
User fills form → App sends data → Apps Script saves input → Sheet formulas calculate → Dashboard displays
```

**What the app saves:** Line No, OC NO, Order No, Process Stage, Actual Start/End, Delay Reason (7 columns)

**What formulas calculate:** SOP LT, Target Dates, Status, Variance, Risk, Derived values (30+ columns)

---

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **FORMULAS_QUICK_REFERENCE.md** | Copy-paste ready formulas | Setting up formulas in sheet |
| **SOP_LT_DEBUG_GUIDE.md** | Step-by-step debugging | When SOP LT returns 0 |
| **SOP_CAL_STRUCTURE_EXAMPLE.md** | Correct sheet structure | Setting up SOP_Cal sheet |
| **FORMULA_BASED_SYSTEM.md** | Complete system explanation | Understanding the architecture |
| **SHEET_FORMULAS_SETUP.md** | Detailed formula guide | Learning how formulas work |
| **TARGET_DATES_CALCULATION.md** | Target date logic | Understanding date calculations |

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Set Up Reference Sheets**

You already have these sheets:
- ✅ **SOP_Drivers** - Defines which dimensions affect each process
- ✅ **SOP_Cal** - Master SOP calendar with lead times
- ✅ **VSM_execution** - Main execution sheet

**Verify SOP_Cal structure:**
- Column B: Process Stage
- Column C: Product Type (or "All")
- Column D: Wash Category (or "All")
- Column E: Order Type (or "All")
- Column F: Order Qty Band (or "All")
- Column J: SOP Lead Time (Days) - MUST be numbers

**Check for issues:**
- No extra spaces in any column
- "All" is capitalized consistently
- Column J has numbers (not text like "7 days")
- No blank cells in columns B-F

📖 **See:** SOP_CAL_STRUCTURE_EXAMPLE.md for detailed examples

---

### **Step 2: Add Formulas to VSM_execution Sheet**

Open **FORMULAS_QUICK_REFERENCE.md** and copy-paste these formulas into Row 2:

**Essential formulas (must have):**
1. **AL2** - Drv_Wash
2. **AM2** - Drv_Product
3. **AN2** - Drv_OrderType
4. **AO2** - Drv_QtyBand
5. **I2** - SOP Lead Time (use FILTER version)
6. **J2** - Target Start Date
7. **K2** - Target End Date

**Status formulas (recommended):**
8. **N2** - Process Status
9. **O2** - Process Time
10. **P2** - Variance
11. **Q2** - Delay Reason Category
12. **R2** - Alert Triggered
13. **S2** - Delay Flag
14. **U2** - Risk Level

**After pasting:**
- Select all cells with formulas in Row 2
- Copy (Ctrl+C)
- Select Row 3 to Row 1000
- Paste (Ctrl+V)

---

### **Step 3: Test Formulas**

Add test data in Row 2:

| Column | Value |
|--------|-------|
| A2 | DBR_L1 |
| B2 | TEST/25/001 |
| C2 | ORD001 |
| G2 | Cutting |
| L2 | 2026-01-15 |
| M2 | 2026-01-17 |

**Check results:**
- AL2, AM2, AN2, AO2 should show values (not blank)
- I2 should show a number (e.g., 5)
- J2, K2 should show dates
- N2 should show status
- O2 should show 2 (days between L2 and M2)

**If SOP LT (I2) shows 0:**
📖 **See:** SOP_LT_DEBUG_GUIDE.md for step-by-step debugging

---

### **Step 4: Deploy Apps Script**

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Delete all existing code
4. Copy code from `vsm-app/google-apps-script/Code.gs`
5. Paste and **Save** (Ctrl+S)
6. Click **Deploy** → **New deployment**
7. Click gear icon → Select **Web app**
8. Settings:
   - Description: "VSM Data Entry v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy**
10. **Copy the Web App URL** (looks like: https://script.google.com/macros/s/AKfycb.../exec)

---

### **Step 5: Update .env.local**

1. Open `vsm-app/.env.local`
2. Update this line:
```
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec
```
3. Save the file
4. Restart dev server:
```bash
npm run dev
```

---

## ✅ Verification Checklist

### **Sheet Setup:**
- [ ] SOP_Cal has correct structure (columns B-F and J)
- [ ] SOP_Cal has no extra spaces
- [ ] SOP_Cal column J has numbers (not text)
- [ ] SOP_Drivers has all process stages
- [ ] VSM_execution has formulas in Row 2
- [ ] Formulas copied down to Row 1000
- [ ] Test data shows correct calculations

### **Apps Script:**
- [ ] Code.gs deployed as Web App
- [ ] Web App URL copied
- [ ] .env.local updated with URL
- [ ] Dev server restarted

### **Testing:**
- [ ] Can access app at http://localhost:3000
- [ ] Can fill form and submit
- [ ] Data appears in VSM_execution sheet
- [ ] Formulas calculate automatically
- [ ] Dashboard shows calculated data

---

## 🐛 Troubleshooting

### **Problem: SOP LT shows 0**

**Solution:**
1. Check derived columns (AL, AM, AN, AO) - should have values
2. Check SOP_Cal structure - see SOP_CAL_STRUCTURE_EXAMPLE.md
3. Try simple formula first: `=IF($G2="","",IFERROR(VLOOKUP($G2,SOP_Cal!$B:$J,9,FALSE),0))`
4. Follow SOP_LT_DEBUG_GUIDE.md step by step

---

### **Problem: Target dates show errors**

**Solution:**
1. Make sure SOP LT (I2) has a value first
2. Check if Delivery Date (E2) exists
3. Check if Process Seq (F2) exists
4. Try simpler formulas:
   - J2: `=IF($K2="","",$K2-$I2)`
   - K2: `=IF($J2="","",$J2+$I2)`

---

### **Problem: Formulas not calculating**

**Solution:**
1. Check if formulas are text (starts with apostrophe)
2. Make sure you copied formulas, not values
3. Try Ctrl+Shift+F9 to force recalculation
4. Check for circular references

---

### **Problem: App not saving data**

**Solution:**
1. Check .env.local has correct Web App URL
2. Restart dev server after changing .env.local
3. Check Apps Script deployment is active
4. Check browser console for errors (F12)
5. Verify sheet name is "VSM_execution" (not "VS_execution")

---

### **Problem: "No matching record" error**

**Solution:**
This is not an error! It means the system will create a new row.
- The app now appends new rows automatically
- Existing rows are updated if OC NO + Process Stage match
- All calculations happen via formulas

---

## 📊 How the System Works

### **When User Submits Form:**

1. **Frontend** (TaskUpdatePage.tsx):
   - User fills: Line No, OC NO, Order No, Process Stage, Dates, Delay Reason
   - Sends data to `/api/update-task`

2. **Backend API** (route.ts):
   - Receives data
   - Sends to Google Apps Script Web App

3. **Apps Script** (Code.gs):
   - Searches for existing row (by OC NO + Process Stage)
   - If found: Updates that row
   - If not found: Appends new row
   - Writes ONLY user input (7 columns)

4. **Google Sheets**:
   - Formulas automatically calculate all other columns
   - Derived columns (AL-AO) determine SOP lookup keys
   - SOP LT (I) looks up from SOP_Cal
   - Target dates (J, K) calculate from SOP LT
   - Status columns (N-U) calculate from dates

5. **Dashboard**:
   - Reads complete data from sheet
   - Shows all calculated values
   - Updates in real-time

---

## 🎯 Formula Dependencies

Understanding the calculation flow:

```
User Input (A, B, C, G, L, M, T)
    ↓
Derived Columns (AL, AM, AN, AO)
    ↓
SOP Lead Time (I) ← looks up from SOP_Cal
    ↓
Target Dates (J, K) ← calculated from SOP LT
    ↓
Status & Metrics (N, O, P, Q, R, S, U) ← calculated from dates
```

**Key Point:** If SOP LT (I) is wrong, everything downstream will be wrong!

---

## 💡 Best Practices

### **For SOP_Cal Sheet:**
✅ Always use "All" for dimensions that don't matter
✅ Add a catch-all row for each process (all "All" values)
✅ Keep data clean (no spaces, consistent capitalization)
✅ Use numbers in SOP LT column (not text)

### **For VSM_execution Sheet:**
✅ Use formulas for all calculated columns
✅ Protect formula columns to prevent accidental edits
✅ Copy formulas down to at least Row 1000
✅ Keep Row 1 as headers

### **For Apps Script:**
✅ Use simple Code.gs (only saves input)
✅ Let formulas handle calculations
✅ Redeploy as new version when making changes
✅ Test with testDoPost() function before deploying

---

## 🔄 Making Changes

### **To Modify a Formula:**
1. Edit formula in Row 2
2. Copy down to all rows
3. Done! No deployment needed

### **To Add a New Calculated Column:**
1. Add column header in Row 1
2. Add formula in Row 2
3. Copy down to Row 1000
4. Done! No script changes needed

### **To Change SOP Logic:**
1. Update SOP_Cal sheet data
2. Done! Formulas will use new data automatically

### **To Modify Apps Script:**
1. Edit Code.gs in Apps Script editor
2. Save
3. Deploy → Manage deployments → Edit → New version
4. Done! No .env.local change needed (URL stays same)

---

## 📞 Support Resources

### **Quick Reference:**
- Copy-paste formulas: **FORMULAS_QUICK_REFERENCE.md**
- Debug SOP LT: **SOP_LT_DEBUG_GUIDE.md**
- Check sheet structure: **SOP_CAL_STRUCTURE_EXAMPLE.md**

### **Detailed Guides:**
- System architecture: **FORMULA_BASED_SYSTEM.md**
- Formula explanations: **SHEET_FORMULAS_SETUP.md**
- Target date logic: **TARGET_DATES_CALCULATION.md**

### **Code Files:**
- Simple script: **google-apps-script/Code.gs** (RECOMMENDED)
- Full calculations: **google-apps-script/Code_WithCalculations.gs** (backup)
- Complex version: **google-apps-script/SOP_Calculator.gs** (not needed)

---

## 🎉 Success Criteria

Your system is working correctly when:

✅ User can submit form via app
✅ Data appears in VSM_execution sheet
✅ Derived columns (AL-AO) show values
✅ SOP LT (I) shows numbers (not 0)
✅ Target dates (J, K) show dates
✅ Status columns (N-U) show calculated values
✅ Dashboard displays all data correctly
✅ No manual intervention needed

---

## 🚀 Next Steps

1. **Follow Quick Start** (5 steps above)
2. **Test with sample data**
3. **Verify calculations**
4. **Deploy to production**
5. **Train users**
6. **Monitor and refine**

You've got this! 💪

---

## 📋 Current Status

Based on conversation history:

✅ **Completed:**
- Next.js app built and running
- UI redesigned with dark blue theme
- Apps Script (Code.gs) created
- Documentation created
- Web App deployed

⏳ **In Progress:**
- SOP LT formula returning 0 (debugging)

🎯 **Next Action:**
- Follow SOP_LT_DEBUG_GUIDE.md to fix formula
- Verify SOP_Cal sheet structure
- Test with FILTER formula from FORMULAS_QUICK_REFERENCE.md

---

## 🔗 Quick Links

- **Web App URL:** https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
- **Sheet ID:** 1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0
- **Dev Server:** http://localhost:3000

---

**Last Updated:** January 26, 2026
**System Version:** Formula-Based v1.0

