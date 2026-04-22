# 📝 EXACT CODE CHANGES - Copy & Paste Ready

## File to Edit: `Code_WithCalculations_FIXED_V2.gs`

---

## CHANGE #1: Add Helper Functions

**Location:** After line 60 (after `SOP_COL` definition)

**Action:** Paste these 2 functions:

```javascript
// ========================================
// DUPLICATE PREVENTION HELPERS
// ========================================

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

## CHANGE #2: Modify doPost - Add Duplicate Check

**Location:** Around line 1100 in `doPost` function

**Find this:**
```javascript
    Logger.log('Actual last row with data: ' + actualLastRow);
    
    // ALWAYS CREATE NEW ROW (no update logic)
    const newRow = actualLastRow + 1;
    Logger.log('Creating new row: ' + newRow);
    
    // Get process sequence number from the fixed stages
    const allStages = getAllProcessStages();
```

**Replace with:**
```javascript
    Logger.log('Actual last row with data: ' + actualLastRow);
    
    // ========================================
    // ✅ DUPLICATE PREVENTION
    // ========================================
    const existingRow = findExistingEntry(sheet, data);
    
    if (existingRow) {
      Logger.log(`⚠️ DUPLICATE DETECTED! Updating row ${existingRow} instead of creating new`);
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
    
    // Get process sequence number from the fixed stages
    const allStages = getAllProcessStages();
```

---

## CHANGE #3: Update Success Response

**Location:** Around line 1220 in `doPost` function (at the end)

**Find this:**
```javascript
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'New task created and calculated successfully',
      row: newRow,
      calculation: calculation
    })).setMimeType(ContentService.MimeType.JSON);
```

**Replace with:**
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

## ✅ DEPLOYMENT STEPS

1. Open Google Apps Script
2. Find `Code_WithCalculations_FIXED_V2.gs`
3. Make the 3 changes above
4. Click "Save" (💾)
5. Click "Deploy" > "New deployment"
6. Select "Web app"
7. Set "New version"
8. Click "Deploy"
9. Copy the new Web App URL
10. Test!

---

## 🧪 TESTING

### Test 1: First Save (Should Create)
```
POST to your Web App URL
Body: {
  "lineNo": "DBR_L1",
  "ocNo": "LC/VLT/25/12748",
  "processStage": "File Release",
  "actualStartDate": "2026-02-02"
}

Expected Response:
{
  "success": true,
  "action": "created",
  "isDuplicate": false,
  "row": 123
}
```

### Test 2: Retry Same Entry (Should Update)
```
POST same data again

Expected Response:
{
  "success": true,
  "action": "updated",
  "isDuplicate": true,
  "row": 123  // Same row number!
}
```

### Test 3: Check Sheet
- Should only have ONE row for that OC + Process
- No duplicates!

---

## 📊 WHAT HAPPENS NOW

### For Non-Transactional Processes (File Release, Pre-Production, etc.):
- **First save**: Creates new row
- **Retry**: Updates same row (checks by OC + Process)
- **Result**: Only 1 row per OC + Process

### For Transactional Processes (Cutting, Sewing, Finishing):
- **First save on 2026-02-02**: Creates new row
- **Retry on 2026-02-02**: Updates same row (checks by OC + Process + Date)
- **New save on 2026-02-03**: Creates new row (different date)
- **Result**: 1 row per OC + Process + Date

---

## 🎉 BENEFITS

✅ Users can safely retry after timeout  
✅ No duplicate entries  
✅ Data integrity maintained  
✅ Frontend already updated with better messaging  
✅ Works for all process types  

---

## 📞 SUPPORT

If you see errors:
1. Check "Executions" tab in Apps Script
2. Look for error messages
3. Check logs for "Duplicate found" or "No duplicate" messages
4. Verify COL definitions are correct
