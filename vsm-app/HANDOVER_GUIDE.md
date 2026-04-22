# VSM Production Dashboard - Handover Guide

## 1. System Overview
The VSM (Value Stream Mapping) Production Dashboard is a real-time tracking system. 
- **Frontend**: Next.js 16 (App Router) deployed on Vercel.
- **Backend/Database**: Google Apps Script (GAS) acting as an API, reading and writing to a Google Sheet.
- **Authentication**: Service Account credentials (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) for secure Google Sheets API communication on the Next.js side.

## 2. Key Components to Hand Over

### A. Code Repository (GitHub)
- Ensure all latest changes from the `main` branch are committed and pushed.
- Transfer ownership of the GitHub repository or ensure the team has `Admin` or `Maintainer` access to it.

### B. Hosting Platform (Vercel)
- Vercel handles the Next.js frontend.
- **Action**: Invite the new team lead or developers to the Vercel Project.
- **Environment Variables**: Ensure they know where the production environment variables are stored in Vercel settings:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
  - Factory Spreadsheet IDs (`DBR_SPREADSHEET_ID`, `KPR_SPREADSHEET_ID`, etc.)

### C. Google Cloud & Google Workspace
- **Google Sheets Database**: Transfer ownership of the production Google Sheets (DBR, KPR) to a shared team drive or the new owner. DO NOT just leave it on a personal account, as it might get deleted if the account is deactivated.
- **Google Apps Script**:
  - The script (`Code.gs`, etc.) attached to the Google Sheet must be shared.
  - Show them how to deploy a new version: **Deploy > Manage Deployments > Edit > New Version > Deploy**.
- **Google Service Account**: Provide access to the Google Cloud Console project where the Service Account was created, so they can rotate the private key if needed.

## 3. Maintenance & Troubleshooting

### Updating the Google Apps Script
If changes are made to the backend logic (e.g., `Code.gs`, `PROCESS_STATUS_ENDPOINT.gs`), developers MUST deploy a new version for changes to take effect on the frontend.
- *How-to*: In the Apps Script Editor -> Deploy -> Manage Deployments -> Create new version.

### Debugging API Issues
- Use the Vercel logging dashboard to trace Next.js API route errors.
- Use Google Apps Script **"Executions"** tab on the left-hand menu to see `console.log` statements and error traces from the backend.

### Local Development Setup
Have the incoming team follow the setup instructions in `README.md`.
1. Clone the repository.
2. Ask for the `.env.local` variables from the outgoing maintainer (do NOT commit this file to Git).
3. Run `npm install` and `npm run dev`.

## 4. Final Cleanup Before Handover
- Remove any temporary scripts (e.g., `trigger_bulk_repair.js`, `tmp_test_protection.js`) from the repository if they are no longer needed.
- Remove hardcoded test values from the code.
- Ensure all API endpoints in Next.js point to the correct production App Script Web App URL and Sheet IDs.

---
**Date of Handover**: [Fill in the Date]  
**Handed over by**: [Your Name/Role]  
**Handed over to**: [Team Lead / Successor Name]
