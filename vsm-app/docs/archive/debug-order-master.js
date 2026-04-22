const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkOrderMaster() {
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

        console.log("Fetching first 10 rows of Order_Master...");
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:E10',
        });

        const rows = response.data.values || [];
        console.log("Rows fetched:", rows.length);
        rows.forEach((row, i) => {
            console.log(`Row ${i}:`, JSON.stringify(row));
        });

        if (rows.length > 0) {
            console.log("Headers:", JSON.stringify(rows[0]));
            const lines = [...new Set(rows.slice(1).map(r => r[1]))];
            console.log("Unique Lines (Col B) in first 10 rows:", lines);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOrderMaster();
