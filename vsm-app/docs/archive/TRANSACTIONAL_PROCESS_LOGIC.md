# 🏭 TRANSACTIONAL PROCESS LOGIC - INDUSTRY STANDARD

## 🎯 CORE CONCEPT

### Real Industry Reality:
- **One OC** can have **multiple daily entries** for same process
- Operator enters **daily achieved quantity**
- System tracks **cumulative progress**
- Process completes when **cumulative = order quantity**

---

## 📊 DATA MODEL

### Transactional Approach:
```
OC: LC/DMN/25/12270
Process: Cutting
Order Qty: 2000

Day 1: Achieved 300  → Cumulative: 300   → WIP: 1700 → Status: In Progress
Day 2: Achieved 400  → Cumulative: 700   → WIP: 1300 → Status: In Progress
Day 3: Achieved 1000 → Cumulative: 1700  → WIP: 300  → Status: In Progress
Day 4: Achieved 300  → Cumulative: 2000  → WIP: 0    → Status: Completed ✅
```

Each line above = **1 row in VSM_Execution**

---

## 🧱 REQUIRED COLUMNS

### New Columns to Add:

| Column | Name | Type | Description |
|--------|------|------|-------------|
| AS | ENTRY_DATE | Date | Date of this transaction |
| AT | QTY_ACHIEVED_TODAY | Number | Quantity achieved on this date |
| AU | ORDER_QTY | Number | Total order quantity (reference) |
| AV | CUM_ACHIEVED | Formula | Cumulative achieved till date |
| AW | WIP_QTY | Formula | Work in progress / balance |
| AX | COMPLETION_STATUS | Formula | Not Started / In Progress / Completed |

---

## 🧮 CALCULATION FORMULAS

### 1. Cumulative Achieved (Column AV)
```excel
=SUMIFS(
  $AT:$AT,           // QTY_ACHIEVED_TODAY column
  $B:$B, B2,         // Match OC_NO
  $G:$G, G2,         // Match PROCESS_STAGE
  $AS:$AS, "<="&AS2  // Up to this date
)
```

### 2. WIP Quantity (Column AW)
```excel
=MAX(0, AU2 - AV2)
```
Never allow negative WIP

### 3. Completion Status (Column AX)
```excel
=IF(
  AV2 = 0,
  "Not Started",
  IF(
    AV2 < AU2,
    "In Progress",
    "Completed"
  )
)
```

---

## 🔄 PROCESS FLOW

### User Entry Flow:
```
1. User selects OC NO + Process (e.g., Cutting)
2. System shows:
   - Order Qty: 2000
   - Already Achieved: 700 (from previous entries)
   - Remaining WIP: 1300
3. User enters:
   - Date: 2026-02-01
   - Qty Achieved Today: 400
4. System creates NEW ROW with:
   - All standard fields
   - QTY_ACHIEVED_TODAY: 400
   - CUM_ACHIEVED: 1100 (auto-calculated)
   - WIP_QTY: 900 (auto-calculated)
   - COMPLETION_STATUS: "In Progress"
```

---

## 🎯 ACTUAL START/END DATE LOGIC

### For Transactional Processes:

**Actual Start Date**:
- First entry date for this OC + Process
- Query: `MIN(ENTRY_DATE) WHERE OC_NO = X AND PROCESS = Y`

**Actual End Date**:
- Date when WIP becomes 0
- Query: `MAX(ENTRY_DATE) WHERE OC_NO = X AND PROCESS = Y AND WIP_QTY = 0`

---

## 🚦 CRITICAL RULES

### Rule 1: Never Overwrite
- Each day = NEW ROW
- Never update previous day's row

### Rule 2: Auto-Calculate Only
- CUM_ACHIEVED = Formula (never manual)
- WIP_QTY = Formula (never manual)
- COMPLETION_STATUS = Formula (never manual)

### Rule 3: Multiple Rows Normal
- One OC can have 10 rows for Cutting
- One OC can have 15 rows for Sewing
- One OC can have 8 rows for Finishing
- **This is expected and correct**

---

## 🔍 WHICH PROCESSES USE THIS LOGIC?

### Transactional Processes (Daily Tracking):
1. ✅ **Cutting** - Multiple days of cutting
2. ✅ **Sewing** - Multiple days of sewing
3. ✅ **Finishing** - Multiple days of finishing

### Single-Entry Processes (One-Time):
- Fabric Inhouse
- Fabric QC
- File Release
- Pre-Production
- CAD / Pattern
- Washing
- Inspection
- Dispatch

---

## 📱 UI CHANGES NEEDED

### For Cutting/Sewing/Finishing:

**Show Before Entry**:
```
┌─────────────────────────────────────────┐
│ 📊 Current Progress                     │
│                                         │
│ Order Quantity: 2000                    │
│ Already Achieved: 700                   │
│ Remaining WIP: 1300                     │
│                                         │
│ ⚠️ You are adding today's progress      │
└─────────────────────────────────────────┘
```

**Entry Fields**:
```
┌─────────────────────────────────────────┐
│ Date: [2026-02-01]                      │
│ Qty Achieved Today: [400]               │
│                                         │
│ After this entry:                       │
│ • Cumulative: 1100                      │
│ • Remaining: 900                        │
└─────────────────────────────────────────┘
```

---

## 🧪 EXAMPLE SCENARIO

### Order: LC/DMN/25/12270
### Process: Cutting
### Order Qty: 2000

| Row | Date | Qty Today | Cum Achieved | WIP | Status |
|-----|------|-----------|--------------|-----|--------|
| 1 | 2026-01-20 | 300 | 300 | 1700 | In Progress |
| 2 | 2026-01-21 | 400 | 700 | 1300 | In Progress |
| 3 | 2026-01-22 | 500 | 1200 | 800 | In Progress |
| 4 | 2026-01-23 | 600 | 1800 | 200 | In Progress |
| 5 | 2026-01-24 | 200 | 2000 | 0 | Completed ✅ |

**Actual Start**: 2026-01-20 (Row 1)
**Actual End**: 2026-01-24 (Row 5, WIP = 0)

---

## 💡 BENEFITS

### 1. Real Production Tracking
- See daily progress
- Identify slow days
- Track efficiency

### 2. Accurate Completion
- No guessing when process ends
- System knows when WIP = 0

### 3. Better Planning
- See remaining work
- Forecast completion date
- Adjust resources

### 4. Audit Trail
- Every day recorded
- Can't fake completion
- Full transparency

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Add Columns to VSM_Execution
```
Column AS: ENTRY_DATE
Column AT: QTY_ACHIEVED_TODAY
Column AU: ORDER_QTY
Column AV: CUM_ACHIEVED (formula)
Column AW: WIP_QTY (formula)
Column AX: COMPLETION_STATUS (formula)
```

### Step 2: Update Backend Code
- Add column constants
- Add cumulative calculation logic
- Modify doPost() to save daily entries
- Add function to get current progress

### Step 3: Update Frontend UI
- Show current progress before entry
- Change "Actual Quantity" to "Qty Achieved Today"
- Show preview of cumulative after entry
- Only for Cutting/Sewing/Finishing

### Step 4: Test
- Enter multiple days for same OC + Process
- Verify cumulative calculation
- Verify WIP calculation
- Verify status changes to "Completed"

---

## ✅ READY TO IMPLEMENT

This is the industry-standard approach for production tracking.

Shall I proceed with the implementation?

