const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function updateFormula() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // The query drops the header row by only selecting where A is not null and A != 'Factory'
        // Or we can just do A2:AA
        const newFormula = "=QUERY(WLP_RAW_All_Lines!A2:AA, \"Select A, B, C, H, T, W, M, V, Q, R, I, J, K, L, S, U, E, F, G where A is not null\", 0)";

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Order_Master!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newFormula]] },
        });

        console.log("Formula applied successfully");
    } catch (err) {
        console.error('Error applying formula:', err.message);
    }
}

updateFormula();
