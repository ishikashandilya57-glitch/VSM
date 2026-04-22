# ✅ Revised Delivery Date Feature

## Overview

The system now supports **revised delivery dates** for orders. When the Planning department updates a delivery date, the system automatically uses the revised date for all target date calculations.

---

## How It Works

### Order_Master Sheet Structure:

```
Column D: DEL DATE (Original Delivery Date)
Column E: QTY ORDER
Column F: REMARKS
Column G: REVISED DEL DATE (New! - Revised Delivery Date)
Column H: Derived Wash Category
```

### Logic:

1. **System checks Column G** (REVISED DEL DATE) first
2. **If Column G has a date** → Use revised delivery date
3. **If Column G is empty** → Use original delivery date from Column D

---

## Example Scenarios

### Scenario 1: No Revision (Normal Flow)

```
Order_Master:
  Column D (DEL DATE): 2026-03-15
  Column G (REVISED DEL DATE): [empty]

Result:
  ✅ Uses: 2026-03-15 (from Column D)
  📊 Source: "Original (Column D)"
```

### Scenario 2: Delivery Date Revised

```
Order_Master:
  Column D (DEL DATE): 2026-03-15 (original)
  Column G (REVISED DEL DATE): 2026-03-20 (revised by Planning)

Result:
  ✅ Uses: 2026-03-20 (from Column G)
  📊 Source: "Revised (Column G)"
  📅 All target dates recalculated from 2026-03-20
```

### Scenario 3: Delivery Date Advanced (Earlier)

```
Order_Master:
  Column D (DEL DATE): 2026-03-15 (original)
  Column G (REVISED DEL DATE): 2026-03-10 (advanced by 5 days)

Result:
  ✅ Uses: 2026-03-10 (from Column G)
  📊 Source: "Revised (Column G)"
  ⚠️ All processes need to complete 5 days earlier
```

---

## What Gets Updated Automatically

When Planning updates Column G in Order_Master:

1. ✅ **Target dates recalculated** - All process target dates adjust to new delivery date
2. ✅ **Working backwards** - System calculates from revised date through all 11 processes
3. ✅ **Supermarkets included** - SM2, SM3, SM5 still accounted for
4. ✅ **Working days** - Holiday calendar still applied
5. ✅ **No code deployment needed** - System reads fresh from sheet every time

---

## Benefits

### For Planning Department:
- ✅ Update delivery dates in one place (Order_Master, Column G)
- ✅ No need to update VSM_Execution manually
- ✅ All future submissions automatically use revised date

### For Production:
- ✅ Always see current target dates
- ✅ Clear visibility of date changes
- ✅ Automatic recalculation of all processes

### For System:
- ✅ Maintains audit trail (both original and revised dates stored)
- ✅ No manual intervention needed
- ✅ Consistent across all processes

---

## How to Use

### Step 1: Planning Updates Delivery Date

```
1. Open Order_Master sheet
2. Find the OC NO row
3. Update Column G (REVISED DEL DATE) with new date
4. Save
```

### Step 2: System Automatically Uses New Date

```
When user submits any process for that OC NO:
  → System reads Column G
  → Finds revised date
  → Calculates all target dates from revised date
  → Saves to VSM_Execution
```

### Step 3: Verify

```
Check VSM_Execution sheet:
  → Column E (DELIVERY_DATE) shows revised date
  → Target Start/End dates adjusted accordingly
```

---

## Technical Details

### Code Changes:

```javascript
// In getOrderDetails() function:

// Check for revised delivery date in Column G (index 6)
const originalDeliveryDate = data[i][3]; // Column D
const revisedDeliveryDate = data[i][6];  // Column G

// Use revised date if available
let deliveryDate = originalDeliveryDate;
let dateSource = 'Original (Column D)';

if (revisedDeliveryDate && revisedDeliveryDate !== '') {
  deliveryDate = revisedDeliveryDate;
  dateSource = 'Revised (Column G)';
  Logger.log(`📅 Using revised delivery date: ${revisedDeliveryDate}`);
}
```

### Return Object:

```javascript
return {
  deliveryDate: deliveryDate,              // Effective date (original or revised)
  originalDeliveryDate: originalDeliveryDate,  // Column D
  revisedDeliveryDate: revisedDeliveryDate,    // Column G (if exists)
  dateSource: dateSource,                  // Source indicator
  // ... other fields
};
```

---

## Testing

### Test 1: Original Date (No Revision)

```
Order_Master:
  OC NO: LC/DMN/25/12270
  Column D: 2026-03-15
  Column G: [empty]

Submit any process:
  Expected: Uses 2026-03-15
  Log: "📅 Using original delivery date: 2026-03-15"
```

### Test 2: Revised Date (Later)

```
Order_Master:
  OC NO: LC/DMN/25/12270
  Column D: 2026-03-15
  Column G: 2026-03-20

Submit any process:
  Expected: Uses 2026-03-20
  Log: "📅 Using revised delivery date: 2026-03-20"
```

### Test 3: Revised Date (Earlier)

```
Order_Master:
  OC NO: LC/DMN/25/12270
  Column D: 2026-03-15
  Column G: 2026-03-10

Submit any process:
  Expected: Uses 2026-03-10
  Log: "📅 Using revised delivery date: 2026-03-10"
  Note: Target dates will be tighter (5 days less)
```

---

## Important Notes

### ⚠️ Column Index Update

The Derived Wash Category column moved from index 6 to index 7 because Column G is now REVISED DEL DATE:

```
OLD:
  Column D: DEL DATE (index 3)
  Column E: QTY ORDER (index 4)
  Column F: REMARKS (index 5)
  Column G: Derived Wash Category (index 6)

NEW:
  Column D: DEL DATE (index 3)
  Column E: QTY ORDER (index 4)
  Column F: REMARKS (index 5)
  Column G: REVISED DEL DATE (index 6)  ← NEW!
  Column H: Derived Wash Category (index 7)  ← MOVED!
```

### ✅ No Breaking Changes

- If Column G is empty, system uses Column D (backward compatible)
- Existing orders without revised dates work as before
- Only orders with revised dates use the new logic

---

## Summary

✅ **Feature**: Revised delivery date support
✅ **Location**: Order_Master, Column G
✅ **Logic**: Column G overrides Column D if present
✅ **Impact**: All target dates recalculated automatically
✅ **Deployment**: Included in Code_WithCalculations_FIXED_V2.gs
✅ **Testing**: Ready for testing after deployment

---

## Next Steps

1. **Deploy the updated Apps Script** (Code_WithCalculations_FIXED_V2.gs)
2. **Add Column G header** in Order_Master: "REVISED DEL DATE"
3. **Test with sample OC NO** (update Column G and submit process)
4. **Verify target dates** adjust correctly in VSM_Execution

---

**This feature is now ready to deploy!** 🚀
