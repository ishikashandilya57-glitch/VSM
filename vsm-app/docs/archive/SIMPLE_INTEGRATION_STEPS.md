# 🚀 SIMPLE INTEGRATION STEPS - Duplicate Prevention

## Overview
Add duplicate prevention to your existing `Code_WithCalculations_FIXED_V2.gs` in 3 simple steps.

---

## STEP 1: Add 2 New Functions

Open your `Code_WithCalculations_FIXED_V2.gs` in Google Apps Script.

**Find this line** (around line 50):
```javascript
const SOP_COL = {
```

**Scroll down to after the SOP_COL definition ends** (around line 60).

**Paste these 2 functions:**

```javascript
/**
 * Check if entry already exists and return row number
 */
function findExistingEntry(sheet, data) {
  const allData = sheet.getDataRange().getValues();
  const isTransactional = isTransactionalProcess(data.processStage);
  const searchOcNo = String(data.ocNo).trim().toUpperCase();
  const searchProcess = data.processStage;
  const searchDate = data.actualStartDate;
  
  Logger.log(`🔍 Checking for duplicate: OC=${searchOcNo}, Process=${searchProcess}${isTransactional ? ', Date=' + searchDate : ''}`);
  
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
  
  Logger.log(`✅ No duplicate - will create new`);
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
  Logger.log(`✅ Row ${rowNumber} updated`);
}
```

---

## STEP 2: Modify doPost Function

**Find this line in your doPost function** (around line 1100):
```javascript
// ALWAYS CREATE NEW ROW (no update logic)
const newRow = actualLastRow + 1;
Logger.log('Creating new row: ' + newRow);
```

**REPLACE IT WITH:**
```javascript
// ✅ CHECK FOR DUPLICATE FIRST
const existingRow = findExistingEntry(sheet, data);

if (existingRow) {
  Logger.log(`⚠️ Duplicate! Updating row ${existingRow}`);
  updateExistingRow(sheet, existingRow, data);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Entry updated (duplicate prevented)',
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

## STEP 3: Update Success Response

**Find this line at the end of doPost** (around line 1200):
```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  row: newRow,
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

**REPLACE IT WITH:**
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

## DONE! 🎉

Save your script and deploy as a new version.

### Test It:
1. Submit a task update (e.g., File Release)
2. Submit the SAME task again
3. Check your sheet - should only have ONE row
4. Check response - second submission should say `"action": "updated"`

---

## What Changed?

- ✅ Before saving, checks if entry already exists
- ✅ If exists: Updates the row instead of creating duplicate
- ✅ If new: Creates new row as before
- ✅ Users can safely retry after timeout

---

## Need Help?

Check the logs in Apps Script:
- Click "Executions" to see what happened
- Look for "Duplicate found" or "No duplicate" messages
