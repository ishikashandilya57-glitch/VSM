const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function listAllSheets() {
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

        console.log("Fetching spreadsheet metadata for ID:", spreadsheetId);
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
        console.log("FULL LIST of Sheets in DBR spreadsheet:");
        sheetNames.sort().forEach(name => console.log(`- ${name}`));

    } catch (err) {
        console.error('Error details:', err);
        if (err.response) {
            console.error('Response data:', err.response.data);
        }
    }
}

listAllSheets();
