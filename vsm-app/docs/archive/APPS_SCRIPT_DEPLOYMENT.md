# Google Apps Script Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Open Your Google Sheet
1. Open the Google Sheet that ontains your production data (VSM_Execution sheet)
2. Make sure your main data sheet has these columns (in order):
   - **Column A**: Line No
   - **Column B**: OC NO
   - **Column C**: Order No
   - **Column D**: Product Type
   - **Column E**: Delivery Date
   - **Column F**: Process Seq
   - **Column G**: Process Stage
   - **Column H**: VA / NVA
   - **Column I**: SOP Lead Time (Days)
   - **Column J**: Target Start Date
   - **Column K**: Target End Date
   - **Column L**: Actual Start Date
   - **Column M**: Actual End Date
   - **Column N**: Process Status
   - **Column O**: Process Time (Days)
   - **Column P**: Waiting Time (Days)
   - **Column Q**: Variance (Days)
   - **Column R**: Delay Reason Category
   - **Column S**: Alert Triggered
   - **Column T**: Delay Flag
   - **Column U**: Delay Reason
   - **Column V**: Risk Level
   - **Column W**: Exec_Key
3. Also ensure you have these sheets:
   - **Line_Master**: Column A = Line names (DBR_L1, DBR_L2, etc.)
   - **OC_Filtered_List**: Column A = Line, Column B = OC NO
   - **Process_List**: Column A = Process Stage names
   - **Factory_master**: Column A = Factory Name, Column B = Factory Code
4. Row 1 should have headers, data starts from Row 2

### Step 2: Create Apps Script
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. You'll see a code editor with a default `myFunction`
3. **Delete all the existing code**
4. Open the file `google-apps-script/Code.gs` from this project
5. **Copy all the code** from that file
6. **Paste it** into the Apps Script editor
7. (Optional) If your main data sheet name is not "VSM_Execution", update line 26:
   ```javascript
   const SHEET_NAME = 'Your Sheet Name Here';
   ```

### Step 3: Test the Script (Optional)
1. In the Apps Script editor, select `testAPI` from the function dropdown
2. Click the **Run** button (▶️)
3. You may need to authorize the script (click "Review Permissions")
4. Check the "Execution log" at the bottom - you should see your data in JSON format

### Step 4: Deploy as Web App
1. Click the **Deploy** button (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: `VSM Production Data API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone`
5. Click **Deploy**
6. You may need to authorize access:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project] (unsafe)**
   - Click **Allow**
7. Copy the **Web app URL** (it will look like):
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

### Step 5: Configure Your App
1. Open the `.env.local` file in your VSM project
2. Paste the Web App URL:
   ```env
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   # Production data endpoint (for reading data)
   GOOGLE_APPS_SCRIPT_URL=paste_your_web_app_url_here
   ```
3. Save the file

### Step 6: Start Your App
```bash
npm run dev
```

Your dashboard should now load data from Google Sheets! 🎉

## Features Enabled

### ✅ Read Production Data
The dashboard reads data from `VSM_Execution` sheet and displays it in charts and tables.

### ✅ Update Tasks
The "Update Task" feature allows you to:
- Select a line from Line_Master
- Choose an OC NO from OC_Filtered_List (filtered by selected line)
- Select a process stage from Process_List
- Enter actual start and end dates
- Add delay reasons

When you save a task update, it will:
- Update the Actual Start Date (Column L)
- Update the Actual End Date (Column M)
- Update the Delay Reason (Column U)
- Calculate and update Process Time (Column O)
- Calculate variance against target dates (Column Q)
- Set Delay Flag (Column T) based on variance
- Update Process Status to "Completed" (Column N)

## Testing the API

### Test Reading Data
1. Open the Web App URL in your browser
2. You should see JSON data with your production information

### Test Updating Tasks
1. Use the dashboard's "Update Task" feature
2. Fill in the form and click "Save Task"
3. Check your Google Sheet to see the updated values

## Updating Your Data

Just update your Google Sheet normally. The changes will be reflected in your dashboard automatically (you may need to refresh the page).

## Troubleshooting

### "Script not found" or 404 error
- Make sure you deployed the script as a Web App (not as API Executable)
- Check that "Who has access" is set to "Anyone"

### "Authorization required" error
- Make sure you authorized the script when deploying
- The "Execute as" should be set to "Me"

### No data showing
- Check that your sheet name matches the `SHEET_NAME` variable in the script
- Verify your data starts from row 2 (row 1 is headers)
- Check column order matches the expected structure

### "CORS error" in browser console
- Apps Script automatically handles CORS, but if you see this error:
- Redeploy the script (Deploy → Manage deployments → Edit → New version)

## Making Changes to the Script

If you need to modify the script:
1. Edit the code in the Apps Script editor
2. Click **Deploy** → **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Under "Version", select **New version**
5. Click **Deploy**
6. The Web App URL stays the same (no need to update .env.local)

## For Vercel Deployment

When deploying to Vercel:
1. Go to your Vercel project settings
2. Add environment variable:
   - **Name**: `GOOGLE_APPS_SCRIPT_URL`
   - **Value**: Your Web App URL
3. Redeploy your application

## Security Notes

- The Apps Script runs under your Google account
- Anyone with the URL can read your data (but cannot modify it)
- If you need more security, change "Who has access" to "Only myself" and implement authentication
- Never commit the Web App URL to public repositories if your data is sensitive
