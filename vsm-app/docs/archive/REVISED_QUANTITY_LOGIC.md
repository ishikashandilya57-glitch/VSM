# 📊 Revised Quantity Logic

## Overview

The system now supports **revised quantity** (cut quantity) entered during the Cutting process. All subsequent processes use this revised quantity instead of the original order quantity.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Order_Master                             │
│  OC NO: LC/DMN/25/12270                                     │
│  QTY ORDER: 800 pieces                                      │
│  QTY BAND: Q1 (≤1000)                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         Processes BEFORE Cutting (1-5)                      │
│  - Fabric Inhouse                                           │
│  - Fabric QC                                                │
│  - File Release                                             │
│  - Pre-Production                                           │
│  - CAD/Pattern                                              │
│                                                             │
│  Uses: Original QTY = 800                                   │
│  Qty Band: Q1                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              CUTTING PROCESS (Process 6)                    │
│                                                             │
│  User Input:                                                │
│  - Actual Start Date                                        │
│  - Actual End Date                                          │
│  - **REVISED QUANTITY: 750** ← NEW FIELD                   │
│                                                             │
│  System Saves:                                              │
│  - Revised Qty: 750                                         │
│  - New Qty Band: Q1 (recalculated)                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         Processes AFTER Cutting (7-11)                      │
│  - Sewing                                                   │
│  - Washing                                                  │
│  - Finishing                                                │
│  - Inspection                                               │
│  - Dispatch                                                 │
│                                                             │
│  Uses: Revised QTY = 750 ← FROM CUTTING                    │
│  Qty Band: Q1 (based on 750)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Logic Rules

### 1. **Quantity Source Priority**

For each process, the system checks:

```javascript
function getQuantityForProcess(ocNo, currentProcessStage) {
  // Check if Cutting process exists for this OC NO
  const cuttingRow = findCuttingProcessRow(ocNo);
  
  if (cuttingRow && cuttingRow.revisedQty > 0) {
    // Cutting has revised quantity
    
    if (currentProcessStage is BEFORE Cutting) {
      // Use original quantity from Order_Master
      return orderMaster.qtyOrder;
    } else {
      // Use revised quantity from Cutting
      return cuttingRow.revisedQty;
    }
  } else {
    // No revised quantity yet, use original
    return orderMaster.qtyOrder;
  }
}
```

### 2. **Process Sequence**

```
Process Seq 1-5: Use Original Qty (from Order_Master)
Process Seq 6 (Cutting): User enters Revised Qty
Process Seq 7-11: Use Revised Qty (from Cutting row)
```

### 3. **Qty Band Recalculation**

```javascript
function calculateQtyBand(quantity) {
  if (quantity <= 1000) return 'Q1';
  if (quantity <= 3000) return 'Q2';
  if (quantity <= 5000) return 'Q3';
  if (quantity <= 8000) return 'Q4';
  return 'Q5';
}
```

**Example:**
- Original: 800 → Q1
- Revised: 750 → Q1 (still Q1)
- Revised: 1200 → Q2 (changed to Q2!)

---

## Implementation Details

### 1. **UI Changes (Frontend)**

#### Add Revised Quantity Field (Cutting Only)

```tsx
{processStage === 'Cutting' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Revised Quantity (Cut Quantity) *
    </label>
    <input
      type="number"
      value={revisedQty}
      onChange={(e) => setRevisedQty(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      placeholder="Enter actual cut quantity"
      required
    />
    <p className="text-xs text-gray-500 mt-1">
      This quantity will be used for all subsequent processes
    </p>
  </div>
)}
```

### 2. **Backend Changes (Apps Script)**

#### A. Add Column for Revised Quantity

```javascript
const COL = {
  // ... existing columns
  REVISED_QTY: 42,      // AP - Revised Quantity (from Cutting)
};
```

#### B. Modify `getOrderDetails()` Function

```javascript
function getOrderDetails(ocNo, currentProcessStage) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orderSheet = ss.getSheetByName(SHEET_ORDER_MASTER);
  const vsmSheet = ss.getSheetByName(SHEET_VSM_EXECUTION);
  
  // Get original order details
  const orderData = findOrderInMaster(orderSheet, ocNo);
  if (!orderData) return null;
  
  // Check if Cutting process exists with revised quantity
  const revisedQty = getRevisedQuantity(vsmSheet, ocNo);
  
  // Determine which quantity to use
  let effectiveQty = orderData.qtyOrder;
  let qtySource = 'Order_Master';
  
  if (revisedQty > 0) {
    const currentSeq = getProcessSequence(currentProcessStage);
    const cuttingSeq = 6;
    
    if (currentSeq >= cuttingSeq) {
      // Use revised quantity for Cutting and after
      effectiveQty = revisedQty;
      qtySource = 'Cutting (Revised)';
    }
  }
  
  // Recalculate Qty Band based on effective quantity
  const qtyBand = calculateQtyBand(effectiveQty);
  
  return {
    ocNo: orderData.ocNo,
    washCategory: orderData.washCategory,
    deliveryDate: orderData.deliveryDate,
    qtyOrder: effectiveQty,
    qtyBand: qtyBand,
    qtySource: qtySource,
    originalQty: orderData.qtyOrder,
    revisedQty: revisedQty > 0 ? revisedQty : null
  };
}
```

#### C. Add Helper Functions

```javascript
/**
 * Get revised quantity from Cutting process
 */
function getRevisedQuantity(sheet, ocNo) {
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowOcNo = data[i][COL.OC_NO - 1];
    const processStage = data[i][COL.PROCESS_STAGE - 1];
    const revisedQty = data[i][COL.REVISED_QTY - 1];
    
    if (rowOcNo === ocNo && processStage === 'Cutting' && revisedQty > 0) {
      return revisedQty;
    }
  }
  
  return 0;
}

/**
 * Get process sequence number
 */
function getProcessSequence(processStage) {
  const stages = getAllProcessStages();
  const stage = stages.find(s => s.stage === processStage);
  return stage ? stage.seq : 0;
}
```

#### D. Modify `doPost()` to Save Revised Quantity

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // ... existing code
  
  // Save revised quantity (only for Cutting)
  if (data.processStage === 'Cutting' && data.revisedQty) {
    rowData[COL.REVISED_QTY - 1] = data.revisedQty;
    
    Logger.log(`✅ Revised Quantity saved: ${data.revisedQty}`);
  }
  
  // ... rest of code
}
```

---

## Example Scenarios

### Scenario 1: Normal Flow (No Revision)

```
Order: 800 pieces

Process 1-5: Use 800 (Q1)
Process 6 (Cutting): User doesn't enter revised qty → Use 800 (Q1)
Process 7-11: Use 800 (Q1)
```

### Scenario 2: Quantity Reduced

```
Order: 800 pieces

Process 1-5: Use 800 (Q1)
Process 6 (Cutting): User enters 750 → Save 750
Process 7-11: Use 750 (Q1)

Result: Qty Band stays Q1
```

### Scenario 3: Quantity Increased (Qty Band Changes)

```
Order: 900 pieces (Q1)

Process 1-5: Use 900 (Q1)
Process 6 (Cutting): User enters 1200 → Save 1200
Process 7-11: Use 1200 (Q2) ← QTY BAND CHANGED!

Result: 
- Cutting uses Q2 SOP times
- Sewing uses Q2 SOP times
- All subsequent processes use Q2
```

### Scenario 4: Multiple Updates

```
First Cutting Entry:
- User enters 750
- Saved to row 100

Second Cutting Entry (same OC NO):
- User enters 720
- Saved to row 150
- System uses LATEST (720) for subsequent processes
```

---

## Data Flow

### 1. **User Submits Cutting Process**

```
Input:
- OC NO: LC/DMN/25/12270
- Process Stage: Cutting
- Actual Start: 2026-01-20
- Actual End: 2026-01-25
- Revised Quantity: 750 ← NEW

Saved to VSM_Execution:
- Column AP (REVISED_QTY): 750
```

### 2. **User Submits Sewing Process**

```
Input:
- OC NO: LC/DMN/25/12270
- Process Stage: Sewing
- Actual Start: 2026-01-26
- Actual End: 2026-01-30

System Checks:
1. Look for Cutting row with OC NO = LC/DMN/25/12270
2. Found: Revised Qty = 750
3. Use 750 for Sewing (not 800 from Order_Master)
4. Calculate Qty Band: 750 → Q1
5. Lookup SOP: Sewing + Q1 → 4.85 days
```

---

## VSM_Execution Sheet Structure

### New Column:

| Column | Name | Description |
|--------|------|-------------|
| AP (42) | REVISED_QTY | Revised quantity entered during Cutting |

### Example Data:

| OC NO | Process Stage | QTY ORDER | REVISED QTY | QTY BAND |
|-------|---------------|-----------|-------------|----------|
| LC/DMN/25/12270 | Fabric Inhouse | 800 | - | Q1 |
| LC/DMN/25/12270 | Cutting | 800 | 750 | Q1 |
| LC/DMN/25/12270 | Sewing | 750 | - | Q1 |
| LC/DMN/25/12270 | Washing | 750 | - | Q1 |

---

## Benefits

1. ✅ **Accurate Tracking**: Reflects actual cut quantity
2. ✅ **Automatic Propagation**: All subsequent processes use revised quantity
3. ✅ **Qty Band Recalculation**: SOP times adjust if quantity changes band
4. ✅ **Audit Trail**: Original and revised quantities both tracked
5. ✅ **Flexible**: Supports multiple revisions per OC NO

---

## Summary

- **Before Cutting**: Use original quantity from Order_Master
- **Cutting Process**: User enters revised quantity (cut quantity)
- **After Cutting**: All processes use revised quantity
- **Qty Band**: Recalculated based on revised quantity
- **SOP Lookup**: Uses new Qty Band for accurate lead times

**The system now accurately reflects the actual production quantity!** 🎯
