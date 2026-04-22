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

        const newFormula = `=WLP_RAW_All_Lines!A4:J50`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Order_Master!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newFormula]] },
        });

        return NextResponse.json({ success: true, message: 'Direct reference applied' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
