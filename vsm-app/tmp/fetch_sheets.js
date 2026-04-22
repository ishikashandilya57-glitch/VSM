const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.DBR_GOOGLE_SHEET_ID,
      range: 'VSM_Execution!A1:Z1', 
    });
    
    console.log('--- VSM HEADERS ROW 1 ---');
    if (response.data.values && response.data.values.length > 0) {
        response.data.values[0].forEach((h, i) => {
            console.log(`Col ${i+1}: '${h}'`);
        });
    }

    const response2 = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.DBR_GOOGLE_SHEET_ID,
      range: 'Order_Master!A1:Z2', 
    });

    console.log('\n--- ORDER MASTER HEADERS ---');
    if (response2.data.values) {
        response2.data.values.forEach((row, ri) => {
           console.log(`ROW ${ri+1}`);
           row.forEach((h, i) => {
              console.log(`Col ${i+1}: '${h}'`);
           });
        });
    }

  } catch (error) {
    console.error('API Error:', error.message);
  }
}

run();
