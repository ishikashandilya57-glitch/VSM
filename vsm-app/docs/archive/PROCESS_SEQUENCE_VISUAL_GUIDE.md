# 🎨 Process Sequence Enforcement - Visual User Guide

## What Users Will See

---

## Scenario 1: New OC Number (No Processes Yet)

### User Action:
```
1. Selects OC Number: LC/DMN/25/12270
2. Looks at Process Stage dropdown
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ 🔓 Fabric Inhouse                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 10 process(es) locked (complete previous processes   │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Only Fabric Inhouse is available!

---

## Scenario 2: After Fabric Inhouse Completed

### User Action:
```
1. Fabric dept completes "Fabric Inhouse"
2. Next user selects same OC Number
3. Looks at Process Stage dropdown
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ ✓ Fabric Inhouse (Completed)                            │
│ 🔓 Fabric QC                                             │
│ 🔓 File Release                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 8 process(es) locked (complete previous processes    │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Fabric QC and File Release are now unlocked!

---

## Scenario 3: After All Pre-Production Completed

### User Action:
```
1. All pre-production processes completed:
   - Fabric Inhouse ✓
   - Fabric QC ✓
   - File Release ✓
   - Pre-Production Activity ✓
   - CAD/Pattern ✓
2. Cutting dept selects OC Number
3. Looks at Process Stage dropdown
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ ✓ Fabric Inhouse (Completed)                            │
│ ✓ Fabric QC (Completed)                                 │
│ ✓ File Release (Completed)                              │
│ ✓ Pre-Production Activity (Completed)                   │
│ ✓ CAD / Pattern (Cut Plan Approval) (Completed)         │
│ 🔓 Cutting                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 5 process(es) locked (complete previous processes    │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Cutting is now available! But Sewing, Washing, etc. are still locked.

---

## Scenario 4: Cutting Started (Partial Dependency)

### User Action:
```
1. Cutting dept STARTS Cutting (enters start date)
2. Sewing dept selects same OC Number
3. Looks at Process Stage dropdown
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ ✓ Fabric Inhouse (Completed)                            │
│ ✓ Fabric QC (Completed)                                 │
│ ✓ File Release (Completed)                              │
│ ✓ Pre-Production Activity (Completed)                   │
│ ✓ CAD / Pattern (Cut Plan Approval) (Completed)         │
│ ⏳ Cutting (In Progress)                                 │
│ 🔓 Sewing                                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 4 process(es) locked (complete previous processes    │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Sewing is now available even though Cutting is not completed! (Partial dependency)

---

## Scenario 5: Mid-Production Status

### User Action:
```
1. Multiple processes in various states:
   - Fabric Inhouse ✓ Completed
   - Fabric QC ✓ Completed
   - File Release ✓ Completed
   - Pre-Production ✓ Completed
   - CAD/Pattern ✓ Completed
   - Cutting ✓ Completed
   - Sewing ⏳ In Progress
   - Washing 🔓 Available (Sewing started)
2. User selects OC Number
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ ✓ Fabric Inhouse (Completed)                            │
│ ✓ Fabric QC (Completed)                                 │
│ ✓ File Release (Completed)                              │
│ ✓ Pre-Production Activity (Completed)                   │
│ ✓ CAD / Pattern (Cut Plan Approval) (Completed)         │
│ ✓ Cutting (Completed)                                   │
│ ⏳ Sewing (In Progress)                                  │
│ 🔓 Washing                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 3 process(es) locked (complete previous processes    │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Washing is available, but Finishing, Inspection, Dispatch are still locked.

---

## Scenario 6: Editing Existing Process

### User Action:
```
1. User realizes they entered wrong date for Cutting
2. Selects OC Number
3. Selects "Cutting" from dropdown
4. Changes dates
5. Saves
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ ✓ Cutting (Completed)  ← Selected                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Actual Start Date *                                     │
│ 2026-01-20  ← Can edit                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Actual End Date *                                       │
│ 2026-01-25  ← Can edit                                  │
└─────────────────────────────────────────────────────────┘
```

**Result:** Can edit any existing process for corrections!

---

## Scenario 7: Trying to Skip Process (Blocked)

### User Action:
```
1. Only Fabric Inhouse completed
2. User tries to select "Cutting"
3. Looks at dropdown
```

### What They See:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ ✓ Fabric Inhouse (Completed)                            │
│ 🔓 Fabric QC                                             │
│ 🔓 File Release                                          │
│                                                         │
│ (Cutting is NOT in the list!)                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Process Status:                                         │
│ ✓ Completed  ⏳ In Progress  🔓 Available                │
│                                                         │
│ 🔒 8 process(es) locked (complete previous processes    │
│    to unlock)                                           │
└─────────────────────────────────────────────────────────┘
```

**Result:** Cannot skip to Cutting! Must complete File Release → Pre-Production → CAD/Pattern first.

---

## Loading State

### When Fetching Process Status:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ ⏳ Loading available processes...                        │
└─────────────────────────────────────────────────────────┘
```

---

## Error State (Fail-Open)

### If API Fails:
```
┌─────────────────────────────────────────────────────────┐
│ Process Stage *                                         │
├─────────────────────────────────────────────────────────┤
│ Select process stage...                                 │
│ Fabric Inhouse                                          │
│ Fabric QC                                               │
│ File Release                                            │
│ Pre-Production Activity                                 │
│ CAD / Pattern (Cut Plan Approval)                       │
│ Cutting                                                 │
│ Sewing                                                  │
│ Washing                                                 │
│ Finishing                                               │
│ Inspection                                              │
│ Dispatch                                                │
└─────────────────────────────────────────────────────────┘
```

**Result:** All processes available (fail-open for safety - doesn't block users)

---

## Visual Legend

### Icons Used:
- **✓** = Completed (green) - Process finished, can edit
- **⏳** = In Progress (blue) - Process started, can update
- **🔓** = Available (yellow) - Process unlocked, can start
- **🔒** = Locked (gray) - Process locked, hidden from dropdown

### Color Coding:
- **Green**: Completed processes
- **Blue**: In Progress processes
- **Yellow**: Available processes
- **Gray**: Locked processes (not shown)

---

## Department Isolation Example

### Cutting Department User:

**What They Can Do:**
- ✓ View completed pre-production processes (read-only in dropdown)
- 🔓 Enter/update Cutting process (their department)
- ❌ Cannot modify Fabric Inhouse (already completed)
- ❌ Cannot skip to Sewing (Cutting not started yet)

**What They See:**
```
Available Processes:
✓ Fabric Inhouse (Completed) ← Can't modify
✓ Fabric QC (Completed) ← Can't modify
✓ File Release (Completed) ← Can't modify
✓ Pre-Production (Completed) ← Can't modify
✓ CAD/Pattern (Completed) ← Can't modify
🔓 Cutting ← THIS IS THEIR PROCESS!

Locked (Hidden):
🔒 Sewing
🔒 Washing
🔒 Finishing
🔒 Inspection
🔒 Dispatch
```

**Result:** Naturally isolated to their department's process!

---

## Summary

### User Experience Benefits:
1. **Clear Visual Feedback**: Icons show exactly what's available
2. **Cannot Make Mistakes**: Locked processes are hidden
3. **Natural Workflow**: Process dependencies guide the user
4. **Edit Capability**: Can fix mistakes in existing entries
5. **No Training Needed**: Visual indicators are self-explanatory
6. **Department Isolation**: Each dept sees only their unlocked processes

### Technical Benefits:
1. **No Authentication**: Process dependencies create natural access control
2. **Fail-Safe**: If API fails, allows all processes (doesn't block users)
3. **Performance**: Efficient batch queries
4. **Scalable**: Works for any number of processes
5. **Maintainable**: Easy to add/modify process dependencies

---

**The visual feedback makes the system intuitive and self-enforcing!** 🎨
