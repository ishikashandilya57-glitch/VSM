# 🚀 INTEGRATED DUPLICATE PREVENTION - DEPLOYMENT GUIDE

## What This Does

Integrates duplicate prevention into your existing `Code_WithCalculations_FIXED_V2.gs` so users can safely retry after timeout without creating duplicate entries.

---

## 📋 STEP 1: Add Duplicate Prevention Functions

**Add these functions to your Apps Script** (paste at the top, after the COL definitions):

```javascript
/**
 * ========================================
 * DUPLICATE PREVENTION SYSTEM
 * ========================================
 */

/**
 * Check if entry already exists and return row number
 * For transactional processes: Check by OC + Process + Date
 * For non-transactional: Check by OC + Process
 */
function findExistingEntry(sheet, data) {
  const allData = sheet.getDataRange().getValues();
  const isTransactional = isTransactionalProcess(data.processStage);
  
  // Normalize search values
  const searchOcNo = String(data.ocNo).trim().toUpperCase();
  const searchProcess = data.processStage;
  const searchDate = data.actualStartDate; // Entry date for transactional
  
  Logger.log(`🔍 Checking for duplicate: OC=${searchOcNo}, Process=${searchProcess}${isTransactional ? ', Date=' + searchDate : ''}`);
  
  // Search from row 2 (skip header)
  for (let i = 1; i < allData.length; i++) {
    const rowOcNo = String(allData[i][COL.OC_NO - 1]).trim().toUpperCase();
    const rowProcess = allData[i][COL.PROCESS_STAGE - 1];
    
    if (rowOcNo === searchOcNo && rowProcess === searchProcess) {
      if (isTransactional) {
        // For transactional: must also match date
        const rowDate = allData[i][COL.ENTRY_DATE - 1];
        const rowDateStr = rowDate ? formatDate(new Date(rowDate)) : '';
        
        if (rowDateStr === searchDate) {
          Logger.log(`✅ Duplicate found at row ${i + 1} (transactional)`);
          return i + 1; // Return 1-indexed row number
        }
      } else {
        // For non-transactional: OC + Process match is enough
        Logger.log(`✅ Duplicate found at row ${i + 1} (non-transactional)`);
        return i + 1;
      }
    }
  }
  
  Logger.log(`✅ No duplicate found - will create new entry`);
  return null; // No duplicate found
}

/**
 * Update existing row with new data
 */
function updateExistingRow(sheet, rowNumber, data, calculation) {
  Logger.log(`📝 Updating existing row ${rowNumber}`);
  
  const isTransactional = isTransactionalProcess(data.processStage);
  
  if (isTransactional) {
    // Update quantity achieved today
    sheet.getRange(rowNumber, COL.QTY_ACHIEVED_TODAY).setValue(data.actualQuantity || 0);
    Logger.log(`  Updated QTY_ACHIEVED_TODAY: ${data.actualQuantity}`);
  } else {
    // Update actual dates
    if (data.actualStartDate) {
      sheet.getRange(rowNumber, COL.ACTUAL_START).setValue(data.actualStartDate);
    }
    if (data.actualEndDate) {
      sheet.getRange(rowNumber, COL.ACTUAL_END).setValue(data.actualEndDate);
    }
  }
  
  // Update delay reason if provided
  if (data.delayReason) {
    sheet.getRange(rowNumber, COL.DELAY_REASON).setValue(data.delayReason);
  }
  
  // Update revised quantity for Cutting
  if (data.processStage === 'Cutting' && data.revisedQty && data.revisedQty > 0) {
    sheet.getRange(rowNumber, COL.REVISED_QTY).setValue(data.revisedQty);
    Logger.log(`  Updated REVISED_QTY: ${data.revisedQty}`);
  }
  
  // Flush changes
  SpreadsheetApp.flush();
  
  Logger.log(`✅ Row ${rowNumber} updated successfully`);
}
```

---

## 📋 STEP 2: Modify Your doPost Function

**Find your `doPost` function** and replace the section that creates new rows with this:

### BEFORE (Current Code - around line 1100):
```javascript
// ALWAYS CREATE NEW ROW (no update logic)
const newRow = actualLastRow + 1;
Logger.log('Creating new row: ' + newRow);

// ... rest of the code that writes data ...
```

### AFTER (With Duplicate Prevention):
```javascript
// ✅ CHECK FOR DUPLICATE FIRST
const existingRow = findExistingEntry(sheet, data);

if (existingRow) {
  // DUPLICATE FOUND - Update existing row
  Logger.log(`⚠️ Duplicate detected! Updating row ${existingRow} instead of creating new`);
  
  updateExistingRow(sheet, existingRow, data, calculation);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Entry updated successfully (duplicate prevented)',
    action: 'updated',
    row: existingRow,
    isDuplicate: true,
    calculation: calculation
  })).setMimeType(ContentService.MimeType.JSON);
}

// NO DUPLICATE - Create new row as usual
const newRow = actualLastRow + 1;
Logger.log('Creating new row: ' + newRow);

// ... rest of your existing code continues unchanged ...
```

---

## 📋 STEP 3: Update Success Response

**At the end of your `doPost` function**, update the success response to include action type:

### BEFORE:
```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  row: newRow,
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

### AFTER:
```javascript
return ContentService.createTextOutput(JSON.stringify({
  success: true,
  message: 'New task created and calculated successfully',
  action: 'created',  // ✅ Added this
  row: newRow,
  isDuplicate: false,  // ✅ Added this
  calculation: calculation
})).setMimeType(ContentService.MimeType.JSON);
```

---

## 🎯 COMPLETE MODIFIED doPost FUNCTION

Here's the complete modified section for clarity:

```javascript
function doPost(e) {
  Logger.log('🚀 doPost HIT');
  
  try {
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed data: ' + JSON.stringify(data));
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_VSM_EXECUTION);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'VSM_Execution sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... your existing productType logic ...
    let productType = data.productType || 'All';
    // (keep all your existing productType retrieval code)
    
    // ... your existing calculation logic ...
    const calculation = calculateTargetDatesWithSteps(data.ocNo, data.processStage, productType);
    
    if (!calculation.success) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: calculation.error,
        steps: calculation.steps
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... your existing actualLastRow logic ...
    const columnAValues = sheet.getRange(1, COL.LINE_NO, sheet.getLastRow(), 1).getValues();
    let actualLastRow = 1;
    for (let i = columnAValues.length - 1; i >= 0; i--) {
      if (columnAValues[i][0] && columnAValues[i][0] !== '') {
        actualLastRow = i + 1;
        break;
      }
    }
    
    // ========================================
    // ✅ DUPLICATE PREVENTION STARTS HERE
    // ========================================
    
    const existingRow = findExistingEntry(sheet, data);
    
    if (existingRow) {
      // DUPLICATE FOUND - Update existing row
      Logger.log(`⚠️ Duplicate detected! Updating row ${existingRow} instead of creating new`);
      
      updateExistingRow(sheet, existingRow, data, calculation);
      
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
    
    // ========================================
    // ✅ YOUR EXISTING ROW CREATION CODE CONTINUES UNCHANGED
    // ========================================
    
    const allStages = getAllProcessStages();
    const processSeq = allStages.find(s => s.stage === data.processStage)?.seq || 0;
    
    const rowData = [];
    for (let i = 1; i <= 49; i++) rowData.push('');
    
    // ... all your existing rowData population code ...
    rowData[COL.LINE_NO - 1] = data.lineNo || '';
    rowData[COL.OC_NO - 1] = data.ocNo || '';
    // ... etc (keep all your existing code) ...
    
    sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // ... your existing formula logic for transactional processes ...
    const isTransactional = isTransactionalProcess(data.processStage);
    if (isTransactional) {
      // ... your existing formula code ...
    }
    
    SpreadsheetApp.flush();
    
    Logger.log('✅ All fields written successfully to row ' + newRow);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'New task created and calculated successfully',
      action: 'created',  // ✅ Added
      row: newRow,
      isDuplicate: false,  // ✅ Added
      calculation: calculation
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('❌ ERROR in doPost: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🧪 TESTING

After deployment, test with these steps:

1. **First Save**: Submit a task update (e.g., File Release for OC LC/VLT/25/12748)
   - Should create new row
   - Response: `action: "created", isDuplicate: false`

2. **Retry Same Entry**: Submit exact same data again
   - Should update existing row
   - Response: `action: "updated", isDuplicate: true`

3. **Check Sheet**: Verify only ONE row exists (no duplicate)

4. **Check Logs**: Open Apps Script > Executions to see duplicate detection logs

---

## ✅ WHAT THIS FIXES

- ✅ Users can safely retry after timeout
- ✅ No duplicate entries created
- ✅ Existing row updated instead
- ✅ Works for both transactional and non-transactional processes
- ✅ Frontend already updated with better messaging

---

## 📝 DEPLOYMENT CHECKLIST

- [ ] Copy the 3 new functions (`findExistingEntry`, `updateExistingRow`) to your Apps Script
- [ ] Modify `doPost` function to check for duplicates before creating new row
- [ ] Update success response to include `action` and `isDuplicate` fields
- [ ] Save the script
- [ ] Deploy as Web App (new version)
- [ ] Test with first save + retry
- [ ] Verify no duplicates in sheet

---

## 🎉 DONE!

Your system now prevents duplicates. Users can safely retry after timeout without worrying about data duplicacy.
