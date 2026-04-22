# 🚨 CRITICAL DEPLOYMENT INSTRUCTIONS - READ CAREFULLY

## 🔴 THE PROBLEM (CONFIRMED)

Your system is showing:
```
📊 All Process Stages (67):
```

This PROVES the old broken code is still running. It should say:
```
📊 All Process Stages (11):
```

## ✅ THE FIX (FOLLOW EXACTLY)

### STEP 1: DELETE OLD FILES FROM APPS SCRIPT ⚠️

**YOU MUST DELETE THESE OLD FILES:**

1. Open your Google Apps Script Editor
2. Look for these files in the left sidebar:
   - `Code_WithCalculations.gs` ❌ DELETE THIS
   - `Code_WithCalculations_FIXED.gs` ❌ DELETE THIS (if exists)
   - Any other `.gs` files except the one you're about to create

**WHY:** Apps Script can have multiple files, and if `getAllProcessStages()` exists in multiple files, it causes conflicts.

### STEP 2: CREATE CLEAN PROJECT

1. In Apps Script Editor, create a NEW file called `Code.gs`
2. Copy the ENTIRE content from `Code_WithCalculations_FIXED_V2.gs` (this file in your workspace)
3. Paste it into `Code.gs`
4. Save (Ctrl+S)

### STEP 3: VERIFY THE HARD ASSERT IS THERE

Search for this text in your Apps Script `Code.gs`:
```javascript
if (allStages.length !== 11) {
  throw new Error(
```

If you DON'T see this, the copy failed. Try again.

### STEP 4: DELETE ALL OLD DEPLOYMENTS ⚠️

**THIS IS THE MOST CRITICAL STEP:**

1. In Apps Script Editor, click "Deploy" (top right)
2. Click "Manage deployments"
3. For EACH deployment listed:
   - Click the ⋮ (three dots)
   - Click "Archive" or "Delete"
4. Delete/Archive ALL of them
5. Close the dialog

**WHY:** Old deployments keep running old code even after you edit the script.

### STEP 5: CREATE NEW DEPLOYMENT

1. Click "Deploy" → "New deployment"
2. Click the gear icon ⚙️ next to "Select type"
3. Select "Web app"
4. Settings:
   - Description: "Fixed 11-Stage Engine"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click "Deploy"
6. Click "Authorize access" (if prompted)
7. **COPY THE NEW WEB APP URL** (it will be different from before)

### STEP 6: UPDATE .ENV.LOCAL

1. Open `vsm-app/.env.local`
2. Update the URL:
   ```
   NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=YOUR_NEW_URL_HERE
   ```
3. Save the file
4. Restart your dev server (Ctrl+C, then `npm run dev`)

### STEP 7: TEST THE FIX

1. Go to http://localhost:3000
2. Fill in the form:
   - Line No: (select any)
   - OC NO: (select any)
   - Process Stage: **Inspection**
3. Look at the "Calculation Steps" panel

**EXPECTED OUTPUT:**
```
📊 All Process Stages (11):
  1. Fabric Inhouse
  2. Fabric QC
  3. File Release
  4. Pre-Production
  5. CAD / Pattern
  6. Cutting
  7. Sewing
  8. Washing
  9. Finishing
  10. Inspection
  11. Dispatch

🎯 Current Process: Inspection (Seq: 10)

📈 Remaining Processes (2):
  10. Inspection: X days
  11. Dispatch: Y days
```

**WRONG OUTPUT (if you see this, deployment failed):**
```
📊 All Process Stages (67):
  ... lots of repeated stages ...
```

### STEP 8: IF IT STILL SHOWS 67 STAGES

The hard assert will now CRASH the system with this error:
```
CRITICAL BUG: Expected 11 process stages, got 67
```

This means:
1. You didn't delete the old files from Apps Script
2. You didn't delete the old deployments
3. You're using the old Web App URL

**GO BACK TO STEP 1 AND DO IT AGAIN.**

## 🎯 WHAT SUCCESS LOOKS LIKE

When you select "Inspection" as the process stage, you should see:

```
📈 Remaining Processes (2):
  10. Inspection: 2.5 days
  11. Dispatch: 1.7 days

📊 Total SOP Lead Time: 4.2 days

🔙 Calculating backwards from Delivery Date:
  11. Dispatch:
     Current End Date: 2024-03-15
     Subtract SOP LT: 1.7 days
     Target Start: 2024-03-13
     Target End: 2024-03-15

  10. Inspection:
     Current End Date: 2024-03-13
     Subtract SOP LT: 2.5 days
     Target Start: 2024-03-10
     Target End: 2024-03-13
```

**NOT:**
```
📈 Remaining Processes (10):  ❌ WRONG
  10. Inspection: 2.5 days
  10. Inspection: 2.5 days
  10. Inspection: 2.5 days
  ... (repeated 5 times)
```

## 🔥 CHECKLIST (DO NOT SKIP)

- [ ] Deleted old `.gs` files from Apps Script
- [ ] Created new `Code.gs` with content from `Code_WithCalculations_FIXED_V2.gs`
- [ ] Verified hard assert is in the code (`if (allStages.length !== 11)`)
- [ ] Deleted ALL old deployments
- [ ] Created NEW deployment
- [ ] Copied NEW Web App URL
- [ ] Updated `.env.local` with new URL
- [ ] Restarted dev server
- [ ] Tested and saw "All Process Stages (11)"
- [ ] Verified only 2 remaining processes for Inspection (not 10)

## 📞 IF YOU STILL HAVE ISSUES

The hard assert will tell you exactly what's wrong. If you see:
- "Expected 11 process stages, got 67" → Old code is still running
- "Expected 11 process stages, got 0" → Function not found
- No error but wrong output → Using old Web App URL

**The fix is simple: DELETE EVERYTHING and start fresh.**
