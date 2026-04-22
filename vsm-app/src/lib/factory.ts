export type FactorySlug = 'dbr' | 'kpr';

export interface FactoryConfig {
    sheetId: string;
    appsScriptUrl: string;
    name: string;
    accentColor: string;
}

export function getFactoryConfig(slug: string): FactoryConfig | null {
    const factory = slug.toLowerCase();

    if (factory === 'dbr') {
        return {
            sheetId: process.env.DBR_GOOGLE_SHEET_ID || '',
            appsScriptUrl: process.env.DBR_GOOGLE_APPS_SCRIPT_URL || '',
            name: 'DBR Factory',
            accentColor: 'blue',
        };
    }

    if (factory === 'kpr') {
        return {
            sheetId: process.env.KPR_GOOGLE_SHEET_ID || '',
            appsScriptUrl: process.env.KPR_GOOGLE_APPS_SCRIPT_URL || '',
            name: 'KPR Factory',
            accentColor: 'indigo',
        };
    }

    return null;
}

export function isValidFactory(slug: string): slug is FactorySlug {
    return ['dbr', 'kpr'].includes(slug.toLowerCase());
}
