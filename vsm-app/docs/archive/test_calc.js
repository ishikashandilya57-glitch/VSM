const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function runTest() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.DBR_GOOGLE_SHEET_ID;
  const ocNo = 'PRLS/25/12970';

  console.log(`--- Testing Calculation for OC: ${ocNo} ---`);

  // 1. Get Order Details (Simulate getOrderDetails_New)
  const omResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Order_Master!A:Z',
  });
  const omRows = omResponse.data.values || [];
  const omRow = omRows.find(r => r[2] && r[2].toString().trim() === ocNo);

  if (!omRow) {
    console.log('Order not found in Order_Master');
    return;
  }

  const fileReleaseRaw = omRow[8]; // Col I (0-indexed 8)
  const revisedFRRaw = omRow[9];    // Col J (0-indexed 9)

  console.log(`File Release Raw: ${fileReleaseRaw} (${typeof fileReleaseRaw})`);
  console.log(`Revised FR Raw: ${revisedFRRaw} (${typeof revisedFRRaw})`);

  function parseDate_Sim(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    
    // Check for serial number (Google Sheets)
    if (!isNaN(val)) {
        const serial = Number(val);
        const d = new Date((serial - 25569) * 86400 * 1000);
        return d;
    }

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  const frDate = parseDate_Sim(revisedFRRaw || fileReleaseRaw);
  console.log(`Parsed FR Date: ${frDate ? frDate.toISOString() : 'NULL'}`);

  if (!frDate) {
    console.log('Error: No File Release date found or could not be parsed.');
    return;
  }

  // 2. Simulate Timeline Calculation (Simplistic)
  const PROCESS_SEQUENCE = [
    { seq: 3, stage: 'File Release' },
    { seq: 7, stage: 'Sewing' },
    { seq: 8, stage: 'Washing' }
  ];

  // In reality, it uses SopLT. Let's assume some values.
  const timeline = [];
  let forwardDate = new Date(frDate);

  PROCESS_SEQUENCE.forEach(p => {
    const targetStart = new Date(forwardDate);
    // Assume 2 days logic
    const targetEnd = new Date(forwardDate); 
    targetEnd.setDate(targetEnd.getDate() + 2);
    
    timeline.push({ stage: p.stage, targetStart, targetEnd });
    forwardDate = new Date(targetEnd);
  });

  console.log('Simulated Timeline:');
  timeline.forEach(t => {
    console.log(`  ${t.stage}: ${t.targetStart.toISOString().split('T')[0]} to ${t.targetEnd.toISOString().split('T')[0]}`);
  });
}

runTest();
