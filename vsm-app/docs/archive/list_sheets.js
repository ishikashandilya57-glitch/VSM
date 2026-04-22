const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function listSheets() {
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
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    console.log('Sheets in spreadsheet:');
    response.data.sheets.forEach(sheet => {
      console.log(`- ${sheet.properties.title}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listSheets();
