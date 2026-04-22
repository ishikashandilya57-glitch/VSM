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
    const ocNo = searchParams.get('ocNo');
    const processStage = searchParams.get('processStage');

    if (!ocNo || !processStage) {
      return NextResponse.json(
        { success: false, error: 'OC No and Process Stage parameters are required' },
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

    // Fetch data from VSM_execution sheet
    // We'll fetch a wider range to ensure we get all columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'VSM_Execution!A2:AW10000',
 // Fetch columns A through U to ensure we get all data
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    let targetDates: { targetStartDate: string; targetEndDate: string } | null = null;

    // Helper function to convert Excel serial date to ISO date string
    const excelDateToISO = (serial: any): string => {
      if (!serial) return '';
      if (typeof serial === 'string') {
        if (serial.includes('-')) return serial; // Already ISO
        if (!isNaN(Number(serial))) {
          const num = Number(serial);
          if (num > 40000 && num < 60000) {
            const date = new Date((num - 25569) * 86400 * 1000);
            return date.toISOString().split('T')[0];
          }
        }
        return serial;
      }
      if (typeof serial === 'number') {
        const date = new Date((serial - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
      return String(serial);
    };

    // Find the matching row
    for (let i = 1; i < rows.length; i++) { // Skip header row
      const row = rows[i];
      if (!row || row.length < 11) continue;

      // Map columns correctly (0-indexed)
      const rowOcNo = (row[1] || '').toString().trim(); // Column B (index 1)
      const rowProcessStage = (row[6] || '').toString().trim(); // Column G (index 6)
      const targetStartDateRaw = row[9]; // Column J (index 9)
      const targetEndDateRaw = row[10];   // Column K (index 10)

      // Match OC No and Process Stage (case-insensitive)
      if (rowOcNo.toLowerCase() === ocNo.toLowerCase() &&
        rowProcessStage.toLowerCase() === processStage.toLowerCase()) {
        targetDates = {
          targetStartDate: excelDateToISO(targetStartDateRaw),
          targetEndDate: excelDateToISO(targetEndDateRaw),
        };
        break;
      }
    }

    // If no matching record found, return empty dates (allow new entry)
    if (!targetDates) {
      return NextResponse.json({
        success: true,
        data: {
          targetStartDate: '',
          targetEndDate: ''
        },
        message: 'No existing record found. You can create a new entry.'
      });
    }

    return NextResponse.json({
      success: true,
      data: targetDates
    });
  } catch (error: any) {
    console.error(`Error fetching target dates from Google Sheets for ${factory}:`, error);
    const errorMessage = error?.message || 'Failed to fetch target dates';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
