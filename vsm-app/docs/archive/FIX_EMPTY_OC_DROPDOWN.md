# Fix: Empty OC Number Dropdown

## Problem
When you select a Line (e.g., DBR_L1), the OC NO dropdown doesn't show any options. You can type but no suggestions appear.

## Root Cause
The API is returning an **empty array** for OC numbers. This means your `WLP_RAW_All_Lines` sheet has one of these issues:

1. ❌ Sheet doesn't exist
2. ❌ Sheet is empty (no data)
3. ❌ All OC numbers for that line have `#REF!` errors (filtered out)
4. ❌ Wrong data format (columns not in expected order)
5. ❌ Line name doesn't match exactly

## Quick Diagnosis

### Test 1: Check API Response
Open this URL in your browser:
```
http://localhost:3000/api/oc-numbers?line=DBR_L1
```

**Current Result**:
```json
{
  "success": true,
  "data": []
}
```

**Expected Result** (if working):
```json
{
  "success": true,
  "data": [
    "LC/PVI/25/11726",
    "LC/PVI/25/11727",
    "LC/PVI/25/11728"
  ]
}
```

### Test 2: Check Lines API
```
http://localhost:3000/api/lines
```

**Current Result**:
```json
{
  "success": true,
  "data": ["DBR_L1", "DBR_L2", "DBR_L3", ...]
}
```
✅ Lines are working - data comes from `VSM_Execution` sheet

## Solution: Fix Your Google Sheet

### Step 1: Check if Sheet Exists

1. Open your Google Sheet
2. Look at the tabs at the bottom
3. Find a sheet named **exactly**: `WLP_RAW_All_Lines`
4. If it doesn't exist, **create it** (see Step 4 below)

### Step 2: Check Sheet Structure

The sheet should have this structure:

| Column A (Line No) | Column B (OC No) |
|--------------------|------------------|
| DBR_L1             | LC/PVI/25/11726  |
| DBR_L1             | LC/PVI/25/11727  |
| DBR_L2             | LC/PVI/25/11728  |
| DBR_L2             | LC/PVI/25/11729  |

**Important**:
- Row 1 can be headers (optional)
- Column A = Line numbers
- Column B = OC numbers
- **Use plain text, NOT formulas!**
- Each line can have multiple OC numbers (multiple rows)

### Step 3: Check for Errors

1. Go to `WLP_RAW_All_Lines` sheet
2. Look for `#REF!` errors in Column A or B
3. If you see errors:
   - Click on the cell
   - Look at the formula bar
   - Either fix the formula or replace with plain text

### Step 4: Create the Sheet (If Missing)

If `WLP_RAW_All_Lines` doesn't exist:

1. Click the **+** button at the bottom of Google Sheets
2. Rename the new sheet to: `WLP_RAW_All_Lines`
3. Add headers in Row 1:
   - A1: `Line No`
   - B1: `OC No`
4. Add your data starting from Row 2

**Example data**:
```
A2: DBR_L1    B2: LC/PVI/25/11726
A3: DBR_L1    B3: LC/PVI/25/11727
A4: DBR_L1    B4: LC/PVI/25/11728
A5: DBR_L2    B5: LC/PVI/25/11729
A6: DBR_L2    B6: LC/PVI/25/11730
```

### Step 5: Alternative - Use VSM_Execution Data

If you don't have a separate `WLP_RAW_All_Lines` sheet, you can modify the API to read from `VSM_Execution` instead.

**Option A**: Copy data from VSM_Execution
1. Go to `VSM_Execution` sheet
2. Select Column A (Line No) and Column B (OC No)
3. Copy the data
4. Create `WLP_RAW_All_Lines` sheet
5. Paste the data
6. Remove duplicates:
   - Select all data
   - Data → Data cleanup → Remove duplicates
   - Check both columns

**Option B**: Modify the API (I can do this for you)
- Change the API to read from `VSM_Execution` instead of `WLP_RAW_All_Lines`
- This will get unique Line-OC combinations from your execution data

## Verification Steps

After fixing the sheet:

### 1. Test the API
```bash
curl "http://localhost:3000/api/oc-numbers?line=DBR_L1"
```

Should return OC numbers:
```json
{
  "success": true,
  "data": ["LC/PVI/25/11726", "LC/PVI/25/11727", ...]
}
```

### 2. Test in Browser
1. Refresh the page (F5)
2. Select Line: DBR_L1
3. Click on OC NO field
4. Start typing (e.g., "1263")
5. **Should see dropdown suggestions**

### 3. Check Browser Console
1. Press F12
2. Go to Console tab
3. Select a line
4. Look for API call: `GET /api/oc-numbers?line=DBR_L1`
5. Check the response

## Common Issues

### Issue 1: Sheet Name is Wrong
- Must be exactly: `WLP_RAW_All_Lines`
- Case-sensitive!
- No extra spaces

### Issue 2: Columns in Wrong Order
- Column A must be Line No
- Column B must be OC No
- Not the other way around!

### Issue 3: All Rows Have Errors
- If all OC numbers are `#REF!`, they're filtered out
- Result: empty array
- Fix: Replace errors with actual OC numbers

### Issue 4: Line Names Don't Match
- In `WLP_RAW_All_Lines`: "DBR_L1"
- In `VSM_Execution`: "DBR_L1"
- Must match exactly (case-sensitive)

## Quick Fix: Use VSM_Execution Instead

If you want me to modify the API to read from `VSM_Execution` instead of `WLP_RAW_All_Lines`, I can do that. This would:

✅ Use existing data (no need to create new sheet)
✅ Always in sync with your execution data
✅ Automatically get unique Line-OC combinations

Let me know if you want this option!

## What to Do Now

**Option 1**: Fix/Create `WLP_RAW_All_Lines` sheet (see steps above)

**Option 2**: Tell me to modify the API to use `VSM_Execution` instead

**Option 3**: Share a screenshot of your Google Sheets tabs so I can see what sheets you have

Choose the option that works best for you!
