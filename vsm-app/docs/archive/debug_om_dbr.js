const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkOmForDbr() {
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

        console.log("Fetching first 1000 rows of Order_Master to find DBR...");
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A1:C1000',
        });

        const rows = response.data.values || [];
        console.log("Rows fetched from OM:", rows.length);

        const dbrRows = rows.filter(row => row[1] && row[1].toString().includes('DBR'));
        console.log("DBR rows found in first 1000:", dbrRows.length);

        if (dbrRows.length > 0) {
            console.log("Sample DBR row in OM:", JSON.stringify(dbrRows[0]));
        } else {
            console.log("No DBR rows found in first 1000. Checking total count...");
            const fullResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Order_Master!B:B',
            });
            const allLines = fullResponse.data.values || [];
            const dbrTotal = allLines.filter(row => row[0] && row[0].toString().includes('DBR')).length;
            console.log("Total DBR rows in Column B of OM:", dbrTotal);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkOmForDbr();
