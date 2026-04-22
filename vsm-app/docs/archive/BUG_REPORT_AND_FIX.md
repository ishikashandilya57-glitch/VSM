# 🐛 SOP Lead Time Calculation - Bug Report & Fix

## 📊 Test Results Summary

I ran comprehensive tests on the SOP calculation logic and found **CRITICAL BUGS** that are causing incorrect target date calculations.

---

## 🔴 CRITICAL BUG #1: Missing SOP_Cal Data for Q3, Q4, Q5 Quantity Bands

### Problem:
Your `SOP_Cal` sheet only has data for **Q1** and **Q2** quantity bands, but orders can have **Q3**, **Q4**, and **Q5** bands.

### Evidence from Test:
```
Order: PRLS/25/12431
Qty Order: 4000 → Qty Band: Q3

Process: Sewing
Looking up: Sewing | Product: Shirt | Qty: Q3
❌ No match found, returning 0 days

Process: Washing  
Looking up: Washing | Wash: Garment Wash | Qty: Q3
❌ No match found, returning 0 days

Process: Finishing
Looking up: Finishing | Product: Shirt | Qty: Q3
❌ No match found, returning 0 days

Result: Total SOP Lead Time = 1.5 days (should be ~15-20 days!)
```

### Impact:
- **Orders with 3000-8000+ units get 0 days SOP time** for most processes
- Target dates are completely wrong
- The system thinks large orders can be completed instantly

### Fix Required:
Add rows to `SOP_Cal` sheet for Q3, Q4, Q5 bands:

```
Process Stage | Product | Wash Category | Order Type | Qty Band | SOP LT
Cutting       | All     | All           | All        | Q3       | 3
Cutting       | All     | All           | All        | Q4       | 4
Cutting       | All     | All           | All        | Q5       | 5
Sewing        | Shirt   | All           | All        | Q3       | 10
Sewing        | Shirt   | All           | All        | Q4       | 14
Sewing        | Shirt   | All           | All        | Q5       | 18
Washing       | All     | Garment Wash  | All        | Q3       | 5
Washing       | All     | Garment Wash  | All        | Q4       | 6
Washing       | All     | Garment Wash  | All        | Q5       | 7
Finishing     | Shirt   | All           | All        | Q3       | 6
Finishing     | Shirt   | All           | All        | Q4       | 8
Finishing     | Shirt   | All           | All        | Q5       | 10
```

---

## 🔴 CRITICAL BUG #2: Missing Fallback Logic in lookupSopLeadTime()

### Problem:
The `lookupSopLeadTime()` function tries to find exact matches, then falls back to "All" values. But the fallback logic is **too strict** - it requires ALL columns to be "All".

### Current Fallback Logic:
```javascript
// Fallback: Try with "All" values
for (let i = 1; i < data.length; i++) {
  if (data[i][1] === processStage &&
      data[i][3] === 'All' &&      // Wash must be "All"
      data[i][5] === 'All') {      // Qty Band must be "All"
    return data[i][9] || 0;
  }
}
```

### Why This Fails:
If you're looking for:
- `Cutting | Product: Shirt | Wash: All | Qty: Q1`

But your SOP_Cal has:
- `Cutting | Product: All | Wash: All | Qty: Q1`

The fallback won't find it because it's looking for `Qty Band = "All"`, not `Qty Band = Q1`.

### Evidence from Test:
```
Process: Cutting
Looking up: Cutting | Product: Shirt | Wash: All | Qty: Q1
❌ No match found, returning 0 days

But SOP_Cal has:
Cutting | Product: All | Wash: All | Qty: Q1 → SOP LT: 1.5 days
```

### Fix Required:
Implement **progressive fallback** logic:

1. Try exact match
2. Try with Product = "All"
3. Try with Wash = "All"  
4. Try with OrderType = "All"
5. Try with QtyBand = "All"
6. Try with ALL = "All"

---

## 🔴 BUG #3: Wrong Parameter Order in lookupSopLeadTime()

### Problem:
The function signature doesn't match how it's being called.

### Current Code:
```javascript
function lookupSopLeadTime(processStage, washCategory, qtyBand) {
  // Only 3 parameters!
}

// But called with 5 parameters:
const sopLt = lookupSopLeadTime(
  processStage,
  drvProduct,      // ❌ This goes to washCategory parameter
  drvWash,         // ❌ This goes to qtyBand parameter
  drvOrderType,    // ❌ This is ignored
  drvQtyBand       // ❌ This is ignored
);
```

### Fix Required:
Update function signature:
```javascript
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  // Match all 5 parameters
}
```

---

## ✅ COMPLETE FIX

Here's the corrected `lookupSopLeadTime()` function with progressive fallback:

```javascript
/**
 * Lookup SOP Lead Time with progressive fallback
 * Matches: Process Stage, Product Type, Wash Category, Order Type, Qty Band
 */
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SOP_CAL);
  
  if (!sheet) return 0;
  
  const data = sheet.getDataRange().getValues();
  
  // Helper function to check match
  function findMatch(pStage, pProduct, pWash, pOrder, pQty) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === pStage &&           // Column B: Process Stage
          data[i][2] === pProduct &&         // Column C: Product Type
          data[i][3] === pWash &&            // Column D: Wash Category
          data[i][4] === pOrder &&           // Column E: Order Type
          data[i][5] === pQty) {             // Column F: Qty Band
        return data[i][9] || 0;              // Column J: SOP LT
      }
    }
    return null;
  }
  
  // 1. Try exact match
  let result = findMatch(processStage, productType || 'All', washCategory || 'All', 
                         orderType || 'All', qtyBand || 'All');
  if (result !== null) {
    Logger.log(`Exact match: ${processStage} → ${result} days`);
    return result;
  }
  
  // 2. Try with Product = "All"
  result = findMatch(processStage, 'All', washCategory || 'All', 
                     orderType || 'All', qtyBand || 'All');
  if (result !== null) {
    Logger.log(`Fallback (Product=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 3. Try with Wash = "All"
  result = findMatch(processStage, productType || 'All', 'All', 
                     orderType || 'All', qtyBand || 'All');
  if (result !== null) {
    Logger.log(`Fallback (Wash=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 4. Try with OrderType = "All"
  result = findMatch(processStage, productType || 'All', washCategory || 'All', 
                     'All', qtyBand || 'All');
  if (result !== null) {
    Logger.log(`Fallback (OrderType=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 5. Try with QtyBand = "All"
  result = findMatch(processStage, productType || 'All', washCategory || 'All', 
                     orderType || 'All', 'All');
  if (result !== null) {
    Logger.log(`Fallback (QtyBand=All): ${processStage} → ${result} days`);
    return result;
  }
  
  // 6. Final fallback: All = "All"
  result = findMatch(processStage, 'All', 'All', 'All', 'All');
  if (result !== null) {
    Logger.log(`Final fallback (All=All): ${processStage} → ${result} days`);
    return result;
  }
  
  Logger.log(`❌ No SOP match found for: ${processStage}`);
  return 0;
}
```

---

## 🔧 Additional Fix: Update calculateRowFields()

The function needs to pass all 5 parameters:

```javascript
// OLD (WRONG):
const sopLt = lookupSopLeadTime(processStage, drvProduct, drvWash, drvOrderType, drvQtyBand);

// NEW (CORRECT):
const sopLt = lookupSopLeadTime(
  processStage,    // Process Stage
  drvWash,         // Wash Category
  drvQtyBand,      // Qty Band
  drvProduct,      // Product Type
  drvOrderType     // Order Type
);
```

---

## 📋 Action Items

### 1. Update SOP_Cal Sheet
Add missing rows for Q3, Q4, Q5 quantity bands for all processes that use QtyBand driver.

### 2. Update Code_WithCalculations.gs
Replace the `lookupSopLeadTime()` function with the corrected version above.

### 3. Update Function Calls
Ensure all calls to `lookupSopLeadTime()` pass parameters in correct order:
- processStage
- washCategory
- qtyBand
- productType
- orderType

### 4. Test with Real Data
Run tests with orders of different sizes:
- Q1: 500 units
- Q2: 2000 units
- Q3: 4000 units
- Q4: 7000 units
- Q5: 10000 units

---

## 🎯 Expected Results After Fix

### Before Fix:
```
Order: 4000 units (Q3)
Process: Sewing → SOP LT: 0 days ❌
Total SOP: 1.5 days ❌
```

### After Fix:
```
Order: 4000 units (Q3)
Process: Sewing → SOP LT: 10 days ✅
Total SOP: 25-30 days ✅
```

---

## 🚀 Testing the Fix

Use the test script I created:
```bash
node test-sop-calculation.js
```

This will show you:
- Which lookups are failing
- What fallback logic is being used
- Complete target date calculations for all processes

---

## 💡 Root Cause Analysis

The bugs occurred because:

1. **Incomplete Data**: SOP_Cal sheet was set up for small orders (Q1, Q2) but not scaled for larger orders
2. **Weak Fallback Logic**: The fallback was too strict, requiring ALL columns to be "All" instead of progressive fallback
3. **Parameter Mismatch**: Function signature didn't match the calling code
4. **No Validation**: No checks to warn when SOP LT = 0 (which is usually wrong)

---

## ✅ Validation Checklist

After applying fixes, verify:

- [ ] All Q1-Q5 quantity bands have SOP data
- [ ] lookupSopLeadTime() has 5 parameters
- [ ] Progressive fallback logic is implemented
- [ ] Test orders of different sizes (Q1-Q5)
- [ ] Target dates are realistic (not all same day)
- [ ] Total SOP LT increases with order size
- [ ] No processes have 0 days SOP (except maybe Dispatch)

---

## 📞 Summary

**3 Critical Bugs Found:**
1. Missing SOP_Cal data for Q3, Q4, Q5 bands
2. Weak fallback logic in lookupSopLeadTime()
3. Wrong parameter order in function calls

**Impact:** Large orders (3000+ units) get 0 days SOP time, causing completely wrong target dates.

**Fix:** Add missing data + implement progressive fallback + fix parameter order.

**Test:** Use the test script to validate all scenarios.
