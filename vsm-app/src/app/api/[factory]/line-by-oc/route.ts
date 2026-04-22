import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ factory: string }> }
) {
  const { factory } = await params;

  if (!isValidFactory(factory)) {
    return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
  }

  const config = getFactoryConfig(factory);
  if (!config || !config.sheetId) {
    return NextResponse.json({ success: false, error: `Configuration missing for factory: ${factory}` }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const ocNo = searchParams.get('ocNo');

    if (!ocNo) {
      return NextResponse.json(
        { success: false, error: 'OC No parameter is required' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Order_Master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Order_Master!A2:C10000', // Column A: FACTORY, Column B: LINE_NO, Column C: OC_NO
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];

    // Search for matching OC NO and return Line NO
    for (const row of rows) {
      if (!row || row.length < 3) continue;

      const rowOcNo = (row[2] || '').toString().trim(); // Column C
      const rowLineNo = (row[1] || '').toString().trim(); // Column B

      if (rowOcNo.toUpperCase() === ocNo.toUpperCase()) {
        return NextResponse.json({
          success: true,
          data: {
            lineNo: rowLineNo,
            ocNo: rowOcNo
          }
        });
      }
    }

    // OC NO not found
    return NextResponse.json({
      success: true,
      data: {
        lineNo: null,
        ocNo: ocNo
      },
      message: 'OC NO not found in Order_Master'
    });

  } catch (error: any) {
    console.error(`Error fetching line by OC NO for ${factory}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch line' },
      { status: 500 }
    );
  }
}
