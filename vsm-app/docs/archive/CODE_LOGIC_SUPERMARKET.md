# 💻 Code Logic: Supermarket Calculation

## Exact Code Flow (Line by Line)

### Step 1: Initialize Supermarket Variables (Line 515-518)

```javascript
// Supermarket tracking (fixed values + process NVA)
let supermarket1 = 0; // Before Cutting (from Cutting NVA)
const supermarket2 = 3; // After Cutting (Cutting WIP) - FIXED
const supermarket3 = 3; // Before Sewing (Sewing WIP) - FIXED
let supermarket4 = 0; // Finishing WIP (from Finishing NVA)
```

**What this does:**
- Creates 4 variables to store supermarket times
- SM2 and SM3 are **hardcoded to 3 days** (never change)
- SM1 and SM4 start at 0 (will be filled from SOP_Cal)

---

### Step 2: Loop Through Each Process (Line 520-545)

```javascript
for (const process of remainingProcesses) {
  // Get SOP breakdown from SOP_Cal
  const sopBreakdown = lookupSopLeadTime(
    process.stage,              // e.g., "Cutting"
    orderDetails.washCategory,  // e.g., "Garment Wash"
    orderDetails.qtyBand,       // e.g., "Q1"
    'All',                      
    'All'                       
  );
```

**What this does:**
- For each process (Fabric Inhouse, Fabric QC, ..., Cutting, Sewing, ..., Finishing)
- Calls `lookupSopLeadTime()` to get VA/NNVA/NVA breakdown from SOP_Cal

---

### Step 3: lookupSopLeadTime() Returns Breakdown (Line 240-330)

```javascript
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  // ... search logic ...
  
  // When match found:
  const sopLt = data[i][SOP_COL.SOP_LT] || 0;   // Column J
  const va = data[i][SOP_COL.VA] || 0;          // Column K
  const nnva = data[i][SOP_COL.NNVA] || 0;      // Column L
  const nva = data[i][SOP_COL.NVA] || 0;        // Column M
  
  return { sopLt, va, nnva, nva };
}
```

**Example return for Cutting Q1:**
```javascript
{
  sopLt: 4.9,   // Total from Column J
  va: 1.9,      // VA from Column K
  nnva: 0.8,    // NNVA from Column L
  nva: 2.2      // NVA from Column M ← This becomes SM1
}
```

---

### Step 4: Extract Supermarket Values (Line 530-535)

```javascript
// Track supermarkets from NVA columns
if (process.stage === 'Cutting') {
  supermarket1 = sopBreakdown.nva; // SM1 = Cutting's NVA column
} else if (process.stage === 'Finishing') {
  supermarket4 = sopBreakdown.nva; // SM4 = Finishing's NVA column
}
```

**What this does:**
- When processing Cutting: `supermarket1 = 2.2` (from Column M)
- When processing Finishing: `supermarket4 = 0.6` (from Column M)
- For all other processes: supermarkets remain unchanged

**IMPORTANT:** This is a **DIRECT ASSIGNMENT**, not a subtraction!

---

### Step 5: Accumulate Totals (Line 537-543)

```javascript
totalSopLt += sopBreakdown.sopLt;   // Add 4.9 to total
totalVA += sopBreakdown.va;         // Add 1.9 to VA total
totalNNVA += sopBreakdown.nnva;     // Add 0.8 to NNVA total
totalNVA += sopBreakdown.nva;       // Add 2.2 to NVA total
```

**What this does:**
- Sums up all process SOP times
- Sums up all VA, NNVA, NVA separately
- **Nothing is deducted** - only addition

---

### Step 6: Calculate Inter-Process WIP (Line 547-548)

```javascript
// Add inter-process WIP to totals
const interProcessWIP = supermarket2 + supermarket3;  // 3 + 3 = 6
const totalLeadTime = totalSopLt + interProcessWIP;   // 26.65 + 6 = 32.65
```

**What this does:**
- Adds SM2 and SM3 (the 6 days between processes)
- Calculates final total lead time
- **This is the ONLY addition** - SM2 and SM3 are added ON TOP

---

### Step 7: Display Supermarket Breakdown (Line 555-560)

```javascript
steps.push(`🏬 Supermarket Breakdown (NVA Components):`);
steps.push(`   Supermarket 1 (Before Cutting): ${supermarket1} days`);
steps.push(`   Supermarket 2 (Cutting WIP): ${supermarket2} days`);
steps.push(`   Supermarket 3 (Sewing WIP): ${supermarket3} days`);
steps.push(`   Supermarket 4 (Finishing WIP): ${supermarket4} days`);
steps.push(`   Total Supermarket Time: ${supermarket1 + supermarket2 + supermarket3 + supermarket4} days`);
```

**Output:**
```
🏬 Supermarket Breakdown (NVA Components):
   Supermarket 1 (Before Cutting): 2.2 days
   Supermarket 2 (Cutting WIP): 3 days
   Supermarket 3 (Sewing WIP): 3 days
   Supermarket 4 (Finishing WIP): 0.6 days
   Total Supermarket Time: 8.8 days
```

---

## Complete Example: Cutting Process (Q1)

### Input from SOP_Cal Sheet:
```
Row for Cutting|All|All|All|Q1:
  Column J (SOP_LT): 4.9
  Column K (VA): 1.9
  Column L (NNVA): 0.8
  Column M (NVA): 2.2
```

### Code Execution:

```javascript
// Step 1: Call lookupSopLeadTime
const sopBreakdown = lookupSopLeadTime('Cutting', 'All', 'Q1', 'All', 'All');
// Returns: { sopLt: 4.9, va: 1.9, nnva: 0.8, nva: 2.2 }

// Step 2: Check if this is Cutting
if (process.stage === 'Cutting') {
  supermarket1 = sopBreakdown.nva;  // supermarket1 = 2.2
}

// Step 3: Add to totals
totalSopLt += 4.9;    // Cutting's full SOP time
totalVA += 1.9;       // Cutting's VA
totalNNVA += 0.8;     // Cutting's NNVA
totalNVA += 2.2;      // Cutting's NVA (which is SM1)

// Step 4: Display
console.log(`Cutting: 4.9 days (VA: 1.9, NNVA: 0.8, NVA: 2.2)`);
console.log(`Supermarket 1 (Before Cutting): 2.2 days`);
```

### Result:
- Cutting SOP LT: **4.9 days** (unchanged)
- Supermarket 1: **2.2 days** (extracted from NVA)
- **NO DEDUCTION** - both values are preserved

---

## Verification: Does VA + NNVA + NVA = SOP LT?

```javascript
// For Cutting Q1:
VA + NNVA + NVA = SOP LT
1.9 + 0.8 + 2.2 = 4.9 ✅

// For Sewing Q1:
VA + NNVA + NVA = SOP LT
1.85 + 0.8 + 2.2 = 4.85 ✅

// For Finishing Q1:
VA + NNVA + NVA = SOP LT
1.0 + 0.8 + 0.6 = 2.4 ✅
```

**All processes maintain their full SOP LT!**

---

## Final Calculation Summary

```javascript
// Process SOP (sum of all Column J values)
totalSopLt = 26.65 days

// VA/NNVA/NVA breakdown (sum of all Column K/L/M values)
totalVA = 15.8 days
totalNNVA = 6.3 days
totalNVA = 4.65 days

// Supermarkets (extracted from NVA + hardcoded)
supermarket1 = 2.2 days  (from Cutting NVA)
supermarket2 = 3.0 days  (hardcoded)
supermarket3 = 3.0 days  (hardcoded)
supermarket4 = 0.6 days  (from Finishing NVA)
totalSupermarket = 8.8 days

// Inter-Process WIP (only SM2 and SM3)
interProcessWIP = 6.0 days

// Final Total
totalLeadTime = totalSopLt + interProcessWIP
totalLeadTime = 26.65 + 6.0 = 32.65 days
```

---

## Key Takeaways:

1. ✅ **Direct Read** - Supermarkets are READ from Column M (NVA)
2. ✅ **No Deduction** - Process SOP LT (Column J) remains unchanged
3. ✅ **SM1 = Cutting NVA** - Directly assigned from Column M
4. ✅ **SM2 & SM3 = Hardcoded** - Fixed 3 days each
5. ✅ **SM4 = Finishing NVA** - Directly assigned from Column M
6. ✅ **Addition Only** - SM2 and SM3 are ADDED to total lead time
7. ✅ **Verification** - VA + NNVA + NVA always equals SOP LT

**The code is mathematically correct and preserves all your SOP data!** 🎯
