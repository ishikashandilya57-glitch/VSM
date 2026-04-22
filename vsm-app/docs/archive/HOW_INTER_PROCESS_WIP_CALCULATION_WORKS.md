# 📐 How Inter-Process WIP Calculation Works

## Step-by-Step Calculation Flow

### Given Data (Q1 Example):
- **Delivery Date**: March 15, 2026
- **Process SOP Times** (from SOP_Cal Column J):
  - Dispatch: 1 day
  - Inspection: 2 days
  - Finishing: 2.6 days
  - Washing: 5 days
  - Sewing: 4.85 days
  - Cutting: 4.9 days
  - (+ other processes)
- **Inter-Process WIP** (hardcoded):
  - SM2 (after Cutting): 3 days
  - SM3 (after Sewing): 3 days
  - SM5 (after Finishing): 1 day

---

## Backward Calculation (from Delivery Date)

### Step 1: Start from Delivery Date
```
Current Date = March 15, 2026 (Delivery Date)
```

---

### Step 2: Dispatch Process
```
Process: Dispatch
SOP LT: 1 day

Target End Date = March 15
Target Start Date = March 15 - 1 day = March 14

Current Date moves to: March 14
```

---

### Step 3: Inspection Process
```
Process: Inspection
SOP LT: 2 days

Target End Date = March 14
Target Start Date = March 14 - 2 days = March 12

Current Date moves to: March 12
```

---

### Step 4: **Supermarket 5** (Inter-Process WIP)
```
⏳ After Inspection, BEFORE Finishing starts
Material waits in Cartoning WIP

SM5 Duration: 1 day

Current Date = March 12
Subtract SM5: March 12 - 1 day = March 11

Current Date moves to: March 11
```

**Key Point**: This is NOT part of Finishing's SOP. It's waiting time BEFORE Finishing.

---

### Step 5: Finishing Process
```
Process: Finishing
SOP LT: 2.6 days (includes SM4 = 0.6 days internally)

Target End Date = March 11 (after SM5 waiting)
Target Start Date = March 11 - 2.6 days = March 8.4

Current Date moves to: March 8.4
```

---

### Step 6: Washing Process
```
Process: Washing
SOP LT: 5 days

Target End Date = March 8.4
Target Start Date = March 8.4 - 5 days = March 3.4

Current Date moves to: March 3.4
```

---

### Step 7: **Supermarket 3** (Inter-Process WIP)
```
⏳ After Washing, BEFORE Sewing starts
Material waits in Sewing WIP

SM3 Duration: 3 days

Current Date = March 3.4
Subtract SM3: March 3.4 - 3 days = March 0.4 (Feb 28.4)

Current Date moves to: Feb 28.4
```

**Key Point**: This is NOT part of Sewing's SOP. It's waiting time BEFORE Sewing.

---

### Step 8: Sewing Process
```
Process: Sewing
SOP LT: 4.85 days

Target End Date = Feb 28.4 (after SM3 waiting)
Target Start Date = Feb 28.4 - 4.85 days = Feb 23.55

Current Date moves to: Feb 23.55
```

---

### Step 9: **Supermarket 2** (Inter-Process WIP)
```
⏳ After Sewing, BEFORE Cutting starts
Material waits in Cutting WIP

SM2 Duration: 3 days

Current Date = Feb 23.55
Subtract SM2: Feb 23.55 - 3 days = Feb 20.55

Current Date moves to: Feb 20.55
```

**Key Point**: This is NOT part of Cutting's SOP. It's waiting time BEFORE Cutting.

---

### Step 10: Cutting Process
```
Process: Cutting
SOP LT: 4.9 days (includes SM1 = 2.2 days internally)

Target End Date = Feb 20.55 (after SM2 waiting)
Target Start Date = Feb 20.55 - 4.9 days = Feb 15.65

Current Date moves to: Feb 15.65
```

---

### Step 11: Continue with remaining processes...
```
(CAD/Pattern, Pre-Production, File Release, Fabric QC, Fabric Inhouse)
...
```

---

## Visual Timeline

```
March 15 ←─────────────────────────────────────────────────────────→ Feb 15.65
│                                                                           │
│  Dispatch  │ Inspection │ [SM5] │ Finishing │ Washing │ [SM3] │ Sewing │ [SM2] │ Cutting │ ...
│   1 day    │   2 days   │ 1 day │  2.6 days │ 5 days  │ 3 days│ 4.85 d │ 3 days│  4.9 d  │
│            │            │       │           │         │       │        │       │         │
└────────────┴────────────┴───────┴───────────┴─────────┴───────┴────────┴───────┴─────────┘
   Process      Process     WIP     Process     Process    WIP    Process   WIP    Process
   (SOP)        (SOP)      (SM5)    (SOP)       (SOP)     (SM3)   (SOP)    (SM2)   (SOP)
```

---

## Code Logic

### The Loop (Simplified):

```javascript
let currentEndDate = new Date(deliveryDate); // March 15

// Loop through processes in REVERSE order (Dispatch → ... → Cutting)
for (let i = processes.length - 1; i >= 0; i--) {
  const process = processes[i];
  
  // Calculate process target dates
  targetEndDate = currentEndDate;
  targetStartDate = currentEndDate - process.sopLt;
  
  // Move backwards
  currentEndDate = targetStartDate;
  
  // Add inter-process WIP AFTER specific processes
  if (process.stage === 'Finishing') {
    currentEndDate = currentEndDate - 1 day (SM5);
  }
  else if (process.stage === 'Sewing') {
    currentEndDate = currentEndDate - 3 days (SM3);
  }
  else if (process.stage === 'Cutting') {
    currentEndDate = currentEndDate - 3 days (SM2);
  }
}
```

---

## Detailed Example with Dates

| Step | Action | Calculation | Result Date |
|------|--------|-------------|-------------|
| 1 | Start | Delivery Date | **March 15** |
| 2 | Dispatch | March 15 - 1 day | **March 14** |
| 3 | Inspection | March 14 - 2 days | **March 12** |
| 4 | **SM5 (WIP)** | March 12 - 1 day | **March 11** ⏳ |
| 5 | Finishing | March 11 - 2.6 days | **March 8.4** |
| 6 | Washing | March 8.4 - 5 days | **March 3.4** |
| 7 | **SM3 (WIP)** | March 3.4 - 3 days | **Feb 28.4** ⏳ |
| 8 | Sewing | Feb 28.4 - 4.85 days | **Feb 23.55** |
| 9 | **SM2 (WIP)** | Feb 23.55 - 3 days | **Feb 20.55** ⏳ |
| 10 | Cutting | Feb 20.55 - 4.9 days | **Feb 15.65** |
| ... | ... | ... | ... |

---

## Key Insights

### 1. **Process SOP Times Don't Change**
```
Cutting SOP = 4.9 days (from Column J) ✅
Sewing SOP = 4.85 days (from Column J) ✅
Finishing SOP = 2.6 days (from Column J) ✅
```

### 2. **Inter-Process WIP is Added Between Processes**
```
After Cutting ends → Wait 3 days (SM2) → Before Sewing starts
After Sewing ends → Wait 3 days (SM3) → Before Washing starts
After Finishing ends → Wait 1 day (SM5) → Before Inspection starts
```

### 3. **Target Dates Shift Earlier**
```
Without WIP: Cutting starts Feb 22.65
With WIP: Cutting starts Feb 15.65 (7 days earlier) ✅
```

### 4. **Total Lead Time Increases**
```
Process SOP only: 26.65 days
Process SOP + Inter-Process WIP: 26.65 + 7 = 33.65 days ✅
```

---

## Verification

### Sum of All Time:
```
Process SOP Times: 26.65 days
+ SM2 (Cutting WIP): 3 days
+ SM3 (Sewing WIP): 3 days
+ SM5 (Cartoning WIP): 1 day
─────────────────────────────
Total Lead Time: 33.65 days ✅
```

### Timeline Check:
```
Delivery Date: March 15
- Total Lead Time: 33.65 days
= Start Date: Feb 9.35 (approximately Feb 9-10)

This is when the FIRST process (Fabric Inhouse) must start! ✅
```

---

## Why This Matters

### Without Inter-Process WIP (WRONG):
```
Cutting Target Start: Feb 22
Reality: Material needs 3 days in Cutting WIP (SM2) before Sewing
Actual need: Material must be ready by Feb 19
Result: 3 days late! ❌
```

### With Inter-Process WIP (CORRECT):
```
Cutting Target Start: Feb 15 (includes 3-day SM2 buffer)
Material ready: Feb 20 (after Cutting + SM2)
Sewing starts: Feb 20 (on time)
Result: On-time delivery! ✅
```

---

## Summary

The calculation works by:
1. ✅ Starting from delivery date
2. ✅ Working backwards through each process using its SOP time
3. ✅ **Adding inter-process WIP** (SM2, SM3, SM5) as **separate waiting periods** between specific processes
4. ✅ Calculating target dates that account for **both** process time AND waiting time
5. ✅ Ensuring materials are ready when needed for on-time delivery

**The inter-process WIP is NOT part of any process SOP - it's added as separate buffer time between processes!** 🎯
