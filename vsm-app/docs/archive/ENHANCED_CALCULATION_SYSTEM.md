# Enhanced Calculation System with Order Master Integration

## 🎯 System Overview

This enhanced system:
1. **Fetches order details** from Order_Master when user selects OC NO
2. **Calculates SOP LT** for current process and all subsequent processes
3. **Calculates target dates** working backwards from Delivery Date
4. **Shows calculation steps** in real-time on the UI

---

## 📊 Data Flow

```
User selects: Line No → OC NO → Process Stage
    ↓
Fetch from Order_Master:
  - Delivery Date (Column E)
  - Wash Category (Column D)
  - Qty Order (Column E)
  - Calculate Qty Band (Q1-Q5)
    ↓
Get all processes from SOP_Cal (from current to end)
    ↓
For each process:
  - Lookup SOP LT from SOP_Cal
  - Match: Process Stage (B) + Wash Category (D) + Qty Band (F)
    ↓
Calculate backwards from Delivery Date:
  - Last Process: Target End = Delivery Date
  - Each Process: Target Start = Target End - SOP LT
  - Previous Process: Target End = Current Target Start
    ↓
Display: Target Start & End for current process
Show: All calculation steps for debugging
```

---

## 🔧 Implementation Files

### **1. Apps Script: Code_WithCalculations.gs**

**New Functions:**
- `getOrderDetails(ocNo)` - Fetches order from Order_Master
- `getAllProcessStages()` - Gets all processes from SOP_Cal
- `lookupSopLeadTime(processStage, washCategory, qtyBand)` - Looks up SOP
- `calculateTargetDatesWithSteps(ocNo, currentProcessStage)` - Main calculation with debug steps
- `doGet(e)` - GET endpoint for calculation preview
- `doPost(e)` - POST endpoint for saving data

**Key Logic:**
```javascript
// Qty Band Calculation
if (qtyOrder <= 1000) qtyBand = 'Q1';
else if (qtyOrder <= 3000) qtyBand = 'Q2';
else if (qtyOrder <= 5000) qtyBand = 'Q3';
else if (qtyOrder <= 8000) qtyBand = 'Q4';
else qtyBand = 'Q5';

// SOP Lookup
Match: SOP_Cal Column B (Process Stage)
       SOP_Cal Column D (Wash Category)
       SOP_Cal Column F (Qty Band)
Return: SOP_Cal Column J (SOP LT)

// Target Date Calculation (Backwards)
currentEndDate = Delivery Date
for each process (from last to first):
  targetEndDate = currentEndDate
  targetStartDate = currentEndDate - SOP LT
  currentEndDate = targetStartDate
```

---

### **2. Frontend: TaskUpdatePageEnhanced.tsx**

**New Features:**
- Calculation preview panel (right side)
- Real-time calculation steps display
- Collapsible calculation panel
- Shows all processes and their SOP LT
- Shows order details (Wash, Qty Band, Delivery Date)
- Shows step-by-step calculation logic

**API Calls:**
```typescript
// GET calculation preview
GET ${scriptUrl}?ocNo=${ocNo}&processStage=${processStage}

// Returns:
{
  success: true,
  orderDetails: { ocNo, washCategory, deliveryDate, qtyOrder, qtyBand },
  currentProcess: { stage, sopLt, targetStartDate, targetEndDate },
  allProcesses: [...],
  totalSopLt: number,
  steps: [...]  // Debug steps
}
```

---

## 📋 Setup Steps

### **Step 1: Update Apps Script**

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Replace all code with `vsm-app/google-apps-script/Code_WithCalculations.gs`
4. **Save** (Ctrl+S)
5. **Deploy** → **Manage deployments** → **Edit** → **New version**
6. Click **Deploy**

**Important:** URL stays the same, no need to update .env.local!

---

### **Step 2: Update Frontend Component**

Replace the TaskUpdatePage component:

**Option A: Replace existing file**
```bash
# Backup current file
cp src/components/TaskUpdatePage.tsx src/components/TaskUpdatePage.backup.tsx

# Replace with enhanced version
cp src/components/TaskUpdatePageEnhanced.tsx src/components/TaskUpdatePage.tsx
```

**Option B: Use enhanced version directly**
In `src/app/page.tsx`, import:
```typescript
import TaskUpdatePageEnhanced from '@/components/TaskUpdatePageEnhanced';
```

---

### **Step 3: Verify Order_Master Structure**

Your Order_Master sheet must have:

| Column | Name | Example |
|--------|------|---------|
| A | Line | DBR_L1 |
| B | OC NO | LC/REIS/25/12360 |
| C | BUYER | Polo Ralph Lauren |
| D | Wash Category | Garment Wash |
| E | DEL DATE | 01/01/2026 |
| E | QTY ORDER | 4552 |
| F | REMARKS | garment wash |

**Note:** If your columns are different, update the Apps Script column indices!

---

### **Step 4: Verify SOP_Cal Structure**

Your SOP_Cal sheet must have:

| Column | Name | Example |
|--------|------|---------|
| A | Process Seq | 1, 2, 3, 4... |
| B | Process Stage | Fabric Inhouse, Fabric QC, Washing... |
| C | Product Type Raw | All |
| D | Product Type (Wash) | Non-Wash, Garment Wash, Enzyme... |
| E | Order Type | All, Repeat, Non-Repeat |
| F | Order Qty Band | Q1, Q2, Q3, Q4, Q5, All |
| J | SOP Lead Time (Days) | 1, 2, 3, 4, 5... |

---

## 🧪 Testing

### **Test 1: Calculation Preview**

1. Open the app
2. Select: Line No = "DBR_L2"
3. Select: OC NO = "LC/REIS/25/12360"
4. Select: Process Stage = "Finishing"
5. **Expected:** 
   - Target dates appear
   - Calculation panel shows steps
   - Order details displayed
   - All processes listed with SOP LT

---

### **Test 2: Verify Calculation Steps**

Click on "Calculation Steps" panel to expand.

**Should show:**
```
📋 Order Details:
  OC NO: LC/REIS/25/12360
  Wash Category: Garment Wash
  Delivery Date: 01/01/2026
  Qty Order: 4552
  Qty Band: Q3

📊 All Process Stages (8):
  1. Fabric Inhouse
  2. Fabric QC
  3. File Release
  4. Pre-Production
  5. Cutting
  6. Sewing
  7. Washing
  8. Finishing

🎯 Current Process: Finishing (Seq: 8)

📈 Remaining Processes (1):
  8. Finishing: 4 days

📊 Total SOP Lead Time: 4 days

📅 Delivery Date: Wed Jan 01 2026

🔙 Calculating backwards from Delivery Date:
  8. Finishing:
     Target End: Wed Jan 01 2026
     SOP LT: 4 days
     Target Start: Sat Dec 28 2025

✅ Target Start Date for Finishing: Sat Dec 28 2025
✅ Target End Date for Finishing: Wed Jan 01 2026
```

---

### **Test 3: Save Task**

1. Fill in Actual Start Date
2. Fill in Actual End Date
3. Select Delay Reason (optional)
4. Click "Save Task"
5. **Expected:**
   - Success message appears
   - Data saved to VSM_execution sheet
   - All calculated fields populated
   - Form resets after 2 seconds

---

## 🔍 Debugging

### **If Calculation Returns Error:**

**Check Apps Script Logs:**
1. Open Apps Script editor
2. Click **Executions** (left sidebar)
3. Find latest execution
4. Check error message

**Common Issues:**
- Order_Master sheet not found → Check sheet name
- OC NO not found → Check if OC exists in Order_Master
- Process Stage not found → Check if process exists in SOP_Cal
- No SOP match → Check SOP_Cal has matching row

---

### **If Target Dates are Wrong:**

**Verify:**
1. Delivery Date in Order_Master is correct
2. Process Seq in SOP_Cal is correct (1, 2, 3...)
3. SOP LT values are correct
4. Calculation steps show correct logic

**Debug:**
- Look at calculation steps panel
- Check each process's SOP LT
- Verify backward calculation logic
- Check if processes are in correct order

---

## 📊 Calculation Example

**Given:**
- OC NO: LC/REIS/25/12360
- Delivery Date: 01/01/2026
- Wash Category: Garment Wash
- Qty Order: 4552 → Qty Band: Q3
- Current Process: Washing (Seq: 7)

**Processes:**
1. Fabric Inhouse: 1 day
2. Fabric QC: 2 days
3. File Release: 1.5 days
4. Pre-Production: 2 days
5. Cutting: 3 days
6. Sewing: 9 days
7. Washing: 4.5 days (current)
8. Finishing: 4 days

**Calculation (Backwards from Delivery Date):**
```
Delivery Date: 01/01/2026

8. Finishing:
   Target End: 01/01/2026
   SOP LT: 4 days
   Target Start: 12/28/2025

7. Washing (CURRENT):
   Target End: 12/28/2025
   SOP LT: 4.5 days
   Target Start: 12/23/2025  ← This is shown to user

6. Sewing:
   Target End: 12/23/2025
   SOP LT: 9 days
   Target Start: 12/14/2025

... and so on
```

**Result:**
- Target Start Date for Washing: 12/23/2025
- Target End Date for Washing: 12/28/2025

---

## ✅ Benefits

1. **Automatic Order Lookup** - No manual entry of wash category, delivery date
2. **Accurate SOP Calculation** - Considers wash category and quantity
3. **Complete Process View** - See all processes and their SOP LT
4. **Transparent Calculation** - Debug steps show exactly how dates are calculated
5. **Real-time Preview** - See target dates before saving
6. **Error Detection** - Immediate feedback if order or process not found

---

## 🚀 Next Steps

1. **Deploy updated Apps Script**
2. **Test with real data**
3. **Verify calculations are correct**
4. **Train users on new UI**
5. **Monitor for any issues**

---

## 📞 Support

If calculations are incorrect:
1. Check calculation steps panel
2. Verify Order_Master data
3. Verify SOP_Cal data
4. Check Apps Script logs
5. Test with known good data

The calculation steps panel is your best debugging tool! 🔍

