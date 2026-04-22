const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.DBR_GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    // Check VSM
    const vsm = doc.sheetsByTitle['VSM_Execution'];
    if(vsm) {
        await vsm.loadHeaderRow(1);
        console.log('ROW 1:', vsm.headerValues);
        try {
            await vsm.loadHeaderRow(2);
            console.log('ROW 2:', vsm.headerValues);
        } catch(e){}
    }

    // Check OM
    const om = doc.sheetsByTitle['Order_Master'];
    if(om) {
        await om.loadHeaderRow(1);
        console.log('OM ROW 1:', om.headerValues);
        try {
            await om.loadHeaderRow(2);
            console.log('OM ROW 2:', om.headerValues);
        } catch(e){}
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
