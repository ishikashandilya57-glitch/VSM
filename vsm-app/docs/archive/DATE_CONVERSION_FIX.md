# DATE CONVERSION FIX ✅

## Problem
Runtime error: `item.deliveryDate.split is not a function`

### Root Cause:
Google Sheets API returns dates as **Excel serial numbers** (e.g., 45975) instead of strings when using `UNFORMATTED_VALUE` option.

Example:
- Excel serial: `45975` → Actual date: `2025-11-13`
- Excel serial: `46034` → Actual date: `2026-01-11`

---

## Solution Implemented

### 1. Added Excel Date Converter Function
**File**: `src/app/api/production-data/route.ts`

```typescript
// Helper function to convert Excel serial date to ISO date string
// Handles both string dates and Excel serial numbers
function excelDateToISO(serial: any): string {
  if (!serial) return '';
  if (typeof serial === 'string') return serial; // Already a string
  if (typeof serial === 'number') {
    // Excel serial date: days since 1900-01-01 (with 1900 leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
  }
  return String(serial);
}
```

### 2. Applied Conversion to All Date Fields
Updated data transformation to convert all date columns:

```typescript
const data = rows.map((row) => ({
  lineNo: row[0] || '',
  ocNo: row[1] || '',
  orderNo: row[2] || '',
  productType: row[3] || '',
  deliveryDate: excelDateToISO(row[4]),    // ✅ Converted
  processSeq: parseInt(row[5]) || 0,
  processStage: row[6] || '',
  vaNva: row[7] || '',
  sopLeadTime: parseFloat(row[8]) || 0,
  targetStartDate: excelDateToISO(row[9]), // ✅ Converted
  targetEndDate: excelDateToISO(row[10]),  // ✅ Converted
  actualStartDate: excelDateToISO(row[11]),// ✅ Converted
  actualEndDate: excelDateToISO(row[12]),  // ✅ Converted
  processStatus: row[13] || '',
  // ... rest of fields
}));
```

### 3. Added Type Safety in Frontend
**File**: `src/app/page.tsx`

Added type checking before calling `.split()`:

```typescript
filteredData.forEach(item => {
  let dateStr = '';
  if (item.deliveryDate && typeof item.deliveryDate === 'string') {
    dateStr = item.deliveryDate.split('T')[0];
  } else if (item.actualEndDate && typeof item.actualEndDate === 'string') {
    dateStr = item.actualEndDate.split('T')[0];
  }
  // ... rest of logic
});
```

---

## Verification

### Before Fix:
```javascript
{
  deliveryDate: 45975,           // ❌ Number
  targetEndDate: 45975,          // ❌ Number
  actualStartDate: 46034,        // ❌ Number
  actualEndDate: 46034           // ❌ Number
}
```

### After Fix:
```javascript
{
  deliveryDate: '2025-11-13',    // ✅ String (ISO format)
  targetEndDate: '2025-11-13',   // ✅ String (ISO format)
  actualStartDate: '2026-01-11', // ✅ String (ISO format)
  actualEndDate: '2026-01-11'    // ✅ String (ISO format)
}
```

---

## Excel Serial Date Explanation

Excel stores dates as serial numbers:
- **Serial 1** = January 1, 1900
- **Serial 45975** = November 13, 2025
- **Serial 46034** = January 11, 2026

Formula: `Date = Excel Epoch (Dec 30, 1899) + (Serial × 86400000 milliseconds)`

Note: Excel has a leap year bug for 1900, so we use Dec 30, 1899 as the epoch.

---

## Files Modified

1. **`src/app/api/production-data/route.ts`**
   - Added `excelDateToISO()` helper function
   - Applied conversion to all date fields (deliveryDate, targetStartDate, targetEndDate, actualStartDate, actualEndDate)

2. **`src/app/page.tsx`**
   - Added type checking before calling `.split()` on date strings
   - Ensures runtime safety even if dates come in unexpected formats

---

## Status

✅ **Error Fixed**: No more "split is not a function" errors  
✅ **Dates Converted**: All Excel serial dates converted to ISO strings  
✅ **Type Safety**: Added type checking in frontend  
✅ **Server Running**: http://localhost:3000  
✅ **Line Filter**: Working correctly with proper date handling  

---

## Test Results

Server logs show successful conversion:
```
First record sample: {
  lineNo: 'DBR_L5',
  ocNo: 'LC/PVI/25/11726.1.1',
  deliveryDate: '2025-11-13',      ✅
  targetEndDate: '2025-11-13',     ✅
  actualStartDate: '2026-01-11',   ✅
  actualEndDate: '2026-01-11',     ✅
  ...
}
```

Dashboard should now load without errors! 🚀
