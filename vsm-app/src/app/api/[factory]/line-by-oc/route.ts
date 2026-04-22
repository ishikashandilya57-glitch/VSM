import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeHeader(value: unknown): string {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function findHeaderIndex(headers: unknown[], aliases: string[]): number {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeHeader(header)));
}

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

    // Read Order_Master by header names instead of fixed columns.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Order_Master',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const values = response.data.values || [];
    const headers = values[0] || [];
    const lineIndex = findHeaderIndex(headers, ['LINE', 'LINE NO', 'LINE_NO']);
    const ocIndex = findHeaderIndex(headers, ['OC NO', 'OC', 'OC_NO']);

    if (ocIndex === -1) {
      throw new Error('OC NO column not found in Order_Master');
    }

    const rows = values.slice(1);

    // Search for matching OC NO and return Line NO
    for (const row of rows) {
      if (!row || row.length === 0) continue;

      const rowOcNo = (row[ocIndex] || '').toString().trim();
      const rowLineNo = lineIndex === -1 ? '' : (row[lineIndex] || '').toString().trim();

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
