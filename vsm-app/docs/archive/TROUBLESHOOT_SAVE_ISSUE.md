# 🔍 TROUBLESHOOTING: Data Not Saving to VSM_execution

## Current Issue
Form submissions are not creating new rows in VSM_execution sheet.

---

## Step 1: Test Apps Script Connection Directly

Run this command in the terminal:

```bash
cd vsm-app
node test-apps-script-connection.js
```

### Expected Output:
```
✅ SUCCESS - Data was saved to VSM_execution sheet!
   Row: 25
   Action: created
```

### If you see errors:
- **"Connection error"** → Apps Script URL is wrong or not accessible
- **"Failed to parse as JSON"** → Apps Script is returning HTML (wrong deployment)
- **"Apps Script returned error"** → Check the error message for details

---

## Step 2: Check Apps Script Deployment

1. Open Google Apps Script: https://script.google.com/home
2. Find your VSM project
3. Click **Deploy** → **Manage deployments**
4. Verify:
   - ✅ Type: **Web app**
   - ✅ Execute as: **Me**
   - ✅ Who has access: **Anyone** (CRITICAL!)
   - ✅ URL matches the one in `.env.local`

### If "Who has access" is NOT "Anyone":
1. Click **Edit** (pencil icon)
2. Change "Who has access" to **Anyone**
3. Click **Deploy**
4. Copy the new URL
5. Update `.env.local` with new URL

---

## Step 3: Verify Code is Deployed

In Apps Script editor:

1. Check if `Code.gs` contains the updated code
2. Look for this function signature:
   ```javascript
   function lookupSopLeadTime(processStage, washCategory, qtyBand, productType, orderType)
   ```
3. Look for this line in `calculateRowFields()`:
   ```javascript
   const drvQtyBand = row[COL.QTY_BAND - 1] || 'All';
   ```

### If code is different:
1. Copy entire content from `vsm-app/google-apps-script/Code_WithCalculations_FIXED_V2.gs`
2. Paste into `Code.gs` in Apps Script
3. Save (Ctrl+S)
4. Deploy as **New version**

---

## Step 4: Check Browser Console

1. Open http://localhost:3000
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Fill and submit the form
5. Look for messages starting with 📥, 📤, 📨

### What to look for:
- ✅ `📥 Received task data:` → Frontend is working
- ✅ `📤 Sending to Apps Script...` → API route is working
- ✅ `📨 Apps Script response status: 200` → Connection successful
- ❌ `❌ Missing required fields` → Form data incomplete
- ❌ `❌ Apps Script returned error` → Check error message

---

## Step 5: Check Apps Script Execution Logs

1. Open Apps Script editor
2. Click **Executions** (left sidebar, clock icon)
3. Look for recent executions
4. Click on the latest one to see logs

### What to look for:
- ✅ Execution completed successfully
- ❌ Error message → Read the error details
- ❌ No executions → Apps Script is not being called

---

## Step 6: Verify Environment Variables

Check `.env.local`:

```bash
# Should have this line:
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Test:
1. Copy the URL from `.env.local`
2. Open it in a browser
3. You should see: `{"success":false,"error":"Missing ocNo or processStage parameter"}`
4. If you see HTML or "Authorization required" → Wrong deployment settings

---

## Step 7: Restart Dev Server

Sometimes environment variables don't reload:

```bash
# Stop the dev server (Ctrl+C in terminal)
# Then restart:
cd vsm-app
npm run dev
```

---

## Step 8: Test with Postman/cURL

Test the API directly:

```bash
curl -X POST http://localhost:3000/api/update-task \
  -H "Content-Type: application/json" \
  -d '{
    "lineNo": "TEST_LINE",
    "ocNo": "LC/DMN/25/12270",
    "orderNo": "TEST_ORDER",
    "processStage": "Sewing",
    "actualStartDate": "2026-01-20",
    "actualEndDate": "2026-01-25",
    "delayReason": ""
  }'
```

### Expected response:
```json
{
  "success": true,
  "message": "Task saved successfully"
}
```

---

## Common Issues & Solutions

### Issue 1: "Authorization required" when accessing Apps Script URL
**Solution:** Deploy with "Who has access" = **Anyone**

### Issue 2: Apps Script returns HTML instead of JSON
**Solution:** Wrong deployment type. Must be deployed as **Web app**, not **API executable**

### Issue 3: "Missing required fields" error
**Solution:** Check form data. All fields must be filled:
- lineNo
- ocNo
- orderNo (might be missing!)
- processStage
- actualStartDate
- actualEndDate

### Issue 4: Data saves but shows #VALUE! errors
**Solution:** Old code is deployed. Deploy new version with updated code.

### Issue 5: Connection timeout
**Solution:** 
1. Check internet connection
2. Verify Apps Script URL is correct
3. Try accessing URL directly in browser

---

## Quick Checklist

- [ ] Apps Script deployed as **Web app**
- [ ] "Who has access" set to **Anyone**
- [ ] Latest code copied to Apps Script
- [ ] Deployed as **New version**
- [ ] `.env.local` has correct URL
- [ ] Dev server restarted after changing `.env.local`
- [ ] Browser console shows no errors
- [ ] Apps Script execution logs show successful runs
- [ ] Test script (`test-apps-script-connection.js`) works

---

## Still Not Working?

Run all diagnostic commands:

```bash
# 1. Test Apps Script connection
node test-apps-script-connection.js

# 2. Check environment variables
cat .env.local | grep GOOGLE_APPS_SCRIPT_URL

# 3. Test API route
curl -X POST http://localhost:3000/api/update-task \
  -H "Content-Type: application/json" \
  -d '{"lineNo":"TEST","ocNo":"LC/DMN/25/12270","orderNo":"TEST","processStage":"Sewing","actualStartDate":"2026-01-20","actualEndDate":"2026-01-25","delayReason":""}'
```

Share the output of these commands for further debugging.
