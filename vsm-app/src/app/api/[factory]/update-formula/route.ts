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

        // The issue is that the QUERY formula was somehow written into WLP_RAW_All_Lines ITSELF
        // in row 2 instead of Order_Master, due to previous scripts or user edits.
        // 
        // And Order_Master currently contains our new headers but no formula.
        //
        // Let's clear WLP_RAW_All_Lines completely, set only headers, so it's a clean slate for uploads.
        // Then set the formula cleanly in Order_Master.

        console.log("Clearing WLP_RAW_All_Lines...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'WLP_RAW_All_Lines!A:ZZ'
        });

        const wlpHeaders = [
            ["Factory", "Line", "OC NO", "ORDER NO", "CFM DATE", "MERCHANT", "STYLE", "BUYER",
                "L/S-S/S", "FABRIC", "FABRIC TYPE", "FABRIC ARTICLE", "REMARKS", "IN HOUSE",
                "NEW INH HOUSE", "APPROVAL OF FIT/PP", "Release of Production file & approved sample",
                "Revised F/R", "SMV", "DEL DATE", "MONTH CODE", "NEW DEL", "QTY ORDER",
                "TRIMS AVAILABILITY", "BAL TO LOAD", "Week 1", "Week 2"]
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'WLP_RAW_All_Lines!A1:AA1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: wlpHeaders },
        });

        // Now set up Order_Master headers and formula
        console.log("Setting up Order_Master...");
        const omHeaders = [
            ["Factory", "Line", "OC NO", "BUYER", "DEL DATE", "QTY ORDER", "REMARKS", "NEW DEL", "Release of Production file & approved sample", "Revised F/R"]
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Order_Master!A1:J1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: omHeaders },
        });

        // The formula selects specific columns from the 27 WLP columns:
        // Factory(A), Line(B), OC(C), Buyer(H), Del(T), Qty(W), Remarks(M), NewDel(V), Release(Q), Revised(R)
        // We use A:AA and specify header count as 1 for stability.
        const newFormula = `=QUERY(WLP_RAW_All_Lines!A:AA, "select A, B, C, H, T, W, M, V, Q, R where C is not null and C <> '' and C <> 'OC NO'", 1)`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Order_Master!A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[newFormula]] },
        });

        return NextResponse.json({ success: true, message: 'Completely reset WLP and Order_Master correctly' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
