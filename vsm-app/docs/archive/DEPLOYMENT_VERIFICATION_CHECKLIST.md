# 🔍 Apps Script Deployment Verification Checklist

## The Problem
Your Apps Script URL shows "Site not reachable" which means **the script is NOT deployed to Google's servers**.

## Current URL (Not Working)
```
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
```

---

## ✅ Step-by-Step Deployment Verification

### Step 1: Open Apps Script Editor
1. Go to: https://docs.google.com/spreadsheets/d/1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0
2. Click: **Extensions** → **Apps Script**
3. A new tab opens with the Apps Script editor

**Verify:** You see the Apps Script editor with Code.gs file

---

### Step 2: Check the Code
1. Look at Code.gs file
2. Scroll through the code

**Verify these things:**
- [ ] File starts with `function doGet(e) {`
- [ ] File is VERY LONG (scroll down - should be 1500+ lines)
- [ ] File ends with closing braces `}`
- [ ] No red error marks in the editor

**If code is missing or short:**
1. Delete all code (Ctrl+A, Delete)
2. Open: `C:\Users\tejas\OneDrive\Documents\GitHub\VSM\vsm-app\google-apps-script\Code_WithCalculations_FIXED_V2.gs`
3. Copy ALL code (Ctrl+A, Ctrl+C)
4. Paste into Code.gs (Ctrl+V)
5. Save (Ctrl+S)

---

### Step 3: Save the Code
1. Press **Ctrl+S** OR click the disk icon 💾
2. Wait for "Saved" message at top

**Verify:** You see "Saved" message (not "Saving...")

---

### Step 4: Check for Existing Deployments
1. Click **Deploy** button (top right)
2. Click **Manage deployments**

**What do you see?**
- **No deployments listed** = You need to create one (go to Step 5)
- **One or more deployments listed** = Note the deployment ID and go to Step 6

---

### Step 5: Create New Deployment
1. Click **Deploy** → **New deployment**
2. Click the **gear icon ⚙️** next to "Select type"
3. Choose **Web app**
4. Fill in:
   - **Description:** VSM System
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**

**If authorization prompt appears:**
1. Click **Authorize access**
2. Choose your Google account
3. Click **Advanced**
4. Click **Go to VSM System (unsafe)**
5. Click **Allow**

**After deployment:**
1. You'll see a URL like: `https://script.google.com/macros/s/AKfycbw.../exec`
2. **COPY THIS URL** - you'll need it!
3. Click **Done**

---

### Step 6: Test the Deployment URL
1. Copy the deployment URL from Step 5
2. Open a NEW browser tab
3. Paste the URL and add this to the end:
   ```
   ?ocNo=TEST&processStage=Test
   ```
4. Press Enter

**What do you see?**
- **JSON response** (like `{"success":true...}`) = ✅ WORKING!
- **HTML page or error** = ❌ Not working
- **"Site not reachable"** = ❌ Not deployed
- **Authorization prompt** = Click through authorization

---

### Step 7: Update .env.local (If URL Changed)
**Only do this if you got a NEW URL in Step 5!**

If your new URL is DIFFERENT from:
```
https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
```

Then:
1. Open `vsm-app/.env.local`
2. Replace BOTH URLs with your new one:
   ```
   GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
   ```
3. Save the file
4. Restart dev server

---

## 🚨 Common Issues

### Issue 1: "Site not reachable"
**Cause:** Script not deployed at all
**Solution:** Follow Steps 1-6 above

### Issue 2: "Authorization required"
**Cause:** Script needs authorization
**Solution:** Open the URL in browser and click through authorization prompts

### Issue 3: Returns HTML instead of JSON
**Cause:** Deployed as wrong type (not Web app)
**Solution:** 
1. Delete the deployment (Deploy → Manage deployments → Delete)
2. Create new deployment as "Web app" (Step 5)

### Issue 4: "Script function not found: doGet"
**Cause:** Code not copied completely
**Solution:** 
1. Delete all code in Code.gs
2. Copy ALL code from Code_WithCalculations_FIXED_V2.gs (1500+ lines)
3. Paste and save
4. Deploy again

---

## ✅ Success Checklist

Once deployed correctly, you should have:
- [ ] Code.gs file with 1500+ lines of code
- [ ] "Saved" message showing in Apps Script editor
- [ ] Deployment listed in "Manage deployments"
- [ ] Deployment URL that returns JSON (not "site not reachable")
- [ ] Target dates appearing in your app at http://localhost:3000

---

## 📞 What to Tell Me

After following these steps, tell me:

1. **What do you see in Step 4?** (Existing deployments or none?)
2. **What URL did you get in Step 5?** (Copy the full URL)
3. **What happens in Step 6?** (JSON, HTML, or error?)

This will help me understand exactly what's happening!

---

Generated: February 1, 2026
