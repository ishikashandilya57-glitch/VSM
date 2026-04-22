import { NextResponse } from 'next/server';
import { isValidFactory } from '@/lib/factory';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ factory: string }> }
) {
  const { factory } = await params;

  if (!isValidFactory(factory)) {
    return NextResponse.json({ success: false, error: 'Invalid factory' }, { status: 400 });
  }

  try {
    const allLines = [
      'DBR L1', 'DBR L2', 'DBR L3', 'DBR L4', 'DBR L5', 'DBR L6', 'DBR L7', 'DBR L8', 'DBR L9',
      'KPR L1', 'KPR L2', 'KPR L3', 'KPR L4', 'KPR L5', 'KPR L6', 'KPR L7', 'KPR L8', 'KPR L9', 'KPR L10', 'KPR L11'
    ];

    // Filter lines based on the factory prefix
    const factoryPrefix = factory.toUpperCase();
    const filteredLines = allLines.filter(line => line.startsWith(factoryPrefix));

    return NextResponse.json({ success: true, data: filteredLines });
  } catch (error: any) {
    console.error(`Error fetching lines for ${factory}:`, error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lines' }, { status: 500 });
  }
}
