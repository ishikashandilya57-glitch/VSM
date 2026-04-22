import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch ALL rows from WLP_RAW_All_Lines (columns A-C)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'WLP_RAW_All_Lines!A:C',
        });

        const rows = response.data.values || [];

        // Find rows where Col B contains "KPR"
        const kprInLineRows = rows.filter(r => r[1] && r[1].toString().includes('KPR'));

        // Also find unique factories in the sheet
        const factories = [...new Set(rows.slice(1).map(r => r[0]))].filter(Boolean);

        return NextResponse.json({
            success: true,
            totalRows: rows.length,
            kprInLineCount: kprInLineRows.length,
            factories,
            sampleKprRow: kprInLineRows[0] || null
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
