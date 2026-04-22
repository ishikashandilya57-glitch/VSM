const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function inspectSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0'; // DBR Sheet ID

    console.log('--- Process_List ---');
    const plRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Process_List!A2:A20',
    });
    console.log('Stages:', plRes.data.values?.flat());

    console.log('\n--- VSM_Execution Sample (for OC LC/VLT/25/12746) ---');
    const execRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'VSM_Execution!A2:M1000',
    });
    
    const ocNo = 'LC/VLT/25/12746';
    const rows = execRes.data.values || [];
    const matches = rows.filter(row => String(row[1] || '').trim().toUpperCase() === ocNo.toUpperCase());
    
    if (matches.length > 0) {
      matches.forEach(row => {
        console.log(`Line: ${row[0]}, OC: ${row[1]}, Stage: ${row[6]}, Start: ${row[11]}, End: ${row[12]}`);
      });
    } else {
      console.log(`No rows found for OC: ${ocNo}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

inspectSheet();
