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
    const processStage = searchParams.get('process');

    if (!processStage) {
      return NextResponse.json(
        { success: false, error: 'Process stage parameter is required' },
        { status: 400 }
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

    let rows: unknown[][] = [];
    const candidateRanges = [
      'Delay reasons',
      'Delay Reasons',
      'Delay_Reasons',
      'DelayReason',
      'Delay_Reason_Master',
    ];

    let lastSheetError: unknown = null;

    for (const range of candidateRanges) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: config.sheetId,
          range,
          valueRenderOption: 'UNFORMATTED_VALUE',
        });
        rows = response.data.values || [];
        if (rows.length > 0) break;
      } catch (error) {
        lastSheetError = error;
      }
    }

    if (rows.length === 0) {
      console.warn(
        `[DELAY_REASONS] No delay-reason sheet data found for ${factory}; returning empty list`,
        lastSheetError
      );
      return NextResponse.json({ success: true, data: [] });
    }

    const headers = rows[0] || [];
    const processIndex = findHeaderIndex(headers, ['PROCESS STAGE', 'PROCESS', 'STAGE', 'PROCESS_STAGE']);
    const reasonIndex = findHeaderIndex(headers, ['DELAY REASON', 'REASON', 'DELAY_REASON']);

    if (processIndex === -1 || reasonIndex === -1) {
      console.warn(`[DELAY_REASONS] Required columns missing for ${factory}; returning empty list`);
      return NextResponse.json({ success: true, data: [] });
    }

    let delayReasons: string[] = [];

    // Find delay reasons for the selected process stage
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const process = (row[processIndex] || '').toString().trim();
      const reason = (row[reasonIndex] || '').toString().trim();

      // Match the process stage (case-insensitive)
      if (process.toLowerCase() === processStage.toLowerCase() && reason) {
        delayReasons.push(reason);
      }
    }

    // Return unique delay reasons
    const uniqueReasons = [...new Set(delayReasons)];

    return NextResponse.json({
      success: true,
      data: uniqueReasons
    });
  } catch (error: any) {
    console.error(`Error fetching delay reasons from Google Sheets for ${factory}:`, error);
    const errorMessage = error?.message || 'Failed to fetch delay reasons';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
