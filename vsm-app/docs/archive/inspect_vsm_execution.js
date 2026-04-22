const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectVsmExecution() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.DBR_GOOGLE_SHEET_ID;

        // Inspect rows 1-20 from VSM_Execution
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'VSM_Execution!A1:V20',
        });
        const rows = response.data.values || [];
        console.log("\n--- VSM_Execution (Rows 1-20) ---");
        rows.forEach((row, i) => console.log(`${i + 1}:`, JSON.stringify(row)));

        if (rows.length > 0) {
            console.log("\nTotal rows in VSM_Execution:", rows.length);
        } else {
            console.log("\nVSM_Execution sheet is EMPTY or only has headers.");
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectVsmExecution();
