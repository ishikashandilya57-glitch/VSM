const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function checkSpecificOC() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0'; // DBR Sheet

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'VSM_Execution!A:K',
    });

    const rows = response.data.values || [];
    const ocToFind = 'PRLS/25/12970';
    const matches = rows.filter(row => row[1] && row[1].toString().trim() === ocToFind);

    console.log(`Searching for OC: ${ocToFind}`);
    if (matches.length > 0) {
      console.log(`Found ${matches.length} matches:`);
      matches.forEach((row, idx) => {
        console.log(`Match ${idx + 1}: Stage=${row[6]}, Start=${row[9]}, End=${row[10]}`);
      });
    } else {
      console.log('Not found in VSM_Execution');
      
      // Check Order_Master
      const masterResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Order_Master!A:C',
      });
      const masterRows = masterResponse.data.values || [];
      const masterMatch = masterRows.find(row => row[2] && row[2].toString().trim() === ocToFind);
      if (masterMatch) {
         console.log(`OC found in Order_Master: ${ocToFind}`);
         console.log(`Column I (File Release): ${masterMatch[8]}`);
         console.log(`Column J (Revised FR): ${masterMatch[9]}`);
         console.log(`Full Row (partial): ${masterMatch.slice(0, 15).join(' | ')}`);
      } else {
         console.log(`OC NOT found in Order_Master: ${ocToFind}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSpecificOC();
