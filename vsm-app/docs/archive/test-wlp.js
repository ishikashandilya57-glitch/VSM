const { google } = require('googleapis');
const fs = require('fs');

async function main() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const envFile = Object.fromEntries(
            envContent.split('\n')
                .filter(line => line && !line.startsWith('#'))
                .map(line => {
                    let [key, ...values] = line.split('=');
                    const val = values.join('=');
                    if (val.startsWith('"') && val.endsWith('"')) {
                        return [key, val.slice(1, -1)];
                    }
                    return [key, val];
                })
        );

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: envFile.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: envFile.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        console.log("Fetching WLP_RAW_All_Lines...");
        const res1 = await sheets.spreadsheets.values.get({
            spreadsheetId: envFile.GOOGLE_SHEET_ID,
            range: 'WLP_RAW_All_Lines!A1:Z5',
        });
        console.log('WLP headers:', JSON.stringify(res1.data.values, null, 2));

        console.log("Fetching Order_Master...");
        const res2 = await sheets.spreadsheets.values.get({
            spreadsheetId: envFile.GOOGLE_SHEET_ID,
            range: 'Order_Master!A1:Z5',
        });
        console.log('Order_Master headers:', JSON.stringify(res2.data.values, null, 2));

        console.log("Fetching VSM_Execution...");
        const res3 = await sheets.spreadsheets.values.get({
            spreadsheetId: envFile.GOOGLE_SHEET_ID,
            range: 'VSM_Execution!A1:Z5',
        });
        console.log('VSM headers:', JSON.stringify(res3.data.values, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
