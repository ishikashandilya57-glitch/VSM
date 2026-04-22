# 📥 HOW TO IMPORT CSV FILE TO GOOGLE SHEETS - STEP BY STEP

## 🎯 GOAL
Import `SOP_CAL_COMPLETE_TABLE.csv` into your Google Sheets SOP_Cal sheet.

---

## 📋 METHOD 1: IMPORT TO EXISTING SHEET (RECOMMENDED)

### Step 1: Backup Your Current SOP_Cal Sheet
**IMPORTANT**: Always backup before replacing data!

1. Open your Google Sheets file
2. Find the **SOP_Cal** tab at the bottom
3. **Right-click** on the SOP_Cal tab
4. Select **"Duplicate"**
5. Rename the duplicate to **"SOP_Cal_Backup"**
6. Now you have a backup! ✅

---

### Step 2: Download the CSV File

1. In your file explorer, go to: `vsm-app` folder
2. Find the file: **`SOP_CAL_COMPLETE_TABLE.csv`**
3. This file is ready to use (already created)
4. Note the location of this file

---

### Step 3: Open Google Sheets Import Dialog

1. Open your Google Sheets file
2. Click on the **SOP_Cal** tab (the one you want to replace)
3. Click on **File** menu (top left)
4. Select **Import**

```
File
  ├─ New
  ├─ Open
  ├─ Make a copy
  ├─ Import  ← Click here
  ├─ ...
```

---

### Step 4: Upload the CSV File

You'll see the **Import file** dialog with 3 tabs:

**Tab 1: Upload**
1. Click on **"Upload"** tab
2. Click **"Browse"** button (or drag and drop)
3. Navigate to `vsm-app` folder
4. Select **`SOP_CAL_COMPLETE_TABLE.csv`**
5. Click **"Open"**

The file will start uploading (should be very fast, it's small).

---

### Step 5: Choose Import Settings

After upload, you'll see **"Import file"** settings:

**Import location**:
- Select: **"Replace current sheet"** ← IMPORTANT!
  
  Options shown:
  - ○ Create new spreadsheet
  - ○ Insert new sheet(s)
  - ● **Replace current sheet** ← Choose this
  - ○ Replace data at selected cell
  - ○ Append rows to current sheet

**Separator type**:
- Select: **"Comma"** (should be auto-detected)
  
  Options:
  - ● Comma ← Should be selected
  - ○ Tab
  - ○ Custom

**Convert text to numbers, dates, and formulas**:
- ☑ Check this box (recommended)

---

### Step 6: Import the Data

1. Click **"Import data"** button
2. Wait a few seconds
3. Done! ✅

Your SOP_Cal sheet now has the new data!

---

## 📋 METHOD 2: IMPORT AS NEW SHEET (ALTERNATIVE)

If you want to keep the old sheet and create a new one:

### Step 1: Open Import Dialog
1. Open Google Sheets
2. Click **File → Import**

### Step 2: Upload CSV
1. Click **"Upload"** tab
2. Browse and select `SOP_CAL_COMPLETE_TABLE.csv`
3. Click **"Open"**

### Step 3: Choose Settings
**Import location**:
- Select: **"Insert new sheet(s)"**

**Separator type**:
- Select: **"Comma"**

### Step 4: Import
1. Click **"Import data"**
2. A new sheet will be created (might be named "SOP_CAL_COMPLETE_TABLE")
3. Rename it to **"SOP_Cal_New"**
4. Compare with old sheet
5. If satisfied, delete old SOP_Cal and rename new one

---

## 📋 METHOD 3: COPY-PASTE (IF IMPORT DOESN'T WORK)

### Step 1: Open CSV in Text Editor
1. Right-click on `SOP_CAL_COMPLETE_TABLE.csv`
2. Select **"Open with" → Notepad** (or any text editor)
3. Select all text (Ctrl+A)
4. Copy (Ctrl+C)

### Step 2: Paste into Google Sheets
1. Open Google Sheets
2. Click on SOP_Cal sheet
3. Click on cell **A1**
4. Paste (Ctrl+V)
5. Google Sheets will automatically parse the CSV data

---

## ✅ VERIFICATION AFTER IMPORT

After importing, verify the data:

### Check 1: Total Rows
- Should have **~50 rows** (including header)
- Header row: Process Seq, Process Stage, Product Type, etc.
- Data rows: 49 rows

### Check 2: Column Headers
```
Column A: Process Seq
Column B: Process Stage
Column C: Product Type
Column D: Derived Wash Category
Column E: Order Type
Column F: Order Qty Band
Column G: VA
Column H: NNVA
Column I: NVA
Column J: SOP Lead Time (Days)
```

**IMPORTANT**: Your original sheet might have columns in different positions!
- Original Column J = SOP Lead Time
- Original Column K = VA
- Original Column L = NNVA
- Original Column M = NVA

**If columns are in different positions**, you need to rearrange them!

### Check 3: Product Types in Column C
Should see:
- Shirt
- Overshirt
- Knitted Shirt
- Tape Shirt
- All

### Check 4: Order Types in Column E
Should see:
- Repeat
- Non-Repeat
- All

### Check 5: Sample Data
Check row 2 (first data row):
```
1, Fabric Inhouse, All, All, All, All, 0, 0.1, 0.9, 1
```

Check Sewing rows (should be multiple):
```
7, Sewing, Shirt, Non-Wash, Repeat, Q2, 1.85, 0, 0, 1.85
7, Sewing, Overshirt, Basic Wash, All, Q1, 3.25, 0, 0, 3.25
7, Sewing, Knitted Shirt, Non-Wash, All, Q2, 2.15, 0, 0, 2.15
```

---

## 🔧 TROUBLESHOOTING

### Problem 1: Columns in Wrong Order
**Symptom**: Data appears in wrong columns

**Solution**: 
1. Check your original SOP_Cal column order
2. The CSV has columns in this order: A, B, C, D, E, F, G, H, I, J
3. Your sheet might have: A, B, C, D, E, F, J, K, L, M
4. You need to rearrange columns to match

**How to rearrange**:
1. Click on column header (e.g., Column G)
2. Drag it to the correct position
3. Repeat for all columns

### Problem 2: Import Button Grayed Out
**Symptom**: Can't click "Import data" button

**Solution**:
1. Make sure you selected "Replace current sheet"
2. Make sure a sheet is selected (SOP_Cal)
3. Try Method 3 (Copy-Paste) instead

### Problem 3: Data Looks Wrong After Import
**Symptom**: Numbers appear as text, dates are wrong

**Solution**:
1. Select all data (Ctrl+A)
2. Go to **Data → Split text to columns**
3. Choose **Comma** as separator
4. Or use Method 3 (Copy-Paste)

### Problem 4: CSV File Not Found
**Symptom**: Can't find `SOP_CAL_COMPLETE_TABLE.csv`

**Solution**:
1. The file is in: `vsm-app/SOP_CAL_COMPLETE_TABLE.csv`
2. Check your file explorer
3. If not there, I can create it again
4. Or copy the data from the file content below

---

## 📊 ALTERNATIVE: MANUAL ENTRY

If import doesn't work, you can manually enter the data:

### Step 1: Clear Existing Data
1. Select all cells in SOP_Cal (Ctrl+A)
2. Delete (Delete key)

### Step 2: Add Headers
In row 1, enter:
```
A1: Process Seq
B1: Process Stage
C1: Product Type
D1: Derived Wash Category
E1: Order Type
F1: Order Qty Band
G1: VA
H1: NNVA
I1: NVA
J1: SOP Lead Time (Days)
```

### Step 3: Add Data Rows
Copy data from `SOP_CAL_COMPLETE_TABLE.csv` file and paste row by row.

---

## 🎯 QUICK REFERENCE

### Import Steps (Short Version):
1. **Backup**: Right-click SOP_Cal tab → Duplicate
2. **Import**: File → Import → Upload
3. **Select**: Browse to `SOP_CAL_COMPLETE_TABLE.csv`
4. **Settings**: Replace current sheet, Comma separator
5. **Import**: Click "Import data"
6. **Verify**: Check 50 rows, Product Types, Order Types

---

## 📝 AFTER IMPORT

### Next Steps:
1. ✅ Verify data imported correctly
2. ✅ Check column positions match your original sheet
3. ✅ Deploy Product Type feature (Apps Script)
4. ✅ Test with different product types
5. ✅ Verify target dates calculate correctly

---

## 🆘 NEED HELP?

If you're stuck:
1. Take a screenshot of the error
2. Check which method you're using
3. Try alternative method (Copy-Paste)
4. Verify CSV file location

---

**The CSV file is ready in `vsm-app/SOP_CAL_COMPLETE_TABLE.csv` - just import it!** 🎯
