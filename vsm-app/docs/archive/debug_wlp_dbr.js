const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkWlpForDbr() {
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

        console.log("Fetching WLP_RAW_All_Lines to search for DBR...");
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A:C',
        });

        const rows = response.data.values || [];
        console.log("Total rows in WLP:", rows.length);

        const dbrRows = rows.filter(row => row[1] && row[1].toString().includes('DBR'));
        console.log("Number of DBR rows found:", dbrRows.length);

        if (dbrRows.length > 0) {
            console.log("Sample DBR rows:");
            dbrRows.slice(0, 5).forEach(row => console.log(JSON.stringify(row)));
        } else {
            console.log("No rows found with 'DBR' in Column B.");
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkWlpForDbr();
