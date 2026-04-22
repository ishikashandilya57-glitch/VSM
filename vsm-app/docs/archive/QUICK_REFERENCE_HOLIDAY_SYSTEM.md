# 🎯 Holiday System - Quick Reference Card

## Working Days Pattern

| Day | Status | Rule |
|-----|--------|------|
| **Monday** | ✅ Working | Always working (except holidays) |
| **Tuesday** | ✅ Working | Always working (except holidays) |
| **Wednesday** | ✅ Working | Always working (except holidays) |
| **Thursday** | ✅ Working | Always working (except holidays) |
| **Friday** | ✅ Working | Always working (except holidays) |
| **Saturday** | 🔄 Depends | 1st & 5th: Working ✅<br>2nd, 3rd, 4th: Off ❌ |
| **Sunday** | ❌ Off | Always off |
| **Public Holiday** | ❌ Off | From Holidays sheet |

---

## January 2026 Example

```
Sun Mon Tue Wed Thu Fri Sat
                1   2   3   4
 5   6   7   8   9  10  11
12  13  14  15  16  17  18
19  20  21  22  23  24  25
26  27  28  29  30  31
```

### Working Days:
- **Jan 4 (Sat)**: ✅ Working (1st Saturday)
- **Jan 5 (Sun)**: ❌ Off (Sunday)
- **Jan 11 (Sat)**: ❌ Off (2nd Saturday)
- **Jan 12 (Sun)**: ❌ Off (Sunday)
- **Jan 14 (Wed)**: ❌ Off (Makara Sankranthi - Holiday)
- **Jan 18 (Sat)**: ❌ Off (3rd Saturday)
- **Jan 19 (Sun)**: ❌ Off (Sunday)
- **Jan 25 (Sat)**: ❌ Off (4th Saturday)
- **Jan 26 (Mon)**: ❌ Off (Republic Day - Holiday)

### Total Working Days in Jan 2026: **20 days**
(31 calendar days - 5 Sundays - 3 off Saturdays - 2 holidays - 1 working Saturday = 20)

---

## Quick Calculation Examples

### Example 1: Simple Week
```
Delivery: Friday, Jan 30, 2026
Subtract: 3 working days

Calculation:
  Jan 29 (Thu) - working (1)
  Jan 28 (Wed) - working (2)
  Jan 27 (Tue) - working (3)

Result: Tuesday, Jan 27
```

### Example 2: Skip Weekend
```
Delivery: Monday, Feb 2, 2026
Subtract: 3 working days

Calculation:
  Feb 1 (Sun) - skip
  Jan 31 (Sat) - working (5th Saturday) (1)
  Jan 30 (Fri) - working (2)
  Jan 29 (Thu) - working (3)

Result: Thursday, Jan 29
```

### Example 3: Skip Holiday
```
Delivery: Tuesday, Jan 27, 2026
Subtract: 3 working days

Calculation:
  Jan 26 (Mon) - skip (Republic Day)
  Jan 25 (Sat) - skip (4th Saturday)
  Jan 24 (Fri) - working (1)
  Jan 23 (Thu) - working (2)
  Jan 22 (Wed) - working (3)

Result: Wednesday, Jan 22
```

### Example 4: Multiple Weekends
```
Delivery: Monday, Feb 9, 2026
Subtract: 10 working days

Calculation:
  Feb 8 (Sun) - skip
  Feb 7 (Sat) - working (1st Saturday) (1)
  Feb 6 (Fri) - working (2)
  Feb 5 (Thu) - working (3)
  Feb 4 (Wed) - working (4)
  Feb 3 (Tue) - working (5)
  Feb 2 (Mon) - working (6)
  Feb 1 (Sun) - skip
  Jan 31 (Sat) - working (5th Saturday) (7)
  Jan 30 (Fri) - working (8)
  Jan 29 (Thu) - working (9)
  Jan 28 (Wed) - working (10)

Result: Wednesday, Jan 28
(10 working days = 12 calendar days)
```

---

## Holidays Sheet Format

### Correct Format:
```
| Date       | Day       | Reason              |
|------------|-----------|---------------------|
| 04/01/2026 | Sunday    | Weekly Off          |
| 10/01/2026 | Saturday  | 2nd Saturday        |
| 14/01/2026 | Wednesday | Makara Sankranthi   |
| 26/01/2026 | Monday    | Republic Day        |
| 19/03/2026 | Thursday  | Ugadi               |
```

### Important:
- ✅ Column A: Date (Excel date format)
- ✅ Row 1: Header
- ✅ Data starts Row 2
- ✅ Sheet name: "Holidays" (exact match)

---

## Console Output Quick Check

### ✅ Success:
```
📅 Holidays Loaded: 49 days
```

### ❌ Warning:
```
⚠️ Holidays sheet not found - working days calculation will not account for holidays
```

### ✅ Working Days Mentioned:
```
Subtract SOP LT: 5 working days (VA: 1.9, NNVA: 0.8, NVA: 2.2)
```

### ❌ Old Version:
```
Subtract SOP LT: 5 days
```

---

## Common Scenarios

### Scenario 1: Delivery on Weekend
```
Input: Delivery = Saturday, March 14, 2026 (2nd Saturday - OFF)
System: Moves to previous working day = Friday, March 13
Then: Subtracts working days from March 13
```

### Scenario 2: Delivery on Holiday
```
Input: Delivery = Monday, Jan 26, 2026 (Republic Day)
System: Moves to previous working day = Friday, Jan 24
Then: Subtracts working days from Jan 24
```

### Scenario 3: Target Date Falls on Weekend
```
Calculation: Target = Sunday, Feb 8
System: Automatically moves to previous working day = Saturday, Feb 7 (1st Saturday - working)
If Feb 7 was off: Moves to Friday, Feb 6
```

---

## Verification Steps

### Step 1: Check Console
```
✅ "📅 Holidays Loaded: X days" (X > 0)
✅ "working days" mentioned in calculation
```

### Step 2: Check Target Dates
```
✅ Never on Sunday
✅ Never on 2nd/3rd/4th Saturday
✅ Never on public holiday
```

### Step 3: Check Calculation
```
✅ Shows "working days" not just "days"
✅ Shows holiday count
✅ Skips weekends in steps
```

---

## Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| "Holidays Loaded: 0 days" | Create "Holidays" sheet with dates in Column A |
| Target dates on Sunday | Redeploy Apps Script as NEW VERSION |
| No "working days" in output | Copy latest code, redeploy |
| Wrong Saturdays skipped | Check week calculation in isWorkingDay() |
| Dates not skipping holidays | Verify Column A has date values (not text) |

---

## Key Functions

### 1. getHolidays()
```javascript
// Loads holidays from "Holidays" sheet
// Returns: ["2026-01-14", "2026-01-26", ...]
```

### 2. isWorkingDay(date, holidays)
```javascript
// Checks if date is working day
// Returns: true/false
```

### 3. subtractWorkingDays(startDate, days, holidays)
```javascript
// Subtracts working days from date
// Returns: Date object
```

---

## Formula

```
Working Days = Calendar Days - Sundays - Off Saturdays - Public Holidays
```

### Example:
```
Calendar Days: 30 days (Jan 1-30)
- Sundays: 5 days
- Off Saturdays: 3 days (2nd, 3rd, 4th)
- Public Holidays: 2 days (Jan 14, Jan 26)
= Working Days: 20 days
```

---

## Summary

✅ **Sunday**: Always off
✅ **Saturday**: 1st & 5th working, 2nd/3rd/4th off
✅ **Public Holidays**: From Holidays sheet
✅ **Working Days**: Automatically calculated
✅ **Target Dates**: Always on working days
✅ **Easy Maintenance**: Update sheet, no code changes

**Your schedule now matches factory reality!** 🎯
