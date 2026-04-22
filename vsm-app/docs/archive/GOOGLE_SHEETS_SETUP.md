# Google Sheets Integration Setup Guide

## Prerequisites
- A Google Cloud Platform account
- A Google Sheet with your production data

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Name: `vsm-sheets-reader` (or any name you prefer)
   - Description: Service account for reading production data
4. Click "Create and Continue"
5. Skip the optional role assignment (click "Continue")
6. Click "Done"

## Step 3: Generate Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" → "Create New Key"
4. Choose **JSON** format
5. Click "Create" - this will download a JSON file

## Step 4: Extract Credentials

Open the downloaded JSON file and find these values:
- `client_email` → This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → This is your `GOOGLE_PRIVATE_KEY`

## Step 5: Prepare Your Google Sheet

### Sheet Structure
Your Google Sheet should have the following columns (in order):

| Column | Header | Description |
|--------|--------|-------------|
| A | OC No | Order/OC Number |
| B | Order No | Order Number |
| C | Product Type | Type of product (e.g., "Enzyme Wash", "Garment Dyed") |
| D | Process Stage | Current stage in production |
| E | Process Status | Status (e.g., "Completed – On Time", "Completed – Delayed") |
| F | Variance | Days variance (number) |
| G | Delay Reason | Reason for delay (if any) |
| H | Risk Level | Risk level ("High", "Medium", "Low") |
| I | Process Time | Process time in days (number) |
| J | Waiting Time | Waiting time in days (number) |

### Example Data Format:
```
OC No          | Order No  | Product Type | Process Stage    | Process Status        | Variance | Delay Reason       | Risk Level | Process Time | Waiting Time
PRLS/25/10600  | ORD10000  | Enzyme Wash  | Fabric Inhouse   | Completed – Delayed   | 1        | Machine Breakdown  | High       | 2            | 3
PRLS/25/10601  | ORD10001  | Garment Dyed | Finishing        | Completed – On Time   | 0        |                    | Low        | 6            | 1
```

## Step 6: Share Your Sheet

1. Open your Google Sheet
2. Click the "Share" button
3. Add the service account email (from `client_email` in your JSON file)
4. Grant **Viewer** permission
5. Click "Send"

## Step 7: Get Your Sheet ID

Your Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

## Step 8: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your_spreadsheet_id_here
   GOOGLE_SHEET_RANGE=Sheet1!A2:J
   ```

   **Important Notes:**
   - Keep the quotes around `GOOGLE_PRIVATE_KEY`
   - Keep the `\n` characters in the private key
   - Make sure there are no extra spaces or line breaks

## Step 9: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to your app
3. The dashboard should now load data from your Google Sheet

## Troubleshooting

### "Failed to fetch data from Google Sheets"
- Verify that the service account email has access to your sheet
- Check that all environment variables are set correctly
- Ensure the Google Sheets API is enabled in your Google Cloud project

### "No data showing"
- Check the sheet range in your `.env.local` file
- Verify the sheet name matches (default is "Sheet1")
- Ensure your data starts from row 2 (row 1 should be headers)

### "Private key error"
- Make sure the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the key
- Ensure the key is wrapped in quotes

## For Vercel Deployment

When deploying to Vercel:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add all four environment variables:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_RANGE`
4. Redeploy your application

**Note:** For the private key in Vercel, paste the entire key including the BEGIN and END markers, with literal `\n` characters (not actual line breaks).
