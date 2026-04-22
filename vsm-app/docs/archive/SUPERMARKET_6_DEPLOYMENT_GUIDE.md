# 🚀 SUPERMARKET 6 STRUCTURE - DEPLOYMENT GUIDE

## ✅ What's Been Completed

### Frontend Changes (DONE)
1. ✅ Added SM6 to ProductionData interface
2. ✅ Updated supermarketMetrics calculation to include SM6
3. ✅ Added 7th KPI card for Supermarket 6 (Cartoning WIP)
4. ✅ Updated Supermarket table to show SM6 column
5. ✅ Updated all calculations to include SM6 in totals

### Backend Changes (READY TO DEPLOY)
1. ✅ Added column definitions for all 6 supermarkets (V, W, X, Y, Z, AA, AB)
2. ✅ Restructured supermarket logic:
   - SM1 (NEW): Pre-Production Waiting Time
   - SM2 (was SM1): Before Cutting
   - SM3 (was SM2): Cutting WIP - 3 days
   - SM4 (was SM3): Sewing WIP - 3 days
   - SM5 (was SM4): Finishing WIP
   - SM6 (was SM5): Cartoning WIP - 1 day
3. ✅ Updated backward calculation to use new supermarket numbers
4. ✅ Added code to write supermarket values to sheet columns
5. ✅ Updated API route to read supermarket columns from sheet

### API Changes (DONE)
1. ✅ Updated production-data API to read SM1-SM6 columns
2. ✅ Added totalSupermarket field mapping

---

## 📋 DEPLOYMENT STEPS

### Step 1: Deploy Apps Script

1. **Open Google Apps Script Editor**
   - Go to your Google Sheet
   - Click Extensions → Apps Script

2. **Copy the Updated Code**
   - Open file: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
   - Select ALL content (Ctrl+A)
   - Copy (Ctrl+C)

3. **Paste into Apps Script**
   - In Apps Script editor, select all existing code
   - Paste the new code
   - Click Save (💾 icon)

4. **Deploy**
   - Click "Deploy" → "New deployment"
   - OR if you have existing deployment: "Deploy" → "Manage deployments" → Edit (pencil icon) → "Version: New version"
   - Click "Deploy"
   - Copy the new Web App URL

5. **Update .env.local** (if URL changed)
   ```
   NEXT_PUBLIC_APPS_SCRIPT_URL=your_new_url_here
   ```

### Step 2: Update Sheet Headers (IMPORTANT!)

Your Google Sheet needs new column headers for supermarkets:

**Add these headers to VSM_Execution sheet:**
- Column V (22): `SM1` - Pre-Production Wait
- Column W (23): `SM2` - Before Cutting
- Column X (24): `SM3` - Cutting WIP
- Column Y (25): `SM4` - Sewing WIP
- Column Z (26): `SM5` - Finishing WIP
- Column AA (27): `SM6` - Cartoning WIP
- Column AB (28): `Total SM` - Total Supermarket Time

### Step 3: Test the System

1. **Create a new task entry** via the Update Task page
2. **Check the VSM_Execution sheet** - verify supermarket columns are populated
3. **View the Dashboard** - check Supermarket tab shows all 6 supermarkets
4. **Verify calculations** - ensure totals include all 6 supermarkets

---

## 🔍 What Changed

### Supermarket Numbering Shift

**OLD Structure (5 Supermarkets):**
- SM1: Before Cutting
- SM2: Cutting WIP (3 days)
- SM3: Sewing WIP (3 days)
- SM4: Finishing WIP
- SM5: Cartoning WIP (1 day)

**NEW Structure (6 Supermarkets):**
- SM1: **Pre-Production Wait** (NEW!)
- SM2: Before Cutting (was SM1)
- SM3: Cutting WIP - 3 days (was SM2)
- SM4: Sewing WIP - 3 days (was SM3)
- SM5: Finishing WIP (was SM4)
- SM6: Cartoning WIP - 1 day (was SM5)

### Column Mapping

| Column | Letter | Field | Description |
|--------|--------|-------|-------------|
| 22 | V | SM1 | Pre-Production Waiting Time |
| 23 | W | SM2 | Before Cutting |
| 24 | X | SM3 | Cutting WIP (3 days) |
| 25 | Y | SM4 | Sewing WIP (3 days) |
| 26 | Z | SM5 | Finishing WIP |
| 27 | AA | SM6 | Cartoning WIP (1 day) |
| 28 | AB | Total SM | Sum of all supermarkets |

---

## 📊 SM1 Calculation (Future Enhancement)

**Note:** SM1 (Pre-Production Waiting Time) is currently set to 0 in the code.

To implement SM1 calculation, you need to:
1. Track actual dates for pre-production processes (File Release, Pre-Production, CAD/Pattern)
2. Calculate: `SM1 = Actual Time - Target SOP Time`
3. This requires additional data tracking in Order_Master or a new sheet

**Example:**
- Target SOP: 5 days (File Release + Pre-Production + CAD)
- Actual Time: 8 days
- SM1 = 8 - 5 = 3 days (waiting time)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Apps Script deployed successfully
- [ ] Sheet headers added (V through AB)
- [ ] New task entry creates supermarket values
- [ ] Dashboard shows 7 KPI cards (SM1-SM6 + Total)
- [ ] Supermarket table shows SM6 column
- [ ] Total calculations include all 6 supermarkets
- [ ] No errors in browser console
- [ ] No errors in Apps Script logs

---

## 🐛 Troubleshooting

**Issue: Supermarket columns showing 0**
- Check that Apps Script is deployed (not just saved)
- Verify sheet headers are in correct columns (V-AB)
- Check Apps Script execution logs for errors

**Issue: Dashboard not showing SM6**
- Clear browser cache and refresh
- Check browser console for errors
- Verify API is returning sm6 field

**Issue: Total not including SM6**
- Verify frontend calculation includes sm6
- Check that API is reading column AA (27)

---

## 📝 Files Modified

### Frontend:
- `vsm-app/src/app/page.tsx` - Added SM6 to table and calculations

### Backend:
- `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs` - Restructured supermarkets

### API:
- `vsm-app/src/app/api/production-data/route.ts` - Added SM1-SM6 column mapping

---

## 🎯 Next Steps

1. Deploy the Apps Script code
2. Add sheet headers
3. Test with a new task entry
4. Implement SM1 calculation logic (future enhancement)
5. Monitor for any issues

---

**Need Help?** Check the Apps Script execution logs (View → Logs) for detailed error messages.
