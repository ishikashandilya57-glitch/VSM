# 📐 Formula Auto-Propagation - How It Works

## ❓ THE QUESTION

**"How will the formulas propagate to new rows automatically?"**

## ✅ THE ANSWER

The formulas are **written by the Apps Script code** when creating each new row. They don't need to be manually copied down.

---

## 🔧 HOW IT WORKS

### Step 1: User Submits Form
```
User enters:
- OC NO: LC/DMN/25/12270
- Process: Cutting
- Date: 2026-02-01
- Qty Today: 300
```

### Step 2: Apps Script Creates New Row
```javascript
// Create new row with data
sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
```

### Step 3: Apps Script Adds Formulas (Automatically)
```javascript
// Add formula for CUM_ACHIEVED (Column AU)
const cumAchievedFormula = `=SUMIFS($AS:$AS, $B:$B, B${newRow}, $G:$G, G${newRow}, $AR:$AR, "<="&AR${newRow})`;
sheet.getRange(newRow, COL.CUM_ACHIEVED).setFormula(cumAchievedFormula);

// Add formula for WIP_QTY (Column AV)
const wipQtyFormula = `=MAX(0, AT${newRow} - AU${newRow})`;
sheet.getRange(newRow, COL.WIP_QTY).setFormula(wipQtyFormula);

// Add formula for COMPLETION_STATUS (Column AW)
const completionStatusFormula = `=IF(AU${newRow}=0, "Not Started", IF(AU${newRow}<AT${newRow}, "In Progress", "Completed"))`;
sheet.getRange(newRow, COL.COMPLETION_STATUS).setFormula(completionStatusFormula);
```

### Step 4: Formulas Calculate Automatically
```
Row 5 created with formulas:
- AU5: =SUMIFS($AS:$AS, $B:$B, B5, $G:$G, G5, $AR:$AR, "<="&AR5)
- AV5: =MAX(0, AT5 - AU5)
- AW5: =IF(AU5=0, "Not Started", IF(AU5<AT5, "In Progress", "Completed"))

Google Sheets automatically calculates:
- CUM_ACHIEVED: 300
- WIP_QTY: 1700
- COMPLETION_STATUS: "In Progress"
```

---

## 📊 EXAMPLE: 5 Days of Entries

### Day 1 Entry:
```
Apps Script creates Row 2:
- B2: LC/DMN/25/12270
- G2: Cutting
- AR2: 2026-02-01
- AS2: 300
- AT2: 2000
- AU2: =SUMIFS($AS:$AS, $B:$B, B2, $G:$G, G2, $AR:$AR, "<="&AR2)  → 300
- AV2: =MAX(0, AT2 - AU2)  → 1700
- AW2: =IF(AU2=0, "Not Started", IF(AU2<AT2, "In Progress", "Completed"))  → "In Progress"
```

### Day 2 Entry:
```
Apps Script creates Row 3:
- B3: LC/DMN/25/12270
- G3: Cutting
- AR3: 2026-02-02
- AS3: 400
- AT3: 2000
- AU3: =SUMIFS($AS:$AS, $B:$B, B3, $G:$G, G3, $AR:$AR, "<="&AR3)  → 700
- AV3: =MAX(0, AT3 - AU3)  → 1300
- AW3: =IF(AU3=0, "Not Started", IF(AU3<AT3, "In Progress", "Completed"))  → "In Progress"
```

### Day 5 Entry (Completion):
```
Apps Script creates Row 6:
- B6: LC/DMN/25/12270
- G6: Cutting
- AR6: 2026-02-05
- AS6: 200
- AT6: 2000
- AU6: =SUMIFS($AS:$AS, $B:$B, B6, $G:$G, G6, $AR:$AR, "<="&AR6)  → 2000
- AV6: =MAX(0, AT6 - AU6)  → 0
- AW6: =IF(AU6=0, "Not Started", IF(AU6<AT6, "In Progress", "Completed"))  → "Completed" ✅
```

---

## 🎯 KEY POINTS

### 1. ✅ No Manual Formula Setup Needed
- You don't need to copy formulas down manually
- Apps Script writes formulas for each new row automatically

### 2. ✅ Each Row Gets Custom Formula
- Row 2 formula references: B2, G2, AR2, AS2, AT2, AU2, AV2
- Row 3 formula references: B3, G3, AR3, AS3, AT3, AU3, AV3
- Row numbers adjust automatically

### 3. ✅ Formulas Calculate in Real-Time
- Google Sheets recalculates when data changes
- No manual refresh needed
- Always shows current cumulative values

### 4. ✅ Works for All Transactional Processes
- Cutting: Gets formulas
- Sewing: Gets formulas
- Finishing: Gets formulas
- Other processes: No formulas (not needed)

---

## 🔍 WHAT YOU SEE IN THE SHEET

### After First Entry:
```
| Row | OC NO | Process | Date | Qty Today | Order Qty | Cum | WIP | Status |
|-----|-------|---------|------|-----------|-----------|-----|-----|--------|
| 2   | LC... | Cutting | 02-01| 300       | 2000      | 300 | 1700| In Progress |
```

Click on cell AU2, you'll see in formula bar:
```
=SUMIFS($AS:$AS, $B:$B, B2, $G:$G, G2, $AR:$AR, "<="&AR2)
```

### After Second Entry:
```
| Row | OC NO | Process | Date | Qty Today | Order Qty | Cum | WIP | Status |
|-----|-------|---------|------|-----------|-----------|-----|-----|--------|
| 2   | LC... | Cutting | 02-01| 300       | 2000      | 300 | 1700| In Progress |
| 3   | LC... | Cutting | 02-02| 400       | 2000      | 700 | 1300| In Progress |
```

Click on cell AU3, you'll see:
```
=SUMIFS($AS:$AS, $B:$B, B3, $G:$G, G3, $AR:$AR, "<="&AR3)
```

Notice: Row number changed from 2 to 3 automatically!

---

## 💡 WHY THIS APPROACH?

### ❌ Alternative 1: Manual Formula Copy
**Problem**: User must remember to copy formulas down every time
- Error-prone
- Requires training
- Easy to forget

### ❌ Alternative 2: Pre-fill 1000 Rows with Formulas
**Problem**: Sheet becomes slow and cluttered
- Wasted rows
- Performance issues
- Confusing for users

### ✅ Our Approach: Dynamic Formula Injection
**Benefits**:
- Automatic (no user action needed)
- Clean (only rows with data have formulas)
- Fast (no wasted calculations)
- Reliable (can't forget to add formulas)

---

## 🧪 HOW TO VERIFY

### Test 1: Check Formula Exists
1. Submit a Cutting entry
2. Open VSM_Execution sheet
3. Click on the CUM_ACHIEVED cell (Column AU)
4. Look at formula bar - you should see: `=SUMIFS(...)`

### Test 2: Check Formula Calculates
1. Submit first entry: 300 pieces
2. Check CUM_ACHIEVED: Should show 300
3. Submit second entry: 400 pieces
4. Check CUM_ACHIEVED in new row: Should show 700
5. Check CUM_ACHIEVED in first row: Still shows 300 (correct!)

### Test 3: Check Different OC Numbers
1. Submit entry for OC1: 300 pieces
2. Submit entry for OC2: 500 pieces
3. Submit another entry for OC1: 400 pieces
4. Check OC1 cumulative: Should be 700 (not 1200!)
5. Check OC2 cumulative: Should be 500 (not affected by OC1)

---

## ✅ SUMMARY

**Question**: How do formulas propagate automatically?

**Answer**: Apps Script writes the formulas when creating each new row. You don't need to do anything manually.

**Code Location**: `doPost()` function in `Code_WithCalculations_FIXED_V2.gs`

**Lines**:
```javascript
// After writing row data
if (isTransactional) {
  sheet.getRange(newRow, COL.CUM_ACHIEVED).setFormula(cumAchievedFormula);
  sheet.getRange(newRow, COL.WIP_QTY).setFormula(wipQtyFormula);
  sheet.getRange(newRow, COL.COMPLETION_STATUS).setFormula(completionStatusFormula);
}
```

**Result**: Every new row automatically gets the correct formulas with the correct row numbers!

---

## 🚀 READY TO USE

No manual setup needed. Just deploy the code and start entering data!

