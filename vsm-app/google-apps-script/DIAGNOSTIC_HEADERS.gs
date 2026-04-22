const SHEET_ID = '1pf9L-WLSelHmFG2aGE891hScLTSRAmcvI16T7YLpmI0'; // The DBR spreadsheet

function dumpHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vsm = ss.getSheetByName('VSM_Execution');
  const om = ss.getSheetByName('Order_Master');
  
  const vsmHeaders = vsm ? vsm.getRange(1, 1, 1, vsm.getLastColumn()).getValues()[0] : [];
  const omHeaders = om ? om.getRange(1, 1, 1, om.getLastColumn()).getValues()[0] : [];
  
  return ContentService.createTextOutput(JSON.stringify({
    vsmHeaders: vsmHeaders.map((h, i) => `${i+1}: '${h}'`),
    omHeaders: omHeaders.map((h, i) => `${i+1}: '${h}'`)
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (e.parameter.action === 'dump_headers') {
    return dumpHeaders();
  }
}
