# Deploy Duplicate Prevention System

## ⚠️ UPDATED - EASIER INTEGRATION AVAILABLE

**👉 For step-by-step deployment, use: `EXACT_CODE_CHANGES.md`**

The new guide shows exactly what to change in your existing code with copy-paste ready snippets.

---

## Problem Solved
Users can now **safely retry** after timeout without creating duplicate entries. The system automatically detects and prevents duplicates.

## What Changed

### Frontend ✅ (Already Applied)
- Better timeout message: "Please wait 10 seconds, then you can safely retry. The system will prevent duplicates."
- Users don't need sheet access to verify
- Can confidently retry without worry

### Backend (Deploy This)
- Automatic duplicate detection
- Updates existing entries instead of creating duplicates
- Works for both transactional and non-transactional processes

## Deployment Steps

### Step 1: Open Google Apps Script

1. Go to your Google Sheet
2. Click **Extensions** → **Apps Script**
3. You'll see your existing code files

### Step 2: Add Duplicate Prevention Code

1. Click the **+** button next to "Files"
2. Select **Script**
3. Name it: `DUPLICATE_PREVENTION`
4. Copy the entire content from `google-apps-script/DUPLICATE_PREVENTION.gs`
5. Paste it into the new file
6. Click **Save** (Ctrl+S)

### Step 3: Update Your Main Code

Find your `doPost` function in `Code_WithCalculations_FIXED_V2.gs` and replace the save logic:

**Before** (current code):
```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Your current save logic
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('VSM_Execution');
    sheet.appendRow([...]); // ❌ Always creates new row
    
    // Calculations...
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Error handling
  }
}
```

**After** (with duplicate prevention):
```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Use duplicate prevention ✅
    const result = saveTaskUpdateWithDuplicatePrevention(data);
    
    if (result.success) {
      // Perform calculations after save
      if (result.rowNumber) {
        // Your existing calculation logic here
        // calculateSOP(result.rowNumber);
        // calculateTargetDates(result.rowNumber);
        // etc.
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 4: Test the Duplicate Prevention

1. In Apps Script, select the function: `testDuplicatePrevention`
2. Click **Run** (▶️ button)
3. Check the **Execution log** (View → Logs)
4. You should see:
   ```
   === Test 1: First save (should create new) ===
   {"success":true,"action":"created","isDuplicate":false}
   
   === Test 2: Second save (should update existing) ===
   {"success":true,"action":"updated","isDuplicate":true}
   
   Duplicate prevented: YES
   ```

### Step 5: Deploy

1. Click **Deploy** → **New deployment**
2. Select type: **Web app**
3. Description: "With duplicate prevention"
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. Copy the new Web App URL
8. Update your `.env.local` file with the new URL (if it changed)

### Step 6: Verify in Production

1. Open your Task Update page
2. Fill in a task (e.g., Line: DBR_L1, OC: LC/VLT/25/12748, Process: File Release)
3. Click **Save**
4. Wait for success message
5. Click **Save again** with the same data
6. Check your sheet - should only have **ONE entry**, not two!

## How It Works

### For Non-Transactional Processes
(File Release, Pre-Production, CAD/Pattern, Washing, Inspection, Dispatch)

**Unique Key**: `OC Number + Process Stage`

Example: `LC/VLT/25/12748|File Release`

- **First save**: Creates new row
- **Second save**: Updates the existing row (same OC + Process)
- **Result**: Only one entry per OC + Process combination

### For Transactional Processes
(Cutting, Sewing, Finishing)

**Unique Key**: `OC Number + Process Stage + Entry Date`

Example: `LC/VLT/25/12748|Cutting|2026-01-28`

- **First save on 2026-01-28**: Creates new row
- **Second save on 2026-01-28**: Updates quantity for that date
- **Save on 2026-01-29**: Creates new row (different date)
- **Result**: One entry per OC + Process + Date

## Benefits

✅ **Safe Retry** - Users can retry after timeout without worry
✅ **No Duplicates** - System automatically prevents duplicate entries
✅ **Data Integrity** - Updates existing data instead of duplicating
✅ **User Friendly** - No need to check sheet manually
✅ **Automatic** - Works transparently in the background

## What Users See

### Before Deployment
```
❌ Timeout error
❌ "Check your sheet before retrying"
❌ User confused - can't access sheet
❌ Afraid to retry - might create duplicate
```

### After Deployment
```
✅ Timeout error
✅ "Please wait 10 seconds, then you can safely retry"
✅ User confident - system prevents duplicates
✅ Retries safely - no duplicate created
```

## Testing Checklist

- [ ] Deploy DUPLICATE_PREVENTION.gs to Apps Script
- [ ] Update doPost function to use duplicate prevention
- [ ] Run testDuplicatePrevention() - should pass
- [ ] Deploy new version of web app
- [ ] Test in browser - save same data twice
- [ ] Verify only one entry in sheet
- [ ] Test timeout scenario - retry after timeout
- [ ] Verify no duplicate created

## Troubleshooting

### If duplicates still occur:

1. **Check deployment**: Make sure you deployed the NEW version
2. **Check doPost**: Verify it's calling `saveTaskUpdateWithDuplicatePrevention`
3. **Check logs**: Look at Apps Script execution logs for errors
4. **Check unique key**: Verify the key generation matches your data

### If updates don't work:

1. **Check column indices**: Verify COL constants match your sheet
2. **Check sheet name**: Must be exactly "VSM_Execution"
3. **Check data format**: Dates should be in correct format

## Status

✅ **Frontend updated** - Better timeout message
✅ **Backend code ready** - DUPLICATE_PREVENTION.gs created
⏳ **Deployment pending** - Follow steps above to deploy

Once deployed, users can safely retry after timeout without creating duplicates!
