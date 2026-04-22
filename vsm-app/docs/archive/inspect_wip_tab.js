const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectWipTab() {
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

        // Inspect headers of WIP_TAB
        const headersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WIP_TAB!1:1',
        });
        console.log("WIP_TAB Headers:", JSON.stringify(headersResponse.data.values ? headersResponse.data.values[0] : []));

        // Inspect rows 310-330 from WIP_TAB
        const rowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WIP_TAB!A310:V330',
        });
        console.log("\n--- WIP_TAB (310-330) ---");
        rowsResponse.data.values?.forEach((row, i) => console.log(`${310 + i}:`, JSON.stringify(row)));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectWipTab();
