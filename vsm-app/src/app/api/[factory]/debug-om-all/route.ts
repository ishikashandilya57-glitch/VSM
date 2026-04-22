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

        // Fetch ALL rows from Order_Master (columns A-C)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Order_Master!A:C',
        });

        const rows = response.data.values || [];
        const kprRows = rows.filter(r => r[1] && r[1].toString().includes('KPR'));
        const dbrRows = rows.filter(r => r[1] && r[1].toString().includes('DBR'));

        return NextResponse.json({
            success: true,
            totalRows: rows.length,
            kprCount: kprRows.length,
            dbrCount: dbrRows.length,
            factories: [...new Set(rows.slice(1).map(r => r[0]))].filter(Boolean),
            sampleKpr: kprRows[0] || null
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
