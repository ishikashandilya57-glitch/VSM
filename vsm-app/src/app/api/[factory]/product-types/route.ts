import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

/**
 * GET /api/[factory]/product-types
 * Fetch unique product types from SOP_Cal sheet (Column C)
 */
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

    // Fetch product types from SOP_Cal sheet, Column C (Product Type)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'SOP_Cal!C2:C',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];

    // Get unique, non-empty product types (excluding 'All')
    const seen = new Set<string>();
    const productTypes = rows
      .map((row) => (row[0] || '').toString().trim())
      .filter((val) => {
        if (!val || val === '' || val === 'All') return false;
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      })
      .sort();

    return NextResponse.json({ success: true, data: productTypes });

  } catch (error: any) {
    console.error(`Error fetching product types from Google Sheets for ${factory}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch product types' },
      { status: 500 }
    );
  }
}
