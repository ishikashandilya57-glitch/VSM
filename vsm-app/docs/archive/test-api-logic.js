const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testApi() {
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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Order_Master!A:C',
        });

        const rows = response.data.values || [];
        console.log("Total rows in OM:", rows.length);

        // Simulate UI mapping
        const rawLineFromUi = "DBR L1";
        const lineMap = { 'DBR L1': 'DBR_L1' };
        const mappedLine = lineMap[rawLineFromUi] || rawLineFromUi;
        console.log("Mapped line sent to API:", mappedLine);

        // Simulate API normalization
        const lineParam = mappedLine;
        const normalizedQueryLine = lineParam.toLowerCase().replace(/_/g, ' ');
        console.log("Normalized query line in API:", normalizedQueryLine);

        let ocNumbers = [];
        const hasError = (value) => {
            return value.includes('#REF!') ||
                value.includes('#N/A') ||
                value.includes('#ERROR') ||
                value.includes('#VALUE!') ||
                value.includes('#DIV/0!') ||
                value.includes('#NAME?') ||
                value.includes('#NULL!');
        };

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 3) continue;

            const lineCell = (row[1] || '').toString().trim();
            const ocCell = (row[2] || '').toString().trim();

            if (lineCell && ocCell && !hasError(lineCell) && !hasError(ocCell)) {
                ocNumbers.push({
                    line: lineCell,
                    ocNo: ocCell,
                });
            }
        }

        console.log("Total valid ocNumbers objects:", ocNumbers.length);

        const filtered = ocNumbers.filter((item, i) => {
            const normalizedItemLine = (item.line || '').toLowerCase().replace(/_/g, ' ');
            if (i < 5) console.log(`Checking item line: '${item.line}' -> '${normalizedItemLine}'`);
            return normalizedItemLine === normalizedQueryLine;
        });

        console.log(`Filtered for '${lineParam}':`, filtered.length);
        if (filtered.length > 0) {
            console.log("First 5 OC numbers:", filtered.slice(0, 5).map(i => i.ocNo));
        }

        const uniqueOcNumbers = [...new Set(filtered.map((item) => item.ocNo))].sort();
        console.log("Unique OC numbers count:", uniqueOcNumbers.length);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testApi();
