const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkDirectAuth() {
    try {
        console.log("Testing direct Google Sheets Auth...");
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
        const sheets = google.sheets({ version: 'v4', auth });

        // Try to fetch headers from a known sheet
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        console.log(`Using spreadsheetId: ${spreadsheetId}`);

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'A1:Z1',
        });

        console.log("SUCCESS! Connected to Google Sheets directly.");
        console.log("Headers found:", res.data.values ? res.data.values[0] : "No data");

    } catch (err) {
        console.error("DIAGNOSTIC FAILED:");
        console.error(err);
    }
}

checkDirectAuth();
