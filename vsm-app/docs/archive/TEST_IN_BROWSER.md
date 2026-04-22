# 🧪 TEST APPS SCRIPT IN BROWSER

Since the Node.js test failed, let's test directly in the browser.

## Step 1: Test Apps Script URL Directly

1. Open this URL in your browser:
   ```
   https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec
   ```

2. **Expected result:**
   ```json
   {"success":false,"error":"Missing ocNo or processStage parameter"}
   ```

3. **If you see this instead:**
   - HTML page → Wrong deployment (not deployed as Web App)
   - "Authorization required" → Permissions not set to "Anyone"
   - Connection error → URL is wrong

---

## Step 2: Test from Browser Console

1. Go to http://localhost:3000
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this code and press Enter:

```javascript
fetch('https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lineNo: 'TEST_LINE',
    ocNo: 'LC/DMN/25/12270',
    orderNo: 'TEST_ORDER',
    processStage: 'Sewing',
    actualStartDate: '2026-01-20',
    actualEndDate: '2026-01-25',
    delayReason: ''
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.success) {
    console.log('🎉 SUCCESS! Data was saved to row:', data.row);
  } else {
    console.log('❌ Error:', data.error);
  }
})
.catch(err => console.error('❌ Connection failed:', err));
```

---

## Step 3: Test the Form Submission

1. Stay on http://localhost:3000
2. Keep Developer Tools open (F12)
3. Go to **Console** tab
4. Fill in the form:
   - Line No: DBR_L1
   - OC NO: LC/DMN/25/12270
   - Order No: 12270
   - Process Stage: Sewing
   - Actual Start Date: 2026-01-20
   - Actual End Date: 2026-01-25
5. Click **Save Task**
6. Watch the console for messages

**Look for:**
- 📥 Received task data
- 📤 Sending to Apps Script
- 📨 Apps Script response
- ✅ Success message OR ❌ Error message

---

## What Each Result Means:

### ✅ If you see: `{"success":true,"row":25}`
**PERFECT!** Data is being saved. Check VSM_execution sheet for new row.

### ❌ If you see: `{"success":false,"error":"Order not found"}`
**Issue:** OC NO doesn't exist in Order_Master sheet.
**Fix:** Use an OC NO that exists in your Order_Master sheet.

### ❌ If you see: HTML page
**Issue:** Apps Script not deployed as Web App.
**Fix:** 
1. Open Apps Script editor
2. Deploy → Manage deployments
3. Make sure it's deployed as **Web app** (not API executable)

### ❌ If you see: "Authorization required"
**Issue:** Permissions not set correctly.
**Fix:**
1. Deploy → Manage deployments
2. Edit deployment
3. "Who has access" → **Anyone**
4. Deploy

### ❌ If you see: Connection error / CORS error
**Issue:** URL is wrong or Apps Script not accessible.
**Fix:**
1. Check the URL in `.env.local`
2. Make sure it ends with `/exec`
3. Try accessing URL directly in browser

---

## Quick Checklist:

- [ ] Apps Script URL opens in browser (shows JSON error, not HTML)
- [ ] Browser console test returns JSON response
- [ ] Form submission shows console logs
- [ ] New row appears in VSM_execution sheet
- [ ] No #VALUE! errors in calculated fields

---

## Next Steps After Testing:

If the browser test works but form doesn't save:
→ Check browser console for error messages

If browser test fails:
→ Apps Script deployment issue (follow fixes above)

If everything works but shows #VALUE! errors:
→ Deploy updated code from `Code_WithCalculations_FIXED_V2.gs`
