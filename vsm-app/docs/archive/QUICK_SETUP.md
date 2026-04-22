# Quick Setup Guide - Connect Your Google Sheet

## The issue: Your Google Sheet is empty or not structured correctly

Follow these steps to fix it:

## Step 1: Set Up Your Google Sheet Structure

1. **Open your Google Sheet** (the one you used for the Apps Script)

2. **In Row 1, add these EXACT headers** (in this order):

   | A | B | C | D | E | F | G | H | I | J |
   |---|---|---|---|---|---|---|---|---|---|
   | OC No | Order No | Product Type | Process Stage | Process Status | Variance | Delay Reason | Risk Level | Process Time | Waiting Time |

3. **Starting from Row 2**, add your production data

## Step 2: Quick Test with Sample Data

I've created a sample data file for you: `sample-data.csv`

**Option A: Import the CSV**
1. In your Google Sheet, go to **File → Import**
2. Upload the `sample-data.csv` file from your project folder
3. Choose "Replace current sheet"
4. Click "Import data"

**Option B: Copy-Paste Sample Data**
1. Open `sample-data.csv` in Excel or a text editor
2. Copy all the data (including headers)
3. Paste into your Google Sheet starting at cell A1

## Step 3: Verify the Apps Script Connection

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Make sure the code from `Code.gs` is there
3. Click the **Run** button (▶️) and select `testAPI`
4. Check the **Logs** (View → Logs or Ctrl+Enter) - you should see your data in JSON format

## Step 4: Check the Sheet Name

Make sure your sheet tab is named **"Sheet1"** (check the bottom tabs of your Google Sheet)

OR if it has a different name, update line 28 in your Apps Script:
```javascript
const SHEET_NAME = 'Your Actual Sheet Name';
```

Then redeploy:
- Deploy → Manage deployments → Edit (pencil icon) → New version → Deploy

## Step 5: Test the API URL

Open this URL in your browser:
```
https://script.google.com/macros/s/AKfycbwCPgBmNTlqlI6z7_J8kvo8QI32hJlxqMWJ3EJ98XxM_zpv82o1VRxXTdbDuu618bL6/exec
```

You should see JSON data like:
```json
{
  "success": true,
  "data": [
    {
      "ocNo": "PRLS/25/10600",
      "orderNo": "ORD10000",
      ...
    }
  ]
}
```

## Step 6: Refresh Your Dashboard

Once you see data from the URL above, refresh your dashboard at http://localhost:3000

## Common Issues

### "Sheet not found" error
- Check that your sheet name matches the `SHEET_NAME` in the Apps Script
- The default is "Sheet1"

### Still showing "0 orders"
- Make sure data starts from Row 2 (Row 1 should be headers)
- Check that column order matches exactly (A to J as listed above)
- Verify there are no extra empty rows at the top

### Need Help?
Share:
1. What you see when you open the Apps Script URL in browser
2. A screenshot of your Google Sheet (first few rows)
3. The name of your sheet tab
