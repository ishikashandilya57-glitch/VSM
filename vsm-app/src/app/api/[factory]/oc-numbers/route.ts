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
    // Validate environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing Google Sheets credentials' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const line = searchParams.get('line');

    // Initialize Google Sheets API with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch OC numbers from Order_Master sheet
    // Columns: A=Factory, B=Line, C=OC NO
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Order_Master!A:C',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    let ocNumbers: { line: string; ocNo: string }[] = [];

    // Transform rows into OC number objects (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue; // Need at least Factory, Line, OC NO

      const lineCell = (row[1] || '').toString().trim(); // Column B
      const ocCell = (row[2] || '').toString().trim();   // Column C

      // Filter out Google Sheets errors
      const hasError = (value: string) => {
        return value.includes('#REF!') ||
          value.includes('#N/A') ||
          value.includes('#ERROR') ||
          value.includes('#VALUE!') ||
          value.includes('#DIV/0!') ||
          value.includes('#NAME?') ||
          value.includes('#NULL!');
      };

      // Only add if both cells are valid and don't contain errors
      if (lineCell && ocCell && !hasError(lineCell) && !hasError(ocCell)) {
        ocNumbers.push({
          line: lineCell,
          ocNo: ocCell,
        });
      }
    }

    // Filter by line if specified (robust normalization)
    if (line) {
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedQueryLine = normalize(line);
      ocNumbers = ocNumbers.filter((item) => {
        return normalize(item.line || '') === normalizedQueryLine;
      });
    }

    // Extract unique OC numbers and sort them
    const uniqueOcNumbers = [...new Set(ocNumbers.map((item) => item.ocNo))].sort();

    return NextResponse.json({ success: true, data: uniqueOcNumbers });
  } catch (error: any) {
    console.error('Error fetching OC numbers from Google Sheets:', error);
    const errorMessage = error?.message || 'Failed to fetch OC numbers';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
