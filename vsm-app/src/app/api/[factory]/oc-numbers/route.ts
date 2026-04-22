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

    // Read Order_Master by header names instead of fixed columns.
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Order_Master',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];
    const lineIndex = findHeaderIndex(headers, ['LINE', 'LINE NO', 'LINE_NO']);
    const ocIndex = findHeaderIndex(headers, ['OC NO', 'OC', 'OC_NO']);

    if (ocIndex === -1) {
      throw new Error('OC NO column not found in Order_Master');
    }

    let ocNumbers: { line: string; ocNo: string }[] = [];

    // Transform rows into OC number objects (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const lineCell = lineIndex === -1 ? '' : (row[lineIndex] || '').toString().trim();
      const ocCell = (row[ocIndex] || '').toString().trim();

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
