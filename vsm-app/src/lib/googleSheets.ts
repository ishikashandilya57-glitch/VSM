import { google } from 'googleapis';

export interface ProductionData {
  ocNo: string;
  orderNo: string;
  productType: string;
  deliveryDate: string;
  processSeq: number;
  processStage: string;
  vaNva: string;
  sopLeadTime: number;
  targetStartDate: string;
  targetEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  processStatus: string;
  processTime: number;
  waitingTime: number;
  variance: number;
  delayReasonCategory: string;
  alertTriggered: string;
  delayFlag: string;
  delayReason: string;
  riskLevel: string;
  execKey: string;
}

/**
 * Fetches production data from Google Sheets
 * @returns Array of production data
 */
export async function getProductionDataFromSheets(): Promise<ProductionData[]> {
  try {
    // Initialize Google Sheets API with service account credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A2:J', // Skip header row
    });

    const rows = response.data.values || [];

    // Transform rows into ProductionData objects
    const data: ProductionData[] = rows.map((row) => ({
      ocNo: row[0] || '',
      orderNo: row[1] || '',
      productType: row[2] || '',
      deliveryDate: row[3] || '',
      processSeq: parseInt(row[4]) || 0,
      processStage: row[5] || '',
      vaNva: row[6] || '',
      sopLeadTime: parseInt(row[7]) || 0,
      targetStartDate: row[8] || '',
      targetEndDate: row[9] || '',
      actualStartDate: row[10] || '',
      actualEndDate: row[11] || '',
      processStatus: row[12] || '',
      processTime: parseInt(row[13]) || 0,
      waitingTime: parseInt(row[14]) || 0,
      variance: parseInt(row[15]) || 0,
      delayReasonCategory: row[16] || '',
      alertTriggered: row[17] || '',
      delayFlag: row[18] || '',
      delayReason: row[19] || '',
      riskLevel: row[20] || '',
      execKey: row[21] || '',
    }));

    return data;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
}
