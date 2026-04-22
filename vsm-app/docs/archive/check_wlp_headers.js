const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkWLPHeaders() {
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
      range: 'WLP_RAW_All_Lines!1:1',
    });

    const headers = response.data.values[0] || [];
    console.log('WLP Headers:');
    headers.forEach((h, i) => console.log(`${i}: ${h}`));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkWLPHeaders();
