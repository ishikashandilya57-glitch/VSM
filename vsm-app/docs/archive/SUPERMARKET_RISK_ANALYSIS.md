# SUPERMARKET RISK ANALYSIS FEATURE ✅

## New Feature Added to SUPERMARKET Tab

The SUPERMARKET tab now shows **which orders are stuck in which supermarket** and for **how long** - enabling NVA risk analysis!

---

## What's New

### Added: "Orders Stuck in Supermarkets" Table

A new comprehensive table showing:
- Which orders are waiting
- Which supermarket they're stuck in
- How long they've been waiting
- Risk level based on wait time
- Delivery date impact

---

## Table Structure

### Columns:

| Column | Description |
|--------|-------------|
| **OC Number** | Order/Contract number |
| **Line** | Production line (badge) |
| **Product Type** | Type of product |
| **Stuck In** | Which supermarket (SM1-SM5) |
| **Wait Time** | Time in that specific supermarket (days) |
| **Total SM Time** | Total time across all supermarkets (days) |
| **Risk Level** | Low / Medium / High / Critical |
| **Delivery Date** | Expected delivery date |

---

## Example Table View:

```
OC Number           | Line     | Product      | Stuck In           | Wait Time | Total SM | Risk     | Delivery
LC/PVI/25/11726.1.1 | [DBR_L5] | Garment Wash | SM3 (Sewing WIP)   | 3.5 days  | 7.2 days | High     | 2025-11-13
LC/PVI/25/11727.1.1 | [DBR_L3] | Enzyme Wash  | SM2 (Cutting WIP)  | 4.2 days  | 6.8 days | High     | 2025-11-15
LC/PVI/25/11728.1.1 | [DBR_L1] | Garment Dyed | SM3 (Sewing WIP)   | 5.5 days  | 8.1 days | Critical | 2025-11-20
```

---

## Risk Level Classification

### Based on Total Supermarket Time:

| Risk Level | Time Range | Color | Meaning |
|------------|------------|-------|---------|
| **Low** | < 1 day | Green | Minimal waiting, good flow |
| **Medium** | 1-2.9 days | Yellow | Some waiting, monitor |
| **High** | 3-4.9 days | Orange | Significant waiting, action needed |
| **Critical** | ≥ 5 days | Red | Excessive waiting, urgent action |

---

## How It Works

### Data Flow:
```
Backend Calculates Supermarkets (SM1-SM5)
         ↓
Each Order Gets 5 Supermarket Values
         ↓
Dashboard Groups by Order
         ↓
Finds Maximum Supermarket (where stuck)
         ↓
Calculates Total Supermarket Time
         ↓
Assigns Risk Level
         ↓
Displays in Table (sorted by risk)
```

### Logic:

**For Each Order:**
1. Get all 5 supermarket values (SM1-SM5)
2. Find which supermarket has the highest time → "Stuck In"
3. Sum all 5 supermarkets → "Total SM Time"
4. Classify risk based on total time
5. Sort by total time (highest first)

---

## Supermarket Locations

| Supermarket | Location | What It Represents |
|-------------|----------|-------------------|
| **SM1** | Before Cutting | Waiting before cutting starts |
| **SM2** | Cutting WIP | Waiting after cutting, before sewing |
| **SM3** | Sewing WIP | Waiting after sewing, before finishing |
| **SM4** | Finishing WIP | Waiting after finishing, before cartoning |
| **SM5** | Cartoning WIP | Waiting after cartoning, before shipment |

---

## Why This Matters

### Supermarket Time = NVA (Non-Value Added)

**NVA means:**
- ❌ No value is being added to the product
- ⏰ Pure waiting time
- 💰 Cost without benefit
- 📉 Delivery risk increases

**Example:**
- Order has 7 days total supermarket time
- This is 7 days of pure waiting
- No work is being done on the product
- Delivery date is at risk

---

## Use Cases

### 1. Identify High-Risk Orders
**Question**: Which orders are at risk of missing delivery dates?
**Answer**: Look at "Critical" and "High" risk orders in the table

### 2. Find Bottlenecks
**Question**: Where are orders getting stuck most?
**Answer**: Check the "Stuck In" column - if many orders show SM3, Sewing is the bottleneck

### 3. Prioritize Actions
**Question**: Which orders need immediate attention?
**Answer**: Sort by "Total SM Time" - highest values need urgent action

### 4. Monitor Specific Lines
**Question**: Is DBR_L1 having issues?
**Answer**: Filter by Line = DBR_L1, check supermarket times

### 5. Track Improvements
**Question**: Are our process improvements working?
**Answer**: Monitor if supermarket times are decreasing over time

---

## Visual Indicators

### Risk Alert Banner:
```
⚠️ Risk Alert: Supermarket time is pure NVA (Non-Value Added). 
Orders stuck in supermarkets represent waiting time and delivery risk.
```

### Color Coding:
- **Orange Badge**: "Stuck In" supermarket
- **Orange Bold**: Wait time in that supermarket
- **Risk Badge**: Color-coded by severity (Green/Yellow/Orange/Red)

### Sorting:
- Orders sorted by **Total SM Time** (highest first)
- Shows top 50 orders with supermarket time > 0

---

## Filter Integration

The table respects all dashboard filters:

**Example:**
1. Select Line: "DBR_L1"
2. Go to SUPERMARKET tab
3. **Result**: Shows only DBR_L1 orders stuck in supermarkets

**Filters Apply To:**
- Order list
- Risk calculations
- Supermarket metrics

---

## Empty State

If no orders are stuck in supermarkets:
```
┌─────────────────────────────────────┐
│         ✓ (Green Checkmark)         │
│                                     │
│  No Orders Stuck in Supermarkets    │
│                                     │
│  All orders are flowing smoothly    │
│  through processes                  │
└─────────────────────────────────────┘
```

---

## Technical Implementation

### Files Modified:

#### `src/app/page.tsx`
**Added:**
- New table section after Key Insights
- Order grouping logic (Map by OC Number)
- Supermarket maximum finder (which SM has highest time)
- Risk level calculator
- Sorting by total supermarket time
- Empty state handling

**Logic:**
```typescript
// Group orders and find max supermarket
const orderMap = new Map();
filteredData.forEach(item => {
  const sm1 = item.sm1 || 0;
  const sm2 = item.sm2 || 0;
  const sm3 = item.sm3 || 0;
  const sm4 = item.sm4 || 0;
  const sm5 = item.sm5 || 0;
  const totalSM = sm1 + sm2 + sm3 + sm4 + sm5;
  
  // Find which supermarket has max time
  const maxSM = [
    { name: 'SM1', value: sm1 },
    { name: 'SM2', value: sm2 },
    { name: 'SM3', value: sm3 },
    { name: 'SM4', value: sm4 },
    { name: 'SM5', value: sm5 },
  ].reduce((max, sm) => sm.value > max.value ? sm : max);
  
  orderMap.set(item.ocNo, { ...data, maxSM, totalSM });
});

// Sort by total SM time
const orders = Array.from(orderMap.values())
  .filter(order => order.totalSM > 0)
  .sort((a, b) => b.totalSM - a.totalSM);
```

---

## SUPERMARKET Tab Now Has:

### 1. Overview Section (Existing)
- 5 KPI cards (SM1-SM5)
- Total Supermarket Time card
- Bar chart
- Pie chart
- Flow visualization
- Summary table
- Key insights

### 2. Risk Analysis Section (NEW!)
- ⚠️ Risk alert banner
- Orders stuck in supermarkets table
- Risk level classification
- Sorted by severity
- Filter integration
- Risk legend

---

## Benefits

### For Management:
✅ **Quick Risk Assessment** - See which orders are at risk  
✅ **Prioritization** - Focus on critical orders first  
✅ **Bottleneck Identification** - See where orders get stuck  
✅ **Data-Driven Decisions** - Numbers, not guesses  

### For Operations:
✅ **Action Items** - Clear list of orders needing attention  
✅ **Process Improvement** - Identify which supermarkets to optimize  
✅ **Resource Allocation** - Deploy resources where needed  
✅ **Performance Tracking** - Monitor improvements over time  

### For Planning:
✅ **Delivery Risk** - Predict which orders might be late  
✅ **Capacity Planning** - See where capacity is constrained  
✅ **Lead Time Reduction** - Target NVA elimination  
✅ **Customer Communication** - Proactive updates on delays  

---

## Current Status

✅ **Risk Analysis Table**: Added to SUPERMARKET tab  
✅ **Order Grouping**: By OC Number  
✅ **Max Supermarket**: Identifies where stuck  
✅ **Risk Classification**: 4 levels (Low/Medium/High/Critical)  
✅ **Sorting**: By total supermarket time  
✅ **Filter Integration**: Works with all filters  
✅ **Empty State**: Handles no stuck orders  
✅ **Server Running**: http://localhost:3000  

---

## Testing Instructions

### Test Risk Analysis:
1. Open dashboard: http://localhost:3000
2. Go to **SUPERMARKET** tab
3. Scroll down to "Orders Stuck in Supermarkets" section
4. Verify you see:
   - Risk alert banner
   - Table with orders
   - Risk levels color-coded
   - "Stuck In" showing supermarket
   - Wait times displayed

### Test Sorting:
1. Check if orders are sorted by Total SM Time (highest first)
2. Verify Critical/High risk orders appear at top

### Test Filters:
1. Select Line: "DBR_L1"
2. Verify table shows only DBR_L1 orders
3. Select Process: "Sewing"
4. Verify filtering works correctly

### Test Empty State:
1. Apply filters that result in no stuck orders
2. Verify green checkmark and message appear

---

## Summary

The SUPERMARKET tab now provides **comprehensive NVA risk analysis**!

**You can now see:**
- 📊 Which orders are stuck
- 📍 Which supermarket they're in
- ⏰ How long they've been waiting
- ⚠️ Risk level for each order
- 🎯 Which orders need immediate action

**This enables:**
- Proactive risk management
- Targeted process improvements
- Better delivery predictions
- Data-driven decision making

**Refresh your browser to see the new risk analysis table!** 🚀
