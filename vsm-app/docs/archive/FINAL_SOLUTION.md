# FINAL SOLUTION - Data Not Saving Issue

## Current Status
- ✅ Frontend form works
- ✅ API route works  
- ✅ Apps Script executes
- ❌ Data NOT appearing in VSM_Execution sheet

## Root Cause
The Apps Script is executing but not writing data. Logs are not showing up to debug why.

## IMMEDIATE FIX - Do This Now

### Step 1: Verify Sheet Name (CRITICAL)
1. Open your Google Sheet
2. Look at the tab name - is it exactly `VSM_Execution` (capital E)?
3. If it's different, note the EXACT name (including spaces, capitals)

### Step 2: Update Code with Correct Sheet Name
In `Code_WithCalculations_FIXED_V2.gs`, line 14:
```javascript
const SHEET_VSM_EXECUTION = 'VSM_Execution';  // Must match EXACTLY
```

Change it to match your actual sheet name.

### Step 3: Test Write Directly
Add this simple test function to Apps Script:

```javascript
function testWrite() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('VSM_Execution');  // Use your exact sheet name
  
  if (!sheet) {
    Logger.log('Sheet NOT found!');
    Logger.log('Available sheets: ' + ss.getSheets().map(s => s.getName()).join(', '));
    return;
  }
  
  Logger.log('Sheet found!');
  const lastRow = sheet.getLastRow();
  Logger.log('Last row: ' + lastRow);
  
  const newRow = lastRow + 1;
  sheet.getRange(newRow, 1).setValue('TEST');
  sheet.getRange(newRow, 2).setValue('WRITE');
  sheet.getRange(newRow, 3).setValue('SUCCESS');
  
  Logger.log('Wrote to row: ' + newRow);
  Logger.log('Check your sheet now!');
}
```

Run this function:
1. Select `testWrite` from dropdown
2. Click **Run**
3. Check the sheet - do you see TEST, WRITE, SUCCESS in a new row?

### Step 4: If Test Works
If the test writes successfully, then the issue is in the `doPost()` function. The most likely causes:

1. **Wrong sheet name** - Fix line 14 in the code
2. **Calculation failing** - The `calculateTargetDatesWithSteps()` is throwing an error
3. **Column numbers wrong** - The COL constants don't match your sheet structure

### Step 5: Simplified doPost (No Calculations)
Replace the entire `doPost()` function with this minimal version:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('VSM_Execution');  // Use your exact name
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const newRow = sheet.getLastRow() + 1;
    
    // Write only the basic fields - no calculations
    sheet.getRange(newRow, 1).setValue(data.lineNo || '');
    sheet.getRange(newRow, 2).setValue(data.ocNo || '');
    sheet.getRange(newRow, 3).setValue(data.orderNo || '');
    sheet.getRange(newRow, 7).setValue(data.processStage || '');
    sheet.getRange(newRow, 12).setValue(data.actualStartDate || '');
    sheet.getRange(newRow, 13).setValue(data.actualEndDate || '');
    sheet.getRange(newRow, 20).setValue(data.delayReason || '');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved to row ' + newRow,
      row: newRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

This version:
- Skips all calculations
- Writes only user input
- Will work even if calculations fail

Deploy this and test. If data appears, then the issue was in the calculation logic.

## Next Steps After Data Saves

Once data is saving successfully:
1. Add back calculations one by one
2. Test after each addition
3. Find which calculation is causing the issue

## Contact Points
- Sheet name must be EXACT (case-sensitive)
- Column numbers must match your sheet structure
- Calculations can fail silently if Order_Master data is missing

---

**Start with the testWrite() function to prove the sheet is accessible.**
