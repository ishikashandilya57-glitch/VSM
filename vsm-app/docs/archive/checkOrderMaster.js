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

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:C50',
        });

        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            console.log('Order_Master is empty.');
            return;
        }

        console.log('Order_Master rows (Factory, Line, OC NO):');
        rows.forEach((row, i) => {
            console.log(`${i}: ${JSON.stringify(row)}`);
        });

        const kprRows = rows.filter(row => row[0] === 'KPR' || (row[1] && row[1].includes('KPR')));
        console.log(`\nFound ${kprRows.length} KPR related rows.`);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOrderMaster();
