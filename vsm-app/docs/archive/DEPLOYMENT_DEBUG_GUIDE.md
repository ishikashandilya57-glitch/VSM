# 🔧 Apps Script Deployment Debug Guide

## Current Situation

**Problem:** Target dates showing "N/A" in your app
**Root Cause:** Apps Script not deployed correctly to Google's servers
**Evidence:** Test shows "FETCH FAILED" or returns HTML instead of JSON

---

## Quick Test

1. Open `TEST_DEPLOYMENT_NOW.html` in your browser
2. Click "Run All Tests"
3. See results:
   - ✅ GREEN = Working! You're done!
   - ❌ RED = Not deployed correctly, follow steps below

---

## Step-by-Step Deployment (5 Minutes)

### Step 1: Open Google Sheet
Go to: https://docs.google.com/spreadsheets/d/1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0

### Step 2: Open Apps Script Editor
Click: **Extensions** → **Apps Script**

A new tab opens with the Apps Script editor.

### Step 3: Clear Old Code
In the Code.gs file:
- Press `Ctrl+A` (select all)
- Press `Delete`

The file should now be empty.

### Step 4: Copy New Code
On your computer:
1. Open: `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
2. Press `Ctrl+A` (select all)
3. Press `Ctrl+C` (copy)

**IMPORTANT:** This file is 1500+ lines. Make sure you copy ALL of it!

### Step 5: Paste Code
Back in Apps Script editor (Code.gs):
- Press `Ctrl+V` (paste)
- You should see a LOT of code appear
- Scroll down to verify it's all there

### Step 6: Save
- Press `Ctrl+S`
- OR click the disk icon 💾
- Wait for "Saved" message to appear at top

### Step 7: Deploy
At the top right:
1. Click **Deploy** button
2. Select **New deployment**

### Step 8: Select Type
In the deployment dialog:
1. Click the gear icon ⚙️ next to "Select type"
2. Choose **Web app**

### Step 9: Configure Settings
Fill in these settings:

**Description:** VSM System (or anything you want)

**Execute as:** Me (your email will show)

**Who has access:** Anyone

### Step 10: Deploy
Click the blue **Deploy** button

### Step 11: Authorize (If Asked)
If Google asks for authorization:
1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced**
4. Click **Go to VSM System (unsafe)**
5. Click **Allow**

### Step 12: Get URL
After deployment:
1. You'll see a URL like: `https://script.google.com/macros/s/AKfycbw.../exec`
2. Click **Copy** to copy the URL
3. Click **Done**

### Step 13: Update .env.local (Only if URL Changed)
If you got a NEW URL (different from the current one):
1. Open `vsm-app/.env.local`
2. Update both lines:
```
GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
```
3. Save the file
4. Restart your dev server

**Current URL in .env.local:**
```
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
```

If your new URL is the same, no need to update!

---

## Verify Deployment

### Method 1: Use Test Tool
1. Open `TEST_DEPLOYMENT_NOW.html` in browser
2. Click "Run All Tests"
3. Should see ✅ SUCCESS

### Method 2: Browser Test
Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec?ocNo=PRLS/25/12973&processStage=CAD / Pattern
```

**Expected:** JSON response like:
```json
{
  "success": true,
  "calculation": { ... }
}
```

**If you see HTML or error:** Deployment didn't work, try again.

### Method 3: Check Your App
1. Go to http://localhost:3000
2. Select OC Number: PRLS/25/12973
3. Select Process: Pre-Production
4. Target dates should appear (not "N/A")

---

## Common Issues

### Issue 1: "FETCH FAILED"
**Cause:** Apps Script not deployed at all
**Solution:** Follow deployment steps above

### Issue 2: Returns HTML Instead of JSON
**Cause:** Deployed as wrong type (not Web app)
**Solution:** 
- Delete the deployment
- Create new deployment
- Make sure to select "Web app" type

### Issue 3: "Authorization Required"
**Cause:** Didn't authorize the script
**Solution:**
- Open the deployment URL in browser
- Click through authorization prompts
- Allow all permissions

### Issue 4: Still Shows "N/A" After Deployment
**Cause:** Browser cache or dev server needs restart
**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. If still not working, restart dev server:
   ```
   cd vsm-app
   npm run dev
   ```

### Issue 5: "Script function not found: doGet"
**Cause:** Didn't copy all the code
**Solution:**
- Make sure you copied ALL 1500+ lines from Code_WithCalculations_FIXED_V2.gs
- The file should start with `function doGet(e) {`
- Scroll to the bottom to verify it's complete

---

## Deployment Checklist

Before you say "I deployed it", verify:

- [ ] Opened Apps Script editor from Google Sheet
- [ ] Deleted old code completely
- [ ] Copied ALL code from Code_WithCalculations_FIXED_V2.gs (1500+ lines)
- [ ] Pasted into Code.gs
- [ ] Saved (Ctrl+S) and saw "Saved" message
- [ ] Clicked Deploy → New deployment
- [ ] Selected "Web app" type (not API Executable)
- [ ] Set "Execute as: Me"
- [ ] Set "Who has access: Anyone"
- [ ] Clicked Deploy button
- [ ] Authorized if asked
- [ ] Got deployment URL
- [ ] Tested URL in browser (should return JSON)

If you checked all boxes and it still doesn't work, there might be an issue with the code itself.

---

## What Happens After Successful Deployment

Once deployed correctly:

1. ✅ Test tool shows SUCCESS
2. ✅ Browser test returns JSON (not HTML)
3. ✅ Target dates appear in app (not "N/A")
4. ✅ All calculations work
5. ✅ Product Type feature works
6. ✅ SOP lookups work

Everything should work immediately - no restart needed!

---

## Still Not Working?

If you followed all steps and it still doesn't work:

1. **Check Apps Script Logs:**
   - In Apps Script editor: View → Logs
   - Look for error messages

2. **Try a Fresh Deployment:**
   - Delete all existing deployments
   - Create a brand new one
   - Use a different description

3. **Verify Google Sheet Access:**
   - Make sure the sheet ID is correct
   - Make sure you have edit access to the sheet

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages

---

## Summary

**The Problem:** Apps Script code exists in your project files but NOT on Google's servers

**The Solution:** Manual deployment through Google Apps Script web interface

**Time Required:** 5 minutes

**Difficulty:** Easy (just copy/paste and click buttons)

**Once Done:** Everything works immediately!

---

Generated: February 1, 2026
