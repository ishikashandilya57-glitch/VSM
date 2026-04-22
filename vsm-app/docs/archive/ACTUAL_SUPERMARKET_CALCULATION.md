# ✅ ACTUAL SUPERMARKET CALCULATION FROM USER INPUT

## Overview

The dashboard now calculates supermarket times from **actual user input dates** instead of reading from backend columns. This gives you real waiting times based on when processes actually started and ended.

---

## 🎯 How It Works

### Calculation Logic

For each order (OC Number), the system:

1. **Collects all processes** for that order
2. **Sorts by process sequence** (1, 2, 3, etc.)
3. **Calculates waiting time** between consecutive processes:
   ```
   Waiting Time = Next Process Start Date - Current Process End Date
   ```
4. **Assigns waiting time** to the appropriate supermarket based on process stages

### Supermarket Assignment Rules

| Supermarket | Calculation | Example |
|-------------|-------------|---------|
| **SM1** | CAD/Pattern End → Cutting Start | CAD ends Jan 10, Cutting starts Jan 13 = 3 days |
| **SM2** | Any Process End → Cutting Start (except CAD) | Fabric ends Jan 5, Cutting starts Jan 8 = 3 days |
| **SM3** | Cutting End → Sewing Start | Cutting ends Jan 15, Sewing starts Jan 18 = 3 days |
| **SM4** | Sewing End → Finishing Start | Sewing ends Jan 25, Finishing starts Jan 28 = 3 days |
| **SM5** | Finishing End → Inspection Start | Finishing ends Feb 1, Inspection starts Feb 3 = 2 days |
| **SM6** | Finishing End → Any Other Process | Finishing ends Feb 1, Packing starts Feb 2 = 1 day |

---

## 📊 What You'll See

### KPI Cards (Top of Supermarket Tab)

Shows **average** supermarket times across all filtered orders:
- Supermarket 1: Average pre-production wait
- Supermarket 2: Average before cutting wait
- Supermarket 3: Average cutting WIP
- Supermarket 4: Average sewing WIP
- Supermarket 5: Average finishing WIP
- Supermarket 6: Average cartoning WIP
- Total SM Time: Sum of all averages

### Supermarket Table (Bottom of Supermarket Tab)

Shows **individual** supermarket times for each order:
- One row per OC Number
- SM1 through SM6 calculated from actual dates
- Total SM = sum of all 6 supermarkets
- Sorted by OC Number

---

## 🔍 Example Calculation

**Order: LC/DMN/25/12272**

**Process Timeline:**
1. CAD / Pattern: Jan 5 (start) → Jan 8 (end)
2. Cutting: Jan 12 (start) → Jan 15 (end)
3. Sewing: Jan 18 (start) → Jan 25 (end)
4. Finishing: Jan 28 (start) → Feb 1 (end)
5. Inspection: Feb 3 (start) → Feb 4 (end)

**Supermarket Calculations:**
- **SM1** = Cutting Start - CAD End = Jan 12 - Jan 8 = **4 days**
- **SM2** = 0 (no other process before Cutting)
- **SM3** = Sewing Start - Cutting End = Jan 18 - Jan 15 = **3 days**
- **SM4** = Finishing Start - Sewing End = Jan 28 - Jan 25 = **3 days**
- **SM5** = Inspection Start - Finishing End = Feb 3 - Feb 1 = **2 days**
- **SM6** = 0 (no other process after Finishing)
- **Total SM** = 4 + 0 + 3 + 3 + 2 + 0 = **12 days**

---

## ✅ Benefits

### 1. Real Data
- Uses actual dates from user input
- Shows real waiting times, not theoretical SOP values
- Reflects actual production delays

### 2. No Backend Dependency
- Works immediately without Apps Script deployment
- Calculates on-the-fly in the dashboard
- No need to wait for backend updates

### 3. Accurate Per Order
- Each order has its own supermarket times
- Can identify which orders have excessive waiting
- Helps pinpoint bottlenecks

### 4. Dynamic Updates
- Recalculates automatically when filters change
- Updates as new data is entered
- Always shows current state

---

## 🎨 Visual Indicators

**In the Dashboard:**
- **Blue** (SM1): Pre-Production Wait
- **Indigo** (SM2): Before Cutting
- **Purple** (SM3): Cutting WIP
- **Pink** (SM4): Sewing WIP
- **Rose** (SM5): Finishing WIP
- **Red** (SM6): Cartoning WIP
- **Orange** (Total): Total Supermarket Time

---

## 📋 Requirements

For accurate calculations, you need:

1. **Actual Start Dates** for each process
2. **Actual End Dates** for each process
3. **Process Sequence** numbers (1, 2, 3, etc.)
4. **Process Stage** names (Cutting, Sewing, etc.)

**Missing Data:**
- If actual dates are missing, waiting time = 0
- If only one process exists, no supermarkets calculated
- Negative waiting times are set to 0

---

## 🔄 Comparison: Old vs New

### OLD Method (Backend Columns)
- Read SM1-SM6 from sheet columns V-AB
- Required Apps Script deployment
- Values were 0 until backend updated
- Static values from last calculation

### NEW Method (Actual Calculation)
- Calculate from actual start/end dates
- Works immediately, no deployment needed
- Shows real waiting times
- Dynamic, updates with filters

---

## 🚀 What's Next

The system now shows **actual** supermarket times based on your data. You'll see:

1. **Real waiting times** between processes
2. **Per-order breakdown** in the table
3. **Average times** in the KPI cards
4. **Immediate updates** when you add new data

**No deployment needed** - this works right now with your existing data!

---

## 📝 Notes

- Supermarket times are calculated in **calendar days**
- Waiting time = difference between end of one process and start of next
- Only consecutive processes are considered
- Orders with incomplete date data will show 0 for missing supermarkets

---

**The dashboard is now calculating supermarket times from your actual user input!** 🎉
