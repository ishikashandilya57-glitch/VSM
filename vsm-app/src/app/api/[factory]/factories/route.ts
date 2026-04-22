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

    // Initialize Google Sheets API with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch factory data from Factory_master sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Factory_master!A2:B', // Assuming column A has factory names
      valueRenderOption: 'UNFORMATTED_VALUE', // Get raw values, not formulas
    });

    const rows = response.data.values || [];

    // Transform rows into factory objects, filtering out errors
    const factories = rows
      .map((row, index) => {
        const name = (row[0] || '').toString().trim();
        const code = (row[1] || row[0] || '').toString().trim();

        // Skip rows with errors
        if (name.includes('#REF!') || name.includes('#N/A') || name.includes('#ERROR')) {
          return null;
        }

        return {
          id: `factory-${index + 1}`,
          name: name,
          code: code,
        };
      })
      .filter(factory => factory !== null && factory.name !== '');

    return NextResponse.json({ success: true, data: factories });
  } catch (error: any) {
    console.error(`Error fetching factories from Google Sheets for ${factory}:`, error);
    const errorMessage = error?.message || 'Failed to fetch factories';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
