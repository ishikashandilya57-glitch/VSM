const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function fixSheet() {
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

        // Check last rows of WLP_RAW_All_Lines to see where real data is
        const WLP_res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'WLP_RAW_All_Lines!A1:AA3000',
        });

        const wlpData = WLP_res.data.values || [];
        console.log(`WLP_RAW_All_Lines has ${wlpData.length} total rows.`);

        // Print lines > 2000
        if (wlpData.length > 2000) {
            console.log("Real data found past row 2000. First 2 rows:");
            console.log(JSON.stringify(wlpData[2000] || []));
            console.log(JSON.stringify(wlpData[2001] || []));
        }

        // Insert the query formula into Order_Master!A2
        const formulaParams = {
            spreadsheetId,
            range: 'Order_Master!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    ['=QUERY(WLP_RAW_All_Lines!A2:AA, "SELECT A, B, C, H, T, W, M, V, Q, R WHERE C IS NOT NULL", 0)']
                ]
            }
        };

        console.log('Writing formula to Order_Master!A2...');
        await sheets.spreadsheets.values.update(formulaParams);
        console.log('Formula written successfully.');

    } catch (err) {
        console.error(err);
    }
}
fixSheet();
