import { NextRequest, NextResponse } from 'next/server';
import { getFactoryConfig, isValidFactory } from '@/lib/factory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ factory: string }> }
) {
  const { factory } = await params;
  
  if (!isValidFactory(factory)) {
    return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
  }

  const config = getFactoryConfig(factory);
  const appsScriptUrl = config?.appsScriptUrl;

  try {
    const { searchParams } = new URL(request.url);
    const ocNo = searchParams.get('ocNo');

    if (!ocNo) {
      return NextResponse.json(
        { success: false, error: 'OC Number is required' },
        { status: 400 }
      );
    }

    if (!appsScriptUrl) {
      return NextResponse.json(
        { success: false, error: `Apps Script URL not configured for factory: ${factory}` },
        { status: 500 }
      );
    }

    // Call Apps Script to get process status for this OC
    const response = await fetch(
      `${appsScriptUrl}?action=getProcessStatus&ocNo=${encodeURIComponent(ocNo)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Apps Script returned ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching process status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch process status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
