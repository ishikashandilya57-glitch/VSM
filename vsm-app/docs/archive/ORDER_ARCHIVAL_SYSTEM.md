# 📦 Automatic Order Archival System

## Overview

Automatically archive orders **1 week after dispatch** to keep your active tracking system clean and focused on current orders.

---

## 🎯 How It Works

### Trigger Condition:
```
IF Order has "Dispatch" process completed
AND Dispatch completion date is > 7 days ago
THEN Move order to Archive sheet
```

### What Gets Archived:
- All process entries for that OC Number
- Moved from `VSM_Execution` to `VSM_Execution_Archive`
- Original data preserved for historical analysis

---

## 📋 Implementation Options

### Option 1: Time-Based Trigger (RECOMMENDED)
**Runs automatically every day at midnight**
- Checks all dispatched orders
- Archives orders older than 7 days
- No manual intervention needed

### Option 2: Manual Trigger
**Run on-demand from Apps Script**
- Click button to archive old orders
- Useful for testing or manual cleanup

### Option 3: On-Dispatch Trigger
**Archives when Dispatch is marked complete**
- Schedules archival for 7 days later
- More complex, requires trigger management

---

## 🏗️ Architecture

### Sheets Structure:
```
VSM_Execution (Active Orders)
    ↓ (After 7 days from dispatch)
VSM_Execution_Archive (Historical Orders)
```

### Archive Sheet Columns:
- Same structure as VSM_Execution
- Additional columns:
  - Archived Date
  - Archived By (system/manual)
  - Days Since Dispatch

---

## 📝 Implementation

### Step 1: Create Archive Sheet

1. Duplicate `VSM_Execution` sheet
2. Rename to `VSM_Execution_Archive`
3. Add columns at the end:
   - Column AX: `Archived Date`
   - Column AY: `Archived By`
   - Column AZ: `Days Since Dispatch`

### Step 2: Add Archive Function

```javascript
/**
 * Archive orders that were dispatched more than 7 days ago
 * Moves data from VSM_Execution to VSM_Execution_Archive
 */
function archiveOldOrders() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = ss.getSheetByName('VSM_Execution');
    const archiveSheet = ss.getSheetByName('VSM_Execution_Archive');
    
    if (!activeSheet || !archiveSheet) {
      Logger.log('❌ Required sheets not found');
      return {
        success: false,
        error: 'VSM_Execution or VSM_Execution_Archive sheet not found'
      };
    }

    const today = new Date();
    const cutoffDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days ago
    
    Logger.log(`📅 Archiving orders dispatched before: ${formatDate(cutoffDate)}`);

    // Get all data from active sheet
    const lastRow = activeSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log('ℹ️ No data to archive');
      return { success: true, archived: 0 };
    }

    const dataRange = activeSheet.getRange(2, 1, lastRow - 1, activeSheet.getLastColumn());
    const allData = dataRange.getValues();

    // Find orders to archive
    const ocNumbersToArchive = new Set();
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const ocNo = row[COL.OC_NO - 1]; // Column B
      const processStage = row[COL.PROCESS_STAGE - 1]; // Column G
      const actualEndDate = row[COL.ACTUAL_END - 1]; // Column M
      
      // Check if this is a completed Dispatch process
      if (processStage === 'Dispatch' && actualEndDate) {
        const endDate = new Date(actualEndDate);
        
        // If dispatch was completed more than 7 days ago
        if (endDate < cutoffDate) {
          ocNumbersToArchive.add(ocNo);
          Logger.log(`📦 Marking for archive: ${ocNo} (Dispatched: ${formatDate(endDate)})`);
        }
      }
    }

    if (ocNumbersToArchive.size === 0) {
      Logger.log('ℹ️ No orders ready for archival');
      return { success: true, archived: 0 };
    }

    // Archive rows for each OC Number
    let archivedCount = 0;
    const rowsToDelete = [];

    for (let i = allData.length - 1; i >= 0; i--) {
      const row = allData[i];
      const ocNo = row[COL.OC_NO - 1];
      
      if (ocNumbersToArchive.has(ocNo)) {
        // Add archive metadata
        const archiveRow = [...row];
        archiveRow.push(formatDate(today)); // Archived Date
        archiveRow.push('System - Auto Archive'); // Archived By
        
        // Calculate days since dispatch
        const dispatchDate = getDispatchDate(allData, ocNo);
        const daysSinceDispatch = dispatchDate 
          ? Math.floor((today - new Date(dispatchDate)) / (1000 * 60 * 60 * 24))
          : 0;
        archiveRow.push(daysSinceDispatch); // Days Since Dispatch
        
        // Append to archive sheet
        archiveSheet.appendRow(archiveRow);
        
        // Mark row for deletion (row index + 2 because of header and 0-based index)
        rowsToDelete.push(i + 2);
        archivedCount++;
      }
    }

    // Delete archived rows from active sheet (in reverse order)
    rowsToDelete.sort((a, b) => b - a);
    for (const rowIndex of rowsToDelete) {
      activeSheet.deleteRow(rowIndex);
    }

    Logger.log(`✅ Archived ${archivedCount} rows for ${ocNumbersToArchive.size} orders`);

    return {
      success: true,
      archived: ocNumbersToArchive.size,
      rows: archivedCount,
      orders: Array.from(ocNumbersToArchive)
    };

  } catch (error) {
    Logger.log('❌ Error in archiveOldOrders: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Helper: Get dispatch completion date for an OC Number
 */
function getDispatchDate(allData, ocNo) {
  for (let i = 0; i < allData.length; i++) {
    const row = allData[i];
    if (row[COL.OC_NO - 1] === ocNo && row[COL.PROCESS_STAGE - 1] === 'Dispatch') {
      return row[COL.ACTUAL_END - 1];
    }
  }
  return null;
}
```

### Step 3: Set Up Time-Based Trigger

```javascript
/**
 * Create a daily trigger to run archival at midnight
 * Run this function ONCE to set up the trigger
 */
function setupDailyArchivalTrigger() {
  // Delete existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'archiveOldOrders') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create new daily trigger at 1 AM
  ScriptApp.newTrigger('archiveOldOrders')
    .timeBased()
    .atHour(1) // 1 AM
    .everyDays(1)
    .create();

  Logger.log('✅ Daily archival trigger created - runs at 1 AM every day');
}
```

---

## 🚀 Deployment Steps

### 1. Create Archive Sheet
```
1. Open your Google Sheet
2. Right-click on "VSM_Execution" tab
3. Click "Duplicate"
4. Rename to "VSM_Execution_Archive"
5. Add 3 columns at the end:
   - AX: Archived Date
   - AY: Archived By
   - AZ: Days Since Dispatch
6. Clear all data rows (keep headers)
```

### 2. Add Functions to Apps Script
```
1. Open Google Apps Script
2. Copy archiveOldOrders() function
3. Copy getDispatchDate() function
4. Copy setupDailyArchivalTrigger() function
5. Paste into your Code_WithCalculations_FIXED_V2.gs
6. Save
```

### 3. Set Up Trigger
```
1. In Apps Script, click "Run" → "setupDailyArchivalTrigger"
2. Authorize the script if prompted
3. Check "Triggers" tab (clock icon) to verify trigger created
4. Should show: archiveOldOrders - Time-driven - Day timer - Every day 1-2am
```

### 4. Test Manually (Optional)
```
1. In Apps Script, click "Run" → "archiveOldOrders"
2. Check execution log
3. Verify orders moved to Archive sheet
4. Verify orders removed from active sheet
```

---

## 📊 What Happens

### Day 0: Order Dispatched
```
VSM_Execution:
OC: LC/DMN/25/12270
Process: Dispatch
Actual End: Jan 15, 2026
Status: Completed
```

### Day 1-6: Order Still Active
```
VSM_Execution:
OC: LC/DMN/25/12270
(Still visible in dashboard)
```

### Day 8: Order Archived (Automatic)
```
VSM_Execution:
(Order removed)

VSM_Execution_Archive:
OC: LC/DMN/25/12270
All process entries moved
Archived Date: Jan 23, 2026
Archived By: System - Auto Archive
Days Since Dispatch: 8
```

---

## 🎨 Dashboard Impact

### Before Archival:
```
Dashboard shows:
- Active orders (in progress)
- Recently dispatched orders (< 7 days)
- Old dispatched orders (> 7 days) ← CLUTTER!
```

### After Archival:
```
Dashboard shows:
- Active orders (in progress)
- Recently dispatched orders (< 7 days)
✅ Clean, focused view!
```

---

## 🔍 Viewing Archived Orders

### Option 1: Direct Sheet Access
```
Open Google Sheet → VSM_Execution_Archive tab
View all archived orders with metadata
```

### Option 2: Add Archive Dashboard (Future)
```
Create separate dashboard view for archived orders
Filter by date range, OC number, etc.
Useful for historical analysis
```

---

## ⚙️ Configuration Options

### Change Archive Period:
```javascript
// In archiveOldOrders() function, change this line:
const cutoffDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days

// To 14 days:
const cutoffDate = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));

// To 30 days:
const cutoffDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
```

### Change Trigger Time:
```javascript
// In setupDailyArchivalTrigger() function:
.atHour(1) // 1 AM

// Change to 3 AM:
.atHour(3)

// Change to 11 PM:
.atHour(23)
```

---

## 🛡️ Safety Features

### 1. Data Preservation
- Original data copied to archive before deletion
- Archive sheet maintains full history
- No data loss

### 2. Selective Archival
- Only archives orders with completed Dispatch
- Only archives if > 7 days old
- Active orders never touched

### 3. Logging
- Every archival logged with details
- Can review what was archived and when
- Easy troubleshooting

### 4. Reversible
- Can manually move orders back from archive
- Archive sheet has same structure as active

---

## 📝 Manual Archival

If you want to manually archive specific orders:

```javascript
/**
 * Manually archive specific OC Numbers
 */
function manualArchive(ocNumbers) {
  // ocNumbers = ['LC/DMN/25/12270', 'LC/DMN/25/12271']
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const activeSheet = ss.getSheetByName('VSM_Execution');
  const archiveSheet = ss.getSheetByName('VSM_Execution_Archive');
  
  const today = new Date();
  let archivedCount = 0;
  
  const lastRow = activeSheet.getLastRow();
  const allData = activeSheet.getRange(2, 1, lastRow - 1, activeSheet.getLastColumn()).getValues();
  
  const rowsToDelete = [];
  
  for (let i = allData.length - 1; i >= 0; i--) {
    const row = allData[i];
    const ocNo = row[COL.OC_NO - 1];
    
    if (ocNumbers.includes(ocNo)) {
      const archiveRow = [...row];
      archiveRow.push(formatDate(today));
      archiveRow.push('Manual Archive');
      archiveRow.push('N/A');
      
      archiveSheet.appendRow(archiveRow);
      rowsToDelete.push(i + 2);
      archivedCount++;
    }
  }
  
  rowsToDelete.sort((a, b) => b - a);
  for (const rowIndex of rowsToDelete) {
    activeSheet.deleteRow(rowIndex);
  }
  
  Logger.log(`✅ Manually archived ${archivedCount} rows`);
}
```

---

## ✅ Benefits

1. **Clean Dashboard**: Only shows active and recent orders
2. **Better Performance**: Fewer rows = faster queries
3. **Automatic**: No manual intervention needed
4. **Historical Data**: All data preserved in archive
5. **Configurable**: Easy to adjust archive period
6. **Safe**: Data copied before deletion
7. **Reversible**: Can restore from archive if needed

---

## 🚀 Summary

**What:** Automatically archive orders 1 week after dispatch
**How:** Daily trigger moves old orders to archive sheet
**When:** Runs at 1 AM every day
**Impact:** Cleaner dashboard, better performance, preserved history

**Deploy this and keep your system clean!** 📦✨
