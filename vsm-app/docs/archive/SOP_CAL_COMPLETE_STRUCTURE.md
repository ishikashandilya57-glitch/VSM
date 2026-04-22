# 📊 SOP_CAL COMPLETE STRUCTURE - FROM LEAD TIME ANALYSIS

## 🎯 UNDERSTANDING YOUR DATA

Based on your Lead Time-Final analysis, here's the complete breakdown:

---

## 📋 PRODUCT TYPES (7 Types)

1. **Basic non-wash shirt (Repeat Order)**
2. **Basic non-wash shirt (Non Repeat Order)**
3. **Basic shirt with basic wash**
4. **Basic shirt with complex wash** (tie & dye, Garment Dye, Denim wash)
5. **Basic tape shirts** (Repeat order, subject to capacity availability)
6. **Basic knitted shirts** (Subject to capacity availability)
7. **Overshirt** with basic wash

---

## 📋 WASH CATEGORIES (4 Types)

1. **Non-Wash** (0 days washing time)
2. **Basic Wash** (2.25 days washing time)
3. **Complex Wash** (tie & dye, Garment Dye, Denim wash) (5.25 days washing time)
4. **Enzyme Wash** (varies)

---

## 📋 ORDER TYPES (2 Types)

1. **Repeat** (faster pre-production: 1 day)
2. **Non-Repeat** (slower pre-production: 3.65-5.9 days)

---

## 📋 QUANTITY BANDS (5 Bands)

1. **Q1**: ≤ 1000
2. **Q2**: ≤ 3000
3. **Q3**: ≤ 5000
4. **Q4**: ≤ 8000
5. **Q5**: > 8000

---

## 🔍 PROCESS-BY-PROCESS BREAKDOWN

### Process 1: Fabric Inhouse
**Type**: NNVA (Necessary Non-Value Added)
**Time**: 0.1 days (standard for all)

| Product Type | Order Type | Wash Type | Qty | VA | NNVA | NVA | SOP LT |
|--------------|------------|-----------|-----|----|----|-----|--------|
| All | All | All | All | 0 | 0.1 | 0.9 | 1 |

---

### Process 2: Fabric QC
**Type**: NNVA (Necessary Non-Value Added)

| Product Type | Order Type | Wash Type | Qty (1800) | Qty (1700) | Qty (1400) | SOP LT |
|--------------|------------|-----------|------------|------------|------------|--------|
| Basic non-wash shirt | Repeat | Non-Wash | 1.5 days | - | - | 1.5 |
| Basic non-wash shirt | Non-Repeat | Non-Wash | 1.5 days | - | - | 1.5 |
| Basic shirt | All | Basic Wash | - | 1.5 days | - | 1.5 |
| Basic shirt | All | Complex Wash | - | - | 5 days | 5 |
| Basic tape shirts | Repeat | Non-Wash | - | - | 2.5 days | 2.5 |
| Basic knitted shirts | All | Non-Wash | - | - | 1.5 days | 1.5 |
| Overshirt | All | Basic Wash | - | - | 1.5 days | 1.5 |

**Breakdown**: All NNVA time

---

### Process 3: File Release
**Type**: NNVA
**Time**: 0 days (standard for all)

---

### Process 4: Pre-Production
**Type**: NNVA (Necessary Non-Value Added)
**CRITICAL**: Order Type (Repeat vs Non-Repeat) makes HUGE difference!

| Product Type | Order Type | Wash Type | Qty | VA | NNVA | NVA | SOP LT |
|--------------|------------|-----------|-----|----|----|-----|--------|
| Basic non-wash shirt | **Repeat** | Non-Wash | 1800 | 0 | **1** | 0 | **1** |
| Basic non-wash shirt | **Non-Repeat** | Non-Wash | 1800 | 0 | **3.65** | 0 | **3.65** |
| Basic shirt | Non-Repeat | Basic Wash | 1700 | 0 | **4.65** | 0 | **4.65** |
| Basic shirt | Non-Repeat | Complex Wash | 1400 | 0 | **5.9** | 0 | **5.9** |
| Basic tape shirts | Repeat | Non-Wash | 1400 | 0 | **3.6** | 0 | **3.6** |
| Basic knitted shirts | All | Non-Wash | 1400 | 0 | **1.5** | 0 | **1.5** |
| Overshirt | All | Basic Wash | 1400 | 0 | **4.6** | 0 | **4.6** |

**Key Insight**: Repeat orders are MUCH faster (1 day vs 3.65-5.9 days)!

---

### Process 5: CAD / Pattern
**Type**: NNVA
**Time**: 0.5 days (standard for all)

---

### Process 6: Cutting
**Type**: VA (Value Added) + NNVA (Fabric Issue and Relaxation)

#### VA Time (Pure Cutting):
| Product Type | Order Type | Wash Type | Qty | VA | NNVA (Fabric Issue) | NVA | Total |
|--------------|------------|-----------|-----|----|--------------------|-----|-------|
| Basic non-wash shirt | Repeat | Non-Wash | 1800 | **1.9** | 0.25 | 0 | 2.15 |
| Basic non-wash shirt | Non-Repeat | Non-Wash | 1800 | **1.9** | 1.25 | 0 | 3.15 |
| Basic shirt | All | Basic Wash | 1700 | **1.9** | 1.25 | 0 | 3.15 |
| Basic shirt | All | Complex Wash | 1400 | **1.9** | 1.25 | 0 | 3.15 |
| Basic tape shirts | Repeat | Non-Wash | 1400 | **3** | 0.5 | 0 | 3.5 |
| Basic knitted shirts | All | Non-Wash | 1400 | **2.5** | 1.25 | 0 | 3.75 |
| Overshirt | All | Basic Wash | 1400 | **1.9** | 1.25 | 0 | 3.15 |

**SUPERMARKET 1 (SM1)**: Fabric Issue and Relaxation (varies by product and order type)
**SUPERMARKET 2 (SM2)**: 3 days (fixed) - After Cutting, before Sewing

---

### Process 7: Sewing
**Type**: VA (Value Added) - Pure sewing time

| Product Type | Order Type | Wash Type | Qty | VA | NNVA | NVA | SOP LT |
|--------------|------------|-----------|-----|----|----|-----|--------|
| Basic non-wash shirt | Repeat | Non-Wash | 1800 | **1.85** | 0 | 0 | 1.85 |
| Basic non-wash shirt | Non-Repeat | Non-Wash | 1800 | **1.85** | 0 | 0 | 1.85 |
| Basic shirt | All | Basic Wash | 1700 | **1.85** | 0 | 0 | 1.85 |
| Basic shirt | All | Complex Wash | 1400 | **1.85** | 0 | 0 | 1.85 |
| Basic tape shirts | Repeat | Non-Wash | 1400 | **5** | 0 | 0 | 5 |
| Basic knitted shirts | All | Non-Wash | 1400 | **2.15** | 0 | 0 | 2.15 |
| Overshirt | All | Basic Wash | 1000 | **3.25** | 0 | 0 | 3.25 |

**SUPERMARKET 3 (SM3)**: 3 days (fixed) - After Sewing, before Washing

**Key Insight**: This is where Product Type matters most!
- Basic shirts: 1.85 days
- Knitted shirts: 2.15 days
- Tape shirts: 5 days
- Overshirt: 3.25 days

---

### Process 8: Washing
**Type**: NNVA (Necessary Non-Value Added)
**CRITICAL**: Wash Type determines time!

| Product Type | Order Type | Wash Type | Qty | VA | NNVA | NVA | SOP LT |
|--------------|------------|-----------|-----|----|----|-----|--------|
| Basic non-wash shirt | All | **Non-Wash** | 1800 | 0 | **0** | 0 | **0** |
| Basic shirt | All | **Basic Wash** | 1700 | 0 | **2.25** | 0 | **2.25** |
| Basic shirt | All | **Complex Wash** | 1400 | 0 | **5.25** | 0 | **5.25** |
| Basic tape shirts | Repeat | **Non-Wash** | 1400 | 0 | **0** | 0 | **0** |
| Basic knitted shirts | All | **Non-Wash** | 1400 | 0 | **0** | 0 | **0** |
| Overshirt | All | **Basic Wash** | 1000 | 0 | **2** | 0 | **2** |

**Key Insight**: Wash Type is the ONLY factor here!
- Non-Wash: 0 days
- Basic Wash: 2-2.25 days
- Complex Wash: 5.25 days

---

### Process 9: Finishing
**Type**: VA (Value Added)

| Product Type | Order Type | Wash Type | Qty | VA | NNVA | NVA (SM4) | SOP LT |
|--------------|------------|-----------|-----|----|----|-----------|--------|
| Basic non-wash shirt | Repeat | Non-Wash | 1800 | **1** | 0 | 1 | 2 |
| Basic non-wash shirt | Non-Repeat | Non-Wash | 1800 | **1** | 0 | 1 | 2 |
| Basic shirt | All | Basic Wash | 1700 | **1** | 0 | 1 | 2 |
| Basic shirt | All | Complex Wash | 1400 | **1** | 0 | 1 | 2 |
| Basic tape shirts | Repeat | Non-Wash | 1400 | **2.5** | 0 | 1 | 3.5 |
| Basic knitted shirts | All | Non-Wash | 1400 | **1.35** | 0 | 1 | 2.35 |
| Overshirt | All | Basic Wash | 1000 | **1** | 0 | 1 | 2 |

**SUPERMARKET 4 (SM4)**: 1 day (fixed) - Finishing WIP
**SUPERMARKET 5 (SM5)**: Cartoning WIP (varies by product)

#### Cartoning WIP (Supermarket 5):
| Product Type | SM5 Time |
|--------------|----------|
| Basic non-wash shirt (Repeat) | 1.7 days |
| Basic non-wash shirt (Non-Repeat) | 1.7 days |
| Basic shirt with basic wash | 1.7 days |
| Basic shirt with complex wash | 1.7 days |
| Basic tape shirts | 0.7 days |
| Basic knitted shirts | 0.7 days |
| Overshirt | 0.7 days |

**Note**: Cartoning is NOT a separate process in UI, but time is added automatically!

---

### Process 10: Inspection
**Type**: NNVA
**Time**: 1.25 days (standard for all - CSO inspection)

---

### Process 11: Dispatch
**Type**: NNVA
**Time**: 1.5 days (standard for all)

---

## 🏬 SUPERMARKET SUMMARY

| Supermarket | Location | Type | Time | Notes |
|-------------|----------|------|------|-------|
| **SM1** | Before Cutting | NVA | Varies | Fabric Issue & Relaxation (0.25-1.25 days) |
| **SM2** | After Cutting | NVA | **3 days** | Fixed - Cutting WIP |
| **SM3** | After Sewing | NVA | **3 days** | Fixed - Sewing WIP |
| **SM4** | After Finishing | NVA | **1 day** | Fixed - Finishing WIP |
| **SM5** | After Finishing | NVA | 0.7-1.7 days | Cartoning WIP (varies by product) |

**Total Inter-Process WIP**: SM2 + SM3 + SM5 = 3 + 3 + (0.7-1.7) = 6.7-7.7 days

---

## 🎯 KEY FACTORS FOR SOP LOOKUP

### 1. Product Type (7 types)
Affects: Fabric QC, Pre-Production, Cutting, **Sewing** (most important), Finishing

### 2. Order Type (2 types)
Affects: **Pre-Production** (1 day vs 3.65-5.9 days - HUGE difference!)

### 3. Wash Type (4 types)
Affects: Fabric QC, **Washing** (0 vs 2.25 vs 5.25 days - HUGE difference!)

### 4. Quantity Band (5 bands)
Affects: Capacity-driven processes (Cutting, Sewing, Finishing)

---

## 📊 HOW TO STRUCTURE SOP_CAL SHEET

Your SOP_Cal sheet should have these columns:

| Column | Field | Example Values |
|--------|-------|----------------|
| A | Process Seq | 1, 2, 3, ..., 11 |
| B | Process Stage | Fabric Inhouse, Fabric QC, ..., Dispatch |
| C | **Product Type** | "Basic non-wash shirt (Repeat)", "Overshirt", "Basic knitted shirts", etc. |
| D | **Derived Wash Category** | "Non-Wash", "Basic Wash", "Complex Wash", "Enzyme" |
| E | **Order Type** | "Repeat", "Non-Repeat", "All" |
| F | **Order Qty Band** | "Q1", "Q2", "Q3", "Q4", "Q5", "All" |
| J | **SOP LT** | Total lead time (VA + NNVA + NVA) |
| K | **VA** | Value Added time |
| L | **NNVA** | Necessary Non-Value Added |
| M | **NVA** | Non-Value Added (waste/queue) |

---

## ✅ EXAMPLE ROWS FOR SEWING PROCESS

```
Process | Product Type              | Wash     | Order Type | Qty | VA   | NNVA | NVA | SOP LT
Sewing  | Basic non-wash shirt (Repeat) | Non-Wash | Repeat     | Q2  | 1.85 | 0    | 0   | 1.85
Sewing  | Basic non-wash shirt (Non-Repeat) | Non-Wash | Non-Repeat | Q2  | 1.85 | 0    | 0   | 1.85
Sewing  | Basic shirt               | Basic Wash | All        | Q2  | 1.85 | 0    | 0   | 1.85
Sewing  | Basic shirt               | Complex Wash | All      | Q2  | 1.85 | 0    | 0   | 1.85
Sewing  | Basic tape shirts         | Non-Wash | Repeat     | Q2  | 5    | 0    | 0   | 5
Sewing  | Basic knitted shirts      | Non-Wash | All        | Q2  | 2.15 | 0    | 0   | 2.15
Sewing  | Overshirt                 | Basic Wash | All      | Q1  | 3.25 | 0    | 0   | 3.25
```

---

## 🚀 NEXT STEPS

1. **Review your Lead Time-Final sheet** - Make sure all times are accurate
2. **Create/Update SOP_Cal sheet** - Add all combinations with correct VA/NNVA/NVA breakdown
3. **Test the system** - Select different product types and verify calculations
4. **Deploy** - Use the Product Type feature we just implemented

---

## 📝 IMPORTANT NOTES

### Cartoning (Supermarket 5):
- NOT a separate process in UI
- Time is automatically added after Finishing
- Varies by product: 0.7-1.7 days
- Already implemented in code as SM5

### Order Type Impact:
- **Pre-Production**: Repeat (1 day) vs Non-Repeat (3.65-5.9 days)
- **Cutting**: Fabric Issue time varies (0.25 vs 1.25 days)
- Should we add Order Type dropdown to UI?

### Wash Type Impact:
- **Washing**: Non-Wash (0) vs Basic (2.25) vs Complex (5.25 days)
- Already captured in "Derived Wash Category"
- System already uses this correctly

---

## ✅ VERIFICATION CHECKLIST

- [ ] SOP_Cal has all 7 product types
- [ ] SOP_Cal has Repeat vs Non-Repeat for Pre-Production
- [ ] SOP_Cal has correct wash types (Non-Wash, Basic, Complex)
- [ ] SOP_Cal has VA/NNVA/NVA breakdown for each row
- [ ] Sewing process has different VA times for different products
- [ ] Pre-Production has different times for Repeat vs Non-Repeat
- [ ] Washing has different times for different wash types
- [ ] Supermarkets (SM1-SM5) are correctly configured in code

---

**Your Lead Time Analysis is comprehensive! Now we need to ensure SOP_Cal sheet matches this structure.** 🎯
