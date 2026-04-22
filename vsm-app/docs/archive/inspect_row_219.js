const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectRow219() {
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
            range: 'VSM_Execution!A219:V219',
        });
        console.log("Row 219:", JSON.stringify(response.data.values ? response.data.values[0] : []));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectRow219();
