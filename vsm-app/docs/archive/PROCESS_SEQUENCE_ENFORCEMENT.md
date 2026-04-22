# 🔒 Process Sequence Enforcement - Implementation Guide

## Overview

Sequential process validation ensures that users can only enter data for processes that are unlocked based on the completion status of previous processes. This naturally creates department-level access control.

---

## Process Dependencies

### Strict Dependencies (100% Complete Required):
1. **Fabric Inhouse** → Always available (starting point)
2. **Fabric QC** → Requires Fabric Inhouse completed
3. **File Release** → Requires Fabric Inhouse completed
4. **Pre-Production Activity** → Requires File Release completed
5. **CAD/Pattern** → Requires Pre-Production Activity completed
6. **Cutting** → Requires CAD/Pattern completed

### Partial Dependencies (Can start with partial completion):
7. **Sewing** → Can start when Cutting has started (has Actual Start Date)
8. **Washing** → Can start when Sewing has started (has Actual Start Date)
9. **Finishing** → Can start when Washing has started (has Actual Start Date)
10. **Inspection** → Can start when Finishing has started (has Actual Start Date)
11. **Dispatch** → Requires Inspection completed

---

## Natural Department Isolation

**How it works:**
- Fabric dept completes "Fabric Inhouse" → Unlocks "Fabric QC" and "File Release"
- Cutting dept can't enter "Cutting" until CAD/Pattern is done
- Sewing dept can't enter "Sewing" until Cutting has started
- Each department can ONLY work on their unlocked processes

**No department selector needed!** The process lock IS the access control.

---

## Implementation

### 1. New API Endpoint: `/api/[factory]/process-status`

**Purpose:** Fetch all existing processes for an OC Number to determine which processes are unlocked.

**Returns:**
```json
{
  "success": true,
  "data": [
    {
      "processStage": "Fabric Inhouse",
      "processSeq": 1,
      "actualStartDate": "2026-01-15",
      "actualEndDate": "2026-01-16",
      "processStatus": "Completed"
    },
    {
      "processStage": "Cutting",
      "processSeq": 6,
      "actualStartDate": "2026-01-20",
      "actualEndDate": "",
      "processStatus": "In Progress"
    }
  ]
}
```

### 2. Process Unlocking Logic

**Function:** `getAvailableProcesses(existingProcesses)`

**Rules:**
- Process #1 (Fabric Inhouse) is always available for new OC
- For strict dependencies: Previous process must have `actualEndDate` filled
- For partial dependencies: Previous process must have `actualStartDate` filled
- Already entered processes can be edited (for corrections)

**Example:**
```
Existing: Fabric Inhouse (completed), Cutting (in progress)
Available: Fabric QC, File Release, Cutting (edit), Sewing (can start)
Locked: Pre-Production, CAD/Pattern, Washing, Finishing, Inspection, Dispatch
```

### 3. Frontend Changes

**TaskUpdatePageEnhanced.tsx:**
- Fetch process status when OC Number is selected
- Calculate available processes
- Filter process dropdown to show only available processes
- Show visual indicators (✓ completed, 🔓 available, 🔒 locked)

---

## User Experience

### When selecting OC Number:
1. System fetches all existing processes for that OC
2. Calculates which processes are unlocked
3. Process dropdown shows:
   - ✓ Completed processes (can edit)
   - 🔓 Available processes (can enter)
   - 🔒 Locked processes (hidden or disabled)

### Visual Feedback:
- **Green badge**: Process completed
- **Blue badge**: Process in progress
- **Yellow badge**: Process available (not started)
- **Gray/Hidden**: Process locked

---

## Benefits

1. **Enforces workflow**: Can't skip processes
2. **Natural access control**: Each dept can only work on their unlocked processes
3. **Prevents errors**: Can't enter Sewing before Cutting starts
4. **Allows corrections**: Can edit existing entries
5. **Clear visibility**: Users see what's available and what's locked

---

## Next Steps

1. ✅ Create `/api/[factory]/process-status` endpoint
2. ✅ Add process unlocking logic
3. ✅ Update TaskUpdatePageEnhanced component
4. ✅ Add visual indicators
5. ✅ Test with various scenarios

---

**This creates a self-enforcing workflow where the process dependencies naturally control department access!**
