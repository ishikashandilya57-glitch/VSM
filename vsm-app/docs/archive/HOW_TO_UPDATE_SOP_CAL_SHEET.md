# 🔧 HOW TO UPDATE SOP_CAL SHEET - STEP BY STEP

## 🎯 GOAL
Update your SOP_Cal sheet to match your Lead Time-Final analysis with correct VA/NNVA/NVA breakdown.

---

## 📋 STEP 1: UNDERSTAND THE 7 PRODUCT TYPES

Based on your Lead Time-Final sheet, you have **7 distinct product types**:

1. **Basic non-wash shirt (Repeat Order)**
2. **Basic non-wash shirt (Non Repeat Order)**
3. **Basic shirt with basic wash**
4. **Basic shirt with complex wash** (tie & dye, Garment Dye, Denim wash)
5. **Basic tape shirts** (Repeat order, subject to capacity availability)
6. **Basic knitted shirts** (Subject to capacity availability)
7. **Overshirt** with basic wash

**IMPORTANT**: These should be the EXACT values in SOP_Cal Column C (Product Type)

---

## 📋 STEP 2: SIMPLIFY PRODUCT TYPE NAMES (RECOMMENDED)

For easier dropdown selection, consider simplifying:

| Full Name | Simplified Name | Use in SOP_Cal |
|-----------|-----------------|----------------|
| Basic non-wash shirt (Repeat Order) | **Shirt (Repeat)** | Shirt |
| Basic non-wash shirt (Non Repeat Order) | **Shirt (Non-Repeat)** | Shirt |
| Basic shirt with basic wash | **Shirt** | Shirt |
| Basic shirt with complex wash | **Shirt** | Shirt |
| Basic tape shirts | **Tape Shirt** | Tape Shirt |
| Basic knitted shirts | **Knitted Shirt** | Knitted Shirt |
| Overshirt with basic wash | **Overshirt** | Overshirt |

**Recommendation**: Use simplified names + Order Type column to differentiate

---

## 📋 STEP 3: PRODUCT TYPE DROPDOWN VALUES

For the UI dropdown (Column C in SOP_Cal), use these **4 simple values**:

1. **All** (fallback)
2. **Shirt** (basic shirts - most common)
3. **Overshirt** (complex product)
4. **Knitted Shirt** (knitted products)
5. **Tape Shirt** (tape shirts)

---

## 📋 STEP 4: ORDER TYPE VALUES

Column E (Order Type) should have:

1. **Repeat** (faster pre-production: 1 day)
2. **Non-Repeat** (slower pre-production: 3.65-5.9 days)
3. **All** (fallback)

---

## 📋 STEP 5: WASH TYPE VALUES

Column D (Derived Wash Category) should have:

1. **Non-Wash** (0 days washing)
2. **Basic Wash** (2-2.25 days washing)
3. **Complex Wash** (5.25 days washing)
4. **Enzyme** (varies)
5. **All** (fallback)

---

## 📋 STEP 6: CREATE SOP_CAL ROWS

### Template Row Structure:
```
Process Seq | Process Stage | Product Type | Wash Category | Order Type | Qty Band | VA | NNVA | NVA | SOP LT
```

---

## 📊 EXAMPLE: SEWING PROCESS ROWS

```csv
Process Seq,Process Stage,Product Type,Wash Category,Order Type,Qty Band,VA,NNVA,NVA,SOP LT
7,Sewing,Shirt,Non-Wash,All,Q2,1.85,0,0,1.85
7,Sewing,Shirt,Basic Wash,All,Q2,1.85,0,0,1.85
7,Sewing,Shirt,Complex Wash,All,Q2,1.85,0,0,1.85
7,Sewing,Tape Shirt,Non-Wash,All,Q2,5,0,0,5
7,Sewing,Knitted Shirt,Non-Wash,All,Q2,2.15,0,0,2.15
7,Sewing,Overshirt,Basic Wash,All,Q1,3.25,0,0,3.25
7,Sewing,All,All,All,All,1.85,0,0,1.85
```

**Key Points**:
- Shirt: 1.85 days (most common)
- Tape Shirt: 5 days (slowest)
- Knitted Shirt: 2.15 days
- Overshirt: 3.25 days (complex)
- Last row (All/All/All/All): Fallback

---

## 📊 EXAMPLE: PRE-PRODUCTION ROWS

```csv
Process Seq,Process Stage,Product Type,Wash Category,Order Type,Qty Band,VA,NNVA,NVA,SOP LT
4,Pre-Production,Shirt,Non-Wash,Repeat,All,0,1,0,1
4,Pre-Production,Shirt,Non-Wash,Non-Repeat,All,0,3.65,0,3.65
4,Pre-Production,Shirt,Basic Wash,Non-Repeat,All,0,4.65,0,4.65
4,Pre-Production,Shirt,Complex Wash,Non-Repeat,All,0,5.9,0,5.9
4,Pre-Production,Tape Shirt,Non-Wash,Repeat,All,0,3.6,0,3.6
4,Pre-Production,Knitted Shirt,Non-Wash,All,All,0,1.5,0,1.5
4,Pre-Production,Overshirt,Basic Wash,All,All,0,4.6,0,4.6
4,Pre-Production,All,All,All,All,0,1,0,1
```

**Key Points**:
- Order Type makes HUGE difference!
- Repeat: 1 day
- Non-Repeat: 3.65-5.9 days
- All NNVA time (no VA)

---

## 📊 EXAMPLE: WASHING ROWS

```csv
Process Seq,Process Stage,Product Type,Wash Category,Order Type,Qty Band,VA,NNVA,NVA,SOP LT
8,Washing,All,Non-Wash,All,All,0,0,0,0
8,Washing,All,Basic Wash,All,All,0,2.25,0,2.25
8,Washing,All,Complex Wash,All,All,0,5.25,0,5.25
8,Washing,Overshirt,Basic Wash,All,All,0,2,0,2
8,Washing,All,All,All,All,0,0,0,0
```

**Key Points**:
- Wash Type is the ONLY factor
- Product Type doesn't matter (use "All")
- Non-Wash: 0 days
- Basic Wash: 2-2.25 days
- Complex Wash: 5.25 days
- All NNVA time

---

## 📊 EXAMPLE: CUTTING ROWS

```csv
Process Seq,Process Stage,Product Type,Wash Category,Order Type,Qty Band,VA,NNVA,NVA,SOP LT
6,Cutting,Shirt,Non-Wash,Repeat,Q2,1.9,0.25,0,2.15
6,Cutting,Shirt,Non-Wash,Non-Repeat,Q2,1.9,1.25,0,3.15
6,Cutting,Shirt,Basic Wash,All,Q2,1.9,1.25,0,3.15
6,Cutting,Shirt,Complex Wash,All,Q2,1.9,1.25,0,3.15
6,Cutting,Tape Shirt,Non-Wash,Repeat,Q2,3,0.5,0,3.5
6,Cutting,Knitted Shirt,Non-Wash,All,Q2,2.5,1.25,0,3.75
6,Cutting,Overshirt,Basic Wash,All,Q2,1.9,1.25,0,3.15
6,Cutting,All,All,All,All,1.9,1,0,2.9
```

**Key Points**:
- VA varies by product type
- NNVA (Fabric Issue & Relaxation) varies by order type
- Repeat: 0.25-0.5 days NNVA
- Non-Repeat: 1.25 days NNVA

---

## 📊 EXAMPLE: FINISHING ROWS

```csv
Process Seq,Process Stage,Product Type,Wash Category,Order Type,Qty Band,VA,NNVA,NVA,SOP LT
9,Finishing,Shirt,All,All,All,1,0,1,2
9,Finishing,Tape Shirt,All,All,All,2.5,0,1,3.5
9,Finishing,Knitted Shirt,All,All,All,1.35,0,1,2.35
9,Finishing,Overshirt,All,All,All,1,0,1,2
9,Finishing,All,All,All,All,1,0,1,2
```

**Key Points**:
- VA varies by product type
- NVA = 1 day (Supermarket 4 - Finishing WIP)
- Tape Shirt takes longest (2.5 days VA)

---

## 📊 STANDARD PROCESSES (Same for All)

### Fabric Inhouse (Process 1):
```csv
1,Fabric Inhouse,All,All,All,All,0,0.1,0.9,1
```

### Fabric QC (Process 2):
```csv
2,Fabric QC,All,Non-Wash,All,All,0,1.5,0,1.5
2,Fabric QC,All,Basic Wash,All,All,0,1.5,0,1.5
2,Fabric QC,All,Complex Wash,All,All,0,5,0,5
2,Fabric QC,All,All,All,All,0,1.5,0,1.5
```

### File Release (Process 3):
```csv
3,File Release,All,All,All,All,0,0,0,0
```

### CAD / Pattern (Process 5):
```csv
5,CAD / Pattern,All,All,All,All,0,0.5,0,0.5
```

### Inspection (Process 10):
```csv
10,Inspection,All,All,All,All,0,1.25,0,1.25
```

### Dispatch (Process 11):
```csv
11,Dispatch,All,All,All,All,0,1.5,0,1.5
```

---

## 🏬 SUPERMARKETS (ALREADY IN CODE)

These are automatically handled by the code:

| Supermarket | Location | Time | Handled By |
|-------------|----------|------|------------|
| SM1 | Before Cutting | Varies | Cutting NNVA column |
| SM2 | After Cutting | 3 days | Hardcoded in code |
| SM3 | After Sewing | 3 days | Hardcoded in code |
| SM4 | After Finishing | 1 day | Finishing NVA column |
| SM5 | Cartoning WIP | 0.7-1.7 days | Hardcoded in code |

**You don't need to add separate rows for SM2, SM3, SM5 - they're automatic!**

---

## ✅ STEP 7: VALIDATION CHECKLIST

After updating SOP_Cal, verify:

- [ ] Column C (Product Type) has: All, Shirt, Overshirt, Knitted Shirt, Tape Shirt
- [ ] Column D (Wash Category) has: All, Non-Wash, Basic Wash, Complex Wash, Enzyme
- [ ] Column E (Order Type) has: All, Repeat, Non-Repeat
- [ ] Column F (Qty Band) has: All, Q1, Q2, Q3, Q4, Q5
- [ ] Column K (VA) has correct value-added times
- [ ] Column L (NNVA) has correct necessary non-value-added times
- [ ] Column M (NVA) has correct waste/queue times
- [ ] Column J (SOP LT) = VA + NNVA + NVA
- [ ] Each process has a fallback row (All/All/All/All)
- [ ] Sewing has different VA for different products
- [ ] Pre-Production has different NNVA for Repeat vs Non-Repeat
- [ ] Washing has different NNVA for different wash types

---

## 🚀 STEP 8: TEST THE SYSTEM

1. Deploy the Product Type feature (already implemented)
2. Select different product types in UI
3. Verify target dates change correctly
4. Check Apps Script logs for SOP lookup
5. Verify VSM_Execution has correct times

---

## 📝 IMPORTANT NOTES

### About Order Type:
Currently, Order Type is NOT in the UI dropdown. The system uses "All" for Order Type.

**Should we add Order Type dropdown to UI?**
- Pre-Production: Repeat (1 day) vs Non-Repeat (3.65-5.9 days) - HUGE difference!
- Cutting: Fabric Issue time varies (0.25 vs 1.25 days)

**Recommendation**: Add Order Type dropdown if you want accurate Pre-Production times.

### About Wash Type:
Wash Type is already captured in "Derived Wash Category" from Order_Master.
- System already uses this correctly
- No UI change needed

### About Cartoning (SM5):
- NOT a separate process
- Time automatically added after Finishing
- Already implemented in code
- No SOP_Cal rows needed

---

## 🎯 SUMMARY

1. **Simplify Product Types**: Use 4-5 simple names (Shirt, Overshirt, Knitted Shirt, Tape Shirt)
2. **Add Order Type**: Consider adding Repeat/Non-Repeat to UI for accurate Pre-Production
3. **Update SOP_Cal**: Add rows with correct VA/NNVA/NVA breakdown
4. **Test**: Verify calculations with different combinations
5. **Deploy**: Use the Product Type feature we implemented

**Your Lead Time-Final analysis is excellent! Now we just need to structure SOP_Cal to match it.** 🎯
