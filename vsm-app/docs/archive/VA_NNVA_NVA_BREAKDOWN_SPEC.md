# VA / NNVA / NVA Breakdown Specification

## Objective
Decompose Cutting SOP LT into three components for better visibility of value-added vs non-value-added time.

## Definitions

### VA (Value Added)
Pure transformation time - blade-on-fabric cutting
- **Cutting VA**: 1.9 days (constant across all qty bands)
- **Sewing VA**: 1.85 days (constant)

### NNVA (Necessary Non-Value Added)
Mandatory preparation that cannot be eliminated
- **Fabric Issue**: 0.25 days (constant)
- **Fabric Relaxation**: 
  - Wash/Complex styles: 1.0 day
  - Non-Wash styles: 0 days

### NVA (Non-Value Added)
System delays, queues, waiting time (can be reduced/eliminated)
- **Cutting Supermarket 1** (before cutting): Part of NVA-Queue
- **Cutting Supermarket 2** (after cutting): 3 days WIP
- **Sewing Supermarket 3** (before sewing): 3 days WIP

## Data Structure

### SOP_Cal Sheet - New Columns

Add these columns after "SOP Lead Time":

| Column | Name | Description |
|--------|------|-------------|
| K | VA | Value-added time (pure execution) |
| L | NNVA | Necessary non-value-added (mandatory prep) |
| M | NVA | Non-value-added (queue/wait time) |

### Cutting Process Breakdown

| Qty Band | NNVA-Prep | VA | NVA-Queue | SOP LT | Notes |
|----------|-----------|----|-----------| -------|-------|
| Q1 | 0.8 | 1.9 | 2.2 | 4.9 | Issue(0.25) + Relax(0.55) |
| Q2 | 0.9 | 1.9 | 2.6 | 5.4 | Issue(0.25) + Relax(0.65) |
| Q3 | 1.0 | 1.9 | 3.0 | 5.9 | Issue(0.25) + Relax(0.75) |
| Q4 | 1.2 | 1.9 | 3.8 | 6.9 | Issue(0.25) + Relax(0.95) |
| Q5 | 1.5 | 1.9 | 4.0 | 7.4 | Issue(0.25) + Relax(1.25) |

**Formula**: `SOP LT = NNVA + VA + NVA`

### Sewing Process Adjustment

Current Sewing SOP LT includes 3 days of Sewing Supermarket (which is actually part of Cutting's NVA).

**Adjustment needed**:
- Display SOP LT: Keep current values (4.85, 5.35, etc.)
- Internal calculation: Sewing Supermarket (3 days) is tracked separately
- This 3 days is part of Cutting's NVA-Queue

### Supermarket Breakdown

1. **Cutting Supermarket 1** (before cutting)
   - Included in NVA-Queue
   - Variable by qty band

2. **Cutting Supermarket 2** (after cutting)
   - 3 days WIP
   - Included in Cutting's NVA-Queue

3. **Sewing Supermarket 3** (before sewing)
   - 3 days WIP
   - Subtracted from Sewing, added to Cutting's NVA

**Total Supermarket Time**: Cutting SM2 (3) + Sewing SM3 (3) = 6 days

## Implementation Steps

### Step 1: Update SOP_Cal Sheet

Add three new columns (K, L, M) with VA, NNVA, NVA values for each process.

**Example rows for Cutting**:
```
Process | Qty Band | SOP LT | VA  | NNVA | NVA
Cutting | Q1       | 4.9    | 1.9 | 0.8  | 2.2
Cutting | Q2       | 5.4    | 1.9 | 0.9  | 2.6
Cutting | Q3       | 5.9    | 1.9 | 1.0  | 3.0
Cutting | Q4       | 6.9    | 1.9 | 1.2  | 3.8
Cutting | Q5       | 7.4    | 1.9 | 1.5  | 4.0
```

**Example rows for Sewing**:
```
Process | Qty Band | SOP LT | VA   | NNVA | NVA
Sewing  | Q1       | 4.85   | 1.85 | 0.8  | 2.2
Sewing  | Q2       | 5.35   | 1.85 | 0.9  | 2.6
Sewing  | Q3       | 5.35   | 1.85 | 1.0  | 2.5
Sewing  | Q4       | 6.15   | 1.85 | 1.3  | 3.0
Sewing  | Q5       | 6.35   | 1.85 | 1.5  | 3.0
```

### Step 2: Modify lookupSopLeadTime()

Update to return an object with breakdown:

```javascript
function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType) {
  // ... existing lookup logic ...
  
  return {
    sopLt: totalSopLt,
    va: vaTime,
    nnva: nnvaTime,
    nva: nvaTime
  };
}
```

### Step 3: Update Calculation Steps Display

Modify `calculateTargetDatesWithSteps()` to show VA/NNVA/NVA breakdown:

```
📈 Remaining Processes (5):
  7. Sewing: 5.35 days
     └─ VA: 1.85 | NNVA: 0.9 | NVA: 2.6
  8. Washing: 4.5 days
     └─ VA: 2.0 | NNVA: 0.5 | NVA: 2.0
  ...
```

### Step 4: Add NVA Summary

At the end of calculation steps, add:

```
📊 Time Breakdown Summary:
   Total SOP LT: 45.2 days
   ├─ VA (Value Added): 18.5 days (41%)
   ├─ NNVA (Necessary): 8.7 days (19%)
   └─ NVA (Waste): 18.0 days (40%)
   
⚠️ NVA Opportunities:
   - Cutting Supermarkets: 6.0 days
   - Washing Queue: 2.0 days
   - Other delays: 10.0 days
```

### Step 5: Dashboard Integration

Add new KPI cards:
- **VA Time**: Total value-added time
- **NVA Time**: Total non-value-added time (highlight for reduction)
- **VA Ratio**: VA / Total SOP LT (target: >50%)

Add chart:
- Stacked bar showing VA/NNVA/NVA breakdown by process

## Validation Rules

1. **Sum Check**: `VA + NNVA + NVA = SOP LT` (must always be true)
2. **VA Constant**: Cutting VA = 1.9, Sewing VA = 1.85 (never changes)
3. **NNVA Range**: 0.8 to 1.5 days for Cutting (varies by qty band)
4. **NVA Tracking**: Must be visible in all reports

## Benefits

1. **Visibility**: Clear view of waste (NVA) in the system
2. **Targeting**: Focus improvement efforts on NVA reduction
3. **Metrics**: Track VA ratio over time
4. **Accountability**: Supermarket times are now explicit
5. **Same SOP LT**: No change to existing calculations, just better breakdown

## Migration Notes

- Existing SOP_Cal data remains valid
- New columns default to 0 if not populated
- Backward compatible with current system
- Can be rolled out incrementally (start with Cutting, then Sewing)

---

**Next Steps**: 
1. Update SOP_Cal sheet with VA/NNVA/NVA columns
2. Implement modified lookup function
3. Update calculation display
4. Add dashboard widgets
5. Test with sample data
