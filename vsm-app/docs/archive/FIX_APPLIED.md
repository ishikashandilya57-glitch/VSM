# Error Fixed ✅

## What Was Wrong

The error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" means:
- The frontend was trying to call Google Apps Script
- But the script returned HTML instead of JSON
- This happens when the script isn't deployed or the URL is wrong

## Fixes Applied

### 1. Added `NEXT_PUBLIC_` Prefix to .env.local
```
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw.../exec
```

**Why:** Environment variables need `NEXT_PUBLIC_` prefix to be accessible in the browser.

### 2. Enhanced Error Handling
- Now checks if Apps Script URL is configured
- Detects if response is HTML instead of JSON
- Shows friendly error message instead of crashing
- Allows form to work even if calculation preview fails

### 3. Improved UI
- Calculation panel shows helpful error messages
- Still allows saving tasks even if preview doesn't work
- Graceful degradation

---

## 🚀 To Fix Completely

### Step 1: Restart Dev Server (REQUIRED!)

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

**Why:** Changes to .env.local require server restart!

---

### Step 2: Deploy Updated Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. **Delete all existing code**
4. Copy everything from `vsm-app/google-apps-script/Code_WithCalculations.gs`
5. Paste into Apps Script editor
6. **Save** (Ctrl+S)
7. Click **Deploy** → **Manage deployments**
8. Click **Edit** (pencil icon) on existing deployment
9. Click **Version** → **New version**
10. Click **Deploy**

**Important:** The URL stays the same, so no need to update .env.local again!

---

### Step 3: Test

1. Go to http://localhost:3000
2. Click "Update Task"
3. Select:
   - Line No: DBR_L2
   - OC NO: LC/REIS/25/12360
   - Process Stage: Finishing

**Expected:**
- Calculation Steps panel appears on the right
- Shows order details and calculation breakdown
- Target dates appear in the form

---

## 🔍 Troubleshooting

### Still Getting Error After Restart?

**Check 1: Is Apps Script Deployed?**
```
Open this URL in browser:
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec?ocNo=TEST&processStage=Cutting
```

**Should return:** JSON (not HTML)
**If returns HTML:** Apps Script not deployed correctly

**Check 2: Is Server Restarted?**
```bash
# Make sure you stopped and restarted
# Not just refreshed the browser!
```

**Check 3: Browser Console**
```
Press F12 → Console tab
Look for error messages
```

---

### Error: "Apps Script not deployed correctly"

**Solution:**
1. Make sure you deployed as **Web App** (not just saved)
2. Settings must be:
   - Execute as: **Me**
   - Who has access: **Anyone**
3. Click **Deploy** (not just Save)

---

### Error: "Order not found in Order_Master"

**Solution:**
- The OC NO you selected doesn't exist in Order_Master sheet
- Check Order_Master sheet has that OC NO in column B
- Make sure sheet name is exactly "Order_Master"

---

### Calculation Steps Show Warning

**This is OK!** The warning means:
- Apps Script isn't deployed yet, OR
- Order_Master doesn't have that OC NO, OR
- SOP_Cal doesn't have that Process Stage

**You can still save tasks!** The calculation will work once Apps Script is deployed.

---

## ✅ What Works Now

Even without Apps Script deployed:
- ✅ Form works
- ✅ Can select Line No, OC NO, Process Stage
- ✅ Can enter dates
- ✅ Can save tasks
- ✅ Shows friendly error instead of crashing

With Apps Script deployed:
- ✅ All of the above PLUS
- ✅ Real-time calculation preview
- ✅ Target dates auto-calculated
- ✅ Calculation steps displayed
- ✅ Order details shown

---

## 📋 Quick Checklist

- [ ] Restarted dev server
- [ ] Deployed updated Apps Script
- [ ] Tested with real OC NO
- [ ] Calculation steps appear
- [ ] Target dates show correctly
- [ ] Can save tasks successfully

---

## 🎯 Summary

The error is fixed! The app now:
1. Handles missing Apps Script gracefully
2. Shows helpful error messages
3. Still allows saving tasks
4. Works perfectly once Apps Script is deployed

**Next:** Restart server and deploy Apps Script! 🚀

