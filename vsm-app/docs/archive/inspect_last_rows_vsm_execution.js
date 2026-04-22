const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function inspectLastRows() {
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

        // Get the full range to find the last row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'VSM_Execution!A:A',
        });
        const totalRows = response.data.values ? response.data.values.length : 0;
        console.log("Total rows in VSM_Execution:", totalRows);

        if (totalRows > 0) {
            const startRow = Math.max(1, totalRows - 10);
            const lastRowsResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `VSM_Execution!A${startRow}:V${totalRows}`,
            });
            console.log(`\n--- VSM_Execution (Last 10 rows: ${startRow}-${totalRows}) ---`);
            lastRowsResponse.data.values?.forEach((row, i) => console.log(`${startRow + i}:`, JSON.stringify(row)));
        }

        // Specifically search for LC/DMN/25/13053 if it's there
        const searchResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'VSM_Execution!B:B',
        });
        const ocNumbers = searchResponse.data.values?.map(r => r[0]) || [];
        const index = ocNumbers.indexOf('LC/DMN/25/13053');
        if (index !== -1) {
            console.log(`\nFound LC/DMN/25/13053 at row ${index + 1}`);
        } else {
            console.log(`\nLC/DMN/25/13053 NOT found in VSM_Execution`);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

inspectLastRows();
