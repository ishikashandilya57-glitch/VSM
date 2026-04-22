const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function debugDbrSheet() {
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

        console.log("Spreadsheet ID:", spreadsheetId);

        // 1. Get sheet names
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId,
        });
        const sheetNames = spreadsheet.data.sheets.map(s => s.properties.title);
        console.log("Sheets in spreadsheet:", sheetNames);

        // 2. Check VSM_execution last rows
        if (sheetNames.includes('VSM_execution')) {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'VSM_execution!A:Z',
            });
            const rows = response.data.values || [];
            console.log("\n--- VSM_execution ---");
            console.log("Total rows:", rows.length);
            if (rows.length > 0) {
                console.log("Last 5 rows:");
                rows.slice(-5).forEach((row, i) => console.log(`${rows.length - 5 + i + 1}:`, JSON.stringify(row)));
            }
        }

        // 3. Check Order_Master last rows (if exists)
        if (sheetNames.includes('Order_Master')) {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Order_Master!A:Z',
            });
            const rows = response.data.values || [];
            console.log("\n--- Order_Master ---");
            console.log("Total rows:", rows.length);
            if (rows.length > 0) {
                console.log("Last 5 rows:");
                rows.slice(-5).forEach((row, i) => console.log(`${rows.length - 5 + i + 1}:`, JSON.stringify(row)));
            }
        }

         // 4. Check WLP_RAW_All_Lines last rows
         if (sheetNames.includes('WLP_RAW_All_Lines')) {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'WLP_RAW_All_Lines!A:C',
            });
            const rows = response.data.values || [];
            console.log("\n--- WLP_RAW_All_Lines ---");
            console.log("Total rows:", rows.length);
            if (rows.length > 0) {
                console.log("Last 5 rows:");
                rows.slice(-5).forEach((row, i) => console.log(`${rows.length - 5 + i + 1}:`, JSON.stringify(row)));
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

debugDbrSheet();
