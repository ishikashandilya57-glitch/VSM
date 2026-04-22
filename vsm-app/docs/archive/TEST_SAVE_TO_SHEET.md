# ✅ Test: Save Data to VSM_execution Sheet

## Current Setup

Your system is **already configured** to save form data to the VSM_execution sheet!

When you click "Save Task", the system:
1. Sends form data to `/api/update-task`
2. Calls Google Apps Script `doPost()` function
3. Calculates all fields (SOP LT, Target Dates, Status, Variance, etc.)
4. Saves to VSM_execution sheet

## How to Test

### Step 1: Fill Out the Form

1. Go to http://localhost:3000
2. Click "Update Task" (or navigate to the form)
3. Fill in:
   - **Line No:** Select any line (e.g., DBR_L1)
   - **OC NO:** Select any OC number
   - **Process Stage:** Select any stage (e.g., Sewing)
   - **Actual Start Date:** Enter a date
   - **Actual End Date:** Enter a date
   - **Delay Reason:** (only if delayed)

### Step 2: Save the Task

1. Click "Save Task" button
2. You should see: "Task saved successfully!" (green message)
3. The form will reset after 2 seconds

### Step 3: Verify in Google Sheet

1. Open your Google Sheet
2. Go to the **VSM_execution** tab
3. Look for a new row (or updated row) with:
   - Your OC NO
   - Your Process Stage
   - Actual Start Date
   - Actual End Date
   - **Auto-calculated fields:**
     - Wash Category (from Order_Master)
     - Delivery Date (from Order_Master)
     - SOP LT (from SOP_Cal)
     - Target Start Date (calculated)
     - Target End Date (calculated)
     - Process Status (calculated)
     - Variance (calculated)
     - Delay Category (calculated)
     - Risk Level (calculated)

## What Gets Saved

### User Input (from form):
- Line No
- OC NO
- Process Stage
- Actual Start Date
- Actual End Date
- Delay Reason (if delayed)

### Auto-Calculated (by Apps Script):
- Wash Category (looked up from Order_Master)
- Delivery Date (looked up from Order_Master)
- Qty Band (calculated from order quantity)
- SOP LT (looked up from SOP_Cal based on process, wash, qty band)
- Target Start Date (calculated backward from delivery date)
- Target End Date (calculated backward from delivery date)
- Process Status (Not Started / In Progress / Completed - On Time / Completed - Delayed)
- Process Time (days between actual start and end)
- Variance (days difference between actual and target)
- Delay Category (On Time / Minor Delay / Moderate Delay / Major Delay)
- Alert (Yes/No based on variance)
- Delay Flag (Yes/No based on variance)
- Risk Level (Low / Medium / High)

## Update vs Create

The system is smart:
- **If the row exists** (same OC NO + Process Stage) → **Updates** the existing row
- **If the row doesn't exist** → **Creates** a new row

## Troubleshooting

### Issue: "Task saved successfully" but no data in sheet

**Cause:** Apps Script not deployed or wrong URL

**Solution:**
1. Check `.env.local` has correct `GOOGLE_APPS_SCRIPT_URL`
2. Verify Apps Script is deployed as Web App
3. Check Apps Script logs (View → Logs) for errors

### Issue: "Failed to update task" error

**Cause:** Apps Script error or missing data

**Solution:**
1. Open Apps Script Editor
2. View → Logs
3. Look for error messages
4. Common issues:
   - Order not found in Order_Master
   - SOP_Cal missing data
   - Column mismatch

### Issue: Data saved but calculations are wrong

**Cause:** SOP_Cal missing data or lookup failing

**Solution:**
1. Run `diagnoseProblem()` in Apps Script
2. Check if SOP LT is 0 (means lookup failed)
3. Run `addMissingSewingRows()` to add missing data
4. Verify column structure matches expected format

## Expected Behavior

### Scenario 1: On-Time Task
- Actual End Date ≤ Target End Date
- Process Status: "Completed - On Time"
- Variance: 0 or negative
- Delay Category: "On Time"
- Risk Level: "Low"
- No delay reason required

### Scenario 2: Delayed Task
- Actual End Date > Target End Date
- Process Status: "Completed - Delayed"
- Variance: Positive number (days delayed)
- Delay Category: "Minor/Moderate/Major Delay"
- Risk Level: "Medium/High"
- Delay reason REQUIRED (form enforces this)

### Scenario 3: In Progress Task
- Actual Start Date entered
- Actual End Date empty
- Process Status: "In Progress"
- Variance: Days since target end date (if past due)

## Next Steps

1. **Test the save functionality** with a real order
2. **Verify data appears** in VSM_execution sheet
3. **Check calculations** are correct
4. **Test update** by saving the same OC NO + Process Stage again

The system is ready to use! 🚀
