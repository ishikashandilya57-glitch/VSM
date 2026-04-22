import { NextRequest, NextResponse } from 'next/server';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Required: force this route to be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_DIR = path.join(process.cwd(), 'tmp', 'cache');
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Sheet name to read from
const VSM_EXEC_SHEET = 'VSM_Execution';

// In-memory cache
const apiCache = new Map<string, { data: any; expiry: number }>();
// In-flight request deduplication
const activeFetches = new Map<string, Promise<any>>();

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function getFileCache(factory: string) {
  const cacheFile = path.join(CACHE_DIR, `${factory}_vsm_exec.json`);
  if (!fs.existsSync(cacheFile)) return null;
  try {
    const stats = fs.statSync(cacheFile);
    if (Date.now() - stats.mtimeMs < CACHE_DURATION) {
      return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  } catch (e) {
    console.error(`[PRODDATA] Failed to read file cache for ${factory}:`, e);
  }
  return null;
}

function setFileCache(factory: string, data: any) {
  const cacheFile = path.join(CACHE_DIR, `${factory}_vsm_exec.json`);
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(data), 'utf8');
  } catch (e) {
    console.error(`[PRODDATA] Failed to write file cache for ${factory}:`, e);
  }
}

const SAMPLE_DATA = {
  columns: ['OC NO', 'ORDER NO', 'LINE NO', 'WASH CATEGORY', 'DELIVERY DATE', 'PROCESS STAGE', 'PROCESS STATUS', 'VARIANCE', 'DELAY REASON', 'RISK LEVEL'],
  rows: [
    ['PRLS/25/10600', 'ORD10000', 'DBR_L1', 'Enzyme Wash', '2026-01-20', 'Fabric Inhouse', 'In Progress', 1, 'Machine Breakdown', 'High'],
    ['PRLS/25/10601', 'ORD10001', 'DBR_L2', 'Garment Dyed', '2026-01-21', 'Finishing', 'Completed - Delayed', 2, 'Machine Breakdown', 'High'],
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ factory: string }> }
) {
  try {
    const { factory } = await params;
    console.log(`[PRODDATA] 🚀 Request for factory: "${factory}" at ${new Date().toISOString()}`);


    if (!isValidFactory(factory)) {
      return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
    }

    const config = getFactoryConfig(factory);
    if (!config || !config.sheetId) {
      return NextResponse.json({ success: false, error: `Configuration missing for factory: ${factory}` }, { status: 500 });
    }

    const bypassCache = request.nextUrl.searchParams.get('refresh') === '1';

    // 1. In-memory cache check
    const memCached = apiCache.get(factory);
    if (!bypassCache && memCached && Date.now() < memCached.expiry) {
      console.log(`[PRODDATA] ⚡ Serving IN-MEMORY cache for "${factory}"`);
      return NextResponse.json(memCached.data);
    }

    // 2. File cache check (survives server restarts)
    const fileCached = getFileCache(factory);
    if (!bypassCache && fileCached) {
      console.log(`[PRODDATA] 📂 Serving FILE cache for "${factory}"`);
      apiCache.set(factory, { data: fileCached, expiry: Date.now() + CACHE_DURATION });
      return NextResponse.json(fileCached);
    }

    // 3. Deduplicate in-flight fetches
    if (activeFetches.has(factory)) {
      console.log(`[PRODDATA] ⏳ Sharing in-flight fetch for "${factory}"...`);
      try {
        const result = await activeFetches.get(factory);
        return NextResponse.json(result);
      } catch (err) {
        console.error(`[PRODDATA] ❌ Shared fetch failed for "${factory}":`, err);
      }
    }

    // 4. Start a new direct Sheets API fetch
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error('[PRODDATA] Missing Google service account credentials!');
      return NextResponse.json({
        data: SAMPLE_DATA,
        success: true,
        source: 'sample-fallback',
        error: 'Missing Google credentials'
      });
    }

    const fetchPromise = (async () => {
      console.log(`[PRODDATA] 🔗 CACHE MISS: Fetching VSM_Execution directly via Sheets API for "${factory}"...`);
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch all data from VSM_Execution in a single API call
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: config.sheetId,
          range: `${VSM_EXEC_SHEET}`,
          valueRenderOption: 'FORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING',
        });

        const values = response.data.values || [];
        if (values.length < 2) {
          return { data: { columns: [], rows: [] }, success: true, source: 'sheets-api', timestamp: new Date().toISOString() };
        }

        const columns = (values[0] as string[]).map(h => String(h || '').trim());
        const rows = values.slice(1);

        console.log(`[PRODDATA] ✅ Received ${rows.length} rows from Sheets API for "${factory}"`);

        const apiResponse = {
          data: { columns, rows },
          success: true,
          timestamp: new Date().toISOString(),
          source: 'sheets-api-direct',
          rowCount: rows.length,
          version: '4.0.0-direct'
        };

        // Cache in memory and on disk
        apiCache.set(factory, { data: apiResponse, expiry: Date.now() + CACHE_DURATION });
        setFileCache(factory, apiResponse);

        return apiResponse;
      } catch (error: any) {
        console.error(`[PRODDATA] ❌ Sheets API fetch error for "${factory}":`, error?.message || error);
        throw error;
      } finally {
        activeFetches.delete(factory);
      }
    })();

    activeFetches.set(factory, fetchPromise);

    try {
      const apiResponse = await fetchPromise;
      return NextResponse.json(apiResponse);
    } catch (error: any) {
      console.error(`[PRODDATA] ❌ Falling back to sample data for "${factory}":`, error?.message);
      return NextResponse.json({
        data: SAMPLE_DATA,
        success: true,
        timestamp: new Date().toISOString(),
        source: 'sample-fallback',
        error: error?.message || 'Backend fetch failed'
      });
    }

  } catch (outerError: any) {
    console.error('[PRODDATA] CRITICAL ERROR:', outerError);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
