import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ factory: string }> }
) {
    const { factory: factorySlug } = await params;
    console.log(`[UPLOAD] Receiving WLP upload for factory: ${factorySlug}`);

    if (!isValidFactory(factorySlug)) {
        console.error(`[UPLOAD] Invalid factory slug: ${factorySlug}`);
        return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
    }

    const config = getFactoryConfig(factorySlug);
    console.log(`[UPLOAD] Config found: ${!!config}, SheetId: ${config?.sheetId ? 'Provided' : 'MISSING'}`);
    console.log(`[UPLOAD] Config detail: ${JSON.stringify({ name: config?.name, accent: config?.accentColor })}`);
    
    if (!config || !config.sheetId) {
        console.error(`[UPLOAD] Configuration missing for factory: ${factorySlug}`);
        return NextResponse.json({ success: false, error: `Configuration missing for factory: ${factorySlug}` }, { status: 500 });
    }

    try {
        console.log('[UPLOAD] Validating credentials...');
        // Validate environment variables
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.error('[UPLOAD] Missing required environment variables');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: Missing Google Sheets credentials' },
                { status: 500 }
            );
        }
        console.log(`[UPLOAD] Service Account: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);

        const payload = await request.json();
        const rows = payload.rows;

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json(
                { success: false, error: 'Invalid payload. Expected { rows }' },
                { status: 400 }
            );
        }

        // Initialize Google Sheets API
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = config.sheetId;
        const range = 'WLP_RAW_All_Lines!A:AA';
        
        console.log(`[UPLOAD] Accessing Spreadsheet: ${spreadsheetId}`);
        console.log(`[UPLOAD] Range: ${range}`);

        // --- INCREMENTAL MERGE STRATEGY ---
        // 1. Fetch current data (ALL columns)
        let currentRows: any[][] = [];
        try {
            console.log('[UPLOAD] Fetching current sheet data for merging...');
            const getResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            currentRows = getResponse.data.values || [];
        } catch (apiError: any) {
            console.error(`[UPLOAD] Google API Error (GET):`, apiError.message);
            
            // Handle specific Google API errors
            if (apiError.code === 404 || apiError.message?.includes('not found')) {
                return NextResponse.json({ 
                    success: false, 
                    error: `Spreadsheet not found (404). Please verify the ${factorySlug.toUpperCase()}_GOOGLE_SHEET_ID in your configuration. ID used: ${spreadsheetId}` 
                }, { status: 404 });
            }
            
            if (apiError.code === 403 || apiError.message?.includes('permission')) {
                return NextResponse.json({ 
                    success: false, 
                    error: `Permission denied (403). Please ensure the service account ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL} is added as an 'Editor' to the spreadsheet.` 
                }, { status: 403 });
            }

            if (apiError.message?.includes('Unable to parse range')) {
                return NextResponse.json({ 
                    success: false, 
                    error: `Sheet not found. Please ensure the spreadsheet has a tab named 'WLP_RAW_All_Lines'.` 
                }, { status: 400 });
            }

            throw apiError; // Re-throw for general catch block
        }

        const sheetHeader = currentRows[0] || [];

        // 2. Map existing rows for duplicate checking and updates
        // KEY: Factory | OC NO (Case-insensitive)
        const rowMap = new Map<string, any[]>();

        if (currentRows.length > 1) {
            currentRows.slice(1).forEach((row) => {
                const factoryKey = String(row[0] || '').trim().toUpperCase();
                const ocNoKey = String(row[2] || '').trim().toUpperCase();
                if (factoryKey && ocNoKey) {
                    rowMap.set(`${factoryKey}|${ocNoKey}`, row);
                }
            });
        }

        // 3. Prepare and sanitize the new data from upload
        const excelDateToJSDate = (serial: number) => {
            const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
        };

        const sanitizedNewRows = rows.map((row: any[]) =>
            row.map((cell: any, idx: number) => {
                let val = String(cell || '').trim();
                const dateIndices = [4, 13, 14, 15, 16, 17, 19, 21];
                if (dateIndices.includes(idx) && val && !isNaN(Number(val))) {
                    const num = Number(val);
                    if (num > 40000 && num < 60000) {
                        try { return excelDateToJSDate(num); } catch (e) { return val; }
                    }
                }
                return val;
            })
        );

        // 4. Merge new rows into the Map (overwrites existing OC rows for this factory)
        const payloadHeader = sanitizedNewRows[0] || sheetHeader;
        let updateCount = 0;
        let createCount = 0;

        sanitizedNewRows.slice(1).forEach((newRow) => {
            const newFactory = String(newRow[0] || '').trim().toUpperCase();
            const newOcNo = String(newRow[2] || '').trim().toUpperCase();
            if (newFactory && newOcNo) {
                const key = `${newFactory}|${newOcNo}`;
                if (rowMap.has(key)) {
                    updateCount++;
                } else {
                    createCount++;
                }
                rowMap.set(key, newRow);
            }
        });

        // 5. Build final data set
        // Important: Preserve the header at Row 1
        const combinedData = [payloadHeader, ...Array.from(rowMap.values())];

        // 6. Atomic Update: Clear then Update
        // This ensures the sheet is exactly what's in our Map
        try {
            console.log('[UPLOAD] Performing atomic update (Clear + Update)...');
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: 'WLP_RAW_All_Lines!A:AA',
            });

            const updateResponse = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'WLP_RAW_All_Lines!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: combinedData,
                },
            });

            console.log('[UPLOAD] Update successful!');
            return NextResponse.json({
                success: true,
                message: `Loading plan updated. New orders: ${createCount}, Updated orders: ${updateCount}. Total records in database: ${rowMap.size}.`,
                data: updateResponse.data
            });
        } catch (updateError: any) {
            console.error(`[UPLOAD] Google API Error (UPDATE):`, updateError.message);
            return NextResponse.json({ 
                success: false, 
                error: `Failed to update spreadsheet: ${updateError.message}. Check permissions for service account.` 
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error(`[UPLOAD] Internal Server Error for ${factorySlug}:`, error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to upload WLP data' },
            { status: 500 }
        );
    }
}
