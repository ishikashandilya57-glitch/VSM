import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

/**
 * Process dependency rules — mirrors the frontend ALL_PROCESSES array.
 * requiresComplete: preceding process must have actualEndDate
 * requiresStart: preceding process must have actualStartDate
 */
const PROCESS_DEPENDENCIES: Record<
  string,
  { type: 'none' | 'complete' | 'start'; prerequisite: string | null }
> = {
  'Fabric Inhouse':  { type: 'none',     prerequisite: null },
  'Fabric QC':       { type: 'start',    prerequisite: 'Fabric Inhouse' },
  'File Release':    { type: 'complete', prerequisite: 'Fabric Inhouse' },
  'Pre-Production':  { type: 'complete', prerequisite: 'File Release' },
  'CAD / Pattern':   { type: 'complete', prerequisite: 'Pre-Production' },
  'Cutting':         { type: 'complete', prerequisite: 'CAD / Pattern' },
  'Sewing':          { type: 'start',    prerequisite: 'Cutting' },
  'Washing':         { type: 'start',    prerequisite: 'Sewing' },
  'Finishing':       { type: 'start',    prerequisite: 'Washing' },
  'Inspection':      { type: 'start',    prerequisite: 'Finishing' },
  'Dispatch':        { type: 'complete', prerequisite: 'Inspection' },
};

function excelDateToISO(serial: any): string {
  if (!serial) return '';
  if (typeof serial === 'string') return serial;
  if (typeof serial === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toISOString().split('T')[0];
  }
  return String(serial);
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
    return NextResponse.json(
      { success: false, error: `Configuration missing for factory: ${factory}` },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const processStage = searchParams.get('process');

  if (!processStage) {
    return NextResponse.json({ success: false, error: 'process parameter required' }, { status: 400 });
  }

  const dependency = PROCESS_DEPENDENCIES[processStage];
  if (!dependency) {
    return NextResponse.json({ success: false, error: `Unknown process stage: ${processStage}` }, { status: 400 });
  }

  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ success: false, error: 'Server configuration error: Missing Google Sheets credentials' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // ── 1. Fetch all OC numbers from Order_Master (columns A=factory, B=line, C=OC, D=Buyer, E=Delivery Date) ──
    const omResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'Order_Master!A:E',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const omRows = omResponse.data.values || [];
    const allOcNumbers: { ocNo: string; line: string; buyer: string; deliveryDate: string }[] = [];

    const hasError = (v: string) =>
      ['#REF!', '#N/A', '#ERROR', '#VALUE!', '#DIV/0!', '#NAME?', '#NULL!'].some(e => v.includes(e));

    for (let i = 1; i < omRows.length; i++) {
      const row = omRows[i];
      if (!row || row.length < 3) continue;
      const line   = (row[1] || '').toString().trim();
      const ocNo   = (row[2] || '').toString().trim();
      const buyer  = (row[3] || '').toString().trim(); // Column D is index 3 (Order_Master layout)
      const delDate = excelDateToISO(row[4]);         // Column E is index 4 (Order_Master layout)

      if (ocNo && !hasError(ocNo)) {
        allOcNumbers.push({ ocNo, line, buyer, deliveryDate: delDate });
      }
    }

    // ── 2. Fetch VSM_Execution to read actual start/end dates per OC per process ──
    const execResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: 'VSM_Execution!A2:N10000',
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    const execRows = execResponse.data.values || [];

    // Build a map: { ocNo → { processStage → { actualStartDate, actualEndDate } } }
    const ocProcessMap: Record<string, Record<string, { start: string; end: string }>> = {};
    const hasAnyExecutionData = new Set<string>();

    for (const row of execRows) {
      const ocNo   = (row[1] || '').toString().trim();  // B: OC_NO
      const stage  = (row[6] || '').toString().trim();  // G: PROCESS_STAGE
      const start  = excelDateToISO(row[11]);            // L: ACTUAL_START
      const end    = excelDateToISO(row[12]);            // M: ACTUAL_END

      if (!ocNo || !stage) continue;
      hasAnyExecutionData.add(ocNo);

      if (!ocProcessMap[ocNo]) ocProcessMap[ocNo] = {};
      const existing = ocProcessMap[ocNo][stage];
      if (!existing || (end && !existing.end) || (end > (existing.end || ''))) {
        ocProcessMap[ocNo][stage] = { start, end };
      }
    }

    // ── 3. Filter OCs based on dependency type and 'Dead Order' logic ──
    const prerequisite = dependency.prerequisite;
    const eligibleOcNos = new Set<string>();
    const ocLineMap  = new Map(allOcNumbers.map(o => [o.ocNo, o.line]));
    const ocBuyerMap = new Map(allOcNumbers.map(o => [o.ocNo, o.buyer]));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const { ocNo, deliveryDate } of allOcNumbers) {
      // 1. Filter out Shipped orders (Dispatch completed)
      if (ocProcessMap[ocNo]?.['Dispatch']?.end) {
        continue;
      }

      // 2. Filter out legacy/dead orders (No execution data AND Delivery Date older than 30 days)
      if (!hasAnyExecutionData.has(ocNo)) {
        if (deliveryDate) {
           const dDate = new Date(deliveryDate);
           if (!isNaN(dDate.getTime()) && dDate < thirtyDaysAgo) {
             continue; // Suppress dead legacy order
           }
        }
      }

      // 3. Handle Prerequisite logic
      if (dependency.type === 'none') {
        eligibleOcNos.add(ocNo);
      } else if (prerequisite) {
        const prereqStatus = ocProcessMap[ocNo]?.[prerequisite];

        if (dependency.type === 'complete') {
          if (prereqStatus?.end) eligibleOcNos.add(ocNo);
        } else if (dependency.type === 'start') {
          if (prereqStatus?.start) eligibleOcNos.add(ocNo);
        }
      }

      // 4. Also include OCs where this process is already recorded (editable)
      if (ocProcessMap[ocNo]?.[processStage]?.start) {
        eligibleOcNos.add(ocNo);
      }
    }

    const result = [...eligibleOcNos]
      .sort()
      .map(ocNo => ({ ocNo, line: ocLineMap.get(ocNo) || '', buyer: ocBuyerMap.get(ocNo) || '' }));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error in oc-numbers-by-process:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch eligible OC numbers' },
      { status: 500 }
    );
  }
}
