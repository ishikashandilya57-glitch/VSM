# 🔧 SOP_CAL SHEET - CHANGES NEEDED

## 📋 WHAT YOU NEED TO DO

### Option 1: Import the Complete CSV (EASIEST)
1. Open your Google Sheets
2. Create a new sheet or clear existing SOP_Cal sheet
3. Go to **File → Import**
4. Upload `SOP_CAL_COMPLETE_TABLE.csv`
5. Choose **Replace current sheet** or **Insert new sheet**
6. Done! ✅

### Option 2: Manual Update (If you want to keep existing data)
Follow the changes below to update your existing SOP_Cal sheet.

---

## 🎯 KEY CHANGES NEEDED

### 1. **Add Product Type Values to Column C**

**Current Problem**: Column C might have generic values or missing product types

**What to Add**:
- `Shirt` (for basic shirts)
- `Overshirt` (for complex overshirts)
- `Knitted Shirt` (for knitted products)
- `Tape Shirt` (for tape shirts)
- `All` (fallback)

**Example**:
```
Column C (Product Type):
- Shirt
- Shirt
- Overshirt
- Knitted Shirt
- Tape Shirt
- All
```

---

### 2. **Add Order Type Values to Column E**

**Current Problem**: Column E might only have "All"

**What to Add**:
- `Repeat` (faster pre-production)
- `Non-Repeat` (slower pre-production)
- `All` (fallback)

**Example**:
```
Column E (Order Type):
- Repeat
- Non-Repeat
- All
```

---

### 3. **Add VA/NNVA/NVA Breakdown (Columns K, L, M)**

**Current Problem**: Might only have SOP LT (Column J) without breakdown

**What to Add**:
- **Column K (VA)**: Value Added time
- **Column L (NNVA)**: Necessary Non-Value Added time
- **Column M (NVA)**: Non-Value Added time (waste/queue)

**Formula**: `SOP LT (Column J) = VA + NNVA + NVA`

**Example for Sewing**:
```
Process Stage | VA   | NNVA | NVA | SOP LT
Sewing (Shirt)| 1.85 | 0    | 0   | 1.85
Sewing (Overshirt) | 3.25 | 0 | 0 | 3.25
```

---

### 4. **Add Multiple Rows for Same Process with Different Product Types**

**Current Problem**: Might have only one row per process

**What to Add**: Multiple rows for each process with different product types

**Example for Sewing Process**:
```
Row 1: Sewing | Shirt         | Non-Wash | All | Q2 | 1.85 | 0 | 0 | 1.85
Row 2: Sewing | Overshirt     | Basic Wash | All | Q1 | 3.25 | 0 | 0 | 3.25
Row 3: Sewing | Knitted Shirt | Non-Wash | All | Q2 | 2.15 | 0 | 0 | 2.15
Row 4: Sewing | Tape Shirt    | Non-Wash | Repeat | Q2 | 5 | 0 | 0 | 5
Row 5: Sewing | All           | All      | All | All | 1.85 | 0 | 0 | 1.85
```

---

### 5. **Add Multiple Rows for Pre-Production with Repeat vs Non-Repeat**

**Current Problem**: Pre-Production might have only one row

**What to Add**: Separate rows for Repeat and Non-Repeat orders

**Example**:
```
Row 1: Pre-Production | Shirt | Non-Wash | Repeat     | All | 0 | 1    | 0 | 1
Row 2: Pre-Production | Shirt | Non-Wash | Non-Repeat | All | 0 | 3.65 | 0 | 3.65
Row 3: Pre-Production | Shirt | Basic Wash | Non-Repeat | All | 0 | 4.65 | 0 | 4.65
Row 4: Pre-Production | Shirt | Complex Wash | Non-Repeat | All | 0 | 5.9 | 0 | 5.9
```

**Key Point**: Repeat orders are MUCH faster (1 day vs 3.65-5.9 days)!

---

### 6. **Add Multiple Rows for Washing with Different Wash Types**

**Current Problem**: Washing might have only one row

**What to Add**: Separate rows for Non-Wash, Basic Wash, Complex Wash

**Example**:
```
Row 1: Washing | All | Non-Wash     | All | All | 0 | 0    | 0 | 0
Row 2: Washing | All | Basic Wash   | All | All | 0 | 2.25 | 0 | 2.25
Row 3: Washing | All | Complex Wash | All | All | 0 | 5.25 | 0 | 5.25
```

**Key Point**: Wash Type makes HUGE difference (0 vs 2.25 vs 5.25 days)!

---

### 7. **Add Fallback Rows (All/All/All/All)**

**Current Problem**: Might be missing fallback rows

**What to Add**: For each process, add a fallback row with all "All" values

**Example**:
```
Process Stage | Product Type | Wash Category | Order Type | Qty Band | VA | NNVA | NVA | SOP LT
Sewing        | All          | All           | All        | All      | 1.85 | 0 | 0 | 1.85
Cutting       | All          | All           | All        | All      | 1.9  | 1 | 0 | 2.9
Finishing     | All          | All           | All        | All      | 1    | 0 | 1 | 2
```

**Why**: System uses fallback if exact match not found

---

## 📊 COMPLETE COLUMN STRUCTURE

Your SOP_Cal sheet should have these columns:

| Column | Field Name | Example Values |
|--------|------------|----------------|
| **A** | Process Seq | 1, 2, 3, ..., 11 |
| **B** | Process Stage | Fabric Inhouse, Fabric QC, File Release, Pre-Production, CAD / Pattern, Cutting, Sewing, Washing, Finishing, Inspection, Dispatch |
| **C** | **Product Type** | **Shirt, Overshirt, Knitted Shirt, Tape Shirt, All** |
| **D** | Derived Wash Category | Non-Wash, Basic Wash, Complex Wash, Enzyme, All |
| **E** | **Order Type** | **Repeat, Non-Repeat, All** |
| **F** | Order Qty Band | Q1, Q2, Q3, Q4, Q5, All |
| **G-I** | (Optional columns) | |
| **J** | SOP Lead Time (Days) | Total time (VA + NNVA + NVA) |
| **K** | **VA** | **Value Added time** |
| **L** | **NNVA** | **Necessary Non-Value Added time** |
| **M** | **NVA** | **Non-Value Added time (waste/queue)** |

---

## 🎯 PROCESS-BY-PROCESS SUMMARY

### Process 1: Fabric Inhouse
- **Rows needed**: 1
- **Product Type**: All
- **VA/NNVA/NVA**: 0 / 0.1 / 0.9
- **Total**: 1 day

### Process 2: Fabric QC
- **Rows needed**: 8 (different product types and wash types)
- **Key factor**: Wash Type (Complex wash takes 5 days vs 1.5 days)
- **VA/NNVA/NVA**: All NNVA (0 / 1.5-5 / 0)

### Process 3: File Release
- **Rows needed**: 1
- **Product Type**: All
- **VA/NNVA/NVA**: 0 / 0 / 0
- **Total**: 0 days

### Process 4: Pre-Production
- **Rows needed**: 8 (different product types and order types)
- **Key factor**: Order Type (Repeat: 1 day, Non-Repeat: 3.65-5.9 days)
- **VA/NNVA/NVA**: All NNVA (0 / 1-5.9 / 0)

### Process 5: CAD / Pattern
- **Rows needed**: 1
- **Product Type**: All
- **VA/NNVA/NVA**: 0 / 0.5 / 0
- **Total**: 0.5 days

### Process 6: Cutting
- **Rows needed**: 8 (different product types and order types)
- **Key factors**: Product Type (VA varies), Order Type (NNVA varies)
- **VA/NNVA/NVA**: 1.9-3 / 0.25-1.25 / 0

### Process 7: Sewing
- **Rows needed**: 8 (different product types)
- **Key factor**: Product Type (1.85-5 days)
- **VA/NNVA/NVA**: All VA (1.85-5 / 0 / 0)
- **MOST IMPORTANT PROCESS FOR PRODUCT TYPE!**

### Process 8: Washing
- **Rows needed**: 7 (different wash types)
- **Key factor**: Wash Type (0-5.25 days)
- **VA/NNVA/NVA**: All NNVA (0 / 0-5.25 / 0)

### Process 9: Finishing
- **Rows needed**: 5 (different product types)
- **Key factor**: Product Type (VA varies)
- **VA/NNVA/NVA**: 1-2.5 / 0 / 1 (NVA = Supermarket 4)

### Process 10: Inspection
- **Rows needed**: 1
- **Product Type**: All
- **VA/NNVA/NVA**: 0 / 1.25 / 0
- **Total**: 1.25 days (CSO inspection)

### Process 11: Dispatch
- **Rows needed**: 1
- **Product Type**: All
- **VA/NNVA/NVA**: 0 / 1.5 / 0
- **Total**: 1.5 days

---

## 📝 TOTAL ROWS NEEDED

**Minimum**: ~50 rows (with all combinations)
**Recommended**: 50-60 rows (including fallbacks)

**Breakdown**:
- Fabric Inhouse: 1 row
- Fabric QC: 8 rows
- File Release: 1 row
- Pre-Production: 8 rows
- CAD/Pattern: 1 row
- Cutting: 8 rows
- Sewing: 8 rows
- Washing: 7 rows
- Finishing: 5 rows
- Inspection: 1 row
- Dispatch: 1 row
- **Total**: 49 rows

---

## ✅ VERIFICATION CHECKLIST

After updating SOP_Cal, verify:

- [ ] Column C has: Shirt, Overshirt, Knitted Shirt, Tape Shirt, All
- [ ] Column E has: Repeat, Non-Repeat, All
- [ ] Column K (VA) has correct value-added times
- [ ] Column L (NNVA) has correct necessary non-value-added times
- [ ] Column M (NVA) has correct waste/queue times
- [ ] Column J (SOP LT) = VA + NNVA + NVA for each row
- [ ] Sewing has different VA for different products (1.85, 2.15, 3.25, 5)
- [ ] Pre-Production has different NNVA for Repeat vs Non-Repeat (1 vs 3.65-5.9)
- [ ] Washing has different NNVA for different wash types (0, 2.25, 5.25)
- [ ] Each process has a fallback row (All/All/All/All)
- [ ] Total rows: ~50

---

## 🚀 QUICK START

### Step 1: Backup Current Sheet
1. Right-click on SOP_Cal tab
2. Select "Duplicate"
3. Rename to "SOP_Cal_Backup"

### Step 2: Import New Data
1. Download `SOP_CAL_COMPLETE_TABLE.csv`
2. Open SOP_Cal sheet
3. Select all cells (Ctrl+A)
4. Delete all data
5. Go to File → Import
6. Upload CSV file
7. Choose "Replace current sheet"

### Step 3: Verify
1. Check Column C has product types
2. Check Column E has order types
3. Check Columns K, L, M have VA/NNVA/NVA
4. Check total rows: ~50

### Step 4: Test
1. Deploy Product Type feature
2. Select different product types in UI
3. Verify target dates change correctly
4. Check Apps Script logs

---

## 📊 EXAMPLE: BEFORE vs AFTER

### BEFORE (Incomplete):
```
Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT
Sewing        | All          | All           | All        | All      | 1.85
```
**Problem**: All products get same time (1.85 days)

### AFTER (Complete):
```
Process Stage | Product Type  | Wash Category | Order Type | Qty Band | VA   | NNVA | NVA | SOP LT
Sewing        | Shirt         | Non-Wash      | All        | Q2       | 1.85 | 0    | 0   | 1.85
Sewing        | Overshirt     | Basic Wash    | All        | Q1       | 3.25 | 0    | 0   | 3.25
Sewing        | Knitted Shirt | Non-Wash      | All        | Q2       | 2.15 | 0    | 0   | 2.15
Sewing        | Tape Shirt    | Non-Wash      | Repeat     | Q2       | 5    | 0    | 0   | 5
Sewing        | All           | All           | All        | All      | 1.85 | 0    | 0   | 1.85
```
**Solution**: Each product gets correct time!

---

## 🎯 SUMMARY

**What to Change**:
1. ✅ Add Product Type values (Shirt, Overshirt, Knitted Shirt, Tape Shirt)
2. ✅ Add Order Type values (Repeat, Non-Repeat)
3. ✅ Add VA/NNVA/NVA breakdown (Columns K, L, M)
4. ✅ Add multiple rows per process with different combinations
5. ✅ Add fallback rows (All/All/All/All)

**Easiest Way**: Import `SOP_CAL_COMPLETE_TABLE.csv` file!

**The CSV file is ready to use - just import it into your Google Sheets!** 🎯
