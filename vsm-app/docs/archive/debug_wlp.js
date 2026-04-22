const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkSheets() {
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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A1:AA5',
        });

        const rows = response.data.values || [];
        console.log("WLP Rows fetched:", rows.length);
        rows.forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSheets();
