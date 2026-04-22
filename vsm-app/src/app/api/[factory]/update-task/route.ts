import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ factory: string }> }
) {
  const { factory } = await params;

  if (!isValidFactory(factory)) {
    return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
  }

  const config = getFactoryConfig(factory);
  if (!config || !config.appsScriptUrl) {
    return NextResponse.json({ success: false, error: `Configuration missing for factory: ${factory}` }, { status: 500 });
  }

  try {
    const taskData = await request.json();

    console.log(`📥 Received task data for ${factory}:`, taskData);

    // If lineNo, washCategory, or deliveryDate is missing, fetch from Order_Master
    if ((!taskData.lineNo || !taskData.washCategory || !taskData.deliveryDate) && taskData.ocNo) {
      console.log('🔍 Missing enrichment data detected, fetching from Order_Master...');

      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        
        const omResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: config.sheetId,
          range: 'Order_Master!A2:H10000', // Expanded range to include Column H (Wash Category)
          valueRenderOption: 'UNFORMATTED_VALUE',
        });
        const omRows = omResponse.data.values || [];
        
        // Find matching OC
        const match = omRows.find(row => 
          row[2] && row[2].toString().trim().toUpperCase() === taskData.ocNo.toUpperCase()
        );

        if (match) {
          if (!taskData.lineNo) taskData.lineNo = (match[1] || '').toString().trim();
          if (!taskData.washCategory) taskData.washCategory = (match[7] || '').toString().trim(); // Column H (Index 7) is Wash Category
          if (!taskData.deliveryDate) {
            const rawDate = match[4]; // Column E (Index 4) is Delivery Date
            if (typeof rawDate === 'number') {
              const date = new Date((rawDate - 25569) * 86400 * 1000);
              taskData.deliveryDate = date.toISOString().split('T')[0];
            } else {
              taskData.deliveryDate = (rawDate || '').toString().trim();
            }
          }
          console.log('✅ Successfully enriched from Order_Master:', { 
            lineNo: taskData.lineNo, 
            washCategory: taskData.washCategory, 
            deliveryDate: taskData.deliveryDate 
          });
        } else {
          console.warn('⚠️ OC NO not found in Order_Master during enrichment');
        }
      } catch (enrichError) {
        console.error('⚠️ Enrichment failed:', enrichError);
        // Continue anyway, better to send what we have
      }
    }

    // Check if process is transactional (Daily quantity tracking)
    const transactionalProcesses = ['Cutting', 'Sewing', 'Washing', 'Finishing', 'Inspection'];
    const isTransactional = transactionalProcesses.includes(taskData.processStage);

    // Validate required fields based on process type
    const missingFields = [];
    if (!taskData.ocNo) missingFields.push('ocNo');
    if (!taskData.processStage) missingFields.push('processStage');

    // Note: Product Type for Pre-Production is stored via File Release.
    // Apps Script looks it up automatically — no frontend/API validation needed.

    if (!taskData.actualStartDate) missingFields.push('actualStartDate');

    // For non-transactional processes, actualEndDate is required
    if (!isTransactional && !taskData.actualEndDate) {
      missingFields.push('actualEndDate');
    }

    // For transactional processes, actualQuantity is required
    if (isTransactional && !taskData.actualQuantity) {
      missingFields.push('actualQuantity');
    }

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Call the Google Apps Script Web App for the specific factory
    const appsScriptUrl = config.appsScriptUrl;

    console.log('🔗 Apps Script URL:', appsScriptUrl ? 'Configured' : 'Missing');

    if (!appsScriptUrl) {
      return NextResponse.json(
        { success: false, error: 'Google Apps Script URL not configured' },
        { status: 500 }
      );
    }

    console.log('📤 Sending to Apps Script. Fields:', Object.keys(taskData).join(', '));

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📨 Apps Script response status:', response.status);

      const responseText = await response.text();
      console.log('📨 Apps Script raw response:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse Apps Script response:', parseError);
        return NextResponse.json(
          { success: false, error: 'Invalid response from Apps Script', details: responseText },
          { status: 500 }
        );
      }

      console.log('📨 Apps Script parsed result:', result);

      if (result.success) {
        console.log('✅ Task saved successfully');
        return NextResponse.json({
          success: true,
          message: 'Task saved successfully',
          data: result
        });
      } else {
        console.error('❌ Apps Script returned error:', result.error);
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to save task' },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Check if it's a timeout error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout - Apps Script took too long to respond. The data might still be saved. Check your sheet.' },
          { status: 504 }
        );
      }

      throw fetchError; // Re-throw to outer catch
    }
  } catch (error) {
    console.error('❌ Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save task' },
      { status: 500 }
    );
  }
}
