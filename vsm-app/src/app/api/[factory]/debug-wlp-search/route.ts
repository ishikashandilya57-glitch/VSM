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

        // Fetch a large range from WLP_RAW_All_Lines to find KPR
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'WLP_RAW_All_Lines!A1:C500',
        });

        const rows = response.data.values || [];
        const kprRows = rows.filter(r => r[0] === 'KPR');

        return NextResponse.json({
            success: true,
            totalRows: rows.length,
            kprCount: kprRows.length,
            firstKpr: kprRows[0] || null,
            first5: rows.slice(0, 5)
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
