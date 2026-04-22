# Target Dates Calculation Logic

## 🎯 Overview

The system calculates **Target Start Date** and **Target End Date** for each process by working **backwards** from the **Delivery Date** using the **SOP Lead Time** for each process.

## 📊 How It Works

### **Example Scenario:**

**Order:** OC NO = LC/THE/25/11735
**Delivery Date:** March 31, 2026

**Processes for this order:**

| Process Seq | Process Stage | SOP LT (Days) | Target Start | Target End |
|-------------|---------------|---------------|--------------|------------|
| 10 | Dispatch | 1 | Mar 30 | Mar 31 |
| 9 | Inspection | 2 | Mar 28 | Mar 30 |
| 8 | Finishing | 3 | Mar 25 | Mar 28 |
| 7 | Washing | 4 | Mar 21 | Mar 25 |
| 6 | Sewing | 7 | Mar 14 | Mar 21 |
| 5 | Cutting | 2 | Mar 12 | Mar 14 |
| 4 | Pre-Production | 3 | Mar 9 | Mar 12 |
| 3 | Fabric QC | 2 | Mar 7 | Mar 9 |
| 2 | Fabric Inhouse | 4 | Mar 3 | Mar 7 |
| 1 | File Release | 1 | Mar 2 | Mar 3 |

### **Calculation Steps:**

1. **Start from Delivery Date** (March 31, 2026)

2. **Process 10 (Dispatch):**
   - Target End Date = Delivery Date = **March 31**
   - SOP LT = 1 day
   - Target Start Date = March 31 - 1 = **March 30**

3. **Process 9 (Inspection):**
   - Target End Date = Previous Process Start = **March 30**
   - SOP LT = 2 days
   - Target Start Date = March 30 - 2 = **March 28**

4. **Process 8 (Finishing):**
   - Target End Date = Previous Process Start = **March 28**
   - SOP LT = 3 days
   - Target Start Date = March 28 - 3 = **March 25**

5. **Continue backwards** through all processes...

## 🔧 Implementation in Apps Script

### **Function: `calculateTargetDates(sheet, rowIndex)`**

```javascript
function calculateTargetDates(sheet, rowIndex) {
  // 1. Get current row data
  const ocNo = row[COL_OC_NO - 1];
  const deliveryDate = row[COL_DELIVERY_DATE - 1];
  const processSeq = row[COL_PROCESS_SEQ - 1];
  const sopLt = row[COL_SOP_LT - 1];
  
  // 2. Find all rows with same OC NO
  const allRows = [];
  for (let i = 2; i <= lastRow; i++) {
    const rowOcNo = sheet.getRange(i, COL_OC_NO).getValue();
    if (rowOcNo === ocNo) {
      allRows.push({
        row: i,
        processSeq: sheet.getRange(i, COL_PROCESS_SEQ).getValue(),
        sopLt: sheet.getRange(i, COL_SOP_LT).getValue()
      });
    }
  }
  
  // 3. Sort by process sequence (descending - highest first)
  allRows.sort((a, b) => b.processSeq - a.processSeq);
  
  // 4. Work backwards from delivery date
  let currentEndDate = new Date(deliveryDate);
  
  for (let i = 0; i < allRows.length; i++) {
    const processRow = allRows[i];
    const processSopLt = processRow.sopLt || 0;
    
    // Target End Date = current end date
    const targetEndDate = new Date(currentEndDate);
    
    // Target Start Date = Target End Date - SOP Lead Time
    const targetStartDate = new Date(currentEndDate);
    targetStartDate.setDate(targetStartDate.getDate() - processSopLt);
    
    // Write to sheet
    sheet.getRange(processRowIndex, COL_TARGET_END).setValue(targetEndDate);
    sheet.getRange(processRowIndex, COL_TARGET_START).setValue(targetStartDate);
    
    // Move backwards for next process
    currentEndDate = new Date(targetStartDate);
  }
}
```

## 📋 Required Data

For target dates calculation to work, each row must have:

1. **OC NO** (Column B) - To group processes for same order
2. **Delivery Date** (Column E) - The final delivery date
3. **Process Seq** (Column F) - Sequence number (1, 2, 3, etc.)
4. **SOP Lead Time** (Column I) - Days required for this process

## 🔄 When Target Dates Are Calculated

Target dates are automatically calculated when:

1. **New row is added** via the app
2. **SOP Lead Time changes** (triggers recalculation)
3. **Delivery Date changes** (triggers recalculation for all processes of that OC NO)
4. **Process Sequence changes**
5. **Manual recalculation** via "SOP Calculator" menu → "Recalculate All Fields"

## ✅ Validation Rules

1. **All processes for same OC NO must have:**
   - Same Delivery Date
   - Unique Process Sequence numbers
   - Valid SOP Lead Time (> 0)

2. **Process Sequence should be continuous:**
   - 1, 2, 3, 4, 5... (no gaps)
   - Represents the order of processes

3. **Delivery Date must be:**
   - A valid date
   - In the future (for new orders)

## 🎯 Example Calculation Flow

### **Scenario: Adding a new process**

**User Input:**
- Line No: DBR_L5
- OC NO: LC/THE/25/11735
- Process Stage: Sewing
- Actual Start Date: 2026-03-15
- Actual End Date: 2026-03-20

**Apps Script Calculates:**

1. **Derived Values:**
   - Drv_Product = "T-Shirt" (from SOP_Drivers)
   - Drv_Wash = "All"
   - Drv_OrderType = "All"
   - Drv_QtyBand = "Q2"

2. **SOP Lead Time:**
   - Looks up in SOP_Cal: Sewing | T-Shirt | All | All | Q2 → **7 days**

3. **Target Dates:**
   - Finds all processes for OC NO: LC/THE/25/11735
   - Gets Delivery Date: March 31, 2026
   - Calculates backwards:
     - If Sewing is Process Seq 6
     - And next process (Seq 7) starts on March 21
     - Then Sewing Target End = March 21
     - Sewing Target Start = March 21 - 7 = **March 14**

4. **Status & Variance:**
   - Actual End: March 20
   - Target End: March 21
   - Variance: -1 day (1 day early!)
   - Status: "Completed - On Time"

## 🐛 Troubleshooting

### **Target dates not calculating:**

**Problem:** Target Start/End dates are blank

**Solutions:**
1. Check Delivery Date is filled for the OC NO
2. Verify Process Seq is a number (not blank)
3. Ensure SOP Lead Time is calculated (not 0 or blank)
4. Check that OC NO matches exactly across all processes

### **Target dates are wrong:**

**Problem:** Dates don't match expected timeline

**Solutions:**
1. Verify Process Sequence numbers are correct
2. Check SOP Lead Times are accurate
3. Ensure Delivery Date is correct
4. Run manual recalculation: "SOP Calculator" → "Recalculate All Fields"

### **Some processes have dates, others don't:**

**Problem:** Inconsistent target dates for same OC NO

**Solutions:**
1. Ensure all processes for the OC NO have same Delivery Date
2. Check Process Sequence has no gaps (1,2,3,4... not 1,2,5,7)
3. Verify all processes have valid SOP Lead Time

## 📊 Sheet Formula Alternative

If you prefer formulas instead of Apps Script:

### **Target End Date (Column K):**

```excel
=IF($B2="","",
  IF($F2=MAX(FILTER($F:$F,$B:$B=$B2)),
    $E2,
    INDEX($J:$J,MATCH($F2+1,FILTER($F:$F,$B:$B=$B2),0))
  )
)
```

### **Target Start Date (Column J):**

```excel
=IF($K2="","",$K2-$I2)
```

**Note:** Apps Script is recommended as it's more reliable and handles edge cases better.

## 🎉 Benefits

✅ **Automatic** - No manual date entry needed
✅ **Consistent** - Same logic for all orders
✅ **Accurate** - Based on actual SOP lead times
✅ **Dynamic** - Updates when SOP or delivery date changes
✅ **Traceable** - Clear calculation logic

## 📞 Summary

The target dates calculation:
1. Takes the **Delivery Date** as the end point
2. Works **backwards** through all processes
3. Uses **SOP Lead Time** for each process
4. Follows **Process Sequence** order
5. Calculates **Target Start** and **Target End** for each process
6. Updates **all processes** for the same OC NO

This ensures every process has realistic target dates based on the final delivery commitment! 🚀
