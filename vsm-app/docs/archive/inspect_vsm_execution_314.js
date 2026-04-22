const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectVsmExecutionRow314() {
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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'VSM_Execution!A310:V320',
        });
        console.log("\n--- VSM_Execution (Rows 310-320) ---");
        response.data.values?.forEach((row, i) => console.log(`${310 + i}:`, JSON.stringify(row)));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectVsmExecutionRow314();
