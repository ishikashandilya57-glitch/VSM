const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function fixDates() {
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

        // Start from A3 to skip the "Factory/Line/..." header and the empty row below it.
        // This ensures Column T (DEL DATE) and others are treated as numeric from the start,
        // so the FORMAT clause works correctly.
        const formula = '=QUERY(WLP_RAW_All_Lines!A3:AA, "SELECT A, B, C, H, T, W, M, V, Q, R WHERE C IS NOT NULL AND C <> \'OC NO\' FORMAT T \'YYYY-MM-DD\', V \'YYYY-MM-DD\', Q \'YYYY-MM-DD\', R \'YYYY-MM-DD\'", 0)';

        const formulaParams = {
            spreadsheetId,
            range: 'Order_Master!A2', // Write data starting from A2
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[formula]]
            }
        };

        console.log('Writing updated formula to Order_Master!A2...');
        await sheets.spreadsheets.values.update(formulaParams);

        // Also restore the manual headers at Order_Master!A1 just in case I messed them up earlier
        const headerParams = {
            spreadsheetId,
            range: 'Order_Master!A1:J1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [["Factory", "Line", "OC NO", "BUYER", "DEL DATE", "QTY ORDER", "REMARKS", "NEW DEL", "Release of Production file & approved sample", "Revised F/R"]]
            }
        };
        console.log('Restoring manual headers to Order_Master!A1...');
        await sheets.spreadsheets.values.update(headerParams);

        console.log('Formula and headers updated successfully.');

    } catch (err) {
        console.error(err);
    }
}
fixDates();
