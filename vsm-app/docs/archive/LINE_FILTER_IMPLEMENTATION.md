# Line Filter Implementation - Complete

## Overview
The LINE filter has been successfully implemented across the entire dashboard, allowing users to filter all data by production line (DBR_L1, DBR_L2, DBR_L3, etc.).

## Data Flow

### 1. Data Entry (Task Update UI)
- User selects a **Line No** from dropdown in TaskUpdatePageEnhanced
- Line options are fetched from `/api/lines` endpoint
- LineNo is sent to backend when saving task updates
- Backend saves lineNo to **Column A** of VSM_Execution sheet

### 2. Data Storage (Google Sheets)
- **VSM_Execution Sheet**: Column A (LINE_NO) stores the line number for each process entry
- **Order_Master Sheet**: Contains master order data (referenced for order details)
- Line numbers are populated when users submit task updates via the UI

### 3. Data Retrieval (Dashboard)
- **Lines API** (`/api/lines`): Fetches unique line numbers from VSM_Execution Column A
- **Production Data API** (`/api/production-data`): Fetches all production data including lineNo from VSM_Execution
- Data includes: lineNo, ocNo, orderNo, processStage, processStatus, and all other fields

### 4. Data Filtering (Dashboard UI)
- LINE filter dropdown appears first in the filter bar (before Process Stage, Product Type, Status)
- Options: "All", "DBR_L1", "DBR_L2", "DBR_L3", etc. (dynamically loaded from sheet)
- Filtering logic: `lineMatch && processMatch && productMatch && statusMatch`
- Affects ALL tabs: OVERVIEW, ANALYTICS, SUPERMARKET, REPORTS

## Implementation Details

### Frontend Changes

#### 1. Dashboard State (page.tsx)
```typescript
const [selectedLine, setSelectedLine] = useState('All');
const [lineOptions, setLineOptions] = useState<string[]>([]);
```

#### 2. Data Fetching
```typescript
// Extract unique lines from production data
const uniqueLines = [...new Set(result.data.map((d: ProductionData) => d.lineNo).filter(Boolean))] as string[];
setLineOptions(['All', ...uniqueLines.sort()]);
```

#### 3. Filtering Logic
```typescript
const filteredData = useMemo(() => {
  return rawData.filter(item => {
    const lineMatch = selectedLine === 'All' || item.lineNo === selectedLine;
    const processMatch = selectedProcess === 'All' || item.processStage === selectedProcess;
    const productMatch = selectedProduct === 'All' || item.productType === selectedProduct;
    const statusMatch = selectedStatus === 'All' || item.processStatus === selectedStatus;
    return lineMatch && processMatch && productMatch && statusMatch;
  });
}, [rawData, selectedLine, selectedProcess, selectedProduct, selectedStatus]);
```

#### 4. Filter Configuration
```typescript
const filterConfig = [
  {
    id: 'line',
    label: 'Line',
    value: selectedLine,
    options: lineOptions.map(l => ({ value: l, label: l })),
    onChange: setSelectedLine,
  },
  // ... other filters
];
```

### Backend Changes

#### 1. Lines API (`/api/lines/route.ts`)
- Fetches from: `VSM_Execution!A2:A10000` (Column A: LINE_NO)
- Returns: Array of unique line numbers sorted alphabetically
- Example: `["DBR_L1", "DBR_L2", "DBR_L3"]`

#### 2. Production Data API (`/api/production-data/route.ts`)
- Fetches from: `VSM_Execution!A2:U10000` (All relevant columns)
- Column mapping:
  - A: lineNo
  - B: ocNo
  - C: orderNo
  - D: productType (wash category)
  - E: deliveryDate
  - F: processSeq
  - G: processStage
  - H: vaNva
  - I: sopLeadTime
  - J-M: Target/Actual dates
  - N: processStatus
  - O: processTime
  - P: variance
  - Q-U: Delay info, risk level

### Interface Updates

#### ProductionData Interface
```typescript
interface ProductionData {
  lineNo?: string;  // Added
  ocNo: string;
  orderNo: string;
  productType: string;
  // ... other fields
}
```

## Supermarket Tab Integration

The SUPERMARKET tab now:
1. Filters data by selected line
2. Calculates supermarket metrics (SM1-SM5) from filtered data
3. Updates all visualizations:
   - 5 KPI cards (one per supermarket)
   - Total Supermarket Time card
   - Bar chart showing time distribution
   - Pie chart showing contribution percentage
   - Flow visualization with color-coded boxes
   - Detailed table with dynamic percentages and status badges
4. Shows line-specific subtitle: "Complete breakdown of inter-process WIP for DBR_L1"

## Testing

### To Test the Line Filter:
1. Open the dashboard
2. Navigate to any tab (OVERVIEW, ANALYTICS, SUPERMARKET, REPORTS)
3. Click the LINE dropdown (first filter)
4. Select a specific line (e.g., "DBR_L1")
5. Verify:
   - All KPIs update to show only that line's data
   - All charts filter to that line
   - Supermarket metrics calculate for that line only
   - Data table shows only records for that line

### Expected Behavior:
- **"All"**: Shows data from all lines combined
- **"DBR_L1"**: Shows only data where lineNo = "DBR_L1"
- **"DBR_L2"**: Shows only data where lineNo = "DBR_L2"
- etc.

## Files Modified

### Frontend:
- `vsm-app/src/app/page.tsx` - Added line filter state, logic, and UI
- `vsm-app/src/app/api/production-data/route.ts` - Updated to fetch lineNo from VSM_Execution
- `vsm-app/src/app/api/lines/route.ts` - Updated to fetch from VSM_Execution Column A

### Backend (Google Apps Script):
- No changes needed - lineNo already being saved to Column A of VSM_Execution

## Notes

- Line numbers are dynamically loaded from the Google Sheet
- If no line data exists, the filter will only show "All"
- The filter works in combination with other filters (Process Stage, Product Type, Status)
- All filters use AND logic (all conditions must match)
- Sample data includes lineNo for testing when Google Sheets is unavailable

## Future Enhancements

Potential improvements:
1. Add line-specific performance metrics
2. Compare multiple lines side-by-side
3. Line capacity and utilization tracking
4. Line-specific bottleneck analysis
5. Export filtered data by line
