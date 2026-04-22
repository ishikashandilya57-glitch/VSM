# 📋 COPY-PASTE DEPLOYMENT GUIDE

## Quick Instructions

Your file is too large to replace entirely. Instead, follow these 3 simple copy-paste steps:

---

## ✅ STEP 1: Add Duplicate Prevention Functions

**Location:** After line 70 (after the `SOP_COL` definition ends)

**Copy this code and paste it:**

```javascript
// ========================================
// DUPLICATE PREVENTION FUNCTIONS
// ========================================

/**
 * Check if entry already exists and return row number
 */
function findExistingEntry(sheet, data) {
  const allData = sheet.getDataRange().getValues();
  const isTransactional = isTransactionalProcess(data.processStage);
  const searchOcNo = String(data.ocNo).trim().toUpperCase();
  const searchProcess = data.processStage;
  const searchDate = data.actualStartDate;
  
  Logger.log(`🔍 Duplicate check: OC=${searchOcNo}, Process=${searchProcess}${isTransactional ? ', Date=' + searchDate : ''}`);
  
  for (let i = 1; i < allData.length; i++) {
    const rowOcNo = String(allData[i][COL.OC_NO - 1]).trim().toUpperCase();
    const rowProcess = allData[i][COL.PROCESS_STAGE - 1];
    
    if (rowOcNo === searchOcNo && rowProcess === searchProcess) {
      if (isTransactional) {
        const rowDate = allData[i][COL.ENTRY_DATE - 1];
        const rowDateStr = rowDate ? formatDate(new Date(rowDate)) : '';
        if (rowDateStr === searchDate) {
          Logger.log(`✅ Duplicate found at row ${i + 1}`);
          return i + 1;
        }
      } else {
        Logger.log(`✅ Duplicate found at row ${i + 1}`);
        return i + 1;
      }
    }
  }
  
  Logger.log(`✅ No duplicate`);
  return null;
}

/**
 * Update existing row with new data
 */
function updateExistingRow(sheet, rowNumber, data) {
  Logger.log(`📝 Updating row ${rowNumber}`);
  const isTransactional = isTransactionalProcess(data.processStage);
  
  if (isTransactional) {
    sheet.getRange(rowNumber, COL.QTY_ACHIEVED_TODAY).setValue(data.actualQuantity || 0);
  } else {
    if (data.actualStartDate) sheet.getRange(rowNumber, COL.ACTUAL_START).setValue(data.actualStartDate);
    if (data.actualEndDate) sheet.getRange(rowNumber, COL.ACTUAL_END).setValue(data.actualEndDate);
  }
  
  if (data.delayReason) sheet.getRange(rowNumber, COL.DELAY_REASON).setValue(data.delayReason);
  if (data.processStage === 'Cutting' && data.revisedQty) {
    sheet.getRange(rowNumber, COL.REVISED_QTY).setValue(data.revisedQty);
  }
  
  SpreadsheetApp.flush();
  Logger.log(`✅ Updated`);
}
```

---

## ✅ STEP 2: Add Duplicate Check in doPost

**Location:** Find this line in your `doPost` function (around line 1150):

```javascript
Logger.log('Actual last row with data: ' + actualLastRow);

// ALWAYS CREATE NEW ROW (no update logic)
const newRow = actualLastRow + 1;
Logger.log('Creating new row: ' + newRow);
```

**Replace it with:**

```javascript
Logger.log('Actual last row with data: ' + actualLastRow);

// ========================================
// ✅ DUPLICATE PREVENTION
// ========================================
const existingRow = findExistingEntry(sheet, data);

if (existingRow) {
  Logger.log(`⚠️ DUPLICATE! Updating row ${existingRow}`);
  updateExistingRow(sheet, existingRow, data);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Entry updated successfully (duplicate prevented)',
    action: 'updated',
    row: existingRow,
    isDuplicate: true,
    calculation: calculation
  })).setMimeType(ContentService.MimeType.JSON);
}

// NO DUPLICATE - Create new row
const newRow = actualLastRow + 1;
Logger.log('Creating new row: ' + newRow);
```

---

## ✅ STEP 3: Update Success Response

**Location:** Find this at the end of `doPost` function (around line 1270):

```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  action: 'created',
  row: newRow,
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

**It should already have `action: 'created'`. If not, add it.**

If your current code looks like this:
```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  row: newRow,
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

**Change it to:**
```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  action: 'created',
  row: newRow,
  isDuplicate: false,
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

---

## 🚀 DEPLOYMENT

1. Open Google Apps Script
2. Find `Code_WithCalculations_FIXED_V2.gs`
3. Make the 3 changes above
4. Click Save (💾)
5. Deploy → Manage deployments → Edit → New version → Deploy

---

## ✅ DONE!

Your duplicate prevention is now active. Test it by:
1. Submitting a task update
2. Submitting the same task again
3. Check sheet - should only have 1 row

---

**Need the complete file?** The file is 1300+ lines. These 3 changes are all you need!
