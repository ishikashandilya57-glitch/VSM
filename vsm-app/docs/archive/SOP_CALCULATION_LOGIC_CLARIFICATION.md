# 🎯 SOP CALCULATION LOGIC - COMPLETE CLARIFICATION

## 📊 CURRENT PROBLEM

### What's Wrong:
The system is currently using `'All'` for Product Type in SOP lookup, which means:
- **All product types get the same VA time** (e.g., 1.85 days for Sewing)
- **This is incorrect** because different products have different sewing complexity

### Example from Your Data (Sewing Process):
| Product Type | Order Qty | VA (Actual) | Current System |
|--------------|-----------|-------------|----------------|
| Non-wash Shirt | 1800 | 1.85 days | 1.85 days ✅ |
| Basic knitted shirts | 1400 | 2.15 days | 1.85 days ❌ |
| Overshirt | 1000 | 3.25 days | 1.85 days ❌ |

**NNVA**: 3 days (same for all) ✅

---

## 🔍 QUESTIONS TO CLARIFY

### Question 1: Product Type Source
**Where is the Product Type stored?**

Options:
- A) In Order_Master sheet (which column?)
- B) Derived from another field (like Order No pattern?)
- C) User enters it manually?

**Current Understanding**: 
- Order_Master has columns A-H
- We're currently reading from Column H (Derived Wash Category)
- Is Product Type in a different column?

---

### Question 2: Product Type Values
**What are ALL the possible Product Type values?**

From your Lead Time Analysis table, I see:
1. Basic non-wash shirt (Repeat Order)
2. Basic non-wash shirt (Non Repeat Order)
3. Basic shirt with basic wash
4. Basic shirt with Embroidery + Basic Wash
5. Basic Shirt with Printing + Basic Wash
6. Basic shirt with complex wash (tie & dye, Garment Dye, Denim wash)
7. Basic tape shirts (Repeat order, to capacity availability)
8. Basic knitted shirts (Subject to capacity availability)
9. Overshirt with basic wash
10. Shirt with note (?)

**Question**: Are these the exact values in your Order_Master sheet?

---

### Question 3: SOP_Cal Table Structure
**Current SOP_Cal Columns**:
- Column A: Process Seq
- Column B: Process Stage
- Column C: Product Type Raw
- Column D: Derived Wash Category
- Column E: Order Type
- Column F: Order Qty Band
- Column J: SOP LT
- Column K: VA
- Column L: NNVA
- Column M: NVA

**Question**: Is Column C (Product Type Raw) the field we should use for matching?

---

### Question 4: Lookup Logic for Each Process

Let me understand the lookup logic for EACH process:

#### Process 1-5 (Before Cutting):
**Fabric Inhouse, Fabric QC, File Release, Pre-Production, CAD/Pattern**

Current logic uses:
- Process Stage: ✅
- Wash Category: ✅
- Qty Band: ✅
- Product Type: ❌ (using 'All')
- Order Type: ❌ (using 'All')

**Question**: Should these processes ALSO use actual Product Type?
- Example: Does "Fabric Inhouse" time differ for Overshirt vs Basic Shirt?

---

#### Process 6: Cutting
From your Lead Time Analysis:
- Standard Cycle Time: 1 day
- But varies by product:
  - Basic non-wash: 1.9 days
  - Basic shirt with Embroidery: 1.9 days
  - Overshirt: 1.9 days
  - Basic knitted shirts: 2.5 days

**Question**: Should Cutting use Product Type for lookup?

---

#### Process 7: Sewing
**This is where the problem is most visible!**

From your data:
- Non-wash Shirt (1800 orders): VA = 1.85 days
- Basic knitted shirts (1400 orders): VA = 2.15 days
- Overshirt (1000 orders): VA = 3.25 days
- NNVA = 3 days (same for all)

**Confirmed**: Sewing MUST use Product Type for accurate VA calculation

---

#### Process 8: Washing
From your SOP_Cal, I see:
- Washing has "Non-Wash" vs other wash types
- VA = 0 for Non-Wash
- VA > 0 for wash processes

**Question**: Does Washing time vary by Product Type?
- Or only by Wash Category?

---

#### Process 9: Finishing
**Question**: Does Finishing time vary by Product Type?
- Example: Does Overshirt take longer to finish than Basic Shirt?

---

#### Process 10-11: Inspection, Dispatch
**Question**: Do these vary by Product Type?
- Or are they standard for all products?

---

## 🎯 PROPOSED LOGIC (PENDING YOUR CONFIRMATION)

### Option A: Product Type for ALL Processes
```
All 11 processes use:
- Process Stage ✅
- Product Type ✅ (actual from Order_Master)
- Wash Category ✅
- Order Type ✅ (actual from Order_Master)
- Qty Band ✅
```

### Option B: Product Type for SOME Processes
```
Processes that use Product Type:
- Cutting ✅
- Sewing ✅
- Finishing ✅

Processes that use 'All':
- Fabric Inhouse, Fabric QC, File Release, Pre-Production, CAD/Pattern
- Washing (uses Wash Category only)
- Inspection, Dispatch
```

### Option C: Use SOP_Drivers Sheet
```
SOP_Drivers sheet tells us which parameters to use for each process:
- Process Stage | Use Product? | Use Wash? | Use Order Type? | Use Qty Band?
- Cutting       | Y            | Y         | Y               | Y
- Sewing        | Y            | Y         | Y               | Y
- Washing       | N            | Y         | N               | Y
- etc.
```

**Question**: Which option matches your business logic?

---

## 📋 INFORMATION I NEED FROM YOU

Please provide:

1. **Order_Master Structure**:
   - Which column contains Product Type?
   - What are the exact Product Type values?

2. **Process-wise Product Type Usage**:
   - Which processes should use actual Product Type?
   - Which processes should use 'All'?

3. **Order Type Usage**:
   - Should we use actual Order Type (Repeat/Non-Repeat)?
   - Or keep using 'All'?

4. **SOP_Drivers Sheet**:
   - Do you have this sheet?
   - Should we use it to control which parameters are used?

---

## 🔄 NEXT STEPS

Once you answer these questions, I will:

1. ✅ Update `getOrderDetails()` to read Product Type from Order_Master
2. ✅ Update SOP lookup logic to use actual Product Type
3. ✅ Ensure fallback logic works correctly
4. ✅ Test with your examples (Overshirt, Basic knitted shirts, etc.)
5. ✅ Document the complete logic

---

## 💡 MY RECOMMENDATION

Based on your Lead Time Analysis table, I recommend:

**Use Product Type for processes where complexity varies**:
- ✅ Cutting (different products have different cutting complexity)
- ✅ Sewing (DEFINITELY - this is where you see the biggest variation)
- ✅ Finishing (different products need different finishing work)

**Use 'All' for standard processes**:
- Fabric Inhouse, Fabric QC (fabric is fabric, regardless of final product)
- File Release, Pre-Production (administrative, not product-specific)
- CAD/Pattern (might vary, but usually standard)
- Washing (varies by Wash Category, not Product Type)
- Inspection, Dispatch (standard processes)

**But I need your confirmation!**

---

## ❓ WAITING FOR YOUR INPUT

Please answer the questions above so we can implement the correct logic! 🎯

