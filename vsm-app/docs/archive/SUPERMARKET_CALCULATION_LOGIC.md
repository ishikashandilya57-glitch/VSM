# 🏬 Supermarket Calculation Logic

## Overview
Supermarkets represent **waiting time (NVA)** between process stages. They are WIP buffers where materials queue before the next operation.

## The 4 Supermarkets

### Supermarket 1: Before Cutting (Queue after Fabric Prep)
**Location**: After Fabric Issue + Relaxation, before Cutting starts
**Calculation**: 
```
Supermarket 1 = Cutting NVA - (Supermarket 2 + Supermarket 3)
Supermarket 1 = Cutting NVA - 6 days
```

**Example (Q1)**:
- Cutting NVA = 2.2 days
- Supermarket 1 = 2.2 - 6 = **-3.8 days** ❌

**Wait, this is negative!** 

This means Supermarket 2 and 3 are NOT part of Cutting's NVA in your current SOP_Cal data. Let me recalculate based on your actual flow:

### Corrected Understanding

Based on your description:
1. **Fabric Issue + Relaxation** (NNVA) → 0.8-1.5 days
2. **Supermarket 1** (NVA) → Queue before cutting
3. **Cutting** (VA) → 1.9 days
4. **Supermarket 2** (NVA) → Cutting WIP = 3 days
5. **Supermarket 3** (NVA) → Sewing WIP = 3 days
6. **Sewing** starts

**Total Cutting SOP LT** = NNVA + SM1 + VA + SM2 + SM3

For Q1: 4.9 days total
- NNVA (Fabric Issue + Relaxation) = 0.8 days
- VA (Pure Cutting) = 1.9 days
- SM2 (Cutting WIP) = 3 days
- SM3 (Sewing WIP) = 3 days
- **SM1 = 4.9 - 0.8 - 1.9 - 3 - 3 = -3.8 days** ❌

## The Problem

Your current SOP LT values (4.9-7.4 days) are **too small** to include all 4 components:
- NNVA: 0.8-1.5 days
- VA: 1.9 days
- SM2: 3 days
- SM3: 3 days
- **Minimum needed**: 0.8 + 1.9 + 3 + 3 = **8.7 days**

But your Q1 Cutting SOP = 4.9 days!

## Two Possible Solutions

### Option A: SM2 and SM3 are ALREADY in Sewing's SOP
If Supermarket 2 and 3 are already counted in Sewing's lead time, then:

**Cutting SOP breakdown (Q1 = 4.9 days)**:
- NNVA (Fabric Issue + Relaxation) = 0.8 days
- SM1 (Queue before cutting) = 1.2 days
- VA (Pure Cutting) = 1.9 days
- **Total**: 0.8 + 1.2 + 1.9 = 3.9 days ❌ (doesn't match 4.9)

Still doesn't work!

### Option B: Your NVA column should ONLY be SM1

**Cutting SOP breakdown (Q1 = 4.9 days)**:
- NNVA = 0.8 days (Fabric Issue + Relaxation)
- VA = 1.9 days (Pure Cutting)
- NVA = 2.2 days (SM1 only)
- **Total**: 0.8 + 1.9 + 2.2 = 4.9 days ✅

**Then separately track:**
- SM2 (Cutting WIP) = 3 days → Part of Sewing's waiting time
- SM3 (Sewing WIP) = 3 days → Part of Sewing's waiting time
- SM4 (Finishing WIP) = 1 day → Part of Finishing's NVA

## Recommended Approach

### For Cutting Process:
```
SOP LT = NNVA + VA + NVA
4.9 = 0.8 + 1.9 + 2.2 ✅

Where:
- NNVA = Fabric Issue + Relaxation
- VA = Pure Cutting
- NVA = Supermarket 1 (queue before cutting)
```

### For Sewing Process:
```
SOP LT = NNVA + VA + NVA
8.0 = 1.0 + 6.0 + 1.0 ✅

Where:
- NNVA = Setup + Material handling
- VA = Pure Sewing
- NVA = Supermarket within Sewing process
```

**Supermarket 2 and 3 (6 days total)** should be:
- Either added to Cutting's SOP LT (making it 10.9 days for Q1)
- Or tracked separately as "Inter-process WIP" not included in individual SOP

### For Finishing Process:
```
SOP LT = NNVA + VA + NVA
4.0 = 1.0 + 2.0 + 1.0 ✅

Where:
- NNVA = Setup
- VA = Pure Finishing
- NVA = Supermarket 4 (Finishing WIP = 1 day)
```

## Final Recommendation

**Keep your current SOP LT values** (they are correct for individual processes).

**Track Supermarkets as:**
1. **SM1** = Cutting NVA column (2.2-4.0 days depending on Qty Band)
2. **SM2** = Fixed 3 days (Cutting WIP) - **NOT in SOP_Cal, hardcoded**
3. **SM3** = Fixed 3 days (Sewing WIP) - **NOT in SOP_Cal, hardcoded**
4. **SM4** = Finishing NVA column (1 day)

**Total Inter-Process WIP** = SM2 + SM3 = 6 days (constant)

This way:
- Individual process SOP LT remains accurate
- Supermarkets are tracked separately
- Total lead time = Sum of all SOP LT + Inter-process WIP (6 days)

---

**This is the correct interpretation!** 🎯
