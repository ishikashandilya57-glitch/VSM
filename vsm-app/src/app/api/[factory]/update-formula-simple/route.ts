import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const newFormula = `=QUERY(WLP_RAW_All_Lines!A2:AA, "select A, B, C, H, T, W, M, V, Q, R where A is not null", 0)`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Order_Master!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newFormula]] },
        });

        return NextResponse.json({ success: true, message: 'Simplified formula applied' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
