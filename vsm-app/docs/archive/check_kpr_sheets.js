const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkKprSheets() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.KPR_GOOGLE_SHEET_ID;

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
        console.log("KPR Sheets:", sheetNames);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkKprSheets();
