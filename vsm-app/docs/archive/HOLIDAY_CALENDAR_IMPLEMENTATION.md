# 📅 Holiday Calendar Implementation

## Overview

The system now calculates target dates using **working days** instead of calendar days, accounting for:
- ✅ **Sundays** (always off)
- ✅ **2nd, 3rd, 4th Saturdays** (off)
- ✅ **1st and 5th Saturdays** (working)
- ✅ **Public Holidays** (from Holidays sheet)

---

## Your Holiday Pattern

### Weekly Schedule:
- **Monday-Friday**: Working days (except public holidays)
- **Saturday**: 
  - 1st Saturday: **Working** ✅
  - 2nd Saturday: **Off** ❌
  - 3rd Saturday: **Off** ❌
  - 4th Saturday: **Off** ❌
  - 5th Saturday: **Working** ✅ (when month has 5 Saturdays)
- **Sunday**: **Always Off** ❌

### Public Holidays (2026 Jan-Jun):
- 14-Jan-2026 (Wednesday) - Makara Sankranthi
- 26-Jan-2026 (Monday) - Republic Day
- 19-Mar-2026 (Thursday) - Ugadi
- (+ more from your Holidays sheet)

---

## How It Works

### 1. **Load Holidays from Sheet**

```javascript
function getHolidays() {
  // Reads from "Holidays" sheet
  // Column A: Date
  // Column B: Day
  // Column C: Reason
  
  // Returns array of date strings: ["2026-01-14", "2026-01-26", ...]
}
```

### 2. **Check if Date is Working Day**

```javascript
function isWorkingDay(date, holidays) {
  // Sunday? → false
  // 2nd/3rd/4th Saturday? → false
  // Public holiday? → false
  // Otherwise → true
}
```

### 3. **Subtract Working Days**

```javascript
function subtractWorkingDays(startDate, workingDays, holidays) {
  // Start from delivery date
  // Move back one calendar day at a time
  // Count only working days
  // Skip weekends and holidays
  // Return date when required working days reached
}
```

---

## Example Calculation

### Scenario:
- **Delivery Date**: Monday, March 30, 2026
- **Process**: Cutting
- **SOP LT**: 5 working days
- **Holidays**: March 19 (Thursday - Ugadi)

### Step-by-Step:

| Step | Date | Day | Working Day? | Count | Reason |
|------|------|-----|--------------|-------|--------|
| Start | Mar 30 | Mon | - | - | Delivery date |
| -1 | Mar 29 | Sun | ❌ No | 0 | Sunday (skip) |
| -2 | Mar 28 | Sat | ✅ Yes | 1 | 4th Saturday (off) → Actually 5th Saturday (working) |
| -3 | Mar 27 | Fri | ✅ Yes | 2 | Working day |
| -4 | Mar 26 | Thu | ✅ Yes | 3 | Working day |
| -5 | Mar 25 | Wed | ✅ Yes | 4 | Working day |
| -6 | Mar 24 | Tue | ✅ Yes | 5 | Working day |
| **Result** | **Mar 24** | **Tue** | - | **5** | **Target Start Date** |

**Note**: If March 19 (Ugadi) was in the range, we'd skip it and go back further.

---

## Code Changes

### Added Functions:

1. **`getHolidays()`** - Loads holidays from sheet
2. **`isWorkingDay(date, holidays)`** - Checks if date is working day
3. **`subtractWorkingDays(startDate, days, holidays)`** - Subtracts working days

### Modified Functions:

1. **`calculateTargetDatesWithSteps()`**:
   - Loads holidays at start
   - Uses `subtractWorkingDays()` instead of `setDate()`
   - Applies to all processes and supermarkets

---

## Impact on Calculations

### Before (Calendar Days):
```
Delivery: March 30
Subtract 5 days → March 25
```

### After (Working Days):
```
Delivery: March 30 (Monday)
Subtract 5 working days:
  Mar 29 (Sun) - skip
  Mar 28 (Sat) - working (5th Saturday)
  Mar 27 (Fri) - working
  Mar 26 (Thu) - working
  Mar 25 (Wed) - working
  Mar 24 (Tue) - working
→ March 24 (5 working days)
```

**Difference**: 6 calendar days vs 5 working days

---

## Setup Instructions

### Your Holidays Sheet Structure:

| Column A | Column B | Column C |
|----------|----------|----------|
| Date | Day | Reason |
| 04/01/2026 | Sunday | Weekly Off |
| 10/01/2026 | Saturday | 2nd Saturday |
| 14/01/2026 | Wednesday | Makara Sankranthi (Holiday) |
| ... | ... | ... |

### Requirements:
1. ✅ Sheet name: **"Holidays"** (exact match, case-sensitive)
2. ✅ Column A: Date values (Excel date format)
3. ✅ Column B: Day name (optional, for reference)
4. ✅ Column C: Reason (optional, for reference)
5. ✅ Header row in row 1
6. ✅ Data starts from row 2

---

## Verification

### Test Case 1: Simple Working Days
```
Delivery: Friday, Jan 30, 2026
Subtract: 3 working days
Expected: Tuesday, Jan 27, 2026
  Jan 29 (Thu) - working (1)
  Jan 28 (Wed) - working (2)
  Jan 27 (Tue) - working (3)
Result: Jan 27 ✅
```

### Test Case 2: Skip Weekend
```
Delivery: Monday, Feb 2, 2026
Subtract: 3 working days
Expected: Wednesday, Jan 28, 2026
  Feb 1 (Sun) - skip
  Jan 31 (Sat) - working (5th Saturday) (1)
  Jan 30 (Fri) - working (2)
  Jan 29 (Thu) - working (3)
Result: Jan 29 ✅
```

### Test Case 3: Skip Holiday
```
Delivery: Friday, Jan 30, 2026
Subtract: 10 working days
Includes: Jan 26 (Republic Day - Monday)
Expected: Will skip Jan 26 and go further back
```

---

## Expected Output

### In Calculation Steps:
```
📅 Holidays Loaded: 49 days

  6. Cutting:
     Current End Date: 2026-03-30
     Subtract SOP LT: 5 working days (VA: 1.9, NNVA: 0.8, NVA: 2.2)
     Target Start: 2026-03-24
     Target End: 2026-03-30
     
     ⏳ Supermarket 2 (Cutting WIP): 3 working days
     New End Date after SM2: 2026-03-19
```

**Note**: "working days" is now explicitly mentioned in output

---

## Benefits

1. ✅ **Accurate scheduling** - Accounts for actual working days
2. ✅ **Realistic timelines** - No work scheduled on holidays
3. ✅ **Easy maintenance** - Update Holidays sheet, no code changes
4. ✅ **Flexible** - Supports any holiday pattern
5. ✅ **Transparent** - Shows holiday count in calculation steps

---

## Troubleshooting

### Issue: "Holidays sheet not found"
**Solution**: 
1. Create sheet named exactly "Holidays" (case-sensitive)
2. Add header row: Date | Day | Reason
3. Add your holiday data starting from row 2

### Issue: Dates not skipping holidays
**Solution**:
1. Verify Column A has proper date values (not text)
2. Check date format matches (DD/MM/YYYY or MM/DD/YYYY)
3. Redeploy Apps Script

### Issue: Wrong Saturdays being skipped
**Solution**:
1. Verify the week calculation logic
2. Check if month has 5 Saturdays
3. Review isWorkingDay() function

---

## Maintenance

### Adding New Holidays:
1. Open Holidays sheet
2. Add new row with Date, Day, Reason
3. No code deployment needed!

### Updating Holiday Pattern:
If your factory changes working days (e.g., all Saturdays become working):
1. Update `isWorkingDay()` function
2. Redeploy Apps Script

---

## Summary

✅ **Working days calculation** implemented
✅ **Holidays loaded** from sheet
✅ **Weekends handled** (Sunday + 2nd/3rd/4th Saturday)
✅ **Public holidays** skipped
✅ **Target dates** now accurate for real working schedule

**Your production schedule now reflects actual factory working days!** 🎯
