const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function dumpHeaders() {
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

        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);

        for (const name of sheetNames) {
            try {
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: `${name}!1:1`,
                });
                const headers = response.data.values ? response.data.values[0] : [];
                console.log(`Sheet: [${name}] | Headers: ${JSON.stringify(headers)}`);
            } catch (e) {
                console.log(`Sheet: [${name}] | Error reading: ${e.message}`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

dumpHeaders();
