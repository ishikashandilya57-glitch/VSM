const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function verify() {
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

        console.log('--- Checking Order_Master Formula ---');
        const formulaRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A2',
            valueRenderOption: 'FORMULA'
        });
        console.log(`Formula in A2: ${JSON.stringify(formulaRes.data.values?.[0]?.[0])}`);

        console.log('\n--- Checking Order_Master Data (Indices mapping check) ---');
        const omRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:J10',
        });
        const headers = omRes.data.values[0];
        const firstRow = omRes.data.values[1];

        headers.forEach((h, i) => {
            console.log(`Col ${i}: ${h} -> Value: ${firstRow?.[i]}`);
        });

    } catch (err) {
        console.error(err);
    }
}
verify();
