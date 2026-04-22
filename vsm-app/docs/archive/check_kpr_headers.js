const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkKprHeaders() {
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

        const response = await sheets.spreadsheets.get({ spreadsheetId });
        const vsmExecution = response.data.sheets.find(s => s.properties.title === 'VSM_Execution');

        if (vsmExecution) {
            const headerResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'VSM_Execution!A1:AZ1',
            });
            console.log("\n--- KPR VSM_Execution Headers ---");
            console.log(JSON.stringify(headerResponse.data.values ? headerResponse.data.values[0] : []));
        } else {
            console.log("\nVSM_Execution sheet NOT found in KPR spreadsheet.");
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkKprHeaders();
