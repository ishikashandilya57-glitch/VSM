const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkWLP() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'WLP_RAW_All_Lines!A:Z',
    });

    const rows = response.data.values || [];
    const ocToFind = 'LC/DMN/25/13445';
    const matches = rows.filter(row => row.some(cell => cell && cell.toString().includes(ocToFind)));

    console.log(`Searching for OC in WLP: ${ocToFind}`);
    if (matches.length > 0) {
      console.log(`Found ${matches.length} matches:`);
      matches.forEach((row, idx) => {
        console.log(`Match ${idx + 1}: ${row.join(' | ')}`);
      });
    } else {
      console.log('Not found in WLP_RAW_All_Lines');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkWLP();
