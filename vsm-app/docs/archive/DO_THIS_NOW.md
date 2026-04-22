# ✅ ACTION CHECKLIST - DO THIS NOW

## 🎯 Goal
Get form submissions to save data in VSM_execution sheet with correct calculations.

---

## ⚡ STEP 1: Test Apps Script (2 minutes)

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
```

**What you should see:**
```json
{"success":false,"error":"Missing ocNo or processStage parameter"}
```

**If you see something else:**
- HTML page → Go to Step 2
- "Authorization required" → Go to Step 2
- Connection error → Check your internet

---

## ⚡ STEP 2: Deploy Updated Code (5 minutes)

1. **Open Google Apps Script:**
   - Go to: https://script.google.com/home
   - Find your VSM project
   - Open it

2. **Replace the code:**
   - Select ALL code in `Code.gs`
   - Delete it
   - Open: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
   - Copy ALL the code
   - Paste into `Code.gs`
   - Click **Save** (Ctrl+S)

3. **Deploy as Web App:**
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (pencil icon)
   - Under "Version", select **New version**
   - Description: "Fixed save + calculations"
   - **CRITICAL:** "Who has access" → **Anyone**
   - Click **Deploy**
   - Copy the Web App URL

4. **Update .env.local (if URL changed):**
   - Open `vsm-app/.env.local`
   - Update `GOOGLE_APPS_SCRIPT_URL=` with new URL
   - Save file

---

## ⚡ STEP 3: Test in Browser (3 minutes)

1. **Go to:** http://localhost:3000

2. **Open Developer Tools:**
   - Press **F12**
   - Go to **Console** tab

3. **Fill the form:**
   - Line No: `DBR_L1`
   - OC NO: `LC/DMN/25/12270` (or any OC NO from your Order_Master)
   - Order No: `12270`
   - Process Stage: `Sewing`
   - Actual Start Date: `2026-01-20`
   - Actual End Date: `2026-01-25`
   - Delay Reason: (leave blank)

4. **Click "Save Task"**

5. **Watch the console** for:
   - ✅ `📥 Received task data`
   - ✅ `📤 Sending to Apps Script`
   - ✅ `📨 Apps Script response status: 200`
   - ✅ `✅ Task saved successfully`

---

## ⚡ STEP 4: Verify in Google Sheets (1 minute)

1. **Open your Google Sheet**

2. **Go to VSM_execution tab**

3. **Check the last row:**
   - Should have your test data
   - Line No: TEST_LINE or DBR_L1
   - OC NO: LC/DMN/25/12270
   - Process Stage: Sewing
   - Target dates should be filled
   - SOP LT should be 5.35 (for Q2)
   - **NO #VALUE! errors**

---

## ⚡ STEP 5: Fix Old Rows (Optional, 1 minute)

If old rows have #VALUE! errors:

1. In Google Sheets, click **VSM Tools** menu
2. Click **Recalculate All**
3. Wait for completion
4. All #VALUE! errors should be fixed

---

## 🚨 TROUBLESHOOTING

### Problem: "Authorization required" when opening Apps Script URL
**Fix:** Deploy with "Who has access" = **Anyone**

### Problem: Browser console shows "Missing required fields"
**Fix:** Make sure ALL form fields are filled (including Order No)

### Problem: Console shows "Apps Script URL not configured"
**Fix:** Check `.env.local` has `GOOGLE_APPS_SCRIPT_URL=...`

### Problem: Data saves but shows #VALUE! errors
**Fix:** You deployed old code. Go back to Step 2 and deploy the correct code.

### Problem: Console shows "Failed to fetch" or CORS error
**Fix:** 
1. Apps Script not deployed as Web App
2. Check deployment settings (Step 2)

---

## ✅ SUCCESS CRITERIA

You're done when:
- [ ] Apps Script URL returns JSON (not HTML)
- [ ] Form submission shows success message
- [ ] New row appears in VSM_execution
- [ ] All calculated fields have values (no #VALUE!)
- [ ] Sewing SOP LT = 5.35 days (for Q2 orders)
- [ ] Target dates are calculated correctly

---

## 📞 NEED HELP?

If stuck, check:
1. `TEST_IN_BROWSER.md` - Detailed browser testing
2. `TROUBLESHOOT_SAVE_ISSUE.md` - Complete troubleshooting guide
3. Browser console logs (F12)
4. Apps Script execution logs (in Apps Script editor)

---

**Start with STEP 1 now!** 🚀
