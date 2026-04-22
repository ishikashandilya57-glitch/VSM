# Timeout and Duplicate Prevention Solution

## Problem
When saving data, a timeout error occurs with the message:
> "Request timeout - Apps Script took too long to respond. The data might still be saved. Check your sheet."

This creates a risk of **data duplicacy** because:
1. User sees timeout error
2. User doesn't know if data was saved
3. User clicks "Save" again
4. Duplicate entry is created

## Solutions Implemented

### 1. Frontend Timeout Handling ✅

**File**: `vsm-app/src/components/TaskUpdatePageEnhanced.tsx`

#### A. Double-Click Prevention
```typescript
if (saving) {
  console.log('Already saving, ignoring duplicate submission');
  return;
}
```
- Prevents multiple clicks while saving
- Button is disabled during save operation

#### B. Client-Side Timeout (55 seconds)
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 55000);
```
- Aborts request after 55 seconds
- Shows clear timeout message
- Warns user about potential duplicate

#### C. Better Error Messages
```typescript
if (error.name === 'AbortError') {
  setSaveMessage({ 
    type: 'error', 
    text: '⚠️ Request timeout. The data may have been saved. Please check your sheet before retrying to avoid duplicates.' 
  });
}
```
- Clear warning about potential save
- Instructs user to check sheet first
- Prevents blind retry

#### D. Visual Feedback
- **Saving state**: Shows spinner + "Saving... Please wait, do not refresh or click again."
- **Button disabled**: Cannot click Save button while saving
- **Loading spinner**: Visual indication of ongoing operation

### 2. Backend Duplicate Prevention (Recommended)

Add duplicate checking in your Google Apps Script:

**File**: `google-apps-script/Code_WithCalculations_FIXED_V2.gs`

```javascript
function saveTaskUpdate(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('VSM_Execution');
  
  // Generate unique key for this entry
  const entryKey = `${data.lineNo}-${data.ocNo}-${data.processStage}-${data.actualStartDate}`;
  
  // Check if this exact entry already exists
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    const existingKey = `${row[0]}-${row[1]}-${row[6]}-${row[11]}`; // LINE_NO, OC_NO, PROCESS_STAGE, ACTUAL_START
    
    if (existingKey === entryKey) {
      // Duplicate found - update instead of insert
      Logger.log('Duplicate entry detected, updating existing row: ' + (i + 1));
      
      // Update the existing row
      sheet.getRange(i + 1, 12).setValue(data.actualStartDate); // ACTUAL_START
      sheet.getRange(i + 1, 13).setValue(data.actualEndDate);   // ACTUAL_END
      
      return {
        success: true,
        message: 'Entry updated (duplicate prevented)',
        rowNumber: i + 1,
        isDuplicate: true
      };
    }
  }
  
  // No duplicate found, insert new row
  sheet.appendRow([...data]);
  
  return {
    success: true,
    message: 'New entry created',
    isDuplicate: false
  };
}
```

### 3. Transactional Process Duplicate Prevention

For transactional processes (Cutting, Sewing, Finishing), use **date-based uniqueness**:

```javascript
function saveTransactionalEntry(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('VSM_Execution');
  
  // For transactional: unique per OC + Process + Date
  const entryKey = `${data.ocNo}-${data.processStage}-${data.actualStartDate}`;
  
  const existingData = sheet.getDataRange().getValues();
  for (let i = 1; i < existingData.length; i++) {
    const row = existingData[i];
    const existingKey = `${row[1]}-${row[6]}-${row[43]}`; // OC_NO, PROCESS_STAGE, ENTRY_DATE
    
    if (existingKey === entryKey) {
      // Update quantity instead of creating duplicate
      const currentQty = row[44] || 0; // QTY_ACHIEVED_TODAY
      const newQty = data.actualQuantity;
      
      Logger.log(`Duplicate transactional entry for ${entryKey}, updating quantity from ${currentQty} to ${newQty}`);
      
      sheet.getRange(i + 1, 45).setValue(newQty); // Update QTY_ACHIEVED_TODAY
      
      return {
        success: true,
        message: 'Quantity updated for today (duplicate prevented)',
        rowNumber: i + 1,
        isDuplicate: true,
        previousQty: currentQty,
        newQty: newQty
      };
    }
  }
  
  // No duplicate, create new entry
  sheet.appendRow([...data]);
  
  return {
    success: true,
    message: 'New daily entry created',
    isDuplicate: false
  };
}
```

### 4. Increase Apps Script Timeout

In your Google Apps Script project settings:

1. Open Script Editor
2. Go to Project Settings (gear icon)
3. Increase execution timeout (if available)
4. Or optimize your script to run faster

### 5. Optimize Backend Performance

**Reduce calculation time**:

```javascript
// Instead of recalculating everything on each save
function saveTaskUpdate(data) {
  // 1. Save data first (fast)
  const rowNumber = appendDataToSheet(data);
  
  // 2. Calculate only for this specific row (fast)
  calculateForRow(rowNumber, data);
  
  // 3. Return immediately
  return { success: true, rowNumber: rowNumber };
}

// Don't do this (slow):
function saveTaskUpdate(data) {
  appendDataToSheet(data);
  recalculateAllRows(); // ❌ Too slow!
  return { success: true };
}
```

## User Instructions

### If Timeout Occurs:

1. **DON'T click Save again immediately**
2. **Check your Google Sheet** (`VSM_Execution` tab)
3. **Look for your entry**:
   - Line: DBR_L1
   - OC: LC/VLT/25/12748
   - Process: File Release
   - Date: 01/28/2026
4. **If entry exists**: Data was saved successfully, no action needed
5. **If entry doesn't exist**: Safe to click Save again

### Prevention Tips:

1. **Wait for confirmation**: Don't click Save multiple times
2. **Check "Saving..." message**: Wait for it to complete
3. **Stable internet**: Ensure good connection before saving
4. **One entry at a time**: Don't rush multiple saves

## Technical Details

### Timeout Hierarchy

1. **Client timeout**: 55 seconds (frontend)
2. **Apps Script timeout**: 30 seconds (Google's limit for web apps)
3. **Network timeout**: Varies by connection

### Duplicate Detection Logic

**Unique Key Components**:
- Line Number
- OC Number
- Process Stage
- Entry Date (for transactional)

**Example**:
```
DBR_L1-LC/VLT/25/12748-File Release-2026-01-28
```

If this exact combination exists, it's a duplicate.

## Implementation Checklist

### Frontend (Already Done) ✅
- [x] Double-click prevention
- [x] Client-side timeout (55s)
- [x] Better error messages
- [x] Loading spinner
- [x] Disabled button during save

### Backend (Recommended)
- [ ] Add duplicate checking in Apps Script
- [ ] Implement update-instead-of-insert logic
- [ ] Add unique key generation
- [ ] Return duplicate status in response
- [ ] Optimize calculation performance

### Testing
- [ ] Test timeout scenario
- [ ] Test duplicate prevention
- [ ] Test update vs insert logic
- [ ] Verify no data loss
- [ ] Check performance improvements

## Benefits

✅ **Prevents duplicate entries** - Checks before inserting
✅ **Better user experience** - Clear messages and feedback
✅ **Data integrity** - Updates existing entries instead of duplicating
✅ **Performance** - Faster saves with optimized backend
✅ **User confidence** - Clear instructions on what to do

## Next Steps

1. **Test the frontend changes** - Try saving and see the improved messages
2. **Implement backend duplicate check** - Add to your Apps Script
3. **Optimize calculations** - Make backend faster
4. **Monitor timeouts** - Track how often they occur
5. **Adjust timeout** - Increase if needed based on actual performance

The frontend is now protected. Adding the backend duplicate check will provide complete protection against data duplicacy.
