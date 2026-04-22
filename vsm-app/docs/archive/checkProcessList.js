const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkProcessList() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        console.log("Fetching Process_List...");
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Process_List!A1:A50',
        });

        const rows = response.data.values || [];
        console.log("Process Stages in sheet:");
        rows.forEach((row, i) => {
            console.log(`${i + 1}: [${row[0]}]`);
        });

        console.log("\nHardcoded Stages in Apps Script:");
        const hardcoded = [
            'Fabric Inhouse', 'Fabric QC', 'File Release', 'Pre-Production',
            'CAD / Pattern', 'Cutting', 'Sewing', 'Washing',
            'Finishing', 'Inspection', 'Dispatch'
        ];
        hardcoded.forEach(s => console.log(`- [${s}]`));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkProcessList();
