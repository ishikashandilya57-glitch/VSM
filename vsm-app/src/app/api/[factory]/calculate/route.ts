import { NextResponse } from 'next/server';
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
    
    // Diagnostic logging for debugging Vercel/Production deployment issues
    console.log(`[API-CALC] Factory: ${factory}, Config Found: ${!!config}, URL Present: ${!!config?.appsScriptUrl}`);
    
    if (!config || !config.appsScriptUrl) {
        console.error(`[API-CALC] ERROR: Missing Apps Script URL for factory ${factory}. Check environment variables.`);
        return NextResponse.json({ 
            success: false, 
            error: `Configuration missing for factory: ${factory}. Please check environment variables on Vercel.` 
        }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    searchParams.set('action', 'calculate');
    const queryString = searchParams.toString();
    const url = `${config.appsScriptUrl}?${queryString}`;

    try {
        console.log(`[API-CALC] Proxying to: ${url.substring(0, 50)}... [L:${url.length}]`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store' // Ensure we get fresh calculations
        });

        if (!response.ok) {
            console.error(`[API-CALC] Apps Script Error: ${response.status} ${response.statusText}`);
            throw new Error(`Apps Script responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('❌ [API-CALC] Proxy Exception:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error',
            context: 'Calculation Proxy'
        }, { status: 500 });
    }
}
