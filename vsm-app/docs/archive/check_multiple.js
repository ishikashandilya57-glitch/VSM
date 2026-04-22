const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkMultipleSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0';
  const ocToFind = 'PRLS/25/12970';

  console.log(`--- Searching for OC: ${ocToFind} ---`);

  // 1. VSM_Execution
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'VSM_Execution!A:N',
    });
    const rows = response.data.values || [];
    const vsmMatches = rows.filter(row => row[1] && row[1].toString().trim() === ocToFind);
    console.log(`VSM_Execution: Found ${vsmMatches.length} matches`);
    vsmMatches.forEach(m => console.log(`  Stage: ${m[6]} | Status: ${m[13]} | Start: ${m[11]} | End: ${m[12]}`));
  } catch (e) { console.log('Error VSM:', e.message); }

  // 2. Order_Master
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Order_Master!A:J',
    });
    const rows = response.data.values || [];
    const masterMatch = rows.find(row => row[2] && row[2].toString().trim() === ocToFind);
    if (masterMatch) {
      console.log('Order_Master: FOUND');
      console.log(`  Col I (File Rel): ${masterMatch[8]}`);
      console.log(`  Col J (Rev FR): ${masterMatch[9]}`);
    } else {
      console.log('Order_Master: NOT FOUND');
    }
  } catch (e) { console.log('Error Order_Master:', e.message); }

  // 3. WLP_RAW_All_Lines
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'WLP_RAW_All_Lines!A:R',
    });
    const rows = response.data.values || [];
    const wlpMatch = rows.find(row => row[2] && row[2].toString().trim() === ocToFind);
    if (wlpMatch) {
      console.log('WLP_RAW_All_Lines: FOUND');
      console.log(`  Col 16 (File Rel): ${wlpMatch[16]}`);
      console.log(`  Col 17 (Rev FR): ${wlpMatch[17]}`);
    } else {
      console.log('WLP_RAW_All_Lines: NOT FOUND');
    }
  } catch (e) { console.log('Error WLP:', e.message); }
}

checkMultipleSheets();
