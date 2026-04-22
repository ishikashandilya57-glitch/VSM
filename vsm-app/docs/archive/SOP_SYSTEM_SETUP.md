# SOP Lead Time Auto-Calculation System Setup

## 🎯 Overview
This system automatically calculates SOP Lead Time for each process based on process-relevant dimensions only, not all order attributes.

## 📊 Google Sheets Structure

### 1️⃣ VS_execution (Main Execution Sheet)

**Key Columns:**
- **Column G**: Process Stage
- **Column D**: Wash Category (derived from remarks)
- **Column AH**: Order Qty Band (Q1-Q5)
- **Column AJ**: Derived Order Type (Repeat/Non-Repeat)
- **Column AK**: Product Type
- **Column AL**: SOP LT (Days) - **AUTO-CALCULATED**
- **Column AM**: Drv_Product - **AUTO-CALCULATED**
- **Column AN**: Drv_Wash - **AUTO-CALCULATED**
- **Column AO**: Drv_OrderType - **AUTO-CALCULATED**
- **Column AP**: Drv_QtyBand - **AUTO-CALCULATED**

### 2️⃣ SOP_Cal (Master SOP Calendar)

**Columns:**
| Column | Header | Description |
|--------|--------|-------------|
| A | ID | Unique identifier |
| B | Process Stage | Process name |
| C | Product Type | Product type or "All" |
| D | Wash Category | Wash type or "All" |
| E | Order Type | Repeat/Non-Repeat or "All" |
| F | Order Qty Band | Q1-Q5 or "All" |
| J | SOP Lead Time (Days) | Target lead time |

**Rules:**
- No blanks in key columns
- Use "All" when dimension doesn't affect the process
- Each row = one unique process behavior

**Example Data:**
```
Process Stage    | Product Type | Wash Category | Order Type | Qty Band | SOP LT (Days)
Pre-Production   | All          | All           | Repeat     | All      | 2
Pre-Production   | All          | All           | Non-Repeat | All      | 5
Fabric Inhouse   | Enzyme Wash  | All           | All        | Q1       | 3
Fabric Inhouse   | Enzyme Wash  | All           | All        | Q2       | 4
Cutting          | All          | All           | All        | All      | 2
Sewing           | T-Shirt      | All           | All        | Q1       | 5
Sewing           | T-Shirt      | All           | All        | Q2       | 7
Washing          | All          | Enzyme        | All        | All      | 3
Washing          | All          | Stone Wash    | All        | All      | 4
```

### 3️⃣ SOP_Drivers (Process Driver Matrix)

**Columns:**
| Column | Header | Description |
|--------|--------|-------------|
| A | Process Stage | Process name |
| B | Use Product | Y/N - Does product type affect SOP? |
| C | Use Wash | Y/N - Does wash category affect SOP? |
| D | Use Order Type | Y/N - Does order type affect SOP? |
| E | Use Qty Band | Y/N - Does quantity band affect SOP? |

**Example Data:**
```
Process Stage    | Use Product | Use Wash | Use Order Type | Use Qty Band
File Release     | N           | N        | N              | N
Pre-Production   | N           | N        | Y              | N
Fabric Inhouse   | Y           | N        | N              | Y
Fabric QC        | N           | N        | N              | N
Cutting          | N           | N        | N              | N
Sewing           | Y           | N        | N              | Y
Washing          | N           | Y        | N              | N
Finishing        | N           | N        | N              | N
Inspection       | N           | N        | N              | N
Dispatch         | N           | N        | N              | N
```

## 🔧 Setup Instructions

### Step 1: Prepare Your Google Sheet

1. Create three sheets in your Google Spreadsheet:
   - `VS_execution`
   - `SOP_Cal`
   - `SOP_Drivers`

2. Set up the column headers as described above

3. Populate `SOP_Drivers` with your process stages and their driver flags

4. Populate `SOP_Cal` with your SOP master data

### Step 2: Install Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy the entire content from `google-apps-script/SOP_Calculator.gs`
5. Paste it into the Apps Script editor
6. Click **Save** (💾 icon)
7. Name your project: "VSM SOP Calculator"

### Step 3: Adjust Column Numbers (if needed)

In the Apps Script, verify these constants match your sheet structure:

```javascript
const COL_PROCESS_STAGE = 7;  // G
const COL_PRODUCT_TYPE = 37;  // AK
const COL_WASH_CATEGORY = 4;  // D
const COL_ORDER_TYPE = 36;    // AJ
const COL_QTY_BAND = 34;      // AH
const COL_SOP_LT = 38;        // AL
```

### Step 4: Deploy as Web App

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "SOP Calculator API"
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Web app URL** - you'll need this for your Next.js app

### Step 5: Configure Next.js App

Add to your `.env.local`:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 6: Test the System

1. In your Google Sheet, go to **SOP Calculator** menu → **Recalculate All SOP**
2. Verify that:
   - Derived columns (AM, AN, AO, AP) are populated
   - SOP LT (Days) column shows calculated values
   - Values change when you edit relevant columns

## 🧠 How It Works

### Auto-Calculation Logic

1. **When you edit** Process Stage, Product Type, Wash Category, Order Type, or Qty Band:
   - Script checks `SOP_Drivers` to see which dimensions matter for that process
   - Creates derived values (uses "All" for dimensions that don't matter)
   - Looks up SOP from `SOP_Cal` using derived values
   - Updates SOP LT (Days) automatically

2. **Derived Value Rules:**
   - If driver says "N" → use "All"
   - If driver says "Y" → use actual value
   - Never blank or null → defaults to "All"

3. **SOP Lookup:**
   - Exact match required on all 5 dimensions
   - Returns 0 if no match found
   - Deterministic (one match only)

### Example Flow

**Scenario**: Editing a Sewing process row

1. User enters:
   - Process Stage: "Sewing"
   - Product Type: "T-Shirt"
   - Wash Category: "Enzyme"
   - Order Type: "Repeat"
   - Qty Band: "Q2"

2. Script checks `SOP_Drivers`:
   - Sewing uses: Product (Y), Qty Band (Y)
   - Sewing ignores: Wash (N), Order Type (N)

3. Script creates derived values:
   - Drv_Product: "T-Shirt" (used)
   - Drv_Wash: "All" (ignored)
   - Drv_OrderType: "All" (ignored)
   - Drv_QtyBand: "Q2" (used)

4. Script looks up in `SOP_Cal`:
   - Finds: Sewing | T-Shirt | All | All | Q2 → **7 days**
   - Sets SOP LT (Days) = 7

## 🔄 Integration with Next.js App

The Update Task page in your app will:

1. Send task updates to the Google Apps Script Web App
2. Script updates the row in VS_execution
3. Script automatically recalculates SOP
4. Returns success response to the app

## ✅ Validation Checklist

- [ ] All three sheets exist with correct names
- [ ] Column headers match the specification
- [ ] SOP_Drivers has all process stages
- [ ] SOP_Cal has no blanks in key columns
- [ ] SOP_Cal uses "All" for non-relevant dimensions
- [ ] Apps Script is deployed as Web App
- [ ] Web App URL is in .env.local
- [ ] Custom menu appears in Google Sheets
- [ ] Manual recalculation works
- [ ] Auto-calculation triggers on edit

## 🐛 Troubleshooting

### SOP shows 0
- Check if matching row exists in SOP_Cal
- Verify derived values are correct
- Check Apps Script logs (View → Logs)

### Derived columns show blank
- Verify SOP_Drivers has the process stage
- Check column number constants in script
- Ensure raw values are not null

### Auto-calculation doesn't trigger
- Verify onEdit trigger is installed
- Check if editing the correct columns
- Look for errors in Apps Script logs

### Web App returns error
- Check deployment settings (Execute as: Me)
- Verify Web App URL in .env.local
- Check Apps Script execution logs

## 📝 Formulas (Alternative to Apps Script)

If you prefer formulas over Apps Script, here are the Google Sheets formulas:

### Drv_Product (Column AM)
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$B,2,FALSE)="Y",$AK2,"All")
```

### Drv_Wash (Column AN)
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$C,3,FALSE)="Y",$D2,"All")
```

### Drv_OrderType (Column AO)
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$D,4,FALSE)="Y",$AJ2,"All")
```

### Drv_QtyBand (Column AP)
```
=IF(VLOOKUP($G2,SOP_Drivers!$A:$E,5,FALSE)="Y",$AH2,"All")
```

### SOP LT (Days) (Column AL)
```
=IFERROR(INDEX(SOP_Cal!$J:$J,MATCH(1,
  (SOP_Cal!$B:$B=$G2)*
  (SOP_Cal!$C:$C=$AM2)*
  (SOP_Cal!$D:$D=$AN2)*
  (SOP_Cal!$E:$E=$AO2)*
  (SOP_Cal!$F:$F=$AP2),0)),0)
```

**Note**: The formula approach requires array formula support. Apps Script is recommended for better performance and reliability.

## 🚀 Next Steps

1. Complete the Google Sheets setup
2. Test SOP calculations manually
3. Deploy the Apps Script as Web App
4. Update your Next.js .env.local
5. Test the Update Task feature from the app
6. Monitor and refine your SOP master data

## 📞 Support

If you encounter issues:
1. Check Apps Script logs: **View** → **Logs**
2. Verify sheet names and column positions
3. Test with a simple example first
4. Check the execution transcript in Apps Script
