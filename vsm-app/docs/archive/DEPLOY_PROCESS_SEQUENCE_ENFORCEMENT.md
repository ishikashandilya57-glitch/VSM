# 🚀 Deploy Process Sequence Enforcement

## What This Feature Does

**Sequential Process Validation** ensures users can only enter data for processes that are unlocked based on previous process completion. This creates natural department-level access control without needing separate user roles.

---

## ✅ Changes Made

### 1. Frontend Changes (✅ COMPLETE)
- **File**: `src/components/TaskUpdatePageEnhanced.tsx`
- Added process status fetching when OC Number is selected
- Added logic to calculate available/locked processes
- Updated Process Stage dropdown to show only unlocked processes
- Added visual indicators (✓ completed, ⏳ in progress, 🔓 available, 🔒 locked)
- Added process status legend

### 2. API Endpoint (✅ COMPLETE)
- **File**: `src/app/api/[factory]/process-status/route.ts`
- New GET endpoint to fetch process status for an OC Number
- Calls Apps Script to get existing process data

### 3. Apps Script Function (⏳ NEEDS DEPLOYMENT)
- **File**: `google-apps-script/PROCESS_STATUS_ENDPOINT.gs`
- New `getProcessStatus(ocNo)` function
- Returns all existing processes for an OC Number
- Needs to be added to your existing Apps Script

---

## 📋 Deployment Steps

### Step 1: Update Apps Script

1. Open your Google Apps Script editor
2. Open your existing `Code_WithCalculations_FIXED_V2.gs` file
3. Add the `getProcessStatus()` function from `PROCESS_STATUS_ENDPOINT.gs`
4. Update your `doGet()` function to handle the new action

**Add this to your `doGet()` function:**

```javascript
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    // ... your existing actions ...
    
    // NEW ACTION: Get process status
    if (action === 'getProcessStatus') {
      const ocNo = e.parameter.ocNo;
      if (!ocNo) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'OC Number is required'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const result = getProcessStatus(ocNo);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... rest of your existing code ...
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. **Save** the script
6. **Deploy** as new version (or redeploy existing)
7. Copy the Web App URL if it changed
8. Update `.env.local` if URL changed

### Step 2: Restart Development Server

```bash
npm run dev
```

### Step 3: Test the Feature

1. Open http://localhost:3000
2. Navigate to Task Update page
3. Select an OC Number
4. Observe:
   - Process dropdown shows only available processes
   - Visual indicators show status (✓ ⏳ 🔓)
   - Locked processes are hidden
   - Status legend appears below dropdown

---

## 🎯 Process Dependency Rules

### Strict Dependencies (Must Complete 100%):
1. **Fabric Inhouse** → Always available
2. **Fabric QC** → Requires Fabric Inhouse completed
3. **File Release** → Requires Fabric Inhouse completed
4. **Pre-Production Activity** → Requires File Release completed
5. **CAD/Pattern** → Requires Pre-Production Activity completed
6. **Cutting** → Requires CAD/Pattern completed

### Partial Dependencies (Can Start with Partial):
7. **Sewing** → Can start when Cutting has started
8. **Washing** → Can start when Sewing has started
9. **Finishing** → Can start when Washing has started
10. **Inspection** → Can start when Finishing has started
11. **Dispatch** → Requires Inspection completed

---

## 🧪 Test Scenarios

### Scenario 1: New OC Number
- **Expected**: Only "Fabric Inhouse" is available
- **Test**: Select new OC, check process dropdown

### Scenario 2: Fabric Inhouse Completed
- **Expected**: "Fabric QC" and "File Release" are available
- **Test**: Complete Fabric Inhouse, check dropdown

### Scenario 3: Cutting Started (Not Completed)
- **Expected**: "Sewing" becomes available (partial dependency)
- **Test**: Start Cutting, check if Sewing is unlocked

### Scenario 4: Edit Existing Process
- **Expected**: Completed processes show with ✓ and can be edited
- **Test**: Select completed process, verify can edit dates

### Scenario 5: Skip Process Attempt
- **Expected**: Cannot select Sewing if Cutting hasn't started
- **Test**: Try to select Sewing before Cutting, should be locked

---

## 🎨 Visual Indicators

### In Process Dropdown:
- **✓ Process Name (Completed)** - Green, can edit
- **⏳ Process Name (In Progress)** - Blue, can edit
- **🔓 Process Name** - Yellow, available to start
- **🔒 (Hidden)** - Gray, locked (not shown in dropdown)

### Status Legend:
Shows below dropdown when OC is selected:
- ✓ Completed
- ⏳ In Progress
- 🔓 Available
- 🔒 X process(es) locked

---

## 🔍 Troubleshooting

### Issue: All processes are locked
**Cause**: Apps Script not deployed or URL incorrect
**Fix**: 
1. Check `.env.local` has correct `GOOGLE_APPS_SCRIPT_URL`
2. Verify Apps Script is deployed as Web App
3. Check browser console for errors

### Issue: Process status not loading
**Cause**: `getProcessStatus` function not added to Apps Script
**Fix**: 
1. Copy function from `PROCESS_STATUS_ENDPOINT.gs`
2. Add to your Apps Script
3. Update `doGet()` function
4. Redeploy

### Issue: Wrong processes are unlocked
**Cause**: Process dependency logic mismatch
**Fix**: 
1. Check `ALL_PROCESSES` array in `TaskUpdatePageEnhanced.tsx`
2. Verify process names match exactly with sheet data
3. Check `calculateAvailableProcesses()` logic

---

## 📊 How It Works

```
User selects OC Number
        ↓
Frontend calls /api/[factory]/process-status
        ↓
API calls Apps Script getProcessStatus(ocNo)
        ↓
Apps Script queries VSM_Execution sheet
        ↓
Returns existing processes with status
        ↓
Frontend calculates available processes
        ↓
Dropdown shows only unlocked processes
        ↓
User can only select available processes
```

---

## ✅ Success Criteria

After deployment, verify:
- [ ] Process dropdown shows only available processes
- [ ] Visual indicators display correctly
- [ ] Locked processes are hidden
- [ ] Can edit existing processes
- [ ] Cannot skip processes
- [ ] Partial dependencies work (Sewing after Cutting starts)
- [ ] Strict dependencies work (CAD after Pre-Production completes)
- [ ] Status legend appears
- [ ] No console errors

---

## 🎉 Benefits

1. **Enforces Workflow**: Cannot skip processes
2. **Natural Access Control**: Each department can only work on unlocked processes
3. **Prevents Errors**: Cannot enter Sewing before Cutting starts
4. **Allows Corrections**: Can edit existing entries
5. **Clear Visibility**: Users see what's available and what's locked
6. **No Authentication Needed**: Process dependencies create natural isolation

---

## 📝 Notes

- **Fail-Open Safety**: If API fails, all processes are allowed (prevents blocking users)
- **Edit Capability**: Existing processes can always be edited (for corrections)
- **Performance**: Process status is fetched once per OC selection
- **Scalability**: Works for any number of processes

---

**Deploy the Apps Script changes and test! The frontend is already ready.** 🚀
