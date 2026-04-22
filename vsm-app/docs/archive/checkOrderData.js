const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkOrderData() {
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

        console.log("Fetching Order_Master data...");
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:J20',
        });

        const rows = response.data.values || [];
        console.log("Rows in Order_Master (first 20):");
        rows.forEach((row, i) => {
            console.log(`Row ${i + 1}: OC=${row[2]} | Qty=${row[5]} | FR=${row[8]} | RevisedFR=${row[9]}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOrderData();
