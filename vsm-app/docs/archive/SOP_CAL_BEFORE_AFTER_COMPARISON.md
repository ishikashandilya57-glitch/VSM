# 📊 SOP_CAL SHEET - BEFORE vs AFTER COMPARISON

## 🎯 WHAT'S CHANGING

This document shows you exactly what needs to change in your SOP_Cal sheet.

---

## 📋 COLUMN STRUCTURE

### BEFORE (What you might have):
```
Column A: Process Seq
Column B: Process Stage
Column C: Product Type (might be empty or generic)
Column D: Derived Wash Category
Column E: Order Type (might be empty or only "All")
Column F: Order Qty Band
Column J: SOP Lead Time (Days)
```

### AFTER (What you need):
```
Column A: Process Seq
Column B: Process Stage
Column C: Product Type ← ADD: Shirt, Overshirt, Knitted Shirt, Tape Shirt
Column D: Derived Wash Category
Column E: Order Type ← ADD: Repeat, Non-Repeat
Column F: Order Qty Band
Column J: SOP Lead Time (Days)
Column K: VA ← ADD: Value Added time
Column L: NNVA ← ADD: Necessary Non-Value Added time
Column M: NVA ← ADD: Non-Value Added time
```

---

## 🔍 EXAMPLE 1: SEWING PROCESS

### BEFORE (Incomplete - Only 1 row):
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT
7           | Sewing        | All          | All           | All        | All      | 1.85
```

**Problem**: All products get 1.85 days, regardless of complexity!

### AFTER (Complete - 8 rows):
```
Process Seq | Process Stage | Product Type  | Wash Category | Order Type | Qty Band | VA   | NNVA | NVA | SOP LT
7           | Sewing        | Shirt         | Non-Wash      | Repeat     | Q2       | 1.85 | 0    | 0   | 1.85
7           | Sewing        | Shirt         | Non-Wash      | Non-Repeat | Q2       | 1.85 | 0    | 0   | 1.85
7           | Sewing        | Shirt         | Basic Wash    | All        | Q2       | 1.85 | 0    | 0   | 1.85
7           | Sewing        | Shirt         | Complex Wash  | All        | Q2       | 1.85 | 0    | 0   | 1.85
7           | Sewing        | Tape Shirt    | Non-Wash      | Repeat     | Q2       | 5    | 0    | 0   | 5
7           | Sewing        | Knitted Shirt | Non-Wash      | All        | Q2       | 2.15 | 0    | 0   | 2.15
7           | Sewing        | Overshirt     | Basic Wash    | All        | Q1       | 3.25 | 0    | 0   | 3.25
7           | Sewing        | All           | All           | All        | All      | 1.85 | 0    | 0   | 1.85
```

**Solution**: Each product gets correct time!
- Shirt: 1.85 days
- Knitted Shirt: 2.15 days
- Overshirt: 3.25 days
- Tape Shirt: 5 days

---

## 🔍 EXAMPLE 2: PRE-PRODUCTION PROCESS

### BEFORE (Incomplete - Only 1 row):
```
Process Seq | Process Stage  | Product Type | Wash Category | Order Type | Qty Band | SOP LT
4           | Pre-Production | All          | All           | All        | All      | 1
```

**Problem**: Repeat and Non-Repeat orders get same time (1 day)!

### AFTER (Complete - 8 rows):
```
Process Seq | Process Stage  | Product Type | Wash Category | Order Type  | Qty Band | VA | NNVA | NVA | SOP LT
4           | Pre-Production | Shirt        | Non-Wash      | Repeat      | All      | 0  | 1    | 0   | 1
4           | Pre-Production | Shirt        | Non-Wash      | Non-Repeat  | All      | 0  | 3.65 | 0   | 3.65
4           | Pre-Production | Shirt        | Basic Wash    | Non-Repeat  | All      | 0  | 4.65 | 0   | 4.65
4           | Pre-Production | Shirt        | Complex Wash  | Non-Repeat  | All      | 0  | 5.9  | 0   | 5.9
4           | Pre-Production | Tape Shirt   | Non-Wash      | Repeat      | All      | 0  | 3.6  | 0   | 3.6
4           | Pre-Production | Knitted Shirt| Non-Wash      | All         | All      | 0  | 1.5  | 0   | 1.5
4           | Pre-Production | Overshirt    | Basic Wash    | All         | All      | 0  | 4.6  | 0   | 4.6
4           | Pre-Production | All          | All           | All         | All      | 0  | 1    | 0   | 1
```

**Solution**: Repeat vs Non-Repeat makes HUGE difference!
- Repeat: 1 day
- Non-Repeat: 3.65-5.9 days (3-5 days longer!)

---

## 🔍 EXAMPLE 3: WASHING PROCESS

### BEFORE (Incomplete - Only 1 row):
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT
8           | Washing       | All          | All           | All        | All      | 0
```

**Problem**: All wash types get 0 days!

### AFTER (Complete - 7 rows):
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | VA | NNVA | NVA | SOP LT
8           | Washing       | Shirt        | Non-Wash      | All        | All      | 0  | 0    | 0   | 0
8           | Washing       | Shirt        | Basic Wash    | All        | All      | 0  | 2.25 | 0   | 2.25
8           | Washing       | Shirt        | Complex Wash  | All        | All      | 0  | 5.25 | 0   | 5.25
8           | Washing       | Tape Shirt   | Non-Wash      | All        | All      | 0  | 0    | 0   | 0
8           | Washing       | Knitted Shirt| Non-Wash      | All        | All      | 0  | 0    | 0   | 0
8           | Washing       | Overshirt    | Basic Wash    | All        | All      | 0  | 2    | 0   | 2
8           | Washing       | All          | All           | All        | All      | 0  | 0    | 0   | 0
```

**Solution**: Wash Type makes HUGE difference!
- Non-Wash: 0 days
- Basic Wash: 2-2.25 days
- Complex Wash: 5.25 days

---

## 🔍 EXAMPLE 4: CUTTING PROCESS

### BEFORE (Incomplete - Only 1 row):
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT
6           | Cutting       | All          | All           | All        | All      | 1.9
```

**Problem**: All products and order types get same time!

### AFTER (Complete - 8 rows):
```
Process Seq | Process Stage | Product Type  | Wash Category | Order Type  | Qty Band | VA  | NNVA | NVA | SOP LT
6           | Cutting       | Shirt         | Non-Wash      | Repeat      | Q2       | 1.9 | 0.25 | 0   | 2.15
6           | Cutting       | Shirt         | Non-Wash      | Non-Repeat  | Q2       | 1.9 | 1.25 | 0   | 3.15
6           | Cutting       | Shirt         | Basic Wash    | All         | Q2       | 1.9 | 1.25 | 0   | 3.15
6           | Cutting       | Shirt         | Complex Wash  | All         | Q2       | 1.9 | 1.25 | 0   | 3.15
6           | Cutting       | Tape Shirt    | Non-Wash      | Repeat      | Q2       | 3   | 0.5  | 0   | 3.5
6           | Cutting       | Knitted Shirt | Non-Wash      | All         | Q2       | 2.5 | 1.25 | 0   | 3.75
6           | Cutting       | Overshirt     | Basic Wash    | All         | Q1       | 1.9 | 1.25 | 0   | 3.15
6           | Cutting       | All           | All           | All         | All      | 1.9 | 1    | 0   | 2.9
```

**Solution**: 
- VA varies by product type (1.9-3 days)
- NNVA varies by order type (0.25-1.25 days)
- Repeat orders are faster (0.25 vs 1.25 days NNVA)

---

## 🔍 EXAMPLE 5: FINISHING PROCESS

### BEFORE (Incomplete - Only 1 row):
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | SOP LT
9           | Finishing     | All          | All           | All        | All      | 1
```

**Problem**: All products get same time!

### AFTER (Complete - 5 rows):
```
Process Seq | Process Stage | Product Type  | Wash Category | Order Type | Qty Band | VA  | NNVA | NVA | SOP LT
9           | Finishing     | Shirt         | All           | All        | All      | 1   | 0    | 1   | 2
9           | Finishing     | Tape Shirt    | All           | All        | All      | 2.5 | 0    | 1   | 3.5
9           | Finishing     | Knitted Shirt | All           | All        | All      | 1.35| 0    | 1   | 2.35
9           | Finishing     | Overshirt     | All           | All        | All      | 1   | 0    | 1   | 2
9           | Finishing     | All           | All           | All        | All      | 1   | 0    | 1   | 2
```

**Solution**: 
- VA varies by product type (1-2.5 days)
- NVA = 1 day (Supermarket 4 - Finishing WIP)
- Tape Shirt takes longest (2.5 days VA)

---

## 📊 TOTAL ROWS COMPARISON

### BEFORE:
```
Total rows: ~11 (one per process)
```

### AFTER:
```
Total rows: ~50 (multiple rows per process with different combinations)

Breakdown:
- Fabric Inhouse: 1 row
- Fabric QC: 8 rows (different products and wash types)
- File Release: 1 row
- Pre-Production: 8 rows (different products and order types)
- CAD/Pattern: 1 row
- Cutting: 8 rows (different products and order types)
- Sewing: 8 rows (different products)
- Washing: 7 rows (different wash types)
- Finishing: 5 rows (different products)
- Inspection: 1 row
- Dispatch: 1 row
Total: 49 rows
```

---

## 🎯 KEY DIFFERENCES SUMMARY

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Total Rows** | ~11 | ~50 |
| **Product Types** | Only "All" | Shirt, Overshirt, Knitted Shirt, Tape Shirt, All |
| **Order Types** | Only "All" | Repeat, Non-Repeat, All |
| **VA/NNVA/NVA** | Not broken down | Separate columns (K, L, M) |
| **Sewing Times** | All products: 1.85 days | Shirt: 1.85, Overshirt: 3.25, Knitted: 2.15, Tape: 5 |
| **Pre-Production** | All orders: 1 day | Repeat: 1 day, Non-Repeat: 3.65-5.9 days |
| **Washing Times** | All wash types: 0 days | Non-Wash: 0, Basic: 2.25, Complex: 5.25 |
| **Accuracy** | ❌ Inaccurate | ✅ Accurate |

---

## ✅ WHAT YOU GET AFTER UPDATE

### 1. Accurate Sewing Times
- Shirt: 1.85 days ✅
- Knitted Shirt: 2.15 days ✅
- Overshirt: 3.25 days ✅
- Tape Shirt: 5 days ✅

### 2. Accurate Pre-Production Times
- Repeat orders: 1 day ✅
- Non-Repeat orders: 3.65-5.9 days ✅
- **3-5 day difference captured!**

### 3. Accurate Washing Times
- Non-Wash: 0 days ✅
- Basic Wash: 2-2.25 days ✅
- Complex Wash: 5.25 days ✅

### 4. VA/NNVA/NVA Breakdown
- See exactly where time is spent
- Identify waste (NVA)
- Optimize processes

### 5. Product Type Feature Works
- User selects product type in UI
- System finds correct row in SOP_Cal
- Target dates calculated accurately

---

## 🚀 HOW TO UPDATE

### Easiest Way: Import CSV
1. Download `SOP_CAL_COMPLETE_TABLE.csv`
2. Open Google Sheets
3. Go to File → Import
4. Upload CSV
5. Choose "Replace current sheet"
6. Done! ✅

### Manual Way: Add Rows
1. Open SOP_Cal sheet
2. Add new rows for each process
3. Fill in Product Type, Order Type, VA, NNVA, NVA
4. Verify totals match
5. Test with Product Type feature

---

## 📝 VERIFICATION

After updating, verify:
- [ ] Total rows: ~50
- [ ] Column C has: Shirt, Overshirt, Knitted Shirt, Tape Shirt, All
- [ ] Column E has: Repeat, Non-Repeat, All
- [ ] Columns K, L, M have VA/NNVA/NVA values
- [ ] Sewing has 8 rows with different product types
- [ ] Pre-Production has 8 rows with Repeat/Non-Repeat
- [ ] Washing has 7 rows with different wash types
- [ ] Each process has fallback row (All/All/All/All)

---

**The CSV file has all the data you need - just import it!** 🎯
