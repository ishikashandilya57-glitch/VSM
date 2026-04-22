const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function checkSheet() {
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

        // Check WLP_RAW_All_Lines
        const WLP_res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A1:A2000',
        });

        const wlpData = WLP_res.data.values || [];
        console.log(`WLP_RAW_All_Lines has ${wlpData.length} rows.`);

        // Find where the first real data is
        let firstDataRow = -1;
        let lastDataRow = -1;
        for (let i = 0; i < wlpData.length; i++) {
            if (wlpData[i] && wlpData[i][0]) {
                if (firstDataRow === -1) firstDataRow = i;
                lastDataRow = i;
            }
        }
        console.log(`WLP: Data found from row ${firstDataRow + 1} to ${lastDataRow + 1}`);

        // If it started at 1001, we know why. Let's see row 1000
        if (wlpData.length > 500) {
            console.log(`Row 1000 is: ${JSON.stringify(wlpData[999] || [])}`);
            console.log(`Row 1001 is: ${JSON.stringify(wlpData[1000] || [])}`);
            console.log(`Row 1002 is: ${JSON.stringify(wlpData[1001] || [])}`);
        }

        // Check Order_Master
        const OM_res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:J5',
            valueRenderOption: 'FORMULA'
        });
        console.log('Order_Master formulas/values (first 5 rows):');
        console.log(JSON.stringify(OM_res.data.values, null, 2));

    } catch (err) {
        console.error(err);
    }
}
checkSheet();
