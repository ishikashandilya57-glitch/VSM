const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectRows() {
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

        // Inspect rows 310-330 from Order_Master
        const omResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A310:H330',
        });
        console.log("\n--- Order_Master (310-330) ---");
        omResponse.data.values?.forEach((row, i) => console.log(`${310 + i}:`, JSON.stringify(row)));

        // Inspect rows 310-330 from WLP_RAW_All_Lines
        const wlpResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A310:V330',
        });
        console.log("\n--- WLP_RAW_All_Lines (310-330) ---");
        wlpResponse.data.values?.forEach((row, i) => console.log(`${310 + i}:`, JSON.stringify(row)));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectRows();
