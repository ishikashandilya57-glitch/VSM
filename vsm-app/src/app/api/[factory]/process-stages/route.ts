import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

const SHEET_ERROR_MARKERS = ['#REF!', '#N/A', '#ERROR', '#VALUE!', '#DIV/0!', '#NAME?', '#NULL!'];

function isValidStage(stage: string) {
  if (!stage) return false;
  return !SHEET_ERROR_MARKERS.some(marker => stage.includes(marker));
}

function uniqueCleanStages(rows: unknown[][], columnIndex = 0) {
  const seen = new Set<string>();

  return rows
    .map(row => String(row[columnIndex] || '').trim())
    .filter(stage => {
      if (!isValidStage(stage) || seen.has(stage)) return false;
      seen.add(stage);
      return true;
    });
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

    // Initialize Google Sheets API with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    let processStages: string[] = [];

    try {
      // Preferred source: explicit process list maintained in the workbook.
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: 'Process_List!A2:A',
        valueRenderOption: 'UNFORMATTED_VALUE',
      });

      processStages = uniqueCleanStages(response.data.values || []);
    } catch (processListError: any) {
      console.warn(
        `[PROCESS_STAGES] Process_List unavailable for ${factory}; falling back to VSM_Execution:`,
        processListError?.message || processListError
      );
    }

    if (processStages.length === 0) {
      // Fallback source: derive stages from the live dashboard data.
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.sheetId,
        range: 'VSM_Execution',
        valueRenderOption: 'UNFORMATTED_VALUE',
      });

      const values = response.data.values || [];
      const headers = (values[0] || []).map(header =>
        String(header || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      );
      const stageIndex = headers.findIndex(header =>
        ['PROCESSSTAGE', 'STAGE', 'CURRENTSTAGE'].includes(header)
      );

      if (stageIndex !== -1) {
        processStages = uniqueCleanStages(values.slice(1), stageIndex);
      }
    }

    return NextResponse.json({ success: true, data: processStages });
  } catch (error: any) {
    console.error(`Error fetching process stages from Google Sheets for ${factory}:`, error);
    const errorMessage = error?.message || 'Failed to fetch process stages';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
