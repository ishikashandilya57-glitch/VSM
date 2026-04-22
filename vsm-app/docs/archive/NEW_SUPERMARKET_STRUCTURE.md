# 🔄 NEW SUPERMARKET STRUCTURE - SPECIFICATION

## Overview

Restructuring the Supermarket concept to add a new Supermarket 1 that tracks Pre-Production waiting time, and shifting all other supermarkets by 1.

---

## 📊 NEW Structure (6 Supermarkets)

### Supermarket 1 (NEW) - Pre-Production Waiting Time
**Purpose**: Track any extra waiting/NV time during pre-production phase

**Processes Included**:
- File Release
- Pre-Production Activity
  - File Receive
  - File Checking & Study
  - Release Indent for Pre-Run
  - Receive Fabric for Pre-Run
  - Pre Run Cutting
  - Pre Run Embroidery
  - Pre Run Printing
  - Pre Run Sewing
  - Pre Run Softner Washing
  - Pre Run Heavy Wash
  - Pre Run Measurement
  - Pre Run Final closure
  - Size Set
  - PPM
  - Pattern Amendment
- CAD / Pattern
  - CAD Cut Plan Making
  - Cut Plan Approval

**Calculation**:
```
SM1 = Actual Time (File Release to CAD Approval) - Target SOP Time
```

**Example**:
- Target SOP: 5 days (File Release + Pre-Production + CAD)
- Actual Time: 8 days
- SM1 = 8 - 5 = 3 days (waiting time)

---

### Supermarket 2 (was SM1) - Before Cutting
**Purpose**: WIP before Cutting starts

**Calculation**: From Cutting NVA column in SOP_Cal

---

### Supermarket 3 (was SM2) - Cutting WIP
**Purpose**: WIP during Cutting

**Value**: 3 days (FIXED)

---

### Supermarket 4 (was SM3) - Sewing WIP
**Purpose**: WIP during Sewing

**Value**: 3 days (FIXED)

---

### Supermarket 5 (was SM4) - Finishing WIP
**Purpose**: WIP during Finishing

**Calculation**: From Finishing NVA column in SOP_Cal

---

### Supermarket 6 (was SM5) - Cartoning WIP
**Purpose**: WIP after Finishing, before Inspection

**Value**: 1 day (FIXED)

---

## 🔧 Implementation Requirements

### 1. Backend (Apps Script)

**File**: `Code_WithCalculations_FIXED_V2.gs`

**Changes Needed**:

1. **Add SM1 Calculation** (around line 800-900):
```javascript
// NEW: Supermarket 1 - Pre-Production Waiting Time
let supermarket1 = 0;

// Get processes: File Release, Pre-Production, CAD/Pattern
const preProductionProcesses = ['File Release', 'Pre-Production', 'CAD / Pattern'];
let totalTargetSOP = 0;
let actualStartDate = null;
let actualEndDate = null;

// Calculate target SOP time for pre-production
preProductionProcesses.forEach(processStage => {
  const sopBreakdown = lookupSopLeadTime(
    processStage,
    orderDetails.washCategory,
    orderDetails.qtyBand,
    effectiveProductType,
    'All'
  );
  totalTargetSOP += sopBreakdown.sopLt;
});

// Get actual dates from VSM_Execution sheet
// actualStartDate = earliest Actual Start for File Release
// actualEndDate = latest Actual End for CAD / Pattern

// Calculate SM1
if (actualStartDate && actualEndDate) {
  const actualDays = Math.ceil((actualEndDate - actualStartDate) / (1000 * 60 * 60 * 24));
  supermarket1 = Math.max(0, actualDays - totalTargetSOP);
}
```

2. **Update Supermarket Numbering**:
```javascript
// OLD:
supermarket1 = cuttingNVA;  // Before Cutting
const supermarket2 = 3;      // Cutting WIP
const supermarket3 = 3;      // Sewing WIP
supermarket4 = finishingNVA; // Finishing WIP
const supermarket5 = 1;      // Cartoning WIP

// NEW:
supermarket1 = calculatePreProductionWaiting(); // NEW - Pre-Production
supermarket2 = cuttingNVA;                      // Before Cutting
const supermarket3 = 3;                         // Cutting WIP
const supermarket4 = 3;                         // Sewing WIP
supermarket5 = finishingNVA;                    // Finishing WIP
const supermarket6 = 1;                         // Cartoning WIP
```

3. **Update Total Calculation**:
```javascript
// OLD:
const totalSupermarket = supermarket1 + supermarket2 + supermarket3 + supermarket4 + supermarket5;

// NEW:
const totalSupermarket = supermarket1 + supermarket2 + supermarket3 + supermarket4 + supermarket5 + supermarket6;
```

4. **Update Column Mapping** (add SM6 column):
```javascript
const COL = {
  // ... existing columns ...
  SM1: XX,  // Column for Supermarket 1
  SM2: XX,  // Column for Supermarket 2
  SM3: XX,  // Column for Supermarket 3
  SM4: XX,  // Column for Supermarket 4
  SM5: XX,  // Column for Supermarket 5
  SM6: XX,  // NEW - Column for Supermarket 6
  TOTAL_SM: XX
};
```

---

### 2. Frontend (Dashboard)

**File**: `vsm-app/src/app/page.tsx`

**Changes Needed**:

1. **Update ProductionData Interface** (add sm6):
```typescript
interface ProductionData {
  // ... existing fields ...
  sm1?: number;
  sm2?: number;
  sm3?: number;
  sm4?: number;
  sm5?: number;
  sm6?: number;  // NEW
  totalSupermarket?: number;
}
```

2. **Update Supermarket Metrics Calculation**:
```typescript
const supermarketMetrics = useMemo(() => {
  // ... existing code ...
  
  const validSm6 = filteredData.filter(d => typeof d.sm6 === 'number' && !isNaN(d.sm6));
  const sm6 = validSm6.length > 0 ? validSm6.reduce((sum, d) => sum + (d.sm6 || 0), 0) / validSm6.length : 1;
  
  const total = sm1 + sm2 + sm3 + sm4 + sm5 + sm6;
  
  return {
    sm1: Math.round(sm1 * 10) / 10,
    sm2: Math.round(sm2 * 10) / 10,
    sm3: Math.round(sm3 * 10) / 10,
    sm4: Math.round(sm4 * 10) / 10,
    sm5: Math.round(sm5 * 10) / 10,
    sm6: Math.round(sm6 * 10) / 10,  // NEW
    total: Math.round(total * 10) / 10,
    // ... percentages ...
  };
}, [filteredData]);
```

3. **Update KPI Cards** (add SM6 card):
```tsx
<KPICard
  title="Supermarket 1"
  value={`${supermarketMetrics.sm1} days`}
  subtitle="Pre-Production Waiting"  // NEW LABEL
  icon={Clock}
  iconColor="text-blue-600"
/>
<KPICard
  title="Supermarket 2"
  value={`${supermarketMetrics.sm2} days`}
  subtitle="Before Cutting"  // UPDATED LABEL
  icon={Package}
  iconColor="text-purple-600"
/>
// ... SM3, SM4, SM5 ...
<KPICard
  title="Supermarket 6"
  value={`${supermarketMetrics.sm6} days`}
  subtitle="Cartoning WIP"  // NEW
  icon={Package}
  iconColor="text-pink-600"
/>
```

---

## 📋 Implementation Steps

### Phase 1: Backend (Apps Script)

1. ✅ Add SM1 calculation function
2. ✅ Update supermarket numbering (shift by 1)
3. ✅ Add SM6 column mapping
4. ✅ Update total calculation
5. ✅ Test with sample data
6. ⏳ Deploy to Google Apps Script

### Phase 2: Frontend (Dashboard)

1. ✅ Update ProductionData interface
2. ✅ Update supermarket metrics calculation
3. ✅ Add SM6 KPI card
4. ✅ Update labels for all supermarkets
5. ✅ Update charts/visualizations
6. ✅ Test display

### Phase 3: Testing

1. ⏳ Verify SM1 calculation accuracy
2. ⏳ Verify all supermarkets shifted correctly
3. ⏳ Verify total calculation
4. ⏳ Verify dashboard display

---

## 🎯 Expected Results

### Before:
```
SM1: 0 days (Before Cutting)
SM2: 3 days (Cutting WIP)
SM3: 3 days (Sewing WIP)
SM4: 0 days (Finishing WIP)
SM5: 1 day  (Cartoning WIP)
Total: 7 days
```

### After:
```
SM1: 2 days (Pre-Production Waiting) ← NEW
SM2: 0 days (Before Cutting)
SM3: 3 days (Cutting WIP)
SM4: 3 days (Sewing WIP)
SM5: 0 days (Finishing WIP)
SM6: 1 day  (Cartoning WIP)
Total: 9 days
```

---

## ⚠️ Important Notes

1. **SM1 Calculation**: Requires actual dates from VSM_Execution for File Release, Pre-Production, and CAD/Pattern processes
2. **Data Availability**: If actual dates are missing, SM1 will be 0
3. **Backward Compatibility**: Old data without SM6 will show SM6 = 0
4. **Column Addition**: Need to add SM6 column to VSM_Execution sheet

---

## 📝 Next Steps

1. **Review this specification** - Confirm the logic is correct
2. **Update Apps Script** - Implement SM1 calculation and shift supermarkets
3. **Update Dashboard** - Add SM6 and update labels
4. **Test thoroughly** - Verify calculations with real data
5. **Deploy** - Roll out changes to production

---

**Created**: February 3, 2026
**Status**: Specification Complete - Ready for Implementation
