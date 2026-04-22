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

    // Fetch delay reasons from 'Delay reasons' sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Delay reasons!A:B',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    let delayReasons: string[] = [];

    // Find delay reasons for the selected process stage
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      if (!row || row.length < 2) continue;

      const process = (row[0] || '').toString().trim();
      const reason = (row[1] || '').toString().trim();

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
