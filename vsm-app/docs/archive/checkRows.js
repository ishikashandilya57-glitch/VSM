const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkSheet() {
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

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A:A',
        });

        console.log(`WLP_RAW_All_Lines has ${res.data.values ? res.data.values.length : 0} rows.`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkSheet();
