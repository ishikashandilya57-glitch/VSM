# 🔍 DEBUG: Why Target Dates Show "N/A"

## POSSIBLE CAUSES

### 1. ❌ Network Issue (Most Likely)
**Symptom:** Console shows `ENOTFOUND oauth2.googleapis.com`

**Cause:** Your computer cannot reach Google's servers (firewall, proxy, or internet connection)

**Solution:**
- Check your internet connection
- Check if you're behind a corporate firewall/proxy
- Try accessing https://oauth2.googleapis.com in your browser
- If behind proxy, configure Node.js to use it

---

### 2. ❌ Apps Script Not Deployed
**Symptom:** Console shows "Apps Script not deployed correctly"

**Cause:** The Google Apps Script is not deployed as a Web App

**Solution:**
1. Open Google Apps Script Editor
2. Copy content from `Code_WithCalculations_FIXED_V2.gs`
3. Click **Deploy → New deployment**
4. Choose **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Click **Deploy**
8. Copy the Web App URL
9. Update `.env.local` with the new URL

---

### 3. ❌ OC Number Not in Order_Master
**Symptom:** Target dates show "N/A" but no error in console

**Cause:** The selected OC number doesn't exist in Order_Master sheet

**Solution:**
1. Open your Google Sheet
2. Go to Order_Master tab
3. Check if the OC number exists in Column B
4. If not, you need to create an order first

---

### 4. ❌ Product Type Not Selected (Pre-Production Only)
**Symptom:** Target dates show "N/A" for Pre-Production

**Cause:** Product Type is required for Pre-Production calculations

**Solution:**
1. Select Product Type dropdown
2. Choose a product type (Shirt, Overshirt, etc.)
3. Target dates should appear

---

## 🧪 TESTING STEPS

### Step 1: Check Browser Console
1. Open browser (http://localhost:3000)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Select OC Number and Process Stage
5. Look for errors

**Expected:** You should see a fetch request to Apps Script URL

**If you see:**
- `ENOTFOUND` → Network issue (see Cause #1)
- `Apps Script not deployed` → Deployment issue (see Cause #2)
- `404` or `403` → Wrong URL or permissions (see Cause #2)
- No error but "N/A" → Data issue (see Cause #3)

---

### Step 2: Test Apps Script Directly
1. Copy your Apps Script URL from `.env.local`
2. Add test parameters:
   ```
   YOUR_URL?ocNo=PRLS/25/12973&processStage=Pre-Production&productType=Shirt
   ```
3. Paste in browser and press Enter

**Expected Response:**
```json
{
  "success": true,
  "orderDetails": {
    "ocNo": "PRLS/25/12973",
    "washCategory": "Non-Wash",
    "deliveryDate": "2025-03-15",
    "qtyOrder": 1800,
    "qtyBand": "Q1"
  },
  "currentProcess": {
    "stage": "Pre-Production",
    "sopLt": 1,
    "targetStartDate": "2025-02-10",
    "targetEndDate": "2025-02-11"
  }
}
```

**If you see:**
- HTML page → Apps Script not deployed correctly
- Error message → Check the error details
- JSON with `success: false` → Check the error message in response

---

### Step 3: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Select OC Number and Process Stage
4. Look for request to Apps Script URL

**Check:**
- Status Code: Should be 200
- Response: Should be JSON
- Time: Should complete in 1-5 seconds

---

## 🔧 QUICK FIXES

### Fix 1: Restart Dev Server
Sometimes the environment variables don't load correctly.

```bash
# Stop the server (Ctrl+C)
# Start again
cd vsm-app
npm run dev
```

---

### Fix 2: Check .env.local
Make sure the Apps Script URL is correct:

```env
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Important:** Must start with `NEXT_PUBLIC_` to be accessible in browser!

---

### Fix 3: Test with Simple OC
Try with a known OC number that definitely exists:

1. Open Google Sheet → Order_Master
2. Find any OC number in Column B
3. Use that OC number in the form
4. See if target dates appear

---

## 📊 CURRENT STATUS

Based on the logs, the issue is:

**❌ Network Error: `ENOTFOUND oauth2.googleapis.com`**

This means your computer cannot reach Google's servers.

**Solutions:**
1. Check internet connection
2. Check firewall/proxy settings
3. Try using a different network
4. If behind corporate firewall, contact IT

---

## ✅ WHEN IT WORKS

When everything is working correctly, you should see:

1. Select Line → OC numbers load
2. Select OC Number → Loading spinner appears
3. Select Process Stage → Target dates appear (not "N/A")
4. For Pre-Production: Select Product Type → Target dates update

**Timeline:**
- OC selection → Process selection → Target dates (1-3 seconds)

---

## 🆘 STILL NOT WORKING?

If target dates still show "N/A" after trying all fixes:

1. **Check Apps Script Logs:**
   - Open Apps Script Editor
   - View → Logs
   - Look for errors

2. **Check Google Sheet:**
   - Verify Order_Master has data
   - Verify SOP_Cal has data
   - Check column positions match

3. **Test Backend Directly:**
   - Use the test URL from Step 2
   - Check the JSON response
   - Look for error messages

---

## 📝 SUMMARY

**Most Common Issue:** Network connectivity to Google servers

**Quick Test:** Can you access https://sheets.google.com in your browser?

**If YES:** Apps Script deployment issue
**If NO:** Network/firewall issue

---

Need more help? Check the browser console for specific error messages!
